<script setup>
import { ref, computed, watch } from 'vue'
import { cohorts, startups } from '../../data/startups.js'

const activeCohortId  = ref(cohorts[0].id)
const activeProjectId = ref(null)
const projectSearch   = ref('')
const genreSearch     = ref('')

const showCohortModal     = ref(false)
const showProjectModal    = ref(false)
const showAddProjectModal = ref(false)
const cohortModalMode     = ref('select')
const projectFormError    = ref('')
const projectLogoError    = ref('')
const itemsPerPage        = ref(10)
const currentPage         = ref(1)
const newProject          = ref({ name: '', genre: '', supporting: '', description: '', logo: '' })
const editSelectedName    = ref('')
const addSelectedName     = ref('')

const localCohorts  = ref(cohorts.map(c => ({ ...c })))
const localStartups = ref(startups.map(s => ({ ...s })))

const allGenres = computed(() => {
  const inCohort = localStartups.value.filter(s => s.cohortId === activeCohortId.value)
  return ['All', ...new Set(inCohort.map(s => s.genre))]
})

const genreOptions = computed(() =>
  Array.from(new Set(localStartups.value.map(s => s.genre.trim()).filter(Boolean))).sort()
)

const filteredStartups = computed(() => {
  const name  = projectSearch.value.toLowerCase()
  const genre = genreSearch.value
  return localStartups.value.filter(s =>
    s.cohortId === activeCohortId.value &&
    s.name.toLowerCase().includes(name) &&
    (genre === '' || genre === 'All' || s.genre === genre)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStartups.value.length / itemsPerPage.value)))

const paginatedStartups = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredStartups.value.slice(start, start + itemsPerPage.value)
})

watch([projectSearch, genreSearch, activeCohortId, itemsPerPage], () => {
  currentPage.value = 1
})

watch(filteredStartups, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

const activeProject = computed(() =>
  localStartups.value.find(s => s.id === activeProjectId.value) ?? null
)

const activeCohortCount = computed(() =>
  localStartups.value.filter(s => s.cohortId === activeCohortId.value).length
)

const recentStartups = computed(() =>
  [...localStartups.value]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
)

function cohortName(id) {
  return localCohorts.value.find(c => c.id === id)?.name ?? ''
}

function selectCohort(id) {
  activeCohortId.value  = id
  activeProjectId.value = null
  genreSearch.value     = ''
  showCohortModal.value = false
}

function selectProject(id) {
  activeProjectId.value = id
}

function openCohortModal() {
  cohortModalMode.value = 'select'
  showCohortModal.value = true
}

function nextCohortName() {
  const existingNumbers = localCohorts.value
    .map(c => Number(c.name.replace(/[^0-9]/g, '')))
    .filter(n => n > 0)
  const nextNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1
  return `Cohort ${nextNumber}`
}

function addCohort() {
  const newId = Math.max(...localCohorts.value.map(c => c.id), 0) + 1
  const name = nextCohortName()
  localCohorts.value.push({ id: newId, name, value: 0 })
  activeCohortId.value  = newId
  showCohortModal.value = false
}

function openAddProjectModal() {
  newProject.value = { name: '', genre: '', supporting: '', description: '', logo: '' }
  projectFormError.value = ''
  projectLogoError.value = ''
  showAddProjectModal.value = true
}

function findProjectConflict(name, excludeId = null) {
  const normalized = name.trim().toLowerCase()
  return localStartups.value.find(s => s.id !== excludeId && s.name.trim().toLowerCase() === normalized)
}

function cohortProjectCount(cohortId) {
  return localStartups.value.filter(s => s.cohortId === cohortId).length
}

function cohortProjectCountLabel(cohortId) {
  const count = cohortProjectCount(cohortId)
  return `${count} ${count === 1 ? 'project' : 'projects'}`
}

function handleLogoUpload(event, target = 'new') {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    projectLogoError.value = 'Logo must be 2MB or smaller.'
    if (target === 'new') {
      newProject.value.logo = ''
      addSelectedName.value = ''
    } else {
      editForm.value.logo = ''
      editSelectedName.value = ''
    }
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (target === 'new') {
      newProject.value.logo = reader.result
      addSelectedName.value = file.name
    } else {
      editForm.value.logo = reader.result
      editSelectedName.value = file.name
    }
    projectLogoError.value = ''
  }
  reader.readAsDataURL(file)
}

function onAddFileSelected(event) {
  handleLogoUpload(event, 'new')
}
 

