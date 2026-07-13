<script setup>
/**
 * startupManagement.vue
 * -----------------------
 * CRUD page for cohorts and startup projects, laid out as a 3-column
 * browser: cohorts (col 1) -> projects within the selected cohort (col 2)
 * -> detail/edit panel for the selected project (col 3). Supports adding
 * cohorts, adding/editing/deleting projects (with optional logo upload),
 * searching/filtering/paginating the project list, and duplicate-name
 * checks scoped across all cohorts (not just the active one).
 *
 * Data shapes (see startupService.js):
 *   cohort:  { id, name, value }  — value = live startup count in that cohort
 *   startup: { id, cohortId, name, genre, shortDescription, logo }
 */

import { ref, computed, watch, onMounted } from 'vue'
import { getCohorts, getStartups, createCohort, createStartup, updateStartup, deleteStartup } from '../../services/startupService.js'

// --- Navigation / selection state ---
const activeCohortId  = ref(null)   // id of the cohort currently shown in column 2
const loadError       = ref('')     // set if the initial loadData() fetch fails; rendered as a banner
const activeProjectId = ref(null)   // id of the startup currently shown in column 3; null = show cohort-wide stats instead
const projectSearch   = ref('')     // free-text filter on project name (column 2)
const genreSearch     = ref('')     // genre filter on project list; '' or 'All' = no filter

// --- Modal / form visibility + error state ---
const showCohortModal     = ref(false)     // "Manage Cohorts" modal (select existing / add new)
const showProjectModal    = ref(false)     // "Edit Project" modal
const showAddProjectModal = ref(false)     // "Add Project" modal
const showDeleteConfirm   = ref(false)     // delete-project confirmation modal
const deleteCandidate     = ref(null)      // the startup object pending deletion

const deleteError         = ref('')        // error shown in the delete confirmation modal if the API call fails
// Disables their respective buttons while a request is in flight — without
// this, a fast double-click fires two concurrent create/update/delete calls,
// producing duplicates. This was here before and got lost in a merge.
const isSavingCohort      = ref(false)
const isSavingProject     = ref(false)
const isDeleting          = ref(false)

const cohortModalMode     = ref('select')  // 'select' | 'add' — which tab is active inside the cohort modal
const projectFormError    = ref('')        // validation/API error shared by the add and edit project forms
const projectLogoError    = ref('')        // logo-specific error (e.g. file too large), shared by both forms
const itemsPerPage        = ref(10)        // rows per page for paginatedStartups
const currentPage         = ref(1)         // 1-indexed current page within the active cohort's project list
const newProject          = ref({ name: '', genre: '', shortDescription: '', logo: '' })  // "Add Project" form model
const editSelectedName    = ref('')        // display name of the chosen logo file in the edit form (UI only)
const addSelectedName     = ref('')        // display name of the chosen logo file in the add form (UI only)

// --- Loaded data ---
const localCohorts  = ref([])   // all cohorts
const localStartups = ref([])   // all startups, across all cohorts (filtered per-cohort in computed props below)

/**
 * Initial fetch on mount: loads cohorts and startups, then defaults
 * activeCohortId to the first cohort in the list (if any exist).
 * Any failure sets loadError instead of throwing.
 */
async function loadData() {
  loadError.value = ''
  try {
    localCohorts.value   = await getCohorts()
    localStartups.value  = await getStartups()
    activeCohortId.value = localCohorts.value[0]?.id ?? null
  } catch (err) {
    loadError.value = 'Failed to load startup data. ' + err.message
  }
}

onMounted(loadData)

/**
 * Genre options for the column-2 genre dropdown, scoped to the active
 * cohort only (unlike genreOptions below, which spans all cohorts).
 * Always includes 'All' as the first option to clear the filter.
 */
const allGenres = computed(() => {
  const inCohort = localStartups.value.filter(s => s.cohortId === activeCohortId.value)
  const genres = inCohort.map(s => s.genre.trim()).filter(Boolean)
  return ['All', ...new Set(genres)]
})

