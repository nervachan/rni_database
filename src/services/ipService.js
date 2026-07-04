const API_BASE = import.meta.env.VITE_API_BASE_URL

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not set. Add it to your .env file.')
}

let classificationsCache = null

async function getClassificationsMap() {
  if (classificationsCache) return classificationsCache

  const res = await fetch(`${API_BASE}/classifications`)
  if (!res.ok) throw new Error(`Failed to load classifications (${res.status})`)
  const { classifications } = await res.json()

  classificationsCache = {
    byId:   new Map(classifications.map(c => [c.id, c.classification_name])),
    byName: new Map(classifications.map(c => [c.classification_name, c.id])),
  }
  return classificationsCache
}

function toClientRecord(row, classificationsById) {
  return {
    id:             row.id,
    title:          row.title,
    inventors:      row.inventors,
    filingDate:     row.filing_date,
    status:         row.status,
    classification: classificationsById.get(row.classification_id) ?? '',
    refNumber:      row.ref_number,
  }
}

function toDbPayload(record, classificationsByName) {
  const payload = {}
  if (record.title          !== undefined) payload.title             = record.title
  if (record.inventors      !== undefined) payload.inventors         = record.inventors
  if (record.filingDate     !== undefined) payload.filing_date       = record.filingDate
  if (record.status         !== undefined) payload.status            = record.status
  if (record.classification !== undefined) payload.classification_id = classificationsByName.get(record.classification)
  if (record.refNumber      !== undefined) payload.ref_number        = record.refNumber
  return payload
}

export async function getIpRecords() {
  const { byId } = await getClassificationsMap()

  const res = await fetch(`${API_BASE}/ips`)
  if (!res.ok) throw new Error(`Failed to load IP records (${res.status})`)
  const { ips } = await res.json()

  return ips.map(row => toClientRecord(row, byId))
}

export async function createIpRecord(payload) {
  const { byId, byName } = await getClassificationsMap()

  const res = await fetch(`${API_BASE}/ips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbPayload(payload, byName)),
  })
  if (!res.ok) throw new Error(`Failed to create IP record (${res.status})`)
  const { ip } = await res.json()

  return toClientRecord(ip, byId)
}

export async function updateIpRecord(id, payload) {
  const { byId, byName } = await getClassificationsMap()

  const res = await fetch(`${API_BASE}/ips/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDbPayload(payload, byName)),
  })
  if (!res.ok) throw new Error(`Failed to update IP record (${res.status})`)
  const { ip } = await res.json()

  return toClientRecord(ip, byId)
}

export async function deleteIpRecord(id) {
  const res = await fetch(`${API_BASE}/ips/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete IP record (${res.status})`)
  return true
}