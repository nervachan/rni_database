<script setup>

import { computed } from 'vue'
import { ipRecords } from '../../data/ip.js'
import { cohorts, genres, startups } from '../../data/startups.js'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const startupsPerCohort = cohorts
const startupsByGenre   = genres


const totalStartups = startups.length
const totalCohorts  = cohorts.length
const activeCohort  = cohorts[cohorts.length - 1].name
const activeCount   = startups.filter(s => s.cohortId === cohorts[cohorts.length - 1].id).length
const topGenre      = genres.reduce((a, b) => a.value > b.value ? a : b).label
const topGenreCount = genres.reduce((a, b) => a.value > b.value ? a : b).value

const startupStats = [
  { eyebrow: 'Total Startups', value: totalStartups, sub: 'All cohorts' },
  { eyebrow: 'Total Cohorts',  value: totalCohorts,  sub: `Cohort 1–${totalCohorts}` },
  { eyebrow: 'Active Cohort',  value: activeCohort,  sub: `${activeCount} startups enrolled`, large: true },
  { eyebrow: 'Top Genre',      value: topGenre,      sub: `${topGenreCount} of ${totalStartups} startups`, large: true },
]

const maxCohort = computed(() => Math.max(...startupsPerCohort.map(i => i.value)))
const maxGenre  = computed(() => Math.max(...startupsByGenre.map(i => i.value)))

function barPercent(value, max) {
  return Math.round((value / max) * 100)
}

const ipByClassification = [
  { label: 'Patent',            value: ipRecords.filter(r => r.classification === 'Patent').length },
  { label: 'Trademark',         value: ipRecords.filter(r => r.classification === 'Trademark').length },
  { label: 'Copyright',         value: ipRecords.filter(r => r.classification === 'Copyright').length },
  { label: 'Industrial Design', value: ipRecords.filter(r => r.classification === 'Industrial Design').length },
  { label: 'Trade secret',      value: ipRecords.filter(r => r.classification === 'Trade secret').length },
  { label: 'Utility model',     value: ipRecords.filter(r => r.classification === 'Utility model').length },
]

const ipByStatus = [
  { label: 'Pending',   value: ipRecords.filter(r => r.status.includes('Pending')).length,   color: '#e6a817' },
  { label: 'Granted',   value: ipRecords.filter(r => r.status.includes('Granted')).length,   color: '#2ecc71' },
]

const ipStats = [
  { eyebrow: 'Total IP filings', value: ipRecords.length,                                                                                     sub: 'All classifications' },
  { eyebrow: 'Pending',          value: ipRecords.filter(r => r.status.includes('Pending')).length,                                           sub: 'Awaiting decision', subClass: 'warn' },
  { eyebrow: 'Granted',          value: ipRecords.filter(r => r.status.includes('Granted')).length,                                           sub: 'Approved',          subClass: 'ok'   },
]

const maxClass  = computed(() => Math.max(...ipByClassification.map(i => i.value)))
const maxStatus = computed(() => Math.max(...ipByStatus.map(i => i.value)))

const statusChartData = computed(() => ({
  labels: ipByStatus.map(i => i.label),
  datasets: [{
    data: ipByStatus.map(i => i.value),
    backgroundColor: ipByStatus.map(i => i.color),
    borderWidth: 0,
  }],
}))

const statusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#000000',
        font: { size: 10 },
        boxWidth: 10,
      },
    },
  },
}

// function barPercent(value, max) {
//   return Math.round((value / max) * 100)
//}




</script>

<template>

  <div class="dashPage flex flex-col gap-4 p-3 sm:p-5 min-h-screen bg-grey-100">

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
        <div class="h-[180px] sm:h-[220px]">
          <Pie :data="statusChartData" :options="statusChartOptions" />
        </div>
      </div>
    </div>

  </div>
  
</template>

<style scoped>



</style>