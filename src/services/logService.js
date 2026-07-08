const initialLogs = [ //Mock data, to be cleaned later
  {
    id: 1,
    timestamp: '2026-06-30T14:30:00',
    action: 'User Login',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'INTTO',
    severity: 'normal',
  },
  {
    id: 2,
    timestamp: '2026-06-29T10:15:00',
    action: 'Profile Updated',
    name: 'Rafael Lim',
    email: 'rafael.lim@example.com',
    role: 'RSO',
    severity: 'warning',
  },
  {
    id: 3,
    timestamp: '2026-06-28T09:05:00',
    action: 'Password Reset',
    name: 'Jasmine Torres',
    email: 'jasmine.torres@example.com',
    role: 'INTTO',
    severity: 'warning',
  },
  {
    id: 4,
    timestamp: '2026-06-27T18:40:00',
    action: 'Role Changed',
    name: 'Paul Reyes',
    email: 'paul.reyes@example.com',
    role: 'RSO',
    severity: 'warning',
  },
  {
    id: 5,
    timestamp: '2026-06-26T13:20:00',
    action: 'Account Activated',
    name: 'Cris Villanueva',
    email: 'cris.villanueva@example.com',
    role: 'INTTO',
    severity: 'normal',
  },
  {
    id: 6,
    timestamp: '2026-06-25T07:55:00',
    action: 'Access Denied',
    name: 'Mina Cruz',
    email: 'mina.cruz@example.com',
    role: 'RSO',
    severity: 'critical',
  },
];

//log functions
let logs = initialLogs.map((log) => ({ ...log }));

export function getLogs() {
  return logs.map((log) => ({ ...log }));
}
