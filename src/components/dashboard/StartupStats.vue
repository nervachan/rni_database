<template>
  <section class="flex flex-col gap-2 sm:gap-3">
    <h2 class="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#2a3a28]">STARTUPS</h2>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 drop-shadow-md p-2.5 sm:p-4 rounded-xl">
      <div
        v-for="s in startupStats" :key="s.eyebrow"
        class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.8)] sm:shadow-[5px_5px_10px_rgba(0,0,0,1)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#0B2C19]"
      >
        <span class="text-[10px] sm:text-[11px] font-medium text-[#9ecfa8]">{{ s.eyebrow }}</span>
        <span class="font-bold text-white leading-tight" :class="s.large ? 'text-[18px] sm:text-[22px]' : 'text-[20px] sm:text-[26px]'">{{ s.value }}</span>
        <span class="text-[9px] sm:text-[11px] text-[#7dab87] mt-0.5">{{ s.sub }}</span>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.5)] sm:shadow-[5px_5px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#2a3a28]">
        <p class="text-[10px] sm:text-xs font-semibold text-[#c8e6c9] mb-2 sm:mb-3.5">Startups per cohort</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in startupsPerCohort" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-[#c8dfc8] w-[70px] sm:w-[110px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
              <div class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxCohort) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-[#e0f0e0] w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.5)] sm:shadow-[5px_5px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#2a3a28]">
        <p class="text-[10px] sm:text-xs font-semibold text-[#c8e6c9] mb-2 sm:mb-3.5">Startups by genre</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in startupsByGenre" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-[#c8dfc8] w-[70px] sm:w-[110px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
              <div class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxGenre) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-[#e0f0e0] w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { cohorts, genres, startups } from '@/data/startups.js'

const startupsPerCohort = cohorts
const startupsByGenre   = genres

const totalStartups  = startups.length
const totalCohorts   = cohorts.length
const activeCohort   = cohorts[cohorts.length - 1].label
const activeCount    = startups.filter(s => s.cohort === activeCohort).length
const topGenre       = genres.reduce((a, b) => a.value > b.value ? a : b).label
const topGenreCount  = genres.reduce((a, b) => a.value > b.value ? a : b).value

const startupStats = [
  { eyebrow: 'Total Startups', value: totalStartups,  sub: 'All cohorts' },
  { eyebrow: 'Total cohorts',  value: totalCohorts,    sub: `Cohort 1-${totalCohorts}` },
  { eyebrow: 'Active cohort',  value: activeCohort,    sub: `${activeCount} startups enrolled`, large: true },
  { eyebrow: 'Top genre',      value: topGenre,        sub: `${topGenreCount} of ${totalStartups} startups`, large: true },
]

const maxCohort = computed(() => Math.max(...startupsPerCohort.map(i => i.value)))
const maxGenre  = computed(() => Math.max(...startupsByGenre.map(i => i.value)))

function barPercent(value, max) {
  return Math.round((value / max) * 100)
}
</script>