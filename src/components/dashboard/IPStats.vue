<template>
  <section class="flex flex-col gap-2 sm:gap-3">
    <h2 class="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#2a3a28]">INTELLECTUAL PROPERTY</h2>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
      <div
        v-for="s in ipStats" :key="s.eyebrow"
        class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.5)] sm:shadow-[5px_5px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#2a3a28]"
      >
        <span class="text-[10px] sm:text-[11px] font-medium text-[#9ecfa8]">{{ s.eyebrow }}</span>
        <span class="text-[20px] sm:text-[26px] font-bold text-white leading-tight">{{ s.value }}</span>
        <span class="text-[9px] sm:text-[11px] mt-0.5" :class="{ 'text-[#e6a817]': s.subClass === 'warn', 'text-[#2ecc71]': s.subClass === 'ok', 'text-[#7dab87]': !s.subClass }">{{ s.sub }}</span>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.5)] sm:shadow-[5px_5px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#2a3a28]">
        <p class="text-[10px] sm:text-xs font-semibold text-[#c8e6c9] mb-2 sm:mb-3.5">IP by classification</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in ipByClassification" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-[#c8dfc8] w-[85px] sm:w-[130px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
              <div class="h-full bg-[#a8d5a2] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxClass) + '%' }"></div>
            </div>
            <span class="text-[9px] sm:text-xs font-semibold text-[#e0f0e0] w-3 sm:w-4 text-right shrink-0">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col gap-1 min-h-[75px] sm:min-h-[90px] shadow-[3px_3px_6px_rgba(0,0,0,0.5)] sm:shadow-[5px_5px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1C5333] to-[#0B2C19] border border-[#2a3a28]">
        <p class="text-[10px] sm:text-xs font-semibold text-[#c8e6c9] mb-2 sm:mb-3.5">IP by status</p>
        <div class="flex flex-col gap-2 sm:gap-3">
          <div v-for="item in ipByStatus" :key="item.label" class="flex items-center gap-1.5 sm:gap-2.5">
            <span class="text-[9px] sm:text-xs text-[#c8dfc8] w-[70px] sm:w-[110px] shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-1 sm:h-1.5 bg-[#2d6640] rounded-full overflow-hidden">
              <div class="h-full bg-[#7db87d] rounded-full transition-all duration-300" :style="{ width: barPercent(item.value, maxStatus) + '%' }"></div>
            </div>
            <span class="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-bold text-white shrink-0" :style="{ background: item.color }">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ipRecords } from '@/data/ip.js'

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
  { label: 'Licensed',  value: ipRecords.filter(r => r.status.includes('Licensed')).length,  color: '#3b9edd' },
  { label: 'Abandoned', value: ipRecords.filter(r => r.status.includes('Abandoned')).length, color: '#e05c5c' },
]

const ipStats = [
  { eyebrow: 'Total IP filings', value: ipRecords.length,                                        sub: 'All classifications' },
  { eyebrow: 'Pending',          value: ipRecords.filter(r => r.status.includes('Pending')).length,   sub: 'Awaiting decision', subClass: 'warn' },
  { eyebrow: 'Granted',          value: ipRecords.filter(r => r.status.includes('Granted')).length,   sub: 'Approved',          subClass: 'ok'   },
  { eyebrow: 'Licensed / other', value: ipRecords.filter(r => r.status.includes('Licensed') || r.status.includes('Abandoned')).length, sub: 'Licensed - Abandoned' },
]

const maxClass  = computed(() => Math.max(...ipByClassification.map(i => i.value)))
const maxStatus = computed(() => Math.max(...ipByStatus.map(i => i.value)))

function barPercent(value, max) {
  return Math.round((value / max) * 100)
}
</script>