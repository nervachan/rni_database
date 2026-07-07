const API_BASE = import.meta.env.VITE_API_BASE_URL

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not set. Add it to your .env file.')
}

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
  const res = await fetch(`${API_BASE}/research-entries`)
  if (!res.ok) throw new Error(`Failed to load research entries (${res.status})`)
  const { entries } = await res.json()

  return entries.map(toClientRecord)
}

export async function createResearchEntry(payload) {
  const res = await fetch(`${API_BASE}/research-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbPayload(payload)),
  })
  if (!res.ok) throw new Error(`Failed to create research entry (${res.status})`)
  const { entry } = await res.json()

  return toClientRecord(entry)
}

export async function updateResearchEntry(id, payload) {
  const res = await fetch(`${API_BASE}/research-entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbPayload(payload)),
  })
  if (!res.ok) throw new Error(`Failed to update research entry (${res.status})`)
  const { entry } = await res.json()

  return toClientRecord(entry)
}

export async function deleteResearchEntry(id) {
  const res = await fetch(`${API_BASE}/research-entries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete research entry (${res.status})`)
  return true
}