// import { ipRecords } from '../data/ip.js'

// let records = ipRecords.map(record => ({ ...record }))

// export async function getIpRecords() {
//   return records.map(record => ({ ...record }))
// }

// export async function createIpRecord(payload) {
//   const newRecord = {
//     id: Date.now(),
//     ...payload,
//   }
//   records = [...records, newRecord]
//   return { ...newRecord }
// }

// export async function updateIpRecord(id, payload) {
//   records = records.map(record => (record.id === id ? { ...record, ...payload } : record))
//   return records.find(record => record.id === id)
// }

// export async function deleteIpRecord(id) {
//   records = records.filter(record => record.id !== id)
//   return true
// }

//===========================================^Left Over COde^================================

const API_BASE = import.meta.env.VITE_API_BASE_URL

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not set. Add it to your .env file.')
}
// This file is a service layer for the IP management feature.
//  It handles fetching, creating, updating, and deleting IP records from the backend API. 
// It also manages the mapping between classification IDs and names, which are stored in a separate classifications table in the database.
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



// What this file is actually doing, in plain terms, since it's a big jump from the old version:

// getClassificationsMap() fetches the classifications table once and builds two lookup tables in memory: one to go from classification_id (number) → name ('Patent'), and one the reverse direction. It's cached in classificationsCache so it only fetches once per page load, not on every single record read.
// getIpRecords() fetches /ips from your Express backend, then runs each row through toClientRecord() to convert it into the exact shape ipManagement.vue already expects — same field names (filingDate, classification) it was using with the old mock data, so nothing downstream breaks yet from this file alone.
// createIpRecord()/updateIpRecord() do the reverse: take what the component sends, convert it back to the DB's snake_case shape and swap the classification name back to an id, then POST/PATCH to Express.
// deleteIpRecord() is unchanged in spirit, just now an actual network call instead of an array filter.

// One thing this file does NOT fix yet, on purpose: status now comes back as a plain string ('Granted') instead of the old ['Granted'] array — that's correct per the DB schema, but ipManagement.vue still expects an array in several places. That mismatch is 4c, next. Nothing will visibly work correctly until 4c is also done — this file alone isn't meant to be tested in isolation.