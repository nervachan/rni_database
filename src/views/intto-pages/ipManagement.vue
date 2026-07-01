<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { ipRecords } from '../../data/ip.js'

defineEmits(['view'])

const rows = ref([...ipRecords])

// --- Toolbar state ---
const search       = ref('')
const filterStatus = ref('')
const filterClass  = ref('')
const sortKey      = ref('')
const itemsPerPage = ref(10)
const currentPage  = ref(1)

// --- Form state ---
const showForm  = ref(false)
const editingId = ref(null)
const form = reactive({ title: '', inventors: '', filingDate: '', classification: '', status: '' })
const formError = ref('')

const blankForm = () => ({ title: '', inventors: '', filingDate: '', classification: '', status: '' })

const deleteCandidate = ref(null)
const showDeleteConfirm = ref(false)

function openForm(row = null) {
  formError.value = ''
  if (row) {
    editingId.value     = row.id
    form.title          = row.title
    form.inventors      = row.inventors.join(', ')
    form.filingDate     = row.filingDate
    form.classification = row.classification
    form.status         = row.status[0] ?? ''
  } else {
    editingId.value = null
    Object.assign(form, blankForm())
  }
  showForm.value = true
}

function cancelForm() {
  showForm.value  = false
  editingId.value = null
  formError.value = ''
}

function recordTitleAlreadyExists(title, excludeId = null) {
  const normalized = title.trim().toLowerCase()
  return rows.value.some(r => r.id !== excludeId && r.title.trim().toLowerCase() === normalized)
}

function submitForm() {
  const title = form.title.trim()
  if (!title) {
    formError.value = 'Title is required.'
    return
  }

  if (recordTitleAlreadyExists(title, editingId.value)) {
    formError.value = 'A record with this title already exists.'
    return
  }

  const record = {
    title,
    inventors:      form.inventors.split(',').map(s => s.trim()).filter(Boolean),
    filingDate:     form.filingDate,
    classification: form.classification,
    status:         [form.status],
  }

  if (editingId.value) {
    const idx = rows.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) rows.value[idx] = { ...rows.value[idx], ...record }
  } else {
    const newId = Math.max(0, ...rows.value.map(r => r.id)) + 1
    rows.value.push({ id: newId, ...record })
  }

  cancelForm()
}

function requestDelete(row) {
  deleteCandidate.value = row
  showDeleteConfirm.value = true
}

function cancelDelete() {
  deleteCandidate.value = null
  showDeleteConfirm.value = false
}

function deleteRow(id) {
  rows.value = rows.value.filter(r => r.id !== id)
}

function confirmDelete() {
  if (deleteCandidate.value) {
    deleteRow(deleteCandidate.value.id)
    cancelDelete()
  }
}

// --- Filtered + sorted view ---
const displayedRows = computed(() => {
  let result = rows.value

  const q = search.value.toLowerCase()
  if (q) result = result.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.inventors.join(' ').toLowerCase().includes(q) ||
    r.classification.toLowerCase().includes(q) ||
    r.status.join(' ').toLowerCase().includes(q)
  )

  if (filterStatus.value)
    result = result.filter(r => r.status.includes(filterStatus.value))

  if (filterClass.value)
    result = result.filter(r => r.classification === filterClass.value)

  if (sortKey.value === 'title')     result = [...result].sort((a, b) => a.title.localeCompare(b.title))
  if (sortKey.value === 'titleDesc') result = [...result].sort((a, b) => b.title.localeCompare(a.title))
  if (sortKey.value === 'date')      result = [...result].sort((a, b) => a.filingDate.localeCompare(b.filingDate))
  if (sortKey.value === 'dateDesc')  result = [...result].sort((a, b) => b.filingDate.localeCompare(a.filingDate))

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayedRows.value.length / itemsPerPage.value)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return displayedRows.value.slice(start, start + itemsPerPage.value)
})

watch([search, filterStatus, filterClass, sortKey, itemsPerPage], () => {
  currentPage.value = 1
})

