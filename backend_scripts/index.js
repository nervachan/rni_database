const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
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
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// Get all users
app.get('/users', async (req, res) => {
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
app.get('/research-entries', async (req, res) => {
  const { data, error } = await supabase
    .from('research_entries')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ entries: data });
});

app.post('/research-entries', async (req, res) => {
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

app.patch('/research-entries/:id', async (req, res) => {
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

app.delete('/research-entries/:id', async (req, res) => {
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

app.get('/classifications', async (req, res) => {
  const { data, error } = await supabase
    .from('classifications')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ classifications: data });
});

app.get('/cohorts', async (req, res) => {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ cohorts: data });
});

app.post('/cohorts', async (req, res) => {
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

app.get('/startups', async (req, res) => {
  const { data, error } = await supabase
    .from('startups')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ startups: data });
});

app.post('/startups', async (req, res) => {
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

app.patch('/startups/:id', async (req, res) => {
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

app.delete('/startups/:id', async (req, res) => {
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

app.get('/ips', async (req, res) => {
  const { data, error } = await supabase
    .from('ips')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ips: data });
});

app.post('/ips', async (req, res) => {
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

app.patch('/ips/:id', async (req, res) => {
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

app.delete('/ips/:id', async (req, res) => {
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
app.get('/applications', async (req, res) => {
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
app.post('/applications', async (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({ first_name: firstName, last_name: lastName, email, role, status: 'pending' })
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ application: data });
});

app.patch('/applications/:id/approve', async (req, res) => {
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

app.patch('/applications/:id/reject', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Application rejected' });
});

// Logs
app.get('/logs', (req, res) => {
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
app.get('/notifications', (req, res) => {
  const notifications = [
    { id: 1, text: 'New application received from Ana Dela Cruz.', createdAt: '2026-06-30T14:30:00' },
    { id: 2, text: 'Application from Lorenzo Rivera was approved.', createdAt: '2026-06-30T11:15:00' },
    { id: 3, text: 'A user profile change requires review.', createdAt: '2026-06-29T18:40:00' },
    { id: 4, text: 'New research entry submission is awaiting review.', createdAt: '2026-06-28T09:05:00' },
  ];
  res.json(notifications);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});