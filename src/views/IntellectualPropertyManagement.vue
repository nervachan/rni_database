<template>
  <div class="min-h-screen bg-gray-100 font-sans">

    <!-- Header -->
    <div class="bg-[#1e4d2e] px-4 py-3 flex items-center gap-2">
      <span class="text-[#9ecfa8] text-sm">◎</span>
      <span class="text-white text-sm font-semibold">Intellectual Property Management</span>
    </div>

    <!-- Search + Add -->
    <div class="px-4 py-4 flex items-center justify-between gap-4 bg-gray-100">
      <div class="flex items-center gap-2 bg-[#d9d9d9] rounded-full px-4 py-2 w-80">
        <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder=""
          class="bg-transparent outline-none text-sm text-gray-600 w-full"
          aria-label="Search IP records"
        />
      </div>
      <button
        class="flex items-center gap-1.5 border border-[#1e4d2e] text-[#1e4d2e] text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#1e4d2e] hover:text-white transition-colors"
        @click="showAdd = true"
      >
        <span class="text-base leading-none">+</span> Add Research
      </button>
    </div>

    <!-- Table -->
    <div class="px-4 pb-8">
      <table class="w-full border-collapse text-sm">
        <!-- Head -->
        <thead>
          <tr class="bg-[#2d6640] text-white">
            <th class="w-8 py-3 px-3"></th>
            <th class="py-3 px-3 text-left font-bold">Title</th>
            <th class="py-3 px-3 text-left font-bold">Inventor</th>
            <th class="py-3 px-3 text-left font-bold">Filing Date</th>
            <th class="py-3 px-3 text-left font-bold">Status</th>
            <th class="py-3 px-3 text-left font-bold">Classification</th>
            <th class="py-3 px-3 text-left font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in filteredRows"
            :key="row.id"
            :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
            class="border-b border-gray-200 hover:bg-[#eaf4ea] transition-colors"
          >
            <!-- Row number -->
            <td class="py-3 px-3 text-gray-400 text-xs text-center">{{ i + 1 }}</td>
            <!-- Title -->
            <td class="py-3 px-3 text-gray-700 max-w-[160px]">
              <span class="block truncate" :title="row.title">{{ row.title }}</span>
            </td>
            <!-- Inventor -->
            <td class="py-3 px-3 text-gray-600 max-w-[180px]">
              <span class="block truncate" :title="row.inventors.join(', ')">{{ row.inventors.join(', ') }}</span>
            </td>
            <!-- Filing Date -->
            <td class="py-3 px-3 text-gray-600 whitespace-nowrap">{{ row.filingDate }}</td>
            <!-- Status -->
            <td class="py-3 px-3 text-gray-600 max-w-[120px]">
              <span class="block truncate" :title="row.status.join(', ')">{{ row.status.join(', ') }}</span>
            </td>
            <!-- Classification -->
            <td class="py-3 px-3 text-gray-600">{{ row.classification }}</td>
            <!-- Actions -->
            <td class="py-3 px-3">
              <div class="flex items-center gap-1.5">
                <!-- View -->
                <button
                  class="w-7 h-7 flex items-center justify-center rounded border border-[#7b68ee] text-[#7b68ee] hover:bg-[#7b68ee] hover:text-white transition-colors"
                  title="View"
                  @click="viewRow(row)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <!-- Edit -->
                <button
                  class="w-7 h-7 flex items-center justify-center rounded border border-[#e6a817] text-[#e6a817] hover:bg-[#e6a817] hover:text-white transition-colors"
                  title="Edit"
                  @click="editRow(row)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <!-- Delete -->
                <button
                  class="w-7 h-7 flex items-center justify-center rounded border border-[#e05c5c] text-[#e05c5c] hover:bg-[#e05c5c] hover:text-white transition-colors"
                  title="Delete"
                  @click="deleteRow(row.id)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="filteredRows.length === 0">
            <td colspan="7" class="py-12 text-center text-gray-400 text-sm">No records match your search.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const showAdd = ref(false)

const rows = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: 'Lorem Ipsum .....',
    inventors: ['Person 1', 'Person 2', 'Person...'],
    filingDate: '01/01/20xx',
    status: ['Pending', 'Grante...'],
    classification: 'Classification id(Fk)',
  }))
)

const filteredRows = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.inventors.join(' ').toLowerCase().includes(q) ||
    r.classification.toLowerCase().includes(q) ||
    r.status.join(' ').toLowerCase().includes(q)
  )
})

function viewRow(row) {
  alert(`Viewing: ${row.title}`)
}
function editRow(row) {
  alert(`Editing: ${row.title}`)
}
function deleteRow(id) {
  if (confirm('Delete this record?')) {
    rows.value = rows.value.filter(r => r.id !== id)
  }
}
</script>
