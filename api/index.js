// rni_database/api/index.js
const express = require('express');
const { supabase } = require('../supabaseClient.cjs');
const { verifyToken, requireRole } = require('../authMiddleware.cjs');
const rateLimit = require('express-rate-limit');

// Firebase is required unconditionally. There is no supported mode where
// this backend runs without it — every route below that touches Firebase
// (application approve/reject, user status/role/email sync) assumes
// `auth` exists. Wrapping this in try/catch and checking `if (auth)`
// everywhere below would let a missing service account silently degrade
// those routes into no-ops instead of crashing at startup, which is
// where a missing credential is actually easy to notice and fix.
const { auth } = require('../firebase.cjs');

const app = express();

// Required for express-rate-limit (added below) to see the real client
// IP instead of Vercel's proxy address. Without this, every request
// would appear to come from the same internal IP, either merging every
// visitor into one shared rate-limit bucket or causing the rate
// limiter to reject all requests outright as a safety check.
app.set('trust proxy', 1);


//----------------------------- app.use(express.json());-------------------------------------------
/* With no limit specified, Express's default body-size cap is 100kb — nowhere close to 2.7MB. 
This middleware rejects the request with 413 Payload Too Large before it ever reaches your route handler, 
before verifyToken/requireRole even run. 
The 2MB check on the frontend was never actually enforced against anything real on the backend — it just happened 
to be nowhere near strict enough for whatever the real, undocumented limit turned out to be. */

app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  // OPTIONS added to the allowed methods list, and handled below.
  // Browsers send an OPTIONS preflight before any PATCH/DELETE request
  // (or any request carrying an Authorization header) when the
  // frontend and API are on different origins. Today, on Vercel, they
  // share an origin, so this has been silently working — no preflight
  // is ever triggered. But that's an accident of the current
  // deployment shape, not a guarantee: the moment FRONTEND_URL points
  // at a different origin (or someone runs the Vite dev server against
  // a remote API), every PATCH/DELETE with a token would start failing
  // preflight with no explanation. Handling it now means that never
  // becomes a surprise later.
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight requests carry no body and expect nothing back but these
  // headers plus a success status — they should never reach the actual
  // route handlers below (verifyToken would otherwise reject them for
  // having no Authorization header, which is correct behavior for a
  // preflight but not what the browser is asking for here).
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function isValidId(id) {
  return /^\d+$/.test(id);
}

// Separate from isValidId() above: most tables in this app (users, ips,
// startups, research_entries) use numeric auto-increment primary keys,
// but applications uses a UUID primary key instead. Using isValidId()
// against a UUID would reject every legitimate id — this checks the
// standard UUID format (8-4-4-4-12 hex characters) instead.
function isValidUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function pick(body, allowedKeys) {
  const result = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
}

// Rate limiter for the one unauthenticated write endpoint in this
// backend (failed-login logging). A client-side cooldown alone isn't
// real protection — it's just JS state, reset by a new tab, a new
// browser, or a direct fetch() call bypassing the UI entirely. This
// enforces the limit server-side, per IP, so a flood of requests is
// rejected with 429 before it ever reaches the logs table — the table
// never grows from this in the first place, rather than growing and
// needing cleanup afterward.
const failedLoginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,               // 5 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many attempts. Please wait before trying again.' });
  },
});

// Rate limiter for the other unauthenticated write endpoint in this
// backend: public registration. Each request creates a real Firebase
// user plus an `applications` row — without a server-side limit, this
// is scriptable into unlimited account creation the same way failed
// logins were before failedLoginLimiter existed above. A longer window
// and lower max than failed-login: registration is a deliberate,
// infrequent action for a real applicant, not something that should
// ever legitimately happen 5+ times a minute from the same IP.
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many applications submitted. Please wait before trying again.' });
  },
});

// Writes one row to the audit log. Failures here are deliberately caught
// and swallowed (not re-thrown) — a failed audit-log write should never
// cause the actual request it's attached to fail. The real action (the
// create/update/delete/approve/etc.) already succeeded by the time this
// runs; losing the audit trail entry for it is a server-side problem
// worth seeing in the console, not a reason to tell the user their
// request failed when it didn't.




