import api from './api';

export async function getApplications() {
  const response = await api.get('/applications');
  return response.data;
}

export async function approveApplication(id) {
  await api.patch(`/applications/${id}/approve`);
  return true;
}

export async function rejectApplication(id) {
  await api.patch(`/applications/${id}/reject`);
  return true;
}