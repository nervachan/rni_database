const initialEntries = [
  {
    id: 1,
    title: 'AI-Powered Crop Disease Detection',
    authors: 'Maria Santos',
    coAuthors: 'Ken Cruz',
    startDate: '2026-06-27',
    endDate: '2026-06-30',
    isbn: '978-1-234567-89-0',
    scopusLink: '#',
    abstract: 'A study on using AI for early crop disease detection in agricultural fields.',
  },
  {
    id: 2,
    title: 'Green Energy Storage Optimization',
    authors: 'Rafael Lim',
    coAuthors: 'Ana Dela Cruz',
    startDate: '2026-06-24',
    endDate: '2026-06-28',
    isbn: '978-1-234567-90-4',
    scopusLink: '#',
    abstract: 'An exploration of optimized energy storage for sustainable power systems.',
  },
  {
    id: 3,
    title: 'Community Health Data Platform',
    authors: 'Jasmine Torres',
    coAuthors: 'N/A',
    startDate: '2026-06-21',
    endDate: '2026-06-25',
    isbn: '978-1-234567-91-2',
    scopusLink: '#',
    abstract: 'A platform for aggregating community health data for local stakeholders.',
  },
  {
    id: 4,
    title: 'Smart Waste Collection Routing',
    authors: 'Paul Reyes',
    coAuthors: 'Liza Buenaventura',
    startDate: '2026-06-18',
    endDate: '2026-06-22',
    isbn: '978-1-234567-92-0',
    scopusLink: '#',
    abstract: 'Route optimization for smart waste collection systems in urban zones.',
  },
  {
    id: 5,
    title: 'Accessible Learning Assistant',
    authors: 'Cris Villanueva',
    coAuthors: 'N/A',
    startDate: '2026-06-15',
    endDate: '2026-06-18',
    isbn: '978-1-234567-93-9',
    scopusLink: '#',
    abstract: 'A digital assistant focused on accessible and inclusive learning.',
  },
  {
    id: 6,
    title: 'Urban Flood Monitoring Systems',
    authors: 'Mina Cruz',
    coAuthors: 'John Rivera',
    startDate: '2026-06-12',
    endDate: '2026-06-16',
    isbn: '978-1-234567-94-7',
    scopusLink: '#',
    abstract: 'An IoT-driven flood monitoring architecture for cities.',
  },
  {
    id: 7,
    title: 'Biodegradable Packaging Materials',
    authors: 'Ian Santos',
    coAuthors: 'Tina Romero',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    isbn: '978-1-234567-95-5',
    scopusLink: '#',
    abstract: 'Research into packaging materials designed to decompose safely.',
  },
  {
    id: 8,
    title: 'Digital Twin for Smart Cities',
    authors: 'Nina Gomez',
    coAuthors: 'Owen Tan',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    isbn: '978-1-234567-96-3',
    scopusLink: '#',
    abstract: 'Simulation models for smart city infrastructure planning and maintenance.',
  },
  {
    id: 9,
    title: 'Remote Sensing for Reforestation',
    authors: 'Grace Belen',
    coAuthors: 'N/A',
    startDate: '2026-06-05',
    endDate: '2026-06-09',
    isbn: '978-1-234567-97-1',
    scopusLink: '#',
    abstract: 'Using remote sensing data to support reforestation efforts.',
  },
  {
    id: 10,
    title: 'Adaptive Learning Analytics',
    authors: 'Leo Navarro',
    coAuthors: 'Mia Perez',
    startDate: '2026-06-02',
    endDate: '2026-06-06',
    isbn: '978-1-234567-98-0',
    scopusLink: '#',
    abstract: 'Analytics-driven adaptation for personalized learning systems.',
  },
];

let researchEntries = initialEntries.map((entry) => ({ ...entry }));

export function getResearchEntries() {
  return researchEntries.map((entry) => ({ ...entry }));
}

export function createResearchEntry(payload) {
  const entry = {
    id: Date.now(),
    ...payload,
  };
  researchEntries = [entry, ...researchEntries];
  return entry;
}

export function updateResearchEntry(id, payload) {
  researchEntries = researchEntries.map((entry) => (entry.id === id ? { ...entry, ...payload } : entry));
  return getResearchEntries().find((entry) => entry.id === id);
}

export function deleteResearchEntry(id) {
  researchEntries = researchEntries.filter((entry) => entry.id !== id);
  return true;
}
