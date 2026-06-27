<script setup>
import { ref, computed } from 'vue'
import { cohorts, startups } from '../../data/startups.js'

const activeCohortId  = ref(cohorts[0].id)
const activeProjectId = ref(null)
const projectSearch   = ref('')
const genreSearch     = ref('')

const filteredStartups = computed(() => {
  const name  = projectSearch.value.toLowerCase()
  const genre = genreSearch.value.toLowerCase()
  return startups.filter(s =>
    s.cohortId === activeCohortId.value &&
    s.name.toLowerCase().includes(name) &&
    s.genre.toLowerCase().includes(genre)
  )
})

const activeProject = computed(() =>
  startups.find(s => s.id === activeProjectId.value) ?? null
)

const activeCohortCount = computed(() =>
  startups.filter(s => s.cohortId === activeCohortId.value).length
)

const recentStartups = computed(() => startups.slice(0, 6))

function cohortName(id) {
  return cohorts.find(c => c.id === id)?.name ?? ''
}

function selectCohort(id) {
  activeCohortId.value  = id
  activeProjectId.value = null
}

function selectProject(id) {
  activeProjectId.value = id
}
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)] bg-[#1a2e22] text-white p-4 sm:p-6">
    <div class="mx-auto max-w-7xl space-y-6">

      <!-- Header -->
      <div class="rounded-[2rem] border border-slate-800 bg-[#263e30] p-5 shadow-2xl shadow-slate-950/40 ring-1 ring-white/5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">◎</span>
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Startup Management</p>
          </div>
        </div>
      </div>

      <!-- 3-column layout -->
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_1fr] lg:grid-cols-[280px_1fr]">

        <!-- Column 1: Cohorts -->
        <section class="rounded-[2rem] border border-slate-800 bg-gradient-to-b from-[#263e30] to-[#293e32] p-5 shadow-md ring-1 ring-white/5">
          <div class="flex items-center justify-between rounded-[2rem] bg-[#2f553f] px-4 py-4">
            <span class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">All Cohorts</span>
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-for="cohort in cohorts"
              :key="cohort.id"
              @click="selectCohort(cohort.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                cohort.id === activeCohortId
                  ? 'bg-[#14254B] border-l-4 border-[#C9AA6D] text-white'
                  : 'bg-[#0E5D46] text-slate-300 hover:bg-[#1F7A6E]'
              ]"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ cohort.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ cohort.value }} projects</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
          </ul>
        </section>

        <!-- Column 2: Projects -->
        <section class="rounded-[2rem] border border-slate-800 bg-[#263e30] p-5 ring-1 ring-white/5">
          <div class="grid gap-3 sm:grid-cols-2 mb-4">
            <input
              v-model="projectSearch"
              placeholder="Search project..."
              class="w-full rounded-[2rem] border border-slate-700 bg-[#14254B] px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
            />
            <input
              v-model="genreSearch"
              placeholder="Search genre..."
              class="w-full rounded-[2rem] border border-slate-700 bg-[#14254B] px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
            />
          </div>
          <ul class="space-y-2">
            <li
              v-for="startup in filteredStartups"
              :key="startup.id"
              @click="selectProject(startup.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                startup.id === activeProjectId
                  ? 'bg-[#14254B] border-l-4 border-[#C9AA6D] text-white'
                  : 'bg-[#0E5D46] text-slate-300 hover:bg-[#1F7A6E]'
              ]"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ startup.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ startup.supporting }}</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
            <li v-if="filteredStartups.length === 0" class="px-4 py-3 text-sm text-slate-500">No projects found.</li>
          </ul>
        </section>

        <!-- Column 3: Detail -->
        <section class="rounded-[2rem] border border-slate-800 bg-[#263e30] p-5 ring-1 ring-white/5">
          <template v-if="activeProject">
            <div class="flex items-center gap-4 mb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-100">{{ activeProject.name }}</h2>
                <p class="text-xs text-slate-400">{{ activeProject.genre }} · {{ cohortName(activeProject.cohortId) }}</p>
              </div>
            </div>
            <div class="rounded-[2rem] bg-[#14254B] p-4 text-sm leading-7 text-slate-300">
              <p>{{ activeProject.description }}</p>
            </div>
          </template>
          <template v-else>
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div class="rounded-[2rem] bg-[#14254B] p-4 text-slate-100">
                <p class="text-xs uppercase tracking-widest text-slate-400">Total Startups</p>
                <p class="mt-4 text-3xl font-semibold">{{ startups.length }}</p>
              </div>
              <div class="rounded-[2rem] bg-[#14254B] p-4 text-slate-100">
                <p class="text-xs uppercase tracking-widest text-slate-400">Cohorts</p>
                <p class="mt-4 text-3xl font-semibold">{{ cohorts.length }}</p>
              </div>
              <div class="rounded-[2rem] bg-[#14254B] p-4 text-slate-100">
                <p class="text-xs uppercase tracking-widest text-slate-400">In Selected Cohort</p>
                <p class="mt-4 text-3xl font-semibold">{{ activeCohortCount }}</p>
              </div>
            </div>
            <div class="mt-4 rounded-[2rem] bg-[#14254B] p-5">
              <h3 class="text-base font-semibold text-slate-100 mb-4">Recent Startups</h3>
              <ul class="space-y-3 text-sm text-slate-300">
                <li v-for="s in recentStartups" :key="s.id" class="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
                  <span class="font-semibold text-slate-100">{{ s.name }}</span> — {{ s.supporting }}
                </li>
              </ul>
            </div>
          </template>
        </section>

      </div>
    </div>
  </div>
</template>

<style>

</style>