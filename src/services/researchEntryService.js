// rni_database/src/services/researchEntryService.js
import api from './api'

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

export async function getResearchEntries() {
  let entries
  try {
    const { data } = await api.get('/research-entries')
    entries = data.entries
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to load research entries (${status})`)
  }

  return entries.map(toClientRecord)
}

export async function createResearchEntry(payload) {
  let entry
  try {
    const { data } = await api.post('/research-entries', toDbPayload(payload))
    entry = data.entry
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to create research entry (${status})`)
  }

  return toClientRecord(entry)
}

export async function updateResearchEntry(id, payload) {
  let entry
  try {
    const { data } = await api.patch(`/research-entries/${id}`, toDbPayload(payload))
    entry = data.entry
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to update research entry (${status})`)
  }

  return toClientRecord(entry)
}

export async function deleteResearchEntry(id) {
  try {
    await api.delete(`/research-entries/${id}`)
  } catch (err) {
    const status = err.response?.status ?? 'network error'
    throw new Error(`Failed to delete research entry (${status})`)
  }
  return true
}