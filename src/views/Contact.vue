<template>
  <div class="min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100 p-4 sm:p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/40 ring-1 ring-white/5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">◎</span>
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Startup Management</p>
            </div>
          </div>
          <button class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400 bg-transparent text-emerald-400 transition hover:bg-slate-800" aria-label="Info">ℹ</button>
        </div>
      </div>

      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_1fr] lg:grid-cols-[280px_1fr]">
        <section class="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/30 ring-1 ring-white/5">
          <div class="flex items-center justify-between rounded-[2rem] bg-slate-950/80 px-4 py-4">
            <span class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">All Cohorts</span>
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400" aria-label="Add cohort">+</button>
          </div>

          <ul class="mt-4 space-y-2 overflow-hidden rounded-[2rem]">
            <li
              v-for="cohort in cohorts"
              :key="cohort.id"
              @click="selectCohort(cohort.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                cohort.id === activeCohortId
                  ? 'bg-slate-800 border-l-4 border-emerald-400 text-white'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
              ]"
            >
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">⊕</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ cohort.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ cohort.projects }} projects</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
          </ul>

          <button class="mt-4 w-full rounded-[2rem] border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">+ Add cohort</button>
        </section>

        <section class="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/30 ring-1 ring-white/5">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-[2rem] bg-slate-950/80 p-3">
              <input
                v-model="projectSearch"
                placeholder="Search Project..."
                aria-label="Search projects"
                class="w-full rounded-[2rem] border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div class="relative rounded-[2rem] bg-slate-950/80 p-3">
              <input
                v-model="genreSearch"
                placeholder="Search genre..."
                aria-label="Search genre"
                class="w-full rounded-[2rem] border border-slate-700 bg-slate-950/90 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
              <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">⊿</span>
            </div>
          </div>

          <ul class="mt-4 space-y-2 overflow-hidden rounded-[2rem]">
            <li
              v-for="project in filteredProjects"
              :key="project.id"
              @click="selectProject(project.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                project.id === activeProjectId
                  ? 'bg-slate-800 border-l-4 border-emerald-400 text-slate-100'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
              ]"
            >
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-slate-300 ring-1 ring-slate-700">
                <svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="20" cy="20" r="18" />
                  <polygon points="20,10 23,17 31,17 25,22 27,30 20,25 13,30 15,22 9,17 17,17" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ project.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ project.supporting }}</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
          </ul>
        </section>

        <section class="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-slate-950/30 ring-1 ring-white/5">
          <template v-if="activeProject">
            <div class="rounded-[2rem] bg-slate-950/80 p-4">
              <div class="flex items-center gap-4">
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
                  <svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="20" cy="20" r="18" />
                    <polygon points="20,10 23,17 31,17 25,22 27,30 20,25 13,30 15,22 9,17 17,17" />
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-slate-100">{{ activeProject.name }}</h2>
              </div>
              <div class="mt-4 rounded-[2rem] bg-slate-950/70 p-4 text-sm leading-7 text-slate-300">
                <p>{{ activeProject.description }}</p>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div class="rounded-[2rem] bg-slate-950/80 p-4 text-slate-100">
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Total Projects</p>
                <p class="mt-4 text-3xl font-semibold">{{ totalProjects }}</p>
              </div>
              <div class="rounded-[2rem] bg-slate-950/80 p-4 text-slate-100">
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Cohorts</p>
                <p class="mt-4 text-3xl font-semibold">{{ cohorts.length }}</p>
              </div>
              <div class="rounded-[2rem] bg-slate-950/80 p-4 text-slate-100">
                <p class="text-xs uppercase tracking-[0.24em] text-slate-400">Selected Cohort Projects</p>
                <p class="mt-4 text-3xl font-semibold">{{ activeCohortProjects }}</p>
              </div>
            </div>

            <div class="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr]">
              <div class="rounded-[2rem] bg-slate-950/80 p-5">
                <h3 class="text-base font-semibold text-slate-100">Recent Projects</h3>
                <ul class="mt-4 space-y-3 text-sm text-slate-300">
                  <li v-for="p in recentProjects" :key="'recent-'+p.id" class="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
                    <span class="font-semibold text-slate-100">{{ p.name }}</span> — {{ p.supporting }}
                  </li>
                </ul>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div v-for="p in projects" :key="'empty-'+p.id" class="rounded-[2rem] bg-slate-950/80 p-4 text-slate-100">
                  <p class="font-semibold">{{ p.name }}</p>
                  <p class="mt-2 text-sm text-slate-400">{{ p.supporting }}</p>
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const cohorts = ref([
  { id: 1, name: 'Cohort 1', projects: 4 },
  { id: 2, name: 'Cohort 2', projects: 8 },
  { id: 3, name: 'Cohort 3', projects: 3 },
  { id: 4, name: 'Cohort 4', projects: 4 },
  { id: 5, name: 'Cohort 5', projects: 5 },
  { id: 6, name: 'Cohort 6', projects: 6 },
  { id: 7, name: 'Cohort 7', projects: 3 },
  { id: 8, name: 'Cohort 8', projects: 6 },
  { id: 9, name: 'Cohort 9', projects: 6 },
  { id: 10, name: 'Label text', projects: 9 },
])

