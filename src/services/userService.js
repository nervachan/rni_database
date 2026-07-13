import api from './api'

// name, role, email, status, and approved_at are all real columns on
// the users table. status syncs to Firebase's `disabled` flag and
// approved_at is set when an application is approved (see
// PATCH /api/applications/:id/approve in api/index.js).
function toClientRecord(row) {
  return {
    id:         row.id,
    name:       row.name,
    role:       row.role,
    email:      row.email,
    status:     row.status,
    approvedAt: row.approved_at,
  }
}

function toDbPayload(payload) {
  const dbPayload = {}
  if (payload.name   !== undefined) dbPayload.name   = payload.name
  if (payload.role   !== undefined) dbPayload.role   = payload.role
  if (payload.email  !== undefined) dbPayload.email  = payload.email
  if (payload.status !== undefined) dbPayload.status = payload.status
  return dbPayload
}

export async function getUsers() {
  const { data } = await api.get('/users')
  return data.users.map(toClientRecord)
}

export async function updateUser(id, payload) {
  const { data } = await api.patch(`/users/${id}`, toDbPayload(payload))
  return toClientRecord(data.user)
}