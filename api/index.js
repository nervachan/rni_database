const express = require('express');
const { supabase } = require('../supabaseClient.cjs');

let auth = null;
try {
  ({ auth } = require('../firebase.cjs'));
} catch (err) {
  console.error('Firebase not configured (missing firebase-service-account.json). /api/applications routes that require Firebase will return 503 until it is added.');
}

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
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
app.get('/api/research-entries', async (req, res) => {
  const { data, error } = await supabase
    .from('research_entries')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ entries: data });
});

app.post('/api/research-entries', async (req, res) => {
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

app.patch('/api/research-entries/:id', async (req, res) => {
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

app.delete('/api/research-entries/:id', async (req, res) => {
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

app.get('/api/classifications', async (req, res) => {
  const { data, error } = await supabase
    .from('classifications')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ classifications: data });
});

app.get('/api/cohorts', async (req, res) => {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ cohorts: data });
});

app.post('/api/cohorts', async (req, res) => {
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

app.get('/api/startups', async (req, res) => {
  const { data, error } = await supabase
    .from('startups')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ startups: data });
});

app.post('/api/startups', async (req, res) => {
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

app.patch('/api/startups/:id', async (req, res) => {
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

app.delete('/api/startups/:id', async (req, res) => {
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

app.get('/api/ips', async (req, res) => {
  const { data, error } = await supabase
    .from('ips')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ips: data });
});

app.post('/api/ips', async (req, res) => {
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

app.patch('/api/ips/:id', async (req, res) => {
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

app.delete('/api/ips/:id', async (req, res) => {
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
app.get('/api/applications', async (req, res) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ applications: data });
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

app.patch('/api/applications/:id/approve', async (req, res) => {
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

app.patch('/api/applications/:id/reject', async (req, res) => {
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