/**
 * Sorted, de-duplicated list of every genre used across ALL startups
 * (not scoped to a cohort). Feeds the <datalist> autocomplete on the
 * genre text input in the add/edit project modals.
 */
const genreOptions = computed(() =>
  Array.from(new Set(localStartups.value.map(s => s.genre.trim()).filter(Boolean))).sort()
)

// Controls visibility of the custom genre-suggestion dropdown (replaces the
// native <datalist>, which can't be styled and had a duplicate-id bug when
// both the Add and Edit forms were open in the same DOM).
const showAddGenreSuggestions  = ref(false)
const showEditGenreSuggestions = ref(false)

/** Genres from genreOptions matching the currently typed text, case-insensitive. */
function matchingGenres(query) {
  const q = query.trim().toLowerCase()
  if (!q) return genreOptions.value
  return genreOptions.value.filter(g => g.toLowerCase().includes(q))
}

function chooseAddGenre(genre) {
  newProject.value.genre = genre
  showAddGenreSuggestions.value = false
}

function chooseEditGenre(genre) {
  editForm.value.genre = genre
  showEditGenreSuggestions.value = false
}

/**
 * Startups in the active cohort matching the current name search and
 * genre filter. This is the base list that paginatedStartups slices.
 */
const filteredStartups = computed(() => {
  const name  = projectSearch.value.toLowerCase()
  const genre = genreSearch.value
  return localStartups.value.filter(s =>
    s.cohortId === activeCohortId.value &&
    s.name.toLowerCase().includes(name) &&
    (genre === '' || genre === 'All' || s.genre === genre)
  )
})

/** Total pages for the current filteredStartups length. Never less than 1. */
const totalPages = computed(() => Math.max(1, Math.ceil(filteredStartups.value.length / itemsPerPage.value)))

/** The slice of filteredStartups shown on the current page in column 2. */
const paginatedStartups = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredStartups.value.slice(start, start + itemsPerPage.value)
})

// Reset to page 1 whenever the search term, genre filter, active cohort,
// or page size changes, so the user isn't left on a stale/out-of-range page.
watch([projectSearch, genreSearch, activeCohortId, itemsPerPage], () => {
  currentPage.value = 1
})

// Safety net for when filteredStartups shrinks (e.g. after a delete) and
// currentPage now points past the last page — clamps back into range.
watch(filteredStartups, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

/** The full startup object currently selected in column 3, or null if none is selected. */
const activeProject = computed(() =>
  localStartups.value.find(s => s.id === activeProjectId.value) ?? null
)

/** Count of startups in the active cohort (used in the "no project selected" stats view). */
const activeCohortCount = computed(() =>
  localStartups.value.filter(s => s.cohortId === activeCohortId.value).length
)

/**
 * The 6 most recently created startups across all cohorts, newest first.
 * Relies on higher ids meaning more recently created (auto-increment
 * primary keys) rather than a createdAt timestamp.
 */
const recentStartups = computed(() =>
  [...localStartups.value]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)
)

/** Looks up a cohort's display name by id. Returns '' if not found. */
function cohortName(id) {
  return localCohorts.value.find(c => c.id === id)?.name ?? ''
}

/**
 * Switches the active cohort: updates column 2's scope, clears the
 * selected project (it belonged to the previous cohort) and the genre
 * filter (genre options are cohort-scoped), and closes the cohort modal.
 */
function selectCohort(id) {
  activeCohortId.value  = id
  activeProjectId.value = null
  genreSearch.value     = ''
  showCohortModal.value = false
}

/** Selects a project to display in column 3. */
function selectProject(id) {
  activeProjectId.value = id
}

/**
 * Opens a startup from the "Recent Startups" list. Unlike selectProject()
 * above, this can jump to a startup outside the currently active cohort
 * (recentStartups spans all cohorts, newest first) — so it switches
 * activeCohortId too, keeping columns 1–3 all pointed at the same startup
 * instead of showing its detail panel while column 1/2 still highlight a
 * different cohort.
 */
function selectRecentStartup(startup) {
  activeCohortId.value  = startup.cohortId
  activeProjectId.value = startup.id
}

