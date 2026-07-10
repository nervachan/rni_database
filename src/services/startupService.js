import api from './api'
// This file is the service layer for both cohorts and startups — they're
// managed together on the same page (startupManagement.vue: startups are
// grouped into cohorts), so it made sense to keep them in one file rather
// than split them.

// Convert database row to client-friendly cohort object.
// startupCountByCohortId is computed once in getCohorts() below and passed
// in here, rather than each cohort querying the startups table itself.
function toClientCohort(row, startupCountByCohortId) {
  return {
    id:    row.id,
    name:  row.cohort_name,
    value: startupCountByCohortId.get(row.id) ?? 0,
  }
}
  

// Convert a raw startup row (snake_case) into the camelCase shape the
// Vue components use.
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


// Convert client payload to database payload for creating/updating a cohort.
// Cohorts only really have one editable field (their name) — everything
// else about a cohort (like its startup count) is derived, not stored.
function toDbCohortPayload(payload) {
  const dbPayload = {}
  if (payload.name !== undefined) dbPayload.cohort_name = payload.name
  return dbPayload
}



// Convert client payload to database payload for creating/updating a
// startup. Only fields the caller actually set are included, so a partial
// edit (e.g. just changing the description) doesn't overwrite the rest.
function toDbStartupPayload(payload) {
  const dbPayload = {}
  if (payload.cohortId         !== undefined) dbPayload.cohort_id        = payload.cohortId
  if (payload.name             !== undefined) dbPayload.name             = payload.name
  if (payload.genre            !== undefined) dbPayload.genre            = payload.genre
  if (payload.shortDescription !== undefined) dbPayload.short_description = payload.shortDescription
  if (payload.logo             !== undefined) dbPayload.logo_url         = payload.logo
  return dbPayload
}

// Get the list of cohorts with the count of startups in each cohort.
// Cohorts and startups are fetched at the same time (Promise.all) since
// neither depends on the other — this avoids waiting for one request to
// finish before starting the second.
export async function getCohorts() {
  const [cohortsRes, startupsRes] = await Promise.all([
    api.get('/cohorts'),
    api.get('/startups'),
  ])

  const { cohorts } = cohortsRes.data
  const { startups } = startupsRes.data

  // Count how many startups belong to each cohort, so each cohort card
  // can show "12 startups" without a separate query per cohort.
  const startupCountByCohortId = new Map()
  startups.forEach(s => {
    startupCountByCohortId.set(s.cohort_id, (startupCountByCohortId.get(s.cohort_id) ?? 0) + 1)
  })

  return cohorts.map(row => toClientCohort(row, startupCountByCohortId))
}



// Get the flat list of all startups (used when a page needs the startups
// themselves, not grouped by cohort).
export async function getStartups() {
  const { data } = await api.get('/startups')
  return data.startups.map(toClientStartup)
}

// Get the list of unique genres in use across all startups, with a count
// of how many startups have each one. There's no separate 'genres' table —
// this is derived on the fly from whatever genre values startups already
// have, so it always reflects real data with no separate list to maintain.
export async function getGenres() {
  const startups = await getStartups()

  const genreCounts = startups.reduce((acc, s) => {
    acc[s.genre] = (acc[s.genre] || 0) + 1
    return acc
  }, {})

  return Object.entries(genreCounts).map(([label, value]) => ({ label, value }))
}
// Create a new cohort. A brand-new cohort always starts at 0 startups,
// so there's no need to recompute the count — just return 0 directly
// instead of re-fetching the startups list.
export async function createCohort(payload) {
  const { data } = await api.post('/cohorts', toDbCohortPayload(payload))
  return { id: data.cohort.id, name: data.cohort.cohort_name, value: 0 }
}


// Create a new startup under a cohort.
export async function createStartup(payload) {
  const { data } = await api.post('/startups', toDbStartupPayload(payload))
  return toClientStartup(data.startup)
}


// Update a startup by ID. Send only the changed fields, get back the
// full updated row from Supabase.
export async function updateStartup(id, payload) {
  const { data } = await api.patch(`/startups/${id}`, toDbStartupPayload(payload))
  return toClientStartup(data.startup)
}

// Delete a startup by ID.

export async function deleteStartup(id) {
  await api.delete(`/startups/${id}`)
  return true
}