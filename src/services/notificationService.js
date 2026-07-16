import api from './api';

// Maps a raw `notifications` table row to the shape appliAndNotifs.vue
// expects. created_at (the real column name) becomes createdAt to
// match what the component's formatTimeAgo() already reads.
function toClientRecord(row) {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
  };
}

export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data.notifications.map(toClientRecord);
}