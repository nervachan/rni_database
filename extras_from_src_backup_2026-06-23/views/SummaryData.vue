<template>
<div class="min-h-screen bg-[#b5c4b1] flex flex-col gap-7 font-sans" :class="$route.path === '/dashboard' ? 'p-5' : 'px-4 py-5'">
      <!-- STARTUPS SECTION -->
    <section class="flex flex-col gap-3">
      <h2 class="text-[11px] font-bold tracking-widest uppercase text-[#2a3a28]">STARTUPS</h2>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div
          v-for="s in startupStats" :key="s.eyebrow"
          class="bg-[#1e4d2e] rounded-xl px-4 py-3.5 flex flex-col gap-1 min-h-[90px]"
        >
          <span class="text-[11px] font-medium text-[#9ecfa8]">{{ s.eyebrow }}</span>
          <span
            class="font-bold text-white leading-tight"
            :class="s.large ? 'text-[22px]' : 'text-[26px]'"
          >{{ s.value }}</span>
          <span class="text-[11px] text-[#7dab87] mt-0.5">{{ s.sub }}</span>
        </div>
      </div>

      <!-- Chart cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ">
        <div class="bg-[#1e4d2e] rounded-xl px-4 py-4">
          <p class="text-xs font-semibold text-[#c8e6c9] mb-3.5">Startups per cohort</p>
          <div class="flex flex-col gap-3">
            <div v-for="item in startupsPerCohort" :key="item.label" class="flex items-center gap-2.5">
              <span class="text-xs text-[#c8dfc8] w-[110px] shrink-0">{{ item.label }}</span>
              <div class="flex-1 h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300"
                  :style="{ width: barPercent(item.value, maxStartupsCohort) + '%' }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-[#e0f0e0] w-4 text-right shrink-0">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <div class="bg-[#1e4d2e] rounded-xl px-4 py-4">
          <p class="text-xs font-semibold text-[#c8e6c9] mb-3.5">Startups by genre</p>
          <div class="flex flex-col gap-3">
            <div v-for="item in startupsByGenre" :key="item.label" class="flex items-center gap-2.5">
              <span class="text-xs text-[#c8dfc8] w-[110px] shrink-0">{{ item.label }}</span>
              <div class="flex-1 h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300"
                  :style="{ width: barPercent(item.value, maxStartupsGenre) + '%' }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-[#e0f0e0] w-4 text-right shrink-0">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- INTELLECTUAL PROPERTY SECTION -->
    <section class="flex flex-col gap-3">
      <h2 class="text-[11px] font-bold tracking-widest uppercase text-[#2a3a28]">INTELLECTUAL PROPERTY</h2>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div
          v-for="s in ipStats" :key="s.eyebrow"
          class="bg-[#1e4d2e] rounded-xl px-4 py-3.5 flex flex-col gap-1 min-h-[90px]"
        >
          <span class="text-[11px] font-medium text-[#9ecfa8]">{{ s.eyebrow }}</span>
          <span class="text-[26px] font-bold text-white leading-tight">{{ s.value }}</span>
          <span
            class="text-[11px] mt-0.5"
            :class="{
              'text-[#e6a817]': s.subClass === 'warn',
              'text-[#2ecc71]': s.subClass === 'ok',
              'text-[#7dab87]': !s.subClass,
            }"
          >{{ s.sub }}</span>
        </div>
      </div>

      <!-- Chart cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- IP by classification -->
        <div class="bg-[#1e4d2e] rounded-xl px-4 py-4">
          <p class="text-xs font-semibold text-[#c8e6c9] mb-3.5">IP by classification</p>
          <div class="flex flex-col gap-3">
            <div v-for="item in ipByClassification" :key="item.label" class="flex items-center gap-2.5">
              <span class="text-xs text-[#c8dfc8] w-[130px] shrink-0">{{ item.label }}</span>
              <div class="flex-1 h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300"
                  :style="{ width: barPercent(item.value, maxIpClass) + '%' }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-[#e0f0e0] w-4 text-right shrink-0">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- IP by status -->
        <div class="bg-[#1e4d2e] rounded-xl px-4 py-4">
          <p class="text-xs font-semibold text-[#c8e6c9] mb-3.5">IP by status</p>
          <div class="flex flex-col gap-3">
            <div v-for="item in ipByStatus" :key="item.label" class="flex items-center gap-2.5">
              <span class="text-xs text-[#c8dfc8] w-[110px] shrink-0">{{ item.label }}</span>
              <div class="flex-1 h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#7db87d] rounded-full transition-all duration-300"
                  :style="{ width: barPercent(item.value, maxIpStatus) + '%' }"
                ></div>
              </div>
              <span
                class="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                :style="{ background: item.color }"
              >{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const startupStats = [
  { eyebrow: 'Total Startups', value: '14', sub: 'All cohorts' },
  { eyebrow: 'Total cohorts',  value: '3',  sub: 'Cohort 1-3' },
  { eyebrow: 'Active cohort',  value: 'Cohort 3',  sub: '5 startups enrolled', large: true },
  { eyebrow: 'Top genre',      value: 'HealthTech', sub: '6 of 14 startups',   large: true },
]

const startupsPerCohort = [
  { label: 'Cohort 1', value: 4 },
  { label: 'Cohort 2', value: 5 },
  { label: 'Cohort 3', value: 5 },
]

const startupsByGenre = [
  { label: 'HeathTech', value: 6 },
  { label: 'FinTech',   value: 3 },
  { label: 'EdTech',    value: 2 },
  { label: 'AgriTech',  value: 3 },
]

const maxStartupsCohort = computed(() => Math.max(...startupsPerCohort.map(i => i.value)))
const maxStartupsGenre  = computed(() => Math.max(...startupsByGenre.map(i => i.value)))

const ipStats = [
  { eyebrow: 'Total IP filings', value: '22', sub: 'All classifications' },
  { eyebrow: 'Pending',          value: '9',  sub: 'Awaiting decision', subClass: 'warn' },
  { eyebrow: 'Granted',          value: '8',  sub: 'Approved',          subClass: 'ok'   },
  { eyebrow: 'Licensed / other', value: '5',  sub: 'Licensed -Abandoned' },
]

const ipByClassification = [
  { label: 'Patent',           value: 8 },
  { label: 'Trademark',        value: 5 },
  { label: 'Copyright',        value: 4 },
  { label: 'Industrial Design',value: 2 },
  { label: 'Trade secret',     value: 2 },
  { label: 'Utility model',    value: 1 },
]

const ipByStatus = [
  { label: 'Pending',   value: 9, color: '#e6a817' },
  { label: 'Granted',   value: 8, color: '#2ecc71' },
  { label: 'Licensed',  value: 3, color: '#3b9edd' },
  { label: 'Abandoned', value: 2, color: '#e05c5c' },
]

const maxIpClass  = computed(() => Math.max(...ipByClassification.map(i => i.value)))
const maxIpStatus = computed(() => Math.max(...ipByStatus.map(i => i.value)))

function barPercent(value, max) {
  return Math.round((value / max) * 100)
}
</script>
