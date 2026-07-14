// rni_database/src/services/ipService.js
import api from './api'

// This file is a service layer for the IP management feature.
// It handles fetching, creating, updating, and deleting IP records from the backend API.
// It also manages the mapping between classification IDs and names, which are stored in a separate classifications table in the database.
let classificationsCache = null

// The 'ips' table only stores a classification_id (a number), not the
// human-readable name ('Patent', 'Trademark', etc.) — that lookup lives in a
// separate 'classifications' table. Rather than re-fetching and re-joining
// that table on every single IP record read, we fetch it once per page load
// and cache both directions (id -> name, and name -> id) in memory.
async function getClassificationsMap() {
  if (classificationsCache) return classificationsCache

  // Cache the in-flight PROMISE itself, not just the value it resolves
  // to. The old version only cached the resolved result — while that
  // first request is still in flight, classificationsCache is still
  // null, so any concurrent caller (e.g. inttoDashboard.vue and
  // ipManagement.vue both mounting around the same time) sees null too
  // and fires its own separate /classifications request. Storing the
  // promise here means every caller that arrives before it settles
  // awaits the SAME request instead of starting a new one.
  classificationsCache = (async () => {
    let classifications
    try {
      const { data } = await api.get('/classifications')
      classifications = data.classifications
    } catch (err) {
      // Clear the cache on failure so the NEXT call gets a fresh
      // attempt, instead of every future call being stuck awaiting
      // this same rejected promise forever.
      classificationsCache = null
      throw new Error(`Failed to load classifications: ${err.message}`)
    }

    return {
      byId:   new Map(classifications.map(c => [c.id, c.classification_name])),
      byName: new Map(classifications.map(c => [c.classification_name, c.id])),
    }
  })()

  return classificationsCache
}

// Clears the cache above. Nothing calls this yet, since there's no UI for
// editing classifications today — it's here so that whenever that feature
// gets built, whoever builds it just has to call this after a save/delete
// instead of rediscovering that the cache exists and needs clearing.
export function invalidateClassificationsCache() {
  classificationsCache = null
}

// Converts a raw database row (snake_case columns, classification_id as a
// number) into the shape the Vue components actually work with (camelCase,
// classification as a readable name). Nothing outside this file should ever
// see a raw database row directly.
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

// The reverse of toClientRecord() — takes whatever a form/component sends
// (only the fields that actually changed) and builds the database's expected
// snake_case shape, converting the classification name back to its id.
// Fields the caller didn't set are left out entirely rather than sent as
// null/undefined, so a partial edit doesn't accidentally wipe other columns.
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

// Fetches every IP record. Requires the classifications map first so each
// row can be converted with a readable classification name attached.
export async function getIpRecords() {
  const { byId } = await getClassificationsMap()

  let ips
  try {
    const { data } = await api.get('/ips')
    ips = data.ips
  } catch (err) {
    throw new Error(`Failed to load IP records: ${err.message}`)
  }

  return ips.map(row => toClientRecord(row, byId))
}

// Creates a new IP record. The backend returns the row as Supabase actually
// stored it (including the generated id), which we convert back to client
// shape before returning — so the caller can push the real record straight
// into its local list without a second fetch.
export async function createIpRecord(payload) {
  const { byId, byName } = await getClassificationsMap()

  let ip
  try {
    const { data } = await api.post('/ips', toDbPayload(payload, byName))
    ip = data.ip
  } catch (err) {
    throw new Error(`Failed to create IP record: ${err.message}`)
  }

  return toClientRecord(ip, byId)
}

// Updates an existing IP record by id. Same round-trip pattern as create:
// send only the changed fields, get back the full updated row.
export async function updateIpRecord(id, payload) {
  const { byId, byName } = await getClassificationsMap()

  let ip
  try {
    const { data } = await api.patch(`/ips/${id}`, toDbPayload(payload, byName))
    ip = data.ip
  } catch (err) {
    throw new Error(`Failed to update IP record: ${err.message}`)
  }

  return toClientRecord(ip, byId)
}

// Deletes an IP record by id. No response body needed — if this doesn't
// throw, the delete succeeded.
export async function deleteIpRecord(id) {
  try {
    await api.delete(`/ips/${id}`)
  } catch (err) {
    throw new Error(`Failed to delete IP record: ${err.message}`)
  }
  return true
}