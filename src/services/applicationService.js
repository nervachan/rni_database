const initialApplications = [
  {
    id: 1,
    name: 'Ana Dela Cruz',
    role: 'INTTO',
    email: 'ana.delacruz@example.com',
    dateApplied: '2026-06-30',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Lorenzo Rivera',
    role: 'RSO',
    email: 'lorenzo.rivera@example.com',
    dateApplied: '2026-06-29',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Bea Mendoza',
    role: 'INTTO',
    email: 'bea.mendoza@example.com',
    dateApplied: '2026-06-28',
    status: 'pending',
  },
];

let applications = initialApplications.map((application) => ({ ...application }));

export function getApplications() {
  return applications.filter((application) => application.status === 'pending').map((application) => ({ ...application }));
}

export function approveApplication(id) {
  applications = applications.map((application) => (application.id === id ? { ...application, status: 'approved' } : application));
  return true;
}

export function rejectApplication(id) {
  applications = applications.map((application) => (application.id === id ? { ...application, status: 'rejected' } : application));
  return true;
}