async function logAction(action, req, severity = 'normal') {
  // supabase-js does NOT throw on a failed insert — it resolves with
  // { error } instead. The try/catch below only ever catches a
  // network-level failure (DNS, connection refused, etc.); it does
  // nothing for the far more common case of a rejected insert (bad
  // column, RLS policy, etc.), which used to fail completely silently.
  // Checking `error` explicitly is what actually surfaces that failure.
  try {
    const { error } = await supabase.from('logs').insert({
      action,
      actor_name: req.user?.name || null,
      actor_email: req.user?.email || null,
      actor_role: req.user?.role || null,
      severity,
    });
    if (error) console.error('Failed to write audit log:', error);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Writes one row to the notifications table. Same fire-and-forget
// pattern as logAction() just above it: a failed notification write is
// a server-side problem worth seeing in the console, never a reason to
// fail the request that triggered it. The real action (application
// submitted, application approved) has already succeeded by the time
// this runs.



async function logNotification(text) {
  // Same reasoning as logAction() above: supabase-js resolves with
  // { error } on a failed insert rather than throwing, so that has to
  // be checked explicitly or a failed write disappears with no trace.
  try {
    const { error } = await supabase.from('notifications').insert({ text });
    if (error) console.error('Failed to write notification:', error);
  } catch (err) {
    console.error('Failed to write notification:', err);
  }
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// Get all users - superadmin only
app.get('/api/users', verifyToken, requireRole('superadmin'), async (req, res) => {
  // Explicit column list instead of select('*'). firebase_uid is an
  // internal identifier used server-side (to sync status/role/email to
  // Firebase in PATCH /api/users/:id) — the frontend never reads it
  // (toClientRecord() in userService.js already drops it on the way
  // in), so there's no reason to send it to the browser at all.
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, status, approved_at');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ users: data });
});

app.patch('/api/users/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const payload = pick(req.body, ['name', 'role', 'email', 'status']);

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // Same reasoning as the application-intake allow-list: `role` is a
  // security boundary, not a display value — requireRole() reads it
  // straight off the Firebase claim. Without this check, a request
  // with { role: 'superadmin' } would sail through pick() (it's in the
  // allow-list above) and this route would hand out superadmin access
  // to whoever it's applied to, no different from editing their name.
  const ALLOWED_USER_ROLES = ['INTTO', 'RSO'];
  if (payload.role !== undefined && !ALLOWED_USER_ROLES.includes(payload.role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // status is a security control too, not just a display value — it's
  // what decides the Firebase `disabled` flag a few lines down. Without
  // this check, any string sails through pick() (status is in that
  // allow-list) and gets compared with `=== 'Inactive'`. Anything that
  // ISN'T exactly that string — a typo, 'inactive' lowercase, trailing
  // whitespace — evaluates to false and silently RE-ENABLES the account,
  // while the users table displays whatever garbage was sent. Same
  // allow-list pattern as ALLOWED_USER_ROLES just above.
  const ALLOWED_USER_STATUSES = ['Active', 'Inactive'];
  if (payload.status !== undefined && !ALLOWED_USER_STATUSES.includes(payload.status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // status, role, and email changes all need the user's firebase_uid
  // before anything else can happen: status maps to Firebase's
  // `disabled` flag, role maps to the custom claim requireRole()
  // checks, and email is what Firebase Auth actually authenticates
  // logins against. Fetched once up front and reused for whichever of
  // the three fields is present.
  let existing = null;
  if (payload.status !== undefined || payload.role !== undefined || payload.email !== undefined) {
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('firebase_uid')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      console.error(`PATCH /api/users/${req.params.id} — fetch failed:`, fetchError);
      return res.status(404).json({ error: 'User not found' });
    }
    existing = data;
  }

  // Status is a security control (can this account log in?), not just a
  // display value — Firebase's disabled flag is what actually enforces
  // it. Synced here, Firebase FIRST, before Supabase is ever touched:
  // if only one of the two succeeds, we want it to be the one that
  // actually blocks access, not the one that just changes what the
  // table displays. A Supabase-only failure after this leaves the UI
  // stale but access still correctly enforced — the safer of the two
  // possible half-done states.

  if (payload.status !== undefined) {
    // auth is guaranteed to exist now (see the top-level require above) —
    // the only thing still worth checking here is whether this particular
    // user actually has a firebase_uid on record.

    if (existing.firebase_uid) {
      try {
        await auth.updateUser(existing.firebase_uid, { disabled: payload.status === 'Inactive' });
      } catch (err) {
        console.error('Failed to sync Firebase disabled flag:', err);
        return res.status(500).json({ error: 'Failed to update account access: ' + err.message });
      }
    }
  }

  // Role changes work the same way and for the same reason: the
  // Firebase custom claim is what requireRole() reads on every request
  // this user makes. Synced Firebase FIRST for the same reason as
  // status: if only one side succeeds, better it's the one that
  // actually governs access.
  if (payload.role !== undefined) {
    if (existing.firebase_uid) {
      try {
        await auth.setCustomUserClaims(existing.firebase_uid, { role: payload.role.toLowerCase() });
      } catch (err) {
        console.error('Failed to sync Firebase role claim:', err);
        return res.status(500).json({ error: 'Failed to update account role: ' + err.message });
      }
    }
  }

  // Email is what Firebase Auth actually authenticates logins against
  // — the Supabase `email` column is only what the UI displays. Without
  // this sync, editing a user's email here would change what
  // userMgmt.vue shows while the person still has to log in with their
  // OLD email, and any Firebase-side password reset would go to that
  // old address too. Synced Firebase FIRST, same ordering as status
  // and role: if only one side succeeds, better it's the one that
  // actually governs login, not the one that just changes a label.
  if (payload.email !== undefined) {
    if (existing.firebase_uid) {
      try {
        await auth.updateUser(existing.firebase_uid, { email: payload.email });
      } catch (err) {
        console.error('Failed to sync Firebase email:', err);
        return res.status(500).json({ error: 'Failed to update account email: ' + err.message });
      }
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error(`PATCH /api/users/${req.params.id} — update failed:`, error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Updated user: ${data.name}`, req);
  res.json({ user: data });
});

// Get all research entries

// RSO-only routes below: verifyToken checks the request carries a real,
// currently-valid Firebase login token; requireRole('rso') then checks that
// token's role claim is specifically 'rso' before the request is allowed
// to reach the actual database logic. Anyone else gets a 401 (no/bad token)
// or 403 (valid token, wrong role) before any Supabase call ever runs.

// GET is left open to any request with a valid RSO session — read access
// doesn't need the extra restriction that writes do below.

// Research entries - RSO full CRUD, INTTO read-only
app.get('/api/research-entries', verifyToken, requireRole('rso', 'intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('research_entries')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ entries: data });
});

app.post('/api/research-entries', verifyToken, requireRole('rso'), async (req, res) => {
  // pick() only copies over the fields we actually expect on this table.
  // Without this, req.body gets passed straight to Supabase as-is — anyone
  // could send extra fields and have them silently written to the row.
  // This is the same allow-list pattern already used on /api/ips and
  // /api/startups; research-entries just never got it applied.
  const payload = pick(req.body, [
    'title', 'authors', 'co_authors', 'start_date', 'end_date',
    'isbn', 'scopus_link', 'abstract',
  ]);

  const { data, error } = await supabase
    .from('research_entries')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Created research entry: ${data.title}`, req);
  res.json({ entry: data });
});

app.patch('/api/research-entries/:id', verifyToken, requireRole('rso'), async (req, res) => {
  // isValidId() makes sure :id is actually a number before it ever reaches
  // Supabase — without it, a malformed id (like "abc" or an empty string)
  // would still get sent as a query filter, producing a confusing database
  // error instead of a clean, expected 400.
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const payload = pick(req.body, [
    'title', 'authors', 'co_authors', 'start_date', 'end_date',
    'isbn', 'scopus_link', 'abstract',
  ]);

  const { data, error } = await supabase
    .from('research_entries')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Updated research entry: ${data.title}`, req);
  res.json({ entry: data });
});

app.delete('/api/research-entries/:id', verifyToken, requireRole('rso'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { error } = await supabase
    .from('research_entries')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Deleted research entry (id ${req.params.id})`, req, 'warning');
  res.json({ success: true });
});


// INTTO-only routes below: same pattern as the RSO routes above, but
// requireRole('intto') instead — these are the classification, cohort,
// startup, and IP record routes, all owned by the INTTO portal.

// Classifications - INTTO lookup table (read-only route for now, no writes exist yet)
app.get('/api/classifications', verifyToken, requireRole('rso', 'intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('classifications')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ classifications: data });
});

// Cohorts - treated as INTTO-owned (used to group startups); confirm with supervisor
app.get('/api/cohorts', verifyToken, requireRole('rso', 'intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ cohorts: data });
});

app.post('/api/cohorts', verifyToken, requireRole('intto'), async (req, res) => {
  const payload = pick(req.body, ['cohort_name']);

  const { data, error } = await supabase
    .from('cohorts')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Created cohort: ${data.cohort_name}`, req);
  res.json({ cohort: data });
});

// Startups - INTTO full CRUD, RSO read-only
app.get('/api/startups', verifyToken, requireRole('rso', 'intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('startups')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ startups: data });
});

app.post('/api/startups', verifyToken, requireRole('intto'), async (req, res) => {
  const payload = pick(req.body, ['cohort_id', 'name', 'genre', 'short_description', 'logo_url']);

  const { data, error } = await supabase
    .from('startups')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Created startup: ${data.name}`, req);
  res.json({ startup: data });
});

app.patch('/api/startups/:id', verifyToken, requireRole('intto'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const payload = pick(req.body, ['cohort_id', 'name', 'genre', 'short_description', 'logo_url']);

  const { data, error } = await supabase
    .from('startups')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Updated startup: ${data.name}`, req);
  res.json({ startup: data });
});

app.delete('/api/startups/:id', verifyToken, requireRole('intto'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { error } = await supabase
    .from('startups')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Deleted startup (id ${req.params.id})`, req, 'warning');
  res.json({ success: true });
});

// IPs - INTTO full CRUD, RSO read-only
app.get('/api/ips', verifyToken, requireRole('rso', 'intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('ips')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ips: data });
});

app.post('/api/ips', verifyToken, requireRole('intto'), async (req, res) => {
  const payload = pick(req.body, ['title', 'inventors', 'filing_date', 'status', 'classification_id', 'ref_number']);

  const { data, error } = await supabase
    .from('ips')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Created IP record: ${data.title}`, req);
  res.json({ ip: data });
});

app.patch('/api/ips/:id', verifyToken, requireRole('intto'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const payload = pick(req.body, ['title', 'inventors', 'filing_date', 'status', 'classification_id', 'ref_number']);

  const { data, error } = await supabase
    .from('ips')
    .update(payload)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Updated IP record: ${data.title}`, req);
  res.json({ ip: data });
});

app.delete('/api/ips/:id', verifyToken, requireRole('intto'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { error } = await supabase
    .from('ips')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  await logAction(`Deleted IP record (id ${req.params.id})`, req, 'warning');
  res.json({ success: true });
});

// Get pending applications
app.get('/api/applications', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  const shaped = data.map((a) => ({
    id: a.id,
    name: `${a.first_name} ${a.last_name}`,
    role: a.role,
    email: a.email,
    dateApplied: new Date(a.date_applied).toISOString().split('T')[0],
  }));

  res.json(shaped);
});

// Submit an application - public, no auth required (this is registration)
app.post('/api/applications', applicationLimiter, async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Allow-list the requested role before it touches anything else.
  // Without this check, `role` comes straight from req.body — the
  // frontend's <select> only ever offers INTTO/RSO, but that dropdown
  // is not a security boundary; a crafted request can send anything,
  // including "superadmin". If a super admin later approves that
  // application without noticing, the approve route (further down in
  // this file) hands out a real superadmin Firebase claim off the back
  // of the public registration endpoint. Validating here, before the
  // Firebase user is even created, closes that off at the source.
  const ALLOWED_APPLICATION_ROLES = ['INTTO', 'RSO'];
  if (!ALLOWED_APPLICATION_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  let userRecord;

  try {
    userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      disabled: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      firebase_uid: userRecord.uid,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    try {
      await auth.deleteUser(userRecord.uid);
    } catch (cleanupErr) {
      console.error('Failed to roll back Firebase user after Supabase insert failure:', cleanupErr);
    }
    return res.status(500).json({ error: error.message });
  }

  try {
    const { error: logError } = await supabase.from('logs').insert({
      action: `New application submitted: ${email}`,
      actor_name: `${firstName} ${lastName}`,
      actor_email: email,
      actor_role: role,
      severity: 'normal',
    });
    // Same reasoning as logAction()/logNotification() above — a rejected
    // insert here resolves with { error }, it doesn't throw.
    if (logError) console.error('Failed to write audit log:', logError);
  } catch (logErr) {
    console.error('Failed to write audit log:', logErr);
  }

  // Powers the superadmin dashboard's notification feed — separate
  // from the audit-log write above, which powers the logs page.
  await logNotification(`New application received from ${firstName} ${lastName}.`);

  res.status(201).json({ application: data, firebaseUid: userRecord.uid });
});

app.patch('/api/applications/:id/approve', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;

  // applications uses a UUID primary key, not a numeric id like most
  // other tables in this file — isValidId() would reject every real
  // application id, so this uses isValidUuid() instead.
  if (!isValidUuid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Atomically claim this application before touching Firebase or the
  // users table. The .eq('status', 'pending') here is the actual lock:
  // this UPDATE only succeeds — only returns a row — if the application
  // is still 'pending' at the exact moment it runs. If two approve
  // requests land close together (double-click, duplicate network
  // retry), only one of them can flip pending -> processing and get a
  // row back. The other gets nothing back and is rejected with a 409
  // before it ever creates a Firebase claim or inserts into users.
  // A plain SELECT-then-check here would NOT be safe — both requests
  // could read 'pending' before either had written anything.
  //
  // Requires the applications_status_check constraint in Supabase to
  // allow 'processing' as a valid status value, alongside pending/
  // approved/rejected — see the migration this project ran to add it.
  const { data: claimed, error: claimError } = await supabase
    .from('applications')
    .update({ status: 'processing' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();

  if (claimError || !claimed) {
    // Either the id doesn't exist, or it's not 'pending' anymore
    // (already approved, already rejected, or a concurrent request
    // just claimed it). 409 Conflict is the correct status here —
    // the request is well-formed, but the resource's current state
    // doesn't allow this action.
    return res.status(409).json({ error: 'Application is not pending (already processed, or does not exist).' });
  }

  const application = claimed;

  // If anything below fails, the application must be put back to
  // 'pending' — otherwise it's stuck on 'processing' forever and can
  // never be approved or rejected again through the normal UI.
  async function revertToPending() {
    const { error: revertError } = await supabase
      .from('applications')
      .update({ status: 'pending' })
      .eq('id', id);
    if (revertError) {
      console.error(`Failed to revert application ${id} to pending after a failed approve:`, revertError);
    }
  }

  // auth is guaranteed to exist now — no more "if (auth)" wrapper here.
  // If Firebase itself is unreachable, the try/catch below still handles
  // that the same way it always has (revert to pending, return 500).
  try {
    const normalizedRole = (application.role || '').toLowerCase();

    if (!normalizedRole) {
      // Guards against the .toLowerCase() crash this route used to
      // have if role was ever null — now a clean 400 instead of an
      // unhandled 500.
      await revertToPending();
      return res.status(400).json({ error: 'Application has no role set' });
    }

    await auth.setCustomUserClaims(application.firebase_uid, { role: normalizedRole });
    await auth.updateUser(application.firebase_uid, { disabled: false });
  } catch (err) {
    console.error('Failed to set Firebase role/enable user:', err);
    await revertToPending();
    return res.status(500).json({ error: 'Failed to activate Firebase account: ' + err.message });
  }

  const { error: insertError } = await supabase
    .from('users')
    .insert({
      firebase_uid: application.firebase_uid,
      name: `${application.first_name} ${application.last_name}`,
      email: application.email,
      role: application.role,
      status: 'Active',
      approved_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error(insertError);
    await revertToPending();
    return res.status(500).json({ error: insertError.message });
  }

  // Only now — Firebase claim confirmed, users row confirmed — does the
  // application move to its true final state.
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    console.error(updateError);
    // The users row and Firebase claim already exist at this point, so
    // reverting to 'pending' would let a retry double-insert into
    // users. Left on 'processing' deliberately — this is now a state
    // that needs a human to fix by hand, so it's logged as critical
    // rather than silently reverted.
    await logAction(`Application ${application.email} approved but status update failed — needs manual fix`, req, 'critical');
    return res.status(500).json({ error: updateError.message });
  }

  await logAction(`Approved application: ${application.email}`, req);
  await logNotification(`Application from ${application.first_name} ${application.last_name} was approved.`);
  res.json({ message: 'Application approved' });
});

app.patch('/api/applications/:id/reject', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;

  // Same guard as approve, and for the same reason — isValidUuid(),
  // not isValidId(), since applications uses UUID primary keys.
  if (!isValidUuid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  // Same atomic-claim pattern as approve, and for the same reason: this
  // stops a stale or duplicate reject request from deleting the
  // Firebase account of someone whose application was already
  // approved and who is now an active user. Previously this route
  // deleted application.firebase_uid unconditionally, with nothing
  // checking that the application hadn't already moved past 'pending'.
  const { data: application, error: claimError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();

  if (claimError || !application) {
    return res.status(409).json({ error: 'Application is not pending (already processed, or does not exist).' });
  }

  // auth is guaranteed to exist now — no more "if (auth)" wrapper here.
  try {
    await auth.deleteUser(application.firebase_uid);
  } catch (deleteError) {
    console.error('Failed to delete Firebase user:', deleteError);
  }

  await logAction(`Rejected application: ${application.email}`, req, 'warning');
  res.json({ message: 'Application rejected' });
});


// Records a successful login. Fired right after login succeeds, while a
// valid token still exists — reuses logAction() the same way every other
// route does.
app.post('/api/logs/login', verifyToken, async (req, res) => {
  await logAction('User logged in', req);
  res.json({ success: true });
});

// Records a logout. Called from the frontend BEFORE signOut() runs, while
// the Firebase token is still valid — once signOut() completes there's no
// token left to authenticate this call with.
app.post('/api/logs/logout', verifyToken, async (req, res) => {
  await logAction('User logged out', req);
  res.json({ success: true });
});

// Records a failed login attempt. Deliberately has NO verifyToken — a
// failed login means there's no valid token to check in the first place.
// This is the only unauthenticated write endpoint in the whole backend.
//
// Also evaluates whether this email has failed to log in repeatedly in
// a short window — if so, this specific attempt is logged as 'critical'
// instead of the usual 'warning', so it stands out on the superadmin
// Logs page (ReusableTable colors rows red/yellow based on the
// severity field automatically — no frontend change needed for this).

app.post('/api/logs/failed-login', failedLoginLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().slice(0, 255) : null;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  // Threshold and window for flagging repeated failures as critical.
  // Not a fixed rule — a starting point. Raise FAILED_LOGIN_THRESHOLD
  // if this turns out to fire too easily during normal typo-driven
  // failed logins; lower it if real brute-force attempts should be
  // caught faster than 5 tries.
  const FAILED_LOGIN_THRESHOLD = 3;
  const FAILED_LOGIN_WINDOW_MINUTES = 15;

  let severity = 'warning';

  try {
    const windowStart = new Date(Date.now() - FAILED_LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString();

    // Fetches the matching rows directly rather than using a count-only
    // ({ count: 'exact', head: true }) query. That head-query pattern
    // was the one thing in this handler that didn't match how every
    // other route in this file queries Supabase, and it was silently
    // returning 0 with no error — switched to the same row-fetching
    // style used everywhere else, which is a known-working pattern in
    // this codebase. This table is small, so fetching a handful of ids
    // instead of just a count is not a real cost.
    const { data: recentFailures, error: countError } = await supabase
      .from('logs')
      .select('id')
      .eq('actor_email', email)
      .like('action', 'Failed login attempt:%')
      .gte('created_at', windowStart);

    if (countError) {
      console.error('Failed to count recent failed login attempts:', countError);
    } else if (recentFailures.length + 1 >= FAILED_LOGIN_THRESHOLD) {
      // +1 accounts for the attempt currently being logged, which
      // hasn't been inserted yet at the point this check runs.
      severity = 'critical';
    }
  } catch (err) {
    console.error('Failed to evaluate failed login threshold:', err);
  }
  try {
    const { error } = await supabase.from('logs').insert({
      action: `Failed login attempt: ${email}`,
      actor_name: null,
      actor_email: email,
      actor_role: null,
      severity,
    });
    // Same reasoning as every other insert in this file — a rejected
    // insert resolves with { error }, it doesn't throw.
    if (error) console.error('Failed to write audit log:', error);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }

  res.json({ success: true });
});

// Logs - superadmin only.
// Was hardcoded mock data. logAction() has been writing real rows to
// the Supabase `logs` table this whole time (every write route, plus
// login/logout/failed-login) — this route just never read from it.
// Ordered newest-first since that's what both the dashboard preview
// and the full logs page want.
app.get('/api/logs', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ logs: data });
});

// Notifications - superadmin only.
// Was hardcoded mock data with no real table behind it. Now backed by
// the notifications table, written to by logNotification() at the two
// real trigger points that exist so far: new application submitted,
// and application approved. Ordered newest-first and capped at 20 —
// this is a preview feed, not a full audit trail (that's what /api/logs
// is for).
app.get('/api/notifications', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ notifications: data });
});

module.exports = app;