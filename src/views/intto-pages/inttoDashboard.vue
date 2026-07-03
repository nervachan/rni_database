<script setup>

import { ref, computed, onMounted } from 'vue'
import { getIpRecords } from '../../services/ipService.js'
import { getCohorts, getStartups, getGenres } from '../../services/startupService.js'

const ipRecords = ref([])
const cohorts   = ref([])
const startups  = ref([])
const genres    = ref([])
const loadError = ref('')

async function loadData() {
  loadError.value = ''
  try {
    ipRecords.value = await getIpRecords()
    cohorts.value   = await getCohorts()
    startups.value  = await getStartups()
    genres.value    = await getGenres()
  } catch (err) {
    loadError.value = 'Failed to load dashboard data. ' + err.message
  }
}

onMounted(loadData)

const startupsPerCohort = computed(() => cohorts.value)
const startupsByGenre   = computed(() => genres.value)

const totalStartups = computed(() => startups.value.length)
const totalCohorts  = computed(() => cohorts.value.length)
const activeCohort  = computed(() => cohorts.value.length ? cohorts.value[cohorts.value.length - 1].name : '')
const activeCount   = computed(() => {
  const lastCohort = cohorts.value[cohorts.value.length - 1]
  return lastCohort ? startups.value.filter(s => s.cohortId === lastCohort.id).length : 0
})
const topGenre      = computed(() => genres.value.length ? genres.value.reduce((a, b) => a.value > b.value ? a : b).label : '')
const topGenreCount = computed(() => genres.value.length ? genres.value.reduce((a, b) => a.value > b.value ? a : b).value : 0)

const startupStats = computed(() => [
  { eyebrow: 'Total Startups', value: totalStartups.value, sub: 'All cohorts' },
  { eyebrow: 'Total Cohorts',  value: totalCohorts.value,  sub: `Cohort 1–${totalCohorts.value}` },
  { eyebrow: 'Active Cohort',  value: activeCohort.value,  sub: `${activeCount.value} startups enrolled`, large: true },
  { eyebrow: 'Top Genre',      value: topGenre.value,      sub: `${topGenreCount.value} of ${totalStartups.value} startups`, large: true },
])

const maxCohort = computed(() => startupsPerCohort.value.length ? Math.max(...startupsPerCohort.value.map(i => i.value)) : 0)
const maxGenre  = computed(() => startupsByGenre.value.length ? Math.max(...startupsByGenre.value.map(i => i.value)) : 0)

function barPercent(value, max) {
  return max ? Math.round((value / max) * 100) : 0
}

const ipByClassification = computed(() => [
  { label: 'Patent',            value: ipRecords.value.filter(r => r.classification === 'Patent').length },
  { label: 'Trademark',         value: ipRecords.value.filter(r => r.classification === 'Trademark').length },
  { label: 'Copyright',         value: ipRecords.value.filter(r => r.classification === 'Copyright').length },
  { label: 'Industrial Design', value: ipRecords.value.filter(r => r.classification === 'Industrial Design').length },
  { label: 'Trade secret',      value: ipRecords.value.filter(r => r.classification === 'Trade secret').length },
  { label: 'Utility model',     value: ipRecords.value.filter(r => r.classification === 'Utility model').length },
])

const ipByStatus = computed(() => [
  { label: 'Pending',   value: ipRecords.value.filter(r => r.status.includes('Pending')).length,   color: '#e6a817' },
  { label: 'Granted',   value: ipRecords.value.filter(r => r.status.includes('Granted')).length,   color: '#2ecc71' },
])

const ipStats = computed(() => [
  { eyebrow: 'Total IP filings', value: ipRecords.value.length,                                                sub: 'All classifications' },
  { eyebrow: 'Pending',          value: ipRecords.value.filter(r => r.status.includes('Pending')).length,      sub: 'Awaiting decision', subClass: 'warn' },
  { eyebrow: 'Granted',          value: ipRecords.value.filter(r => r.status.includes('Granted')).length,      sub: 'Approved',          subClass: 'ok'   },
])