watch(displayedRows, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

function statusClass(status) {
  const s = status.join(' ')
  if (s.includes('Granted'))   return 'bg-[#2ecc71]/10 text-[#2ecc71] group-hover:bg-[#2ecc71] group-hover:text-[#eff2f0]'
  if (s.includes('Pending'))   return 'bg-[#e6a817]/10 text-[#e6a817] group-hover:bg-[#e6a817] group-hover:text-[#eff2f0]'
  if (s.includes('Licensed'))  return 'bg-[#3b9edd]/10 text-[#3b9edd] group-hover:bg-[#3b9edd] group-hover:text-[#eff2f0]'
  if (s.includes('Abandoned')) return 'bg-[#e05c5c]/10 text-[#e05c5c] group-hover:bg-[#e05c5c] group-hover:text-[#eff2f0]'
  return 'bg-white/10 text-white/60 group-hover:bg-white/80 group-hover:text-[#eff2f0]'
}
</script>


<template>
  <div class="min-h-screen bg-gray-100 font-sans">

    <!-- Header -->
    <div class="mx-4 sm:mx-6 mt-4 sm:mt-6 flex items-center gap-3 bg-white px-4 sm:px-6 py-6 rounded-2xl shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
      <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#263e30] text-white">◎</span>
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-black">Intellectual Property Management</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Track and manage IP filings and classifications</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="flex items-center gap-2 bg-white border border-white/10 rounded-md px-4 py-2 w-64 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <svg class="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search records..."
          class="bg-transparent outline-none text-sm text-black placeholder-black/30 w-full"
          aria-label="Search IP records"
        />
      </div>

      <!-- Filter by status -->
      <select
        v-model="filterStatus"
        class="bg-white border border-white/10 rounded-md px-4 py-2 text-sm text-black/70 outline-none cursor-pointer hover:border-[#9ecfa8]/40 transition-colors shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]"
      >
        <option value="">All statuses</option>
        <option value="Pending">Pending</option>
        <option value="Granted">Granted</option>
        <option value="Licensed">Licensed</option>
        <option value="Abandoned">Abandoned</option>
      </select>

      <!-- Filter by classification -->
      <select
        v-model="filterClass"
        class="bg-white border border-white/10 rounded-md px-4 py-2 text-sm text-black/70 outline-none cursor-pointer hover:border-[#9ecfa8]/40 transition-colors shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]"
      >
        <option value="">All classifications</option>
        <option value="Patent">Patent</option>
        <option value="Trademark">Trademark</option>
        <option value="Copyright">Copyright</option>
        <option value="Industrial Design">Industrial Design</option>
        <option value="Trade secret">Trade secret</option>
        <option value="Utility model">Utility model</option>
      </select>

      <!-- Sort -->
      <select
        v-model="sortKey"
        class="bg-white border border-white/10 rounded-md px-4 py-2 text-sm text-black/70 outline-none cursor-pointer hover:border-[#9ecfa8]/40 transition-colors shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]"
      >
        <option value="">Sort by...</option>
        <option value="title">Title A–Z</option>
        <option value="titleDesc">Title Z–A</option>
        <option value="date">Filing date ↑</option>
        <option value="dateDesc">Filing date ↓</option>
      </select>

      <div class="flex items-center gap-2 bg-white border border-white/10 rounded-md px-4 py-2 text-sm text-black/70 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <span>Show</span>
        <select
          v-model="itemsPerPage"
          class="bg-transparent outline-none text-sm text-black"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>

      <!-- Add -->
      <button
        class="ml-auto flex items-center gap-1.5 bg-grey-200 border border-[#9ecfa8]/40 text-black text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#9ecfa8] hover:text-[#1a2e22] transition-colors shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]"
        @click="openForm()"
      >
        <span class="text-base leading-none">+</span> Add Record
      </button>
    </div>

        <!-- Record modal -->
    <transition name="slide-form">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" @click.self="cancelForm">
        <div class="w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-black mb-1">{{ editingId ? 'Edit Record' : 'New Record' }}</p>
              <p class="text-sm text-slate-500">Use this form to save IP filing details.</p>
            </div>
            <button @click="cancelForm" class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-black transition">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="formError" class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ formError }}</div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Title</label>
                <input v-model="form.title" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" placeholder="IP title" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Filing Date</label>
                <input v-model="form.filingDate" type="date" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Inventors</label>
                <input v-model="form.inventors" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" placeholder="e.g. Juan Dela Cruz, Maria Santos" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Classification</label>
                <select v-model="form.classification" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]">
                  <option value="">Select...</option>
                  <option>Patent</option>
                  <option>Trademark</option>
                  <option>Copyright</option>
                  <option>Industrial Design</option>
                  <option>Trade secret</option>
                  <option>Utility model</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Status</label>
                <select v-model="form.status" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]">
                  <option value="">Select...</option>
                  <option>Pending</option>
                  <option>Granted</option>
                  <option>Licensed</option>
                  <option>Abandoned</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="cancelForm" class="rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button type="submit" class="rounded-2xl bg-[#263e30] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition">
                {{ editingId ? 'Save changes' : 'Add record' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Table --><!-- Table -->
    <div class="px-4 sm:px-6 pb-8">
      <div class="rounded-xl overflow-hidden border border-white/5 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
        <div class="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table class="w-full border-collapse text-sm min-w-[700px]">
            <thead class="sticky top-0 z-10 divide-y divide-gray-200">
              <tr class="bg-[#4d7c5e] text-white">
                <th class="w-8 py-3 px-3 text-center font-semibold text-xs tracking-wider">#</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Title</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Author</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Filing Date</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Status</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Classification</th>
                <th class="py-3 px-3 text-left font-semibold text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in paginatedRows"
                :key="row.id"
                class="border-b border-white/5 transition-colors group cursor-default"
                :class="i % 2 === 0 ? 'bg-white hover:bg-gradient-to-r from-[#c3d7c8] to-#f2f7f3' : 'bg-grey-200 hover:bg-gradient-to-r from-[#c3d7c8] to-[#f2f7f3] '"
              >
                <td class="py-3 px-3 text-xs text-center text-black/30 group-hover:text-black">{{ (currentPage - 1) * itemsPerPage + i + 1 }}</td>
                <td class="py-3 px-3 text-black group-hover:text-black max-w-[160px]">
                  <span class="block truncate" :title="row.title">{{ row.title }}</span>
                </td>
                <td class="py-3 px-3 text-black/70 group-hover:text-black max-w-[180px]">
                  <span class="block truncate" :title="row.inventors.join(', ')">{{ row.inventors.join(', ') }}</span>
                </td>
                <td class="py-3 px-3 text-black/70 group-hover:text-black whitespace-nowrap">{{ row.filingDate }}</td>
                <td class="py-3 px-3 max-w-[120px]">
                  <span
                    class="block truncate text-xs font-medium px-2 py-0.5 rounded-full w-fit transition-colors"
                    :class="statusClass(row.status)"
                    :title="row.status.join(', ')"
                  >{{ row.status.join(', ') }}</span>
                </td>
                <td class="py-3 px-3 text-black/70 group-hover:text-black">{{ row.classification }}</td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5">
                    <!-- <button class="w-7 h-7 flex items-center justify-center rounded border border-[#3b9edd]/50 text-[#3b9edd] hover:bg-[#3b9edd] hover:text-white transition-colors" title="View" @click="$emit('view', row)">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg> -->
                    <!-- </button> -->
                    <button class="w-7 h-7 flex items-center justify-center rounded border border-[#e6a817]/50 text-[#e6a817] hover:bg-[#e6a817] hover:text-white transition-colors" title="Edit" @click="openForm(row)">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="w-7 h-7 flex items-center justify-center rounded border border-[#e05c5c]/50 text-[#e05c5c] hover:bg-[#e05c5c] hover:text-white transition-colors" title="Delete" @click="requestDelete(row)">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="displayedRows.length === 0">
                <td colspan="7" class="py-12 text-center text-/30 text-sm">No records match your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-slate-600">Showing {{ paginatedRows.length }} of {{ displayedRows.length }} records</div>
          <div class="flex items-center gap-2 justify-center">
            <button
              class="rounded border border-gray-300 px-3 py-2 text-xs transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >Prev</button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="h-9 min-w-[2.25rem] rounded-full text-sm transition"
              :class="currentPage === page ? 'bg-[#263e30] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'"
              @click="currentPage = page"
            >{{ page }}</button>
            <button
              class="rounded border border-gray-300 px-3 py-2 text-xs transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >Next</button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" @click.self="cancelDelete">
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
          <p class="text-sm font-semibold text-black mb-2">Confirm delete</p>
          <p class="mb-6 text-sm text-slate-600">Are you sure you want to delete <strong>{{ deleteCandidate?.title }}</strong>? This action cannot be undone.</p>
          <div class="flex justify-end gap-3">
            <button type="button" @click="cancelDelete" class="rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
            <button type="button" @click="confirmDelete" class="rounded-2xl bg-[#e05c5c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c44343]">Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<style scoped>

</style>