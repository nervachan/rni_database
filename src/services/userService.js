const initialUsers = [
  {
    id: 1,
    name: 'Maria Santos',
    role: 'INTTO',
    email: 'maria.santos@example.com',
    approvedAt: '2026-06-27',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Rafael Lim',
    role: 'RSO',
    email: 'rafael.lim@example.com',
    approvedAt: '2026-06-24',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Jasmine Torres',
    role: 'INTTO',
    email: 'jasmine.torres@example.com',
    approvedAt: '2026-06-21',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Paul Reyes',
    role: 'RSO',
    email: 'paul.reyes@example.com',
    approvedAt: '2026-06-18',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Cris Villanueva',
    role: 'INTTO',
    email: 'cris.villanueva@example.com',
    approvedAt: '2026-06-15',
    status: 'Inactive',
  },
  {
    id: 6,
    name: 'Mina Cruz',
    role: 'RSO',
    email: 'mina.cruz@example.com',
    approvedAt: '2026-06-12',
    status: 'Active',
  },
];

let users = initialUsers.map((user) => ({ ...user }));

export function getUsers() {
  return users.map((user) => ({ ...user }));
}

export function updateUser(id, payload) {
  users = users.map((user) => (user.id === id ? { ...user, ...payload } : user));
  return getUsers().find((user) => user.id === id);
}
