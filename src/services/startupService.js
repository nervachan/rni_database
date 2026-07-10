// rni_database/src/services/startupService.js
import api from './api'

// Convert database row to client-friendly cohort object
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

// Convert client payload to database payload for creating/updating a cohort
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

// Get the list of cohorts with the count of startups in each cohort
export async function getCohorts() {
  let cohorts, startups
  try {
    const [cohortsRes, startupsRes] = await Promise.all([
      api.get('/cohorts'),
      api.get('/startups'),
    ])
    cohorts = cohortsRes.data.cohorts
    startups = startupsRes.data.startups
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to load cohorts (${status})`)
  }

  const startupCountByCohortId = new Map()
  startups.forEach(s => {
    startupCountByCohortId.set(s.cohort_id, (startupCountByCohortId.get(s.cohort_id) ?? 0) + 1)
  })

  return cohorts.map(row => toClientCohort(row, startupCountByCohortId))
}

export async function getStartups() {
  let startups
  try {
    const { data } = await api.get('/startups')
    startups = data.startups
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to load startups (${status})`)
  }

  return startups.map(toClientStartup)
}

// Get the list of unique genres from startups
export async function getGenres() {
  const startups = await getStartups()

  const genreCounts = startups.reduce((acc, s) => {
    acc[s.genre] = (acc[s.genre] || 0) + 1
    return acc
  }, {})

  return Object.entries(genreCounts).map(([label, value]) => ({ label, value }))
}

// Create a new cohort
export async function createCohort(payload) {
  let cohort
  try {
    const { data } = await api.post('/cohorts', toDbCohortPayload(payload))
    cohort = data.cohort
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to create cohort (${status})`)
  }

  return { id: cohort.id, name: cohort.cohort_name, value: 0 }
}

// Create a new startup
export async function createStartup(payload) {
  let startup
  try {
    const { data } = await api.post('/startups', toDbStartupPayload(payload))
    startup = data.startup
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to create startup (${status})`)
  }

  return toClientStartup(startup)
}

// Update a startup by ID
export async function updateStartup(id, payload) {
  let startup
  try {
    const { data } = await api.patch(`/startups/${id}`, toDbStartupPayload(payload))
    startup = data.startup
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to update startup (${status})`)
  }

  return toClientStartup(startup)
}

// Delete a startup by ID
export async function deleteStartup(id) {
  try {
    await api.delete(`/startups/${id}`)
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to delete startup (${status})`)
  }
  return true
}