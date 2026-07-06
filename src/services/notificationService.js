const initialNotifications = [ // mock data, to be cleaned later
  {
    id: 1,
    text: 'New application received from Ana Dela Cruz.',
    createdAt: '2026-06-30T14:30:00',
  },
  {
    id: 2,
    text: 'Application from Lorenzo Rivera was approved.',
    createdAt: '2026-06-30T11:15:00',
  },
  {
    id: 3,
    text: 'A user profile change requires review.',
    createdAt: '2026-06-29T18:40:00',
  },
  {
    id: 4,
    text: 'New research entry submission is awaiting review.',
    createdAt: '2026-06-28T09:05:00',
  },
];

// notifications function
export function getNotifications() {
  return initialNotifications.map((notification) => ({ ...notification }));
}
