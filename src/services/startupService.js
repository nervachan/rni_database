const API_BASE = import.meta.env.VITE_API_BASE_URL

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not set. Add it to your .env file.')
}

function toClientCohort(row, startupCountByCohortId) {
  return {
    id:    row.id,
    name:  row.cohort_name,
    value: startupCountByCohortId.get(row.id) ?? 0,
  }
}

function toClientStartup(row) {
  return {
    id:               row.id,
    cohortId:         row.cohort_id,
    name:             row.name,
    genre:            row.genre,
    shortDescription: row.short_description,
    logo:             row.logo_url,
  }
}

function toDbCohortPayload(payload) {
  const dbPayload = {}
  if (payload.name !== undefined) dbPayload.cohort_name = payload.name
  return dbPayload
}

function toDbStartupPayload(payload) {
  const dbPayload = {}
  if (payload.cohortId         !== undefined) dbPayload.cohort_id        = payload.cohortId
  if (payload.name             !== undefined) dbPayload.name             = payload.name
  if (payload.genre            !== undefined) dbPayload.genre            = payload.genre
  if (payload.shortDescription !== undefined) dbPayload.short_description = payload.shortDescription
  if (payload.logo             !== undefined) dbPayload.logo_url         = payload.logo
  return dbPayload
}

export async function getCohorts() {
  const [cohortsRes, startupsRes] = await Promise.all([
    fetch(`${API_BASE}/cohorts`),
    fetch(`${API_BASE}/startups`),
  ])
  if (!cohortsRes.ok) throw new Error(`Failed to load cohorts (${cohortsRes.status})`)
  if (!startupsRes.ok) throw new Error(`Failed to load startups (${startupsRes.status})`)

  const { cohorts } = await cohortsRes.json()
  const { startups } = await startupsRes.json()

  const startupCountByCohortId = new Map()
  startups.forEach(s => {
    startupCountByCohortId.set(s.cohort_id, (startupCountByCohortId.get(s.cohort_id) ?? 0) + 1)
  })

  return cohorts.map(row => toClientCohort(row, startupCountByCohortId))
}

export async function getStartups() {
  const res = await fetch(`${API_BASE}/startups`)
  if (!res.ok) throw new Error(`Failed to load startups (${res.status})`)
  const { startups } = await res.json()

  return startups.map(toClientStartup)
}

export async function getGenres() {
  const startups = await getStartups()

  const genreCounts = startups.reduce((acc, s) => {
    acc[s.genre] = (acc[s.genre] || 0) + 1
    return acc
  }, {})

  return Object.entries(genreCounts).map(([label, value]) => ({ label, value }))
}

export async function createCohort(payload) {
  const res = await fetch(`${API_BASE}/cohorts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbCohortPayload(payload)),
  })
  if (!res.ok) throw new Error(`Failed to create cohort (${res.status})`)
  const { cohort } = await res.json()

  return { id: cohort.id, name: cohort.cohort_name, value: 0 }
}

export async function createStartup(payload) {
  const res = await fetch(`${API_BASE}/startups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbStartupPayload(payload)),
  })
  if (!res.ok) throw new Error(`Failed to create startup (${res.status})`)
  const { startup } = await res.json()

  return toClientStartup(startup)
}

export async function updateStartup(id, payload) {
  const res = await fetch(`${API_BASE}/startups/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbStartupPayload(payload)),
  })
  if (!res.ok) throw new Error(`Failed to update startup (${res.status})`)
  const { startup } = await res.json()

  return toClientStartup(startup)
}

export async function deleteStartup(id) {
  const res = await fetch(`${API_BASE}/startups/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete startup (${res.status})`)
  return true
}