/** Opens the cohort modal, always starting on the "select" tab. */
function openCohortModal() {
  cohortModalMode.value = 'select'
  showCohortModal.value = true
}

/**
 * Derives the next auto-generated cohort name in the form "Cohort N",
 * where N is one greater than the highest numeric suffix found among
 * existing cohort names. Non-numeric or unparsable names are ignored
 * (filtered out via `n > 0`). Falls back to "Cohort 1" if no existing
 * cohort has a valid numeric suffix.
 */
function nextCohortName() {
  const existingNumbers = localCohorts.value
    .map(c => Number(c.name.replace(/[^0-9]/g, '')))
    .filter(n => n > 0)
  const nextNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1
  return `Cohort ${nextNumber}`
}

/**
 * Creates a new cohort using the auto-generated name from
 * nextCohortName(), then makes it the active cohort and closes the modal.
 */


/* async function addCohort() {
  const name = nextCohortName()
  try {
    const created = await createCohort({ name, value: 0 })
    localCohorts.value.push(created)
    activeCohortId.value  = created.id
    showCohortModal.value = false
  } catch (err) {
    loadError.value = 'Failed to create cohort. ' + err.message} */

/** Resets the "Add Project" form to blank and opens its modal. */
function openAddProjectModal() {
  newProject.value = { name: '', genre: '', shortDescription: '', logo: '' }
  projectFormError.value = ''
  projectLogoError.value = ''
  showAddProjectModal.value = true
}

/**
 * Case-insensitive, whitespace-trimmed duplicate name check across ALL
 * startups (every cohort, not just the active one) — a project name must
 * be globally unique. Used by both addProject() and saveProject().
 * @param {string} name - candidate project name
 * @param {number|null} excludeId - id to exclude (the project being edited)
 * @returns {object|undefined} the conflicting startup, if any
 */
function findProjectConflict(name, excludeId = null) {
  const normalized = name.trim().toLowerCase()
  return localStartups.value.find(s => s.id !== excludeId && s.name.trim().toLowerCase() === normalized)
}

/** Number of startups belonging to a given cohort id. */
function cohortProjectCount(cohortId) {
  return localStartups.value.filter(s => s.cohortId === cohortId).length
}

/** Human-readable "N project(s)" label shown next to each cohort in the list/modal. */
function cohortProjectCountLabel(cohortId) {
  const count = cohortProjectCount(cohortId)
  return `${count} ${count === 1 ? 'project' : 'projects'}`
}

/**
 * Reads a selected logo image file as a data URL and stores it on the
 * appropriate form model. Rejects files over 2MB (clears any previously
 * selected logo/filename on that form instead of silently keeping it).
 * @param {Event} event - file input change event
 * @param {'new'|'edit'} target - which form to update: newProject (add
 *   modal) or editForm (edit modal)
 */
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

/** Thin wrapper so the "Add Project" file input doesn't need to pass the 'new' target inline in the template. */
function onAddFileSelected(event) {
  handleLogoUpload(event, 'new')
}

/**
 * Validates and submits the "Add Project" form: requires a non-empty,
 * globally-unique name. On success, creates the startup via the API,
 * appends it to `localStartups`, and increments the active cohort's
 * local `value` (startup count) so the cohort list reflects the new
 * total without a full reload. Closes the modal on success; leaves it
 * open with an error message on failure.
 */
async function addProject() {
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


  async function addCohort() {
  const name = nextCohortName()
  isSavingCohort.value = true
  try {
    const created = await createCohort({ name, value: 0 })
    localCohorts.value.push(created)
    activeCohortId.value  = created.id
    showCohortModal.value = false
  } catch (err) {
    loadError.value = 'Failed to create cohort. ' + err.message
  } finally {
    isSavingCohort.value = false
  }
}


//-----july 10- Updated to try and eliminate duplicate inputs

  isSavingProject.value = true
  try {
    const created = await createStartup({
      cohortId:         activeCohortId.value,
      name,
      genre:            newProject.value.genre.trim(),
      shortDescription: newProject.value.shortDescription.trim(),
      logo:             newProject.value.logo || '',
    })
    localStartups.value.push(created)

    const cohort = localCohorts.value.find(c => c.id === activeCohortId.value)
    if (cohort) cohort.value += 1

    showAddProjectModal.value = false
  } catch (err) {
    projectFormError.value = 'Failed to create project. ' + err.message
  } finally {
    isSavingProject.value = false
  }
}

