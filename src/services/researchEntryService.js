import api from './api'
// Service layer for the RSO research entries feature. Simpler than
// ipService.js/startupService.js since there's no separate lookup table to
// join against here — every field on a research entry lives directly on
// the research_entries row.
// rni_database/src/services/researchEntryService.js


// Convert a raw database row (snake_case columns) into the camelCase shape
// resEntryMgmt.vue and RSODashboard.vue actually work with.
function toClientRecord(row) {
  return {
    id:         row.id,
    title:      row.title,
    authors:    row.authors,
    coAuthors:  row.co_authors,
    startDate:  row.start_date,
    endDate:    row.end_date,
    isbn:       row.isbn,
    scopusLink: row.scopus_link,
    abstract:   row.abstract,
  }
}

// The reverse of toClientRecord() — builds the database's snake_case shape
// from whatever a form actually changed. Only fields the caller set are
// included, so a partial edit doesn't wipe out other columns with undefined.
function toDbPayload(record) {
  const payload = {}
  if (record.title      !== undefined) payload.title       = record.title
  if (record.authors    !== undefined) payload.authors     = record.authors
  if (record.coAuthors  !== undefined) payload.co_authors  = record.coAuthors
  if (record.startDate  !== undefined) payload.start_date  = record.startDate
  if (record.endDate    !== undefined) payload.end_date    = record.endDate
  if (record.isbn       !== undefined) payload.isbn        = record.isbn
  if (record.scopusLink !== undefined) payload.scopus_link = record.scopusLink
  if (record.abstract   !== undefined) payload.abstract    = record.abstract
  return payload
}

// Fetch every research entry.
export async function getResearchEntries() {
  let entries
  try {
    const { data } = await api.get('/research-entries')
    entries = data.entries
  } catch (err) {
    // err here is already a plain Error thrown by api.js's response
    // interceptor, which pulls the backend's real message out of
    // error.response.data.error — err.response doesn't exist on it.
    // Reading err.response?.status (the old code) was always undefined,
    // so every failure showed "(network error)" no matter what actually
    // went wrong. err.message is the real reason, same as every other
    // service file in this project.
    throw new Error(`Failed to load research entries. ${err.message}`)
  }

  return entries.map(toClientRecord)
}

// Create a new research entry. Returns the row exactly as Supabase stored
// it (with its generated id), converted to client shape, so the caller can
// add it straight to its local list without a second round trip.
export async function createResearchEntry(payload) {
  let entry
  try {
    const { data } = await api.post('/research-entries', toDbPayload(payload))
    entry = data.entry
  } catch (err) {
    // Same reasoning as getResearchEntries() above — err is already a
    // plain Error with the real backend message on err.message.
    throw new Error(`Failed to create research entry. ${err.message}`)
  }

  return toClientRecord(entry)
}

// Update an existing research entry by id.
export async function updateResearchEntry(id, payload) {
  let entry
  try {
    const { data } = await api.patch(`/research-entries/${id}`, toDbPayload(payload))
    entry = data.entry
  } catch (err) {
    // Same reasoning as getResearchEntries() above.
    throw new Error(`Failed to update research entry. ${err.message}`)
  }

  return toClientRecord(entry)
}

// Delete a research entry by id.
export async function deleteResearchEntry(id) {
  try {
    await api.delete(`/research-entries/${id}`)
  } catch (err) {
    // Same reasoning as getResearchEntries() above.
    throw new Error(`Failed to delete research entry. ${err.message}`)
  }
  return true
}