function addProject() {
  const name = newProject.value.name.trim()
  if (!name) {
    projectFormError.value = 'Project name is required.'
    return
  }

  const conflict = findProjectConflict(name)
  if (conflict) {
    projectFormError.value = `A project named "${name}" already exists in ${cohortName(conflict.cohortId)}.`
    return
  }

  const newId = Math.max(...localStartups.value.map(s => s.id), 0) + 1
  localStartups.value.push({
    id:          newId,
    cohortId:    activeCohortId.value,
    name,
    genre:       newProject.value.genre.trim(),
    supporting:  newProject.value.supporting.trim(),
    description: newProject.value.description.trim(),
    logo:        newProject.value.logo || '',
  })

  const cohort = localCohorts.value.find(c => c.id === activeCohortId.value)
  if (cohort) cohort.value += 1
  showAddProjectModal.value = false
}

const editForm = ref({ id: null, name: '', genre: '', supporting: '', description: '', logo: '' })

function openEditModal() {
  if (!activeProject.value) return
  editForm.value = { ...activeProject.value }
  projectFormError.value = ''
  projectLogoError.value = ''
  showProjectModal.value = true
}

function saveProject() {
  const name = editForm.value.name.trim()
  if (!name) {
    projectFormError.value = 'Project name is required.'
    return
  }

  const conflict = findProjectConflict(name, editForm.value.id)
  if (conflict) {
    projectFormError.value = `A project named "${name}" already exists in ${cohortName(conflict.cohortId)}.`
    return
  }

  const idx = localStartups.value.findIndex(s => s.id === editForm.value.id)
  if (idx !== -1) {
    localStartups.value[idx] = { ...editForm.value }
  }
  showProjectModal.value = false
}
</script>

