const express = require('express');
const { auth } = require('../firebase.cjs');
const { supabase } = require('../supabaseClient.cjs');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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
    .from('research-entries')
    .select('*');

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ 'research-entries': data });
});

app.post('/api/applications', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    const { data, error } = await supabase
      .from('applications')
      .insert({
        firebase_uid: userRecord.uid,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        status: 'pending'
      })
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Application submitted',
      applicationId: data[0].id,
      firebaseUid: userRecord.uid
    });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/applications/:id/approve - Approve application
app.patch('/api/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status to approved
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Copy to users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        firebase_uid: application.firebase_uid,
        name: `${application.first_name} ${application.last_name}`,
        email: application.email,
        role: application.role
      });

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ message: 'Application approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/applications/:id/reject - Reject application
app.patch('/api/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Delete Firebase account
    try {
      await auth.deleteUser(application.firebase_uid);
    } catch (deleteError) {
      console.error('Failed to delete Firebase user:', deleteError);
    }

    res.json({ message: 'Application rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications - Get pending applications (mock data for now)
app.get('/api/applications', (req, res) => {
  const applications = [
    { id: 1, name: 'Ana Dela Cruz', role: 'INTTO', email: 'ana.delacruz@example.com', dateApplied: '2026-06-30', status: 'pending' },
    { id: 2, name: 'Lorenzo Rivera', role: 'RSO', email: 'lorenzo.rivera@example.com', dateApplied: '2026-06-29', status: 'pending' },
    { id: 3, name: 'Bea Mendoza', role: 'INTTO', email: 'bea.mendoza@example.com', dateApplied: '2026-06-28', status: 'pending' },
  ];
  res.json(applications.filter(a => a.status === 'pending'));
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
    { id: 3, text: 'A user profile change requires review.', createdAt: '2026-06-28T09:05:00' },
    { id: 4, text: 'New research entry submission is awaiting review.', createdAt: '2026-06-28T09:05:00' },
  ];
  res.json(notifications);
});

module.exports = app;
