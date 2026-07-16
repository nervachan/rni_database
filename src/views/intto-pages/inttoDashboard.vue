<script setup>
/**
 * inttoDashboard.vue
 * -------------------
 * Read-only overview page for the INTTO module. Pulls IP records, cohorts,
 * startups, and genre breakdowns on mount and renders two stat/chart
 * sections: "Startups" and "Intellectual Property". Has no write actions —
 * all mutation happens in ipManagement.vue / startupManagement.vue.
 */

import { ref, computed, onMounted } from 'vue'
import { getIpRecords } from '../../services/ipService.js'
import { getStartupBoardData } from '../../services/startupService.js'

// --- Raw data loaded from the backend on mount ---
const ipRecords = ref([])   // IP filings: { id, title, inventors, filingDate, status, classification, refNumber }
const cohorts   = ref([])   // Cohorts:    { id, name, value } where value = startup count in that cohort
const startups  = ref([])   // Startups:   { id, cohortId, name, genre, shortDescription, logo }
const genres    = ref([])   // Genre tally: { label, value } — precomputed count per genre across all startups
const loadError = ref('')   // Populated if any of the four fetches below throw; shown as a banner in the template

// Same genre-counting logic startupService.js's getGenres() uses,
// just applied to startups data already sitting in memory instead of
// triggering its own fetch. Calling the real getGenres() here would
// mean a FOURTH request for the exact same /startups data loadData()
// below already has from getStartupBoardData() — this makes that cost
// nothing extra.
function computeGenreCounts(startupList) {
  const genreCounts = startupList.reduce((acc, s) => {
    acc[s.genre] = (acc[s.genre] || 0) + 1
    return acc
  }, {})
  return Object.entries(genreCounts).map(([label, value]) => ({ label, value }))
}

/**
 * Fetches dashboard data as TWO requests run in parallel — getIpRecords()
 * and getStartupBoardData() — instead of the four sequential, partly
 * redundant calls this used to make. getCohorts() + getStartups() +
 * getGenres() each fetched /startups on their own, meaning this page
 * made three separate round trips to the same table, one after another,
 * with nothing overlapping. getStartupBoardData() already fetches
 * /cohorts and /startups together in one round trip (see
 * startupService.js), and genres are now computed locally from that
 * same startups array via computeGenreCounts() above instead of paying
 * for a fourth fetch.
 * Any failure sets loadError; Promise.all() rejects as soon as either
 * call fails, same short-circuit behavior as before.
 */
async function loadData() {
  loadError.value = ''
  try {
    const [records, boardData] = await Promise.all([
      getIpRecords(),
      getStartupBoardData(),
    ])
    ipRecords.value = records
    cohorts.value   = boardData.cohorts
    startups.value  = boardData.startups
    genres.value    = computeGenreCounts(boardData.startups)
  } catch (err) {
    loadError.value = 'Failed to load dashboard data. ' + err.message
  }
}

onMounted(loadData)

// --- Startup section ---

// Aliases used directly by the "Startups per cohort" / "Startups by genre" bar charts.
// Kept as separate computed refs (rather than reusing `cohorts`/`genres` directly)
// so the template reads semantically ("startupsPerCohort" vs raw "cohorts").
const startupsPerCohort = computed(() => cohorts.value)
const startupsByGenre   = computed(() => genres.value)

const totalStartups = computed(() => startups.value.length)
const totalCohorts  = computed(() => cohorts.value.length)

/** Name of the most recently created cohort (last item in the cohorts array). */
const activeCohort  = computed(() => cohorts.value.length ? cohorts.value[cohorts.value.length - 1].name : '')

/** Number of startups enrolled in the active (most recent) cohort. */
const activeCount   = computed(() => {
  const lastCohort = cohorts.value[cohorts.value.length - 1]
  return lastCohort ? startups.value.filter(s => s.cohortId === lastCohort.id).length : 0
})

/** Genre with the highest startup count, and its count. Empty string/0 when no genres exist. */
const topGenre      = computed(() => genres.value.length ? genres.value.reduce((a, b) => a.value > b.value ? a : b).label : '')
const topGenreCount = computed(() => genres.value.length ? genres.value.reduce((a, b) => a.value > b.value ? a : b).value : 0)

