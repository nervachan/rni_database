<script setup>
const startupsPerCohort = [
  { label: 'Cohort 1', value: 4 },
  { label: 'Cohort 2', value: 5 },
  { label: 'Cohort 3', value: 5 },
]

const startupsByGenre = [
  { label: 'HealthTech', value: 6 },
  { label: 'FinTech', value: 3 },
  { label: 'EdTech', value: 2 },
  { label: 'AgriTech', value: 3 },
]

const ipByClass = [
  { label: 'Patent', value: 8 },
  { label: 'Trademark', value: 5 },
  { label: 'Copyright', value: 4 },
  { label: 'Industrial Design', value: 2 },
  { label: 'Trade secret', value: 2 },
  { label: 'Utility model', value: 1 },
]

const ipByStatus = [
  { label: 'Pending', value: 9, color: 'bg-orange-500 text-white' },
  { label: 'Granted', value: 8, color: 'bg-emerald-500 text-white' },
  { label: 'Licensed', value: 3, color: 'bg-sky-500 text-white' },
  { label: 'Abandoned', value: 2, color: 'bg-rose-500 text-white' },
]
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)] bg-slate-950 p-4 text-slate-100 sm:p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">STARTUPS</p>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Total Startups</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">14</p>
            <p class="mt-2 text-sm text-slate-400">All cohorts</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Total cohorts</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">3</p>
            <p class="mt-2 text-sm text-slate-400">Cohort 1-3</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Active cohort</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">Cohort 3</p>
            <p class="mt-2 text-sm text-slate-400">5 startups enrolled</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Top genre</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">HealthTech</p>
            <p class="mt-2 text-sm text-slate-400">6 of 14 startups</p>
          </div>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <h2 class="text-base font-semibold text-slate-100">Startups per cohort</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in startupsPerCohort" :key="item.label" class="space-y-2">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>{{ item.label }}</span>
                  <span>{{ item.value }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div class="h-full rounded-full bg-emerald-400" :style="{ width: `${(item.value / 5) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-slate-950/70 p-5">
            <h2 class="text-base font-semibold text-slate-100">Startups by genre</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in startupsByGenre" :key="item.label" class="space-y-2">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>{{ item.label }}</span>
                  <span>{{ item.value }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div class="h-full rounded-full bg-sky-400" :style="{ width: `${(item.value / 6) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">INTELLECTUAL PROPERTY</p>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Total IP filings</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">22</p>
            <p class="mt-2 text-sm text-slate-400">All classifications</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Pending</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">9</p>
            <p class="mt-2 text-sm text-orange-300">Awaiting decision</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Granted</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">8</p>
            <p class="mt-2 text-sm text-emerald-300">Approved</p>
          </div>
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Licensed / other</p>
            <p class="mt-4 text-3xl font-semibold text-slate-100">5</p>
            <p class="mt-2 text-sm text-slate-400">Licensed · Abandoned</p>
          </div>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <div class="rounded-3xl bg-slate-950/70 p-5">
            <h2 class="text-base font-semibold text-slate-100">IP by classification</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in ipByClass" :key="item.label" class="space-y-2">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>{{ item.label }}</span>
                  <span>{{ item.value }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div class="h-full rounded-full bg-slate-400" :style="{ width: `${(item.value / 8) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-slate-950/70 p-5">
            <h2 class="text-base font-semibold text-slate-100">IP by status</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in ipByStatus" :key="item.label" class="space-y-2">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>{{ item.label }}</span>
                  <span>{{ item.value }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div class="h-full rounded-full bg-slate-400" :style="{ width: `${(item.value / 9) * 100}%` }"></div>
                </div>
                <span :class="['inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold', item.color]">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed; Tailwind utilities cover the layout. */
</style>