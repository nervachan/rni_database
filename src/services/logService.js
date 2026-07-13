import api from './api';

// Maps a raw `logs` table row to the shape the Logs page and dashboard
// preview expect. Two things this deliberately fixes, not just renames:
//
// 1. Column names: the table stores actor_name/actor_email/actor_role
//    (matching what logAction() in api/index.js inserts), but the UI
//    was built around name/email/role. Renamed here so the rest of the
//    frontend doesn't need to know about the raw column names.
//
// 2. Role casing: logAction() pulls actor_role straight from the
//    Firebase custom claim, which is always lowercase ('intto', 'rso',
//    'superadmin'). The Logs page's role filter (FilterControls) offers
//    'INTTO'/'RSO' uppercase, matching the users table's role column.
//    Without normalizing here, the role filter would silently match
//    nothing — every log row's role would fail the comparison. .toUpperCase()
//    fixes that at the one place both sides meet.
function toClientRecord(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    action: row.action,
    name: row.actor_name,
    email: row.actor_email,
    role: row.actor_role ? row.actor_role.toUpperCase() : row.actor_role,
    severity: row.severity,
  };
}

export async function getLogs() {
  const { data } = await api.get('/logs');
  return data.logs.map(toClientRecord);
}