// "Edit Project" form model — populated from activeProject when the edit modal opens.
const editForm = ref({ id: null, name: '', genre: '', shortDescription: '', logo: '' })

/**
 * Opens the "Edit Project" modal, pre-filled with a shallow copy of the
 * currently active project. No-op if no project is selected.
 */
function openEditModal() {
  if (!activeProject.value) return
  editForm.value = { ...activeProject.value }
  projectFormError.value = ''
  projectLogoError.value = ''
  showProjectModal.value = true
}

// --- Delete Project ---

/** Opens the delete confirmation modal for a given project. */
function requestDelete(project) {
  deleteCandidate.value = project
  deleteError.value = ''
  showDeleteConfirm.value = true
}

/** Closes the delete confirmation modal without deleting anything. */
function cancelDelete() {
  deleteCandidate.value = null
  deleteError.value = ''
  showDeleteConfirm.value = false
}

/**
 * Deletes the pending project via the API, then removes it from
 * `localStartups` and decrements its cohort's local `value` count.
 * If the deleted project was open in column 3, clears the selection so
 * the detail panel falls back to the cohort-wide stats view. Leaves the
 * modal open with an error message if the API call fails (so nothing is
 * removed locally unless the delete actually succeeded).
 */



// async function confirmDelete() {
//   if (!deleteCandidate.value) return

//   try {
//     await deleteStartup(deleteCandidate.value.id)
//     localStartups.value = localStartups.value.filter(s => s.id !== deleteCandidate.value.id)

//     const cohort = localCohorts.value.find(c => c.id === deleteCandidate.value.cohortId)
//     if (cohort) cohort.value -= 1

//     if (activeProjectId.value === deleteCandidate.value.id) {
//       activeProjectId.value = null
//     }

//     cancelDelete()
//   } catch (err) {
//     deleteError.value = 'Failed to delete project. ' + err.message
//   }
// }


//-----july 10- Updated to try and eliminate duplicate inputs
async function confirmDelete() {
  if (!deleteCandidate.value) return
  isDeleting.value = true

  try {
    await deleteStartup(deleteCandidate.value.id)
    localStartups.value = localStartups.value.filter(s => s.id !== deleteCandidate.value.id)

    const cohort = localCohorts.value.find(c => c.id === deleteCandidate.value.cohortId)
    if (cohort) cohort.value -= 1

    if (activeProjectId.value === deleteCandidate.value.id) {
      activeProjectId.value = null
    }

    cancelDelete()
  } catch (err) {
    deleteError.value = 'Failed to delete project. ' + err.message
  } finally {
    isDeleting.value = false
  }
}

/**
 * Validates and submits the "Edit Project" form: requires a non-empty
 * name that isn't already used by another project (excluding the project
 * being edited itself). On success, replaces the record in
 * `localStartups` with the server's updated version and closes the modal.
 * Note: unlike addProject(), this does not adjust any cohort's `value`
 * count — editing a project never changes which cohort it belongs to
 * here, so counts stay accurate without adjustment.
 */
async function saveProject() {
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

//   try {
//     const updated = await updateStartup(editForm.value.id, { ...editForm.value })
//     const idx = localStartups.value.findIndex(s => s.id === editForm.value.id)
//     if (idx !== -1) {
//       localStartups.value[idx] = updated
//     }
//     showProjectModal.value = false
//   } catch (err) {
//     projectFormError.value = 'Failed to save project. ' + err.message
//   }
// }

//-----july 10- Updated to try and eliminate duplicate inputs-------//
isSavingProject.value = true
  try {
    const updated = await updateStartup(editForm.value.id, { ...editForm.value })
    const idx = localStartups.value.findIndex(s => s.id === editForm.value.id)
    if (idx !== -1) {
      localStartups.value[idx] = updated
    }
    showProjectModal.value = false
  } catch (err) {
    projectFormError.value = 'Failed to save project. ' + err.message
  } finally {
    isSavingProject.value = false
  }
}
</script>