/**
 * Data source for the four "Startups" stat cards at the top of the page.
 * `large: true` cards get a smaller font size in the template to
 * accommodate longer text (cohort names / genre labels).
 */
const startupStats = computed(() => [
  { eyebrow: 'Total Startups', value: totalStartups.value, sub: 'All cohorts' },
  { eyebrow: 'Total Cohorts',  value: totalCohorts.value,  sub: `Cohort 1–${totalCohorts.value}` },
  { eyebrow: 'Active Cohort',  value: activeCohort.value,  sub: `${activeCount.value} startups enrolled`, large: true },
  { eyebrow: 'Top Genre',      value: topGenre.value,      sub: `${topGenreCount.value} of ${totalStartups.value} startups`, large: true },
])

// Highest single value in each bar-chart dataset, used as the 100% baseline
// for barPercent() below. 0 when the dataset is empty (avoids div-by-zero).
const maxCohort = computed(() => startupsPerCohort.value.length ? Math.max(...startupsPerCohort.value.map(i => i.value)) : 0)
const maxGenre  = computed(() => startupsByGenre.value.length ? Math.max(...startupsByGenre.value.map(i => i.value)) : 0)

/**
 * Converts a raw value into a percentage width for a horizontal bar,
 * relative to the largest value in its dataset.
 * @param {number} value - the bar's raw count
 * @param {number} max   - the largest count in the dataset (100% baseline)
 * @returns {number} integer percentage, 0 if max is falsy
 */
function barPercent(value, max) {
  return max ? Math.round((value / max) * 100) : 0
}

// --- IP section ---

/**
 * IP filing counts grouped by classification, in a fixed display order.
 * Filters ipRecords by exact classification string match — must stay in
 * sync with the classification values seeded via ipService's
 * classifications table (Patent, Trademark, Copyright, Industrial Design,
 * Utility model).
 */
const ipByClassification = computed(() => [
  { label: 'Patent',            value: ipRecords.value.filter(r => r.classification === 'Patent').length },
  { label: 'Trademark',         value: ipRecords.value.filter(r => r.classification === 'Trademark').length },
  { label: 'Copyright',         value: ipRecords.value.filter(r => r.classification === 'Copyright').length },
  { label: 'Industrial Design', value: ipRecords.value.filter(r => r.classification === 'Industrial Design').length },
  { label: 'Utility model',     value: ipRecords.value.filter(r => r.classification === 'Utility model').length },
])

/**
 * IP filing counts grouped by status, feeding the donut chart's conic
 * gradient (statusChartGradient below). `color` here is the literal hex
 * used both for the gradient slice and the legend dot in the template.
 * `status` on an IP record is a single string (see ipService.toClientRecord) —
 * comparison is exact-match, not substring.
 */
const ipByStatus = computed(() => [
  { label: 'Pending',   value: ipRecords.value.filter(r => r.status === 'Pending').length,   color: '#e6a817' },
  { label: 'Granted',   value: ipRecords.value.filter(r => r.status === 'Granted').length,   color: '#2ecc71' },
])

/**
 * Data source for the three "Intellectual Property" stat cards.
 * `subClass` drives the sub-label color in the template ('warn' = amber,
 * 'ok' = green, unset = default grey).
 */
const ipStats = computed(() => [
  { eyebrow: 'Total IP filings', value: ipRecords.value.length,                                           sub: 'All classifications' },
  { eyebrow: 'Pending',          value: ipRecords.value.filter(r => r.status === 'Pending').length,       sub: 'Awaiting decision', subClass: 'warn' },
  { eyebrow: 'Granted',          value: ipRecords.value.filter(r => r.status === 'Granted').length,       sub: 'Approved',          subClass: 'ok'   },
])

const maxClass    = computed(() => ipByClassification.value.length ? Math.max(...ipByClassification.value.map(i => i.value)) : 0)
const totalStatus = computed(() => ipByStatus.value.reduce((sum, item) => sum + item.value, 0))

/**
 * Builds the CSS conic-gradient() string that renders the "IP by status"
 * donut chart. Walks ipByStatus in order, converting each item's share of
 * totalStatus into a degree range (0–360), and emits one gradient stop per
 * status. Falls back to a flat grey ring when there is no data yet, so the
 * donut doesn't render as a broken/empty gradient.
 */
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