const maxClass  = computed(() => ipByClassification.value.length ? Math.max(...ipByClassification.value.map(i => i.value)) : 0)
const totalStatus = computed(() => ipByStatus.value.reduce((sum, item) => sum + item.value, 0))

const statusChartGradient = computed(() => {
  if (!totalStatus.value) return 'conic-gradient(#e5e7eb 0deg 360deg)'

  let accumulated = 0
  const stops = ipByStatus.value.map((item) => {
    const start = (accumulated / totalStatus.value) * 360
    accumulated += item.value
    const end = (accumulated / totalStatus.value) * 360
    return `${item.color} ${start}deg ${end}deg`
  })

  return `conic-gradient(${stops.join(', ')})`
})


</script>
<template>

  <div class="dashPage flex flex-col gap-4 p-3 sm:p-5 min-h-screen bg-grey-100">
    <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
      {{ loadError }}
    </div>

    <!-- Startups Header -->
    <h2 class="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#000000]">Startups</h2>

    <!-- Startup Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
      <div v-for="s in startupStats" :key="s.eyebrow"
        class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <span class="text-[10px] sm:text-[11px] font-medium text-black">{{ s.eyebrow }}</span>
        <span class="font-bold text-black leading-tight" :class="s.large ? 'text-[18px] sm:text-[22px]' : 'text-[20px] sm:text-[26px]'">{{ s.value }}</span>
        <span class="text-[9px] sm:text-[11px] text-black/40 mt-0.5">{{ s.sub }}</span>
      </div>
    </div>

    <!-- Startup Charts -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <p class="text-[10px] sm:text-xs font-semibold text-black mb-2 sm:mb-3.5">Startups per cohort</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in startupsPerCohort" :key="item.name" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-black/60 w-[70px] sm:w-[110px] shrink-0">{{ item.name }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-[#9ecfa8] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxCohort) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-black w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <p class="text-[10px] sm:text-xs font-semibold text-black mb-2 sm:mb-3.5">Startups by genre</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in startupsByGenre" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-black/60 w-[70px] sm:w-[110px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-[#9ecfa8] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxGenre) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-black w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- IP Header -->
    <h2 class="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#040504]">Intellectual Property</h2>

    <!-- IP Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
      <div v-for="s in ipStats" :key="s.eyebrow"
        class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,.25)]">
        <span class="text-[10px] sm:text-[11px] font-medium text-black">{{ s.eyebrow }}</span>
        <span class="text-[20px] sm:text-[26px] font-bold text-black leading-tight">{{ s.value }}</span>
        <span class="text-[9px] sm:text-[11px] mt-0.5" :class="{ 'text-[#e6a817]': s.subClass === 'warn', 'text-[#2ecc71]': s.subClass === 'ok', 'text-grey/40': !s.subClass }">{{ s.sub }}</span>
      </div>
    </div>

    <!-- IP Charts -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <p class="text-[10px] sm:text-xs font-semibold text-black mb-2 sm:mb-3.5">IP by classification</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in ipByClassification" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-black/60 w-[85px] sm:w-[130px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-[#9ecfa8] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxClass) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-black w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] bg-white border border-white/10 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <p class="text-[10px] sm:text-xs font-semibold text-black mb-2 sm:mb-3.5">IP by status</p>
        <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div class="relative h-[180px] w-[180px] sm:h-[220px] sm:w-[220px] shrink-0 rounded-full" :style="{ background: statusChartGradient }">
            <div class="absolute inset-[28%] rounded-full bg-white shadow-inner"></div>
          </div>
          <div class="flex-1 flex flex-col gap-2 sm:gap-3 w-full">
            <div v-for="item in ipByStatus" :key="item.label" class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></span>
              <span class="text-[9px] sm:text-xs text-black/70 flex-1">{{ item.label }}</span>
              <span class="text-[9px] sm:text-xs font-semibold text-black">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  
</template>

<style scoped>



</style>