const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

app.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice', role: 'super-admin' },
      { id: 2, name: 'Bob', role: 'rso-admin' },
      { id: 3, name: 'Charlie', role: 'intto-admin' }
    ]
  });
});

app.get('/research-entries', (req, res) => {
  res.json({
    entries: [
      { id: 1, title: 'Entry 1', office: 'INTTO' },
      { id: 2, title: 'Entry 2', office: 'RSO' },
      { id: 3, title: 'Entry 3', office: 'INTTO' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});