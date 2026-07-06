const supabase = require('./supabaseClient')
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

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

app.get('/research-entries', async (req, res) => {
  const { data, error } = await supabase
    .from('research-entries')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ 'research-entries': data });
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
  const { data, error } = await supabase
    .from('cohorts')
    .insert(req.body)
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
  const { data, error } = await supabase
    .from('startups')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ startup: data });
});

app.patch('/startups/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('startups')
    .update(req.body)
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
  const { data, error } = await supabase
    .from('ips')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ip: data });
});

app.patch('/ips/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('ips')
    .update(req.body)
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

// Applications
let applications = [
  { id: 1, name: 'Ana Dela Cruz', role: 'INTTO', email: 'ana.delacruz@example.com', dateApplied: '2026-06-30', status: 'pending' },
  { id: 2, name: 'Lorenzo Rivera', role: 'RSO', email: 'lorenzo.rivera@example.com', dateApplied: '2026-06-29', status: 'pending' },
  { id: 3, name: 'Bea Mendoza', role: 'INTTO', email: 'bea.mendoza@example.com', dateApplied: '2026-06-28', status: 'pending' },
];

app.get('/applications', (req, res) => {
  res.json(applications.filter(a => a.status === 'pending'));
});

app.patch('/applications/:id/approve', (req, res) => {
  const id = Number(req.params.id);
  applications = applications.map(a => a.id === id ? { ...a, status: 'approved' } : a);
  res.json({ success: true });
});

app.patch('/applications/:id/reject', (req, res) => {
  const id = Number(req.params.id);
  applications = applications.map(a => a.id === id ? { ...a, status: 'rejected' } : a);
  res.json({ success: true });
});

// Logs
const logs = [
  { id: 1, timestamp: '2026-06-30T14:30:00', action: 'User Login', name: 'Maria Santos', email: 'maria.santos@example.com', role: 'INTTO', severity: 'normal' },
  { id: 2, timestamp: '2026-06-29T10:15:00', action: 'Profile Updated', name: 'Rafael Lim', email: 'rafael.lim@example.com', role: 'RSO', severity: 'warning' },
  { id: 3, timestamp: '2026-06-28T09:05:00', action: 'Password Reset', name: 'Jasmine Torres', email: 'jasmine.torres@example.com', role: 'INTTO', severity: 'warning' },
  { id: 4, timestamp: '2026-06-27T18:40:00', action: 'Role Changed', name: 'Paul Reyes', email: 'paul.reyes@example.com', role: 'RSO', severity: 'warning' },
  { id: 5, timestamp: '2026-06-26T13:20:00', action: 'Account Activated', name: 'Cris Villanueva', email: 'cris.villanueva@example.com', role: 'INTTO', severity: 'normal' },
  { id: 6, timestamp: '2026-06-25T07:55:00', action: 'Access Denied', name: 'Mina Cruz', email: 'mina.cruz@example.com', role: 'RSO', severity: 'critical' },
];

app.get('/logs', (req, res) => {
  res.json(logs);
});

// Notifications
const notifications = [
  { id: 1, text: 'New application received from Ana Dela Cruz.', createdAt: '2026-06-30T14:30:00' },
  { id: 2, text: 'Application from Lorenzo Rivera was approved.', createdAt: '2026-06-30T11:15:00' },
  { id: 3, text: 'A user profile change requires review.', createdAt: '2026-06-29T18:40:00' },
  { id: 4, text: 'New research entry submission is awaiting review.', createdAt: '2026-06-28T09:05:00' },
];

app.get('/notifications', (req, res) => {
  res.json(notifications);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});