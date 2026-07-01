import { ipRecords } from '../data/ip.js'

let records = ipRecords.map(record => ({ ...record }))

export async function getIpRecords() {
  return records.map(record => ({ ...record }))
}

export async function createIpRecord(payload) {
  const newRecord = {
    id: Date.now(),
    ...payload,
  }
  records = [...records, newRecord]
  return { ...newRecord }
}

export async function updateIpRecord(id, payload) {
  records = records.map(record => (record.id === id ? { ...record, ...payload } : record))
  return records.find(record => record.id === id)
}

export async function deleteIpRecord(id) {
  records = records.filter(record => record.id !== id)
  return true
}