<template>
  <div class="h-screen bg-gray-100 text-white p-4 sm:p-6">
    <div class="w-full space-y-6">

      <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
        {{ loadError }}
      </div>

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
        <section class="rounded-xl bg-white p-5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] self-start min-w-0">
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
        <section class="rounded-xl bg-white p-5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] self-start min-w-0">

          <div class="flex items-center justify-between rounded-xl bg-[#263e30] px-4 py-4 gap-2"> <!-- Projects Header -->
            <span class="text-sm font-semibold uppercase tracking-[0.24em] text-white">Projects</span>
            <button
              @click="openAddProjectModal"
              class="rounded-sm bg-[#4d7c5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4d7c5e] transition shrink-0"
            >+ Project</button>
          </div>


          <div class="grid gap-3 sm:grid-cols-3 mb-4 p-3"> <!-- Search and Filters -->
            <div class="flex flex-col gap-1">
              <label class="text-xs text-neutral-600">Project</label>
              <input
                v-model="projectSearch"
                placeholder="Search project..."
                class="w-full rounded-[2rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-neutral-600">Genre</label>
              <select
                v-model="genreSearch"
                class="w-full rounded-[2rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:border-[#263e30] text-black"
              >
                <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-neutral-600">Display</label>
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


          <ul class="space-y-2"> <!-- Project List -->
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
                <!--fall back logo (UC Official Seal), if no logo is selected-->
                <img :src="startup.logo || '/UC_Official_Seal.png'" alt="Logo" class="h-full w-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ startup.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ startup.shortDescription }}</p>
              </div>
              <span class="text-slate-500">›</span>
            </li>
            <li v-if="filteredStartups.length === 0" class="px-4 py-3 text-sm text-slate-500">No projects found.</li>
          </ul>


          <div class="mt-4 space-y-2"> <!-- Pagination Controls -->
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
        <section class="rounded-xl bg-white shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] md:h-[70vh] overflow-hidden min-w-0"> <!-- Detail Section -->

          <div class="col3 h-full overflow-y-auto pr-2 rounded-[2rem]">
          <template v-if="activeProject"> 
            <div class="flex items-center justify-between gap-4 p-5 md:sticky md:top-0 bg-white rounded-t-[2rem] z-10">
              <div class="flex items-center gap-4 min-w-0">
                <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-200">
                  <!--fall back logo (UC Official Seal), if no logo is selected-->
                  <img :src="activeProject.logo || '/UC_Official_Seal.png'" alt="Project logo" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0">
                  <h2 class="text-xl font-semibold text-black truncate">{{ activeProject.name }}</h2>
                  <p class="text-xs text-slate-600 truncate">{{ activeProject.genre }} · {{ cohortName(activeProject.cohortId) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="activeProjectId = null"
                  class="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >← Back</button>
                <button
                  @click="openEditModal"
                  class="rounded-2xl bg-[#263e30] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
                >Edit</button>
                <button
                  @click="requestDelete(activeProject)"
                  class="rounded-2xl bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c44343] transition"
                >Delete</button>
              </div>
            </div>
            <div class="rounded-[2rem] bg-gray-100 p-4 mx-5 text-sm leading-7 text-black">
              <p>{{ activeProject.shortDescription }}</p>
            </div>
            <div class="md:sticky md:bottom-0 bg-white rounded-b-[2rem] px-5 py-3 flex items-center justify-between">
              <p class="text-xs text-white">{{ activeProject.genre }} · {{ cohortName(activeProject.cohortId) }}</p>
              <p class="text-xs text-white">{{ activeProject.name }}</p>
            </div>
          </template>


          <template v-else> <!-- No Project Selected -->
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
                <li
                  v-for="s in recentStartups"
                  :key="s.id"
                  @click="selectRecentStartup(s)"
                  class="min-w-0 cursor-pointer border-b border-slate-200 pb-3 transition last:border-b-0 last:pb-0 hover:text-[#263e30] hover:*:bg-[#c3d7c8]"
                >
                  <p class="truncate font-semibold text-black">{{ s.name }}</p>
                  <p class="truncate text-slate-600">{{ s.shortDescription }}</p>
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
        <!-- <button
          @click="addCohort"
          class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
        >Add Cohort</button> -->
        <!--july 10-[bug fix]: duplicate entries on double click-->
        <button
          @click="addCohort"
          :disabled="isSavingCohort"
          class="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg v-if="isSavingCohort" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ isSavingCohort ? 'Adding...' : 'Add Cohort' }}
        </button>
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
            v-model="newProject.genre"
            placeholder="Genre (e.g. HealthTech)"
            class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
            @focus="showAddGenreSuggestions = true"
            @blur="showAddGenreSuggestions = false"
          />
          <ul
            v-if="showAddGenreSuggestions && matchingGenres(newProject.genre).length"
            class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg"
          >
            <li
              v-for="genre in matchingGenres(newProject.genre)"
              :key="genre"
              @mousedown.prevent="chooseAddGenre(genre)"
              class="cursor-pointer px-4 py-2 text-sm text-black hover:bg-[#c3d7c8]"
            >{{ genre }}</li>
          </ul>
        </div>
        <textarea
          v-model="newProject.shortDescription"
          placeholder="Description"
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
      <!-- <button
        @click="addProject"
        class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
      >Add Project</button> -->
      <!--july 10-[bug fix]: duplicate entries on double click-->
      <button
        @click="addProject"
        :disabled="isSavingProject"
        class="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg v-if="isSavingProject" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        {{ isSavingProject ? 'Adding...' : 'Add Project' }}
      </button>
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
            v-model="editForm.genre"
            placeholder="Genre"
            class="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]"
            @focus="showEditGenreSuggestions = true"
            @blur="showEditGenreSuggestions = false"
          />
          <ul
            v-if="showEditGenreSuggestions && matchingGenres(editForm.genre).length"
            class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg"
          >
            <li
              v-for="genre in matchingGenres(editForm.genre)"
              :key="genre"
              @mousedown.prevent="chooseEditGenre(genre)"
              class="cursor-pointer px-4 py-2 text-sm text-black hover:bg-[#c3d7c8]"
            >{{ genre }}</li>
          </ul>
        </div>
        <textarea
          v-model="editForm.shortDescription"
          placeholder="Description"
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
      <!-- <button
        @click="saveProject"
        class="w-full rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition"
      >Save Changes</button> -->

      <!--july 10-[bug fix]: duplicate entries on double click-->
      <button
        @click="saveProject"
        :disabled="isSavingProject"
        class="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#263e30] py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg v-if="isSavingProject" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        {{ isSavingProject ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>

  <!-- Delete confirmation modal -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl space-y-4">
      <p class="text-sm font-semibold text-black">Confirm delete</p>
      <p class="text-sm text-slate-600">Are you sure you want to delete <strong>{{ deleteCandidate?.name }}</strong>? This action cannot be undone.</p>
      <p v-if="deleteError" class="text-sm text-red-600">{{ deleteError }}</p>
      <div class="flex justify-end gap-3">
        <!-- <button type="button" @click="cancelDelete" class="rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
        <button type="button" @click="confirmDelete" class="rounded-2xl bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c44343]">Delete</button> -->
          
        <!--july 10-[bug fix]: duplicate entries on double click-->
        <button type="button" @click="cancelDelete" class="rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
        <button type="button" :disabled="isDeleting" @click="confirmDelete" class="flex items-center gap-2 rounded-2xl bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c44343] disabled:cursor-not-allowed disabled:opacity-60">
          <svg v-if="isDeleting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.col3 {
  scrollbar-gutter: stable;
}

</style>