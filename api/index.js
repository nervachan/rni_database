const express = require('express');
const { supabase } = require('../supabaseClient.cjs');
const { verifyToken, requireRole } = require('../authMiddleware.cjs');

let auth = null;
try {
  ({ auth } = require('../firebase.cjs'));
} catch (err) {
  console.error('Firebase not configured (missing firebase-service-account.json). /api/applications routes that require Firebase will return 503 until it is added.');
}

const app = express();

//----------------------------- app.use(express.json());-------------------------------------------
/* With no limit specified, Express's default body-size cap is 100kb — nowhere close to 2.7MB. 
This middleware rejects the request with 413 Payload Too Large before it ever reaches your route handler, 
before verifyToken/requireRole even run. 
The 2MB check on the frontend was never actually enforced against anything real on the backend — it just happened 
to be nowhere near strict enough for whatever the real, undocumented limit turned out to be. */

app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

function isValidId(id) {
  return /^\d+$/.test(id);
}

function pick(body, allowedKeys) {
  const result = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// Get all users
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ users: data });
});

// Get all research entries

// RSO-only routes below: verifyToken checks the request carries a real,
// currently-valid Firebase login token; requireRole('rso') then checks that
// token's role claim is specifically 'rso' before the request is allowed
// to reach the actual database logic. Anyone else gets a 401 (no/bad token)
// or 403 (valid token, wrong role) before any Supabase call ever runs.

app.get('/api/research-entries', verifyToken, requireRole('rso'), async (req, res) => {
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
  const { data, error } = await supabase
    .from('research_entries')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ entry: data });
});

app.patch('/api/research-entries/:id', verifyToken, requireRole('rso'), async (req, res) => {
  const { data, error } = await supabase
    .from('research_entries')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ entry: data });
});

app.delete('/api/research-entries/:id', verifyToken, requireRole('rso'), async (req, res) => {
  const { error } = await supabase
    .from('research_entries')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});


// INTTO-only routes below: same pattern as the RSO routes above, but
// requireRole('intto') instead — these are the classification, cohort,
// startup, and IP record routes, all owned by the INTTO portal.

app.get('/api/classifications', verifyToken, requireRole('intto'), async (req, res) => {
  const { data, error } = await supabase
    .from('classifications')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ classifications: data });
});

app.get('/api/cohorts', verifyToken, requireRole('intto'), async (req, res) => {
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

  res.json({ cohort: data });
});

app.get('/api/startups', verifyToken, requireRole('intto'), async (req, res) => {
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

  res.json({ success: true });
});

app.get('/api/ips', verifyToken, requireRole('intto'), async (req, res) => {
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

// Submit an application
app.post('/api/applications', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!auth) {
    return res.status(503).json({ error: 'Firebase is not configured on this server yet.' });
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

  res.status(201).json({ application: data, firebaseUid: userRecord.uid });
});

app.patch('/api/applications/:id/approve', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;

  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(fetchError);
    return res.status(404).json({ error: 'Application not found' });
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    console.error(updateError);
    return res.status(500).json({ error: updateError.message });
  }

  if (auth) {
    const normalizedRole = application.role.toLowerCase();
    await auth.setCustomUserClaims(application.firebase_uid, { role: normalizedRole });
    await auth.updateUser(application.firebase_uid, { disabled: false });
  }

  const { error: insertError } = await supabase
    .from('users')
    .insert({
      firebase_uid: application.firebase_uid,
      name: `${application.first_name} ${application.last_name}`,
      email: application.email,
      role: application.role,
    });

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({ error: insertError.message });
  }

  res.json({ message: 'Application approved' });
});

app.patch('/api/applications/:id/reject', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;

  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(fetchError);
    return res.status(404).json({ error: 'Application not found' });
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  if (auth) {
    try {
      await auth.deleteUser(application.firebase_uid);
    } catch (deleteError) {
      console.error('Failed to delete Firebase user:', deleteError);
    }
  }

  res.json({ message: 'Application rejected' });
});

// Logs
app.get('/api/logs', (req, res) => {
  const logs = [
    { id: 1, timestamp: '2026-06-30T14:30:00', action: 'User Login', name: 'Maria Santos', email: 'maria.santos@example.com', role: 'INTTO', severity: 'normal' },
    { id: 2, timestamp: '2026-06-29T10:15:00', action: 'Profile Updated', name: 'Rafael Lim', email: 'rafael.lim@example.com', role: 'RSO', severity: 'warning' },
    { id: 3, timestamp: '2026-06-28T09:05:00', action: 'Password Reset', name: 'Jasmine Torres', email: 'jasmine.torres@example.com', role: 'INTTO', severity: 'warning' },
    { id: 4, timestamp: '2026-06-27T18:40:00', action: 'Role Changed', name: 'Paul Reyes', email: 'paul.reyes@example.com', role: 'RSO', severity: 'warning' },
    { id: 5, timestamp: '2026-06-26T13:20:00', action: 'Account Activated', name: 'Cris Villanueva', email: 'cris.villanueva@example.com', role: 'INTTO', severity: 'normal' },
    { id: 6, timestamp: '2026-06-25T07:55:00', action: 'Access Denied', name: 'Mina Cruz', email: 'mina.cruz@example.com', role: 'RSO', severity: 'critical' },
  ];
  res.json(logs);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const notifications = [
    { id: 1, text: 'New application received from Ana Dela Cruz.', createdAt: '2026-06-30T14:30:00' },
    { id: 2, text: 'Application from Lorenzo Rivera was approved.', createdAt: '2026-06-30T11:15:00' },
    { id: 3, text: 'A user profile change requires review.', createdAt: '2026-06-29T18:40:00' },
    { id: 4, text: 'New research entry submission is awaiting review.', createdAt: '2026-06-28T09:05:00' },
  ];
  res.json(notifications);
});

module.exports = app;