<template>
  <div class="h-screen bg-gray-100 text-white p-4 sm:p-6">
    <div class="mx-auto max-w-7xl space-y-6">

      <!-- Header -->
      <div class="rounded-2xl bg-white p-5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <div class="flex items-center gap-3">
          <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#263e30] text-white">◎</span>
          <p class="text-sm font-semibold uppercase tracking-[0.32em] text-black">Startup Management</p>
        </div>
      </div>

      <!-- 3-column layout -->
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_1fr] lg:grid-cols-[280px_1fr] items-start">

        <!-- Column 1: Cohorts -->
        <section class="rounded-xl bg-white p-5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] self-start">
          <div class="flex items-center justify-between rounded-xl bg-[#263e30] px-4 py-4 gap-2">
            <span class="text-sm font-semibold uppercase tracking-[0.24em] text-white">All Cohorts</span>
            <button
              @click="openCohortModal"
              class="rounded-sm bg-[#4d7c5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-[#263e30] transition shrink-0"
            >+ Cohort</button>
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-for="cohort in localCohorts"
              :key="cohort.id"
              @click="selectCohort(cohort.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                cohort.id === activeCohortId
                  ? 'bg-[#4d7c5e] border-l-4 border-[#9abba4] text-white shadow-inner'
                  : 'bg-gray-100 text-black hover:bg-[#c3d7c8]'
              ]"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ cohort.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ cohortProjectCountLabel(cohort.id) }}</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
          </ul>
        </section>

        <!-- Column 2: Projects -->
        <section class="rounded-xl bg-white p-5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] self-start">
          <div class="flex items-center justify-between rounded-xl bg-[#263e30] px-4 py-4 gap-2">
            <span class="text-sm font-semibold uppercase tracking-[0.24em] text-white">Projects</span>
            <button
              @click="openAddProjectModal"
              class="rounded-sm bg-[#4d7c5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4d7c5e] transition shrink-0"
            >+ Project</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-3 mb-4 p-3">
            <input
              v-model="projectSearch"
              placeholder="Search project..."
              class="w-full rounded-[2rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
            />
            <select
              v-model="genreSearch"
              class="w-full rounded-[2rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-[#263e30] text-black"
            >
              <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
              <option value="" disabled selected hidden> Genre...</option>
            </select>
            <div class="flex items-center gap-2">
              <label class="min-w-max text-xs text-neutral-600">Display</label>
              <select
                v-model="itemsPerPage"
                class="w-full rounded-[2rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-[#263e30] text-black"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>
          <ul class="space-y-2">
            <li
              v-for="startup in paginatedStartups"
              :key="startup.id"
              @click="selectProject(startup.id)"
              :class="[
                'flex cursor-pointer items-center gap-3 rounded-[2rem] px-4 py-3 transition',
                startup.id === activeProjectId
                  ? 'bg-[#4d7c5e] border-l-4 border-[#9abba4] text-white shadow-inner'
                  : 'bg-gray-100 text-black hover:bg-[#c3d7c8]'
              ]"
            >
              <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                <img v-if="startup.logo" :src="startup.logo" alt="Logo" class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center text-xs text-slate-500">Logo</div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ startup.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ startup.supporting }}</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
            <li v-if="filteredStartups.length === 0" class="px-4 py-3 text-sm text-slate-500">No projects found.</li>
          </ul>
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Showing {{ paginatedStartups.length }} of {{ filteredStartups.length }} projects</span>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <button
                class="rounded border border-gray-300 px-3 py-2 text-xs text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
              >Prev</button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="h-9 min-w-[2.25rem] rounded-full text-sm transition"
                :class="currentPage === page ? 'bg-[#263e30] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="rounded border border-gray-300 px-3 py-2 text-xs text-slate-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="currentPage === totalPages"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
              >Next</button>
            </div>
          </div>
        </section>

        <!-- Column 3: Detail -->
        <section class="rounded-xl bg-white shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] md:h-[70vh] overflow-hidden">
          <div class="col3 h-full overflow-y-auto pr-2 rounded-[2rem]">
          <template v-if="activeProject">
            <div class="flex items-center justify-between gap-4 p-5 md:sticky md:top-0 bg-white rounded-t-[2rem] z-10">
              <div class="flex items-center gap-4">
                <div class="h-20 w-20 overflow-hidden rounded-3xl bg-slate-200">
                  <img v-if="activeProject.logo" :src="activeProject.logo" alt="Project logo" class="h-full w-full object-cover" />
                  <div v-else class="flex h-full items-center justify-center text-sm text-slate-500">No logo</div>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-black">{{ activeProject.name }}</h2>
                  <p class="text-xs text-slate-600">{{ activeProject.genre }} · {{ cohortName(activeProject.cohortId) }}</p>
                </div>
              </div>
              <button
                @click="openEditModal"
                class="rounded-2xl bg-[#263e30] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
              >Edit</button>
            </div>
            <div class="rounded-[2rem] bg-gray-100 p-4 mx-5 text-sm leading-7 text-black">
              <p>{{ activeProject.description }}</p>
            </div>
            <div class="md:sticky md:bottom-0 bg-white rounded-b-[2rem] px-5 py-3 flex items-center justify-between">
              <p class="text-xs text-white">{{ activeProject.genre }} · {{ cohortName(activeProject.cohortId) }}</p>
              <p class="text-xs text-white">{{ activeProject.name }}</p>
            </div>
          </template>
          <template v-else>
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-3 p-5">
              <div class="rounded-[2rem] bg-gray-100 p-4 text-black ">
                <p class="text-xs uppercase tracking-widest text-slate-600">Total Startups</p>
                <p class="mt-4 text-3xl font-semibold">{{ localStartups.length }}</p>
              </div>
              <div class="rounded-[2rem] bg-gray-100 p-4 text-black">
                <p class="text-xs uppercase tracking-widest text-slate-400">Cohorts</p>
                <p class="mt-4 text-3xl font-semibold">{{ localCohorts.length }}</p>
              </div>
              <div class="rounded-[2rem] bg-gray-100 p-4 text-black">
                <p class="text-xs uppercase tracking-widest text-slate-400">In Selected Cohort</p>
                <p class="mt-4 text-3xl font-semibold">{{ activeCohortCount }}</p>
              </div>
            </div>
            <div class="mt-4 mx-5 mb-5 rounded-[2rem] bg-gray-100 p-5">
              <h3 class="text-base font-semibold text-black mb-4">Recent Startups</h3>
              <ul class="space-y-3 text-sm text-slate-700">
                <li v-for="s in recentStartups" :key="s.id" class="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                  <span class="font-semibold text-black">{{ s.name }}</span> — {{ s.supporting }}
                </li>
              </ul>
            </div>
          </template>
          </div>
        </section>

      </div>
    </div>
  </div>

  <!-- Cohort Modal -->
  <div v-if="showCohortModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-black">Manage Cohorts</h3>
        <button @click="showCohortModal = false" class="text-slate-400 hover:text-black text-xl leading-none">✕</button>
      </div>
      <div class="flex gap-2">
        <button
          @click="cohortModalMode = 'select'"
          :class="cohortModalMode === 'select' ? 'bg-[#263e30] text-white' : 'bg-gray-100 text-black'"
          class="flex-1 rounded-2xl py-2 text-sm font-semibold transition"
        >Select</button>
        <button
          @click="cohortModalMode = 'add'"
          :class="cohortModalMode === 'add' ? 'bg-[#263e30] text-white' : 'bg-gray-100 text-black'"
          class="flex-1 rounded-2xl py-2 text-sm font-semibold transition"
        >Add New</button>
      </div>
      <ul v-if="cohortModalMode === 'select'" class="space-y-2 max-h-60 overflow-y-auto">
        <li
          v-for="cohort in localCohorts"
          :key="cohort.id"
          @click="selectCohort(cohort.id)"
          :class="[
            'flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 transition',
            cohort.id === activeCohortId ? 'bg-[#4d7c5e] text-white' : 'bg-gray-100 text-black hover:bg-[#c3d7c8]'
          ]"
        >
          <span class="text-sm font-semibold">{{ cohort.name }}</span>
          <span class="text-xs text-slate-400">{{ cohortProjectCountLabel(cohort.id) }}</span>
        </li>
      </ul>
      <div v-if="cohortModalMode === 'add'" class="space-y-3">
        <p class="text-sm text-slate-600">New cohort name will be:</p>
        <div class="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black">{{ nextCohortName() }}</div>
        <button
          @click="addCohort"
          class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
        >Add Cohort</button>
      </div>
    </div>
  </div>

  <!-- Add Project Modal -->
  <div v-if="showAddProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-black">Add Project to {{ cohortName(activeCohortId) }}</h3>
        <button @click="showAddProjectModal = false" class="text-slate-400 hover:text-black text-xl leading-none">✕</button>
      </div>
      <div class="space-y-3">
        <input
          v-model="newProject.name"
          placeholder="Project name"
          class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
        />
        <div class="relative">
          <input
            list="genre-options"
            v-model="newProject.genre"
            placeholder="Genre (e.g. HealthTech)"
            class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
          />
          <datalist id="genre-options">
            <option v-for="genre in genreOptions" :key="genre" :value="genre" />
          </datalist>
        </div>
          <input
            v-model="newProject.supporting"
            placeholder="Short description"
            class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
        />
        <textarea
          v-model="newProject.description"
          placeholder="Full description"
          rows="4"
          class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30] resize-none"
        />
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Logo (optional)</label>
          <div class="mb-2 h-24 w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-300">
            <img v-if="newProject.logo" :src="newProject.logo" alt="Logo preview" class="h-full w-full object-contain" />
            <div v-else class="flex h-full items-center justify-center text-sm text-slate-500">No logo uploaded</div>
          </div>

          <input ref="addFileInput" type="file" accept="image/*" @change="onAddFileSelected" class="hidden" />
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" @click="$refs.addFileInput.click()" class="rounded-2xl bg-[#4d7c5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a6d4f] transition">Choose File</button>
            <span class="text-sm text-slate-600">{{ addSelectedName || 'No file chosen' }}</span>
          </div>

          <p v-if="projectLogoError" class="mt-1 text-xs text-red-600">{{ projectLogoError }}</p>
        </div>
      </div>
      <p v-if="projectFormError" class="text-sm text-red-600">{{ projectFormError }}</p>
      <button
        @click="addProject"
        class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
      >Add Project</button>
    </div>
  </div>

  <!-- Edit Project Modal -->
  <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-black">Edit Project</h3>
        <button @click="showProjectModal = false" class="text-slate-400 hover:text-black text-xl leading-none">✕</button>
      </div>
      <div class="space-y-3">
        <input
          v-model="editForm.name"
          placeholder="Project name"
          class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
        />
        <div class="relative">
          <input
            list="genre-options"
            v-model="editForm.genre"
            placeholder="Genre"
            class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
          />
          <datalist id="genre-options">
            <option v-for="genre in genreOptions" :key="genre" :value="genre" />
          </datalist>
        </div>
        <input
          v-model="editForm.supporting"
          placeholder="Supporting description"
          class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
        />
        <textarea
          v-model="editForm.description"
          placeholder="Full description"
          rows="4"
          class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30] resize-none"
        />
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Logo (optional)</label>
          <div class="mb-2 h-24 w-full overflow-hidden rounded-3xl border border-gray-200 bg-slate-100">
            <img v-if="editForm.logo" :src="editForm.logo" alt="Logo preview" class="h-full w-full object-contain" />
            <div v-else class="flex h-full items-center justify-center text-sm text-slate-500">No logo uploaded</div>
          </div>
          <input ref="editFileInput" type="file" accept="image/*" @change="handleLogoUpload($event, 'edit')" class="hidden" />
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" @click="$refs.editFileInput.click()" class="rounded-2xl bg-[#4d7c5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a6d4f] transition">Choose File</button>
            <span class="text-sm text-slate-600">{{ editSelectedName || 'No file chosen' }}</span>
          </div>
          <p v-if="projectLogoError" class="mt-1 text-xs text-red-600">{{ projectLogoError }}</p>
        </div>
      </div>
      <p v-if="projectFormError" class="text-sm text-red-600">{{ projectFormError }}</p>
      <button
        @click="saveProject"
        class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
      >Save Changes</button>
    </div>
  </div>

</template>

<style scoped>
.col3 {
  scrollbar-gutter: stable;
}

</style>