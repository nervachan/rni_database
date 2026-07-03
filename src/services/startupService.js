import { cohorts, genres, startups } from '../data/startups.js'

let localCohorts = cohorts.map(item => ({ ...item }))
let localGenres = genres.map(item => ({ ...item }))
let localStartups = startups.map(item => ({ ...item }))

export async function getCohorts() {
  return localCohorts.map(item => ({ ...item }))
}

export async function getStartups() {
  return localStartups.map(item => ({ ...item }))
}

export async function getGenres() {
  return localGenres.map(item => ({ ...item }))
}

export async function createCohort(payload) {
  const newCohort = {
    id: Date.now(),
    ...payload,
  }
  localCohorts = [...localCohorts, newCohort]
  return { ...newCohort }
}

export async function createStartup(payload) {
  const newStartup = {
    id: Date.now(),
    ...payload,
  }
  localStartups = [...localStartups, newStartup]
  return { ...newStartup }
}

export async function updateStartup(id, payload) {
  localStartups = localStartups.map(item => (item.id === id ? { ...item, ...payload } : item))
  return localStartups.find(item => item.id === id)
}

export async function deleteStartup(id) {
  localStartups = localStartups.filter(item => item.id !== id)
  return true
}