const projects = ref([
  {
    id: 1,
    name: 'Project A1',
    supporting: 'Supporting line text, lorem ipsum dolor',
    genre: 'Tech',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus a neque molestie, consectetur dolor id, faucibus risus. Etiam quis fringilla libero. Proin volutpat dui nunc, id vestibulum sem sodales in. Proin condimentum commodo nulla, a pretium arcu condimentum nec. Nullam dignissim mi sapien. Quisque eget sem laoreet, pharetra lectus sed, gravida ante. Sed tristique, tellus eu porta bibendum, elit ligula dignissim leo, sed pulvinar velit est vitae dolor. Maecenas sodales mauris sem, ut pellentesque dui posuere a. Sed maximus velit sit amet vulputate imperdiet. Mauris eleifend risus magna, a sagittis quam maximus in. Proin mattis vehicula sem, quis volutpat tellus mollis euismod. Etiam et lacus rhoncus, gravida dui ut, aliquet diam. Vivamus molestie orci dolor, a pellentesque lorem laoreet nec. Ut sed nunc sed ipsum ullamcorper blandit. Pellentesque pellentesque accumsan ipsum non ultricies. Maecenas nunc metus, posuere non scelerisque quis, convallis quis ipsum. Maecenas posuere eros.',
  },
  { id: 2, name: 'Project A2', supporting: 'Supporting line text, (#Genre type)', genre: 'Finance', description: 'Details for Project A2. ' + 'Lorem ipsum dolor sit amet. '.repeat(8) },
  { id: 3, name: 'Project A3', supporting: 'Supporting line text, (#Genre type)', genre: 'Health', description: 'Details for Project A3. ' + 'Lorem ipsum dolor sit amet. '.repeat(8) },
  { id: 4, name: 'Project A4', supporting: 'Supporting line text, (#Genre type)', genre: 'Tech', description: 'Details for Project A4. ' + 'Lorem ipsum dolor sit amet. '.repeat(8) },
  { id: 5, name: 'Project A5', supporting: 'Supporting line text, (#Genre type)', genre: 'Education', description: 'Details for Project A5. ' + 'Lorem ipsum dolor sit amet. '.repeat(8) },
  { id: 6, name: 'Label text', supporting: 'Supporting line text, (#Genre type)', genre: 'Other', description: 'Details for Label text project. ' + 'Lorem ipsum dolor sit amet. '.repeat(8) },
])

const activeCohortId = ref(6)
const activeProjectId = ref(1)
const projectSearch = ref('')
const genreSearch = ref('')

const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    const matchName = p.name.toLowerCase().includes(projectSearch.value.toLowerCase())
    const matchGenre = p.genre.toLowerCase().includes(genreSearch.value.toLowerCase())
    return matchName && matchGenre
  })
})

const activeProject = computed(() =>
  projects.value.find((p) => p.id === activeProjectId.value) ?? null
)

const totalProjects = computed(() => projects.value.length)
const activeCohortProjects = computed(() => {
  const c = cohorts.value.find((x) => x.id === activeCohortId.value)
  return c ? c.projects : 0
})
const recentProjects = computed(() => projects.value.slice(0, 6))

function selectCohort(id) {
  activeCohortId.value = id
}

</script>

<style scoped>
/* Tailwind utilities handle Contact page styling. */
</style>