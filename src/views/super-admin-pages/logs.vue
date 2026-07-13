<script setup>
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline';
import { computed, ref, watch, onMounted } from 'vue';
import ReusableTable from '../../components/tables/ReusableTable.vue';
import FilterControls from '../../components/filters/FilterControls.vue';
import { getLogs } from '../../services/logService';

const searchQuery = ref('');
const isFocused = ref(false);
const isFilterOpen = ref(false);
const filterState = ref({ from: '', to: '', role: '' });
const itemsPerPage = ref(10);
const currentPage = ref(1);

const logs = ref([]);
const isLoading = ref(true);
const loadError = ref('');

async function loadLogs() {
  isLoading.value = true;
  loadError.value = '';
  try {
    logs.value = await getLogs();
  } catch (err) {
    loadError.value = 'Failed to load logs. ' + err.message;
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadLogs);

const tableColumns = [
  { key: 'timestamp', label: 'Timestamp', widthClass: 'w-[12rem]' },
  { key: 'action', label: 'Action', widthClass: 'w-[12rem]' },
  { key: 'name', label: 'Name', widthClass: 'w-[12rem]' },
  { key: 'email', label: 'Email', widthClass: 'w-[14rem]' },
  { key: 'role', label: 'Role', widthClass: 'w-[8rem]' },
];

const filteredLogs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const matchesQuery = !q || log.name?.toLowerCase().includes(q);

    const from = filterState.value.from ? new Date(filterState.value.from) : null;
    const to = filterState.value.to ? new Date(filterState.value.to) : null;
    const timestamp = log.timestamp ? new Date(log.timestamp) : null;
    const matchesDate = (!from || !timestamp || timestamp >= from) && (!to || !timestamp || timestamp <= to);

    const matchesRole = !filterState.value.role || log.role === filterState.value.role;

    return matchesQuery && matchesDate && matchesRole;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / itemsPerPage.value)));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredLogs.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, filterState, itemsPerPage], () => {
  currentPage.value = 1;
});

function toggleFilterDropdown() {
  isFilterOpen.value = !isFilterOpen.value;
}

function closeFilterDropdown() {
  isFilterOpen.value = false;
}

function clearFilters() {
  filterState.value = { from: '', to: '', role: '' };
  isFilterOpen.value = false;
}

function handleFilterApply() {
  isFilterOpen.value = false;
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function getSeverityClass(log) {
  if (log.severity === 'critical') return 'bg-red-100 text-red-800';
  if (log.severity === 'warning') return 'bg-yellow-100 text-yellow-800';
  return '';
}

// Displays a log's raw ISO timestamp (e.g. "2026-07-13T02:17:44.000Z")
// as readable 24-hour/military time (e.g. "2026-07-13 02:17"). Built
// by hand with getHours()/getMinutes() rather than toLocaleString(),
// since toLocaleString()'s output format depends on the viewer's
// browser locale — it could show 12-hour AM/PM time for some admins
// and 24-hour time for others, which defeats the point of making this
// consistent. Filtering (matchesDate above) still compares the raw
// log.timestamp directly — this only changes what's displayed.
function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
      {{ loadError }}
    </div>

    <div class="flex flex-col gap-4 md:flex-row">
      <div class="flex flex-1 items-center gap-1 rounded-full bg-gray-100 p-1 ring-1 ring-gray-300" :class="isFocused ? 'ring-2 ring-[#263e30]' : 'hover:ring-2 hover:ring-gray-500'">
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300">
          <MagnifyingGlassIcon class="h-5 w-5" />
        </button>
        <input v-model="searchQuery" type="text" class="h-7 flex-1 bg-transparent focus:outline-none" placeholder="Search by Name" @focus="isFocused = true" @blur="isFocused = false" />
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300" @click="searchQuery = ''">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 relative">
        <div v-click-outside="closeFilterDropdown" class="relative">
          <FilterControls v-model="filterState" :is-open="isFilterOpen" :show-status-filter="false" @apply="handleFilterApply" @clear="clearFilters">
            <template #trigger>
              <button class="flex w-20 items-center justify-center rounded-md border border-gray-300 p-1 text-sm transition hover:bg-gray-300" @click.stop="toggleFilterDropdown">
                Filter
              </button>
            </template>
          </FilterControls>
        </div>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>Showing</span>
        <select v-model="itemsPerPage" class="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
        </select>
        <span>out of {{ filteredLogs.length }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <svg class="h-6 w-6 animate-spin text-[#263e30]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>

    <template v-else>
      <ReusableTable
        :rows="paginatedLogs.map((log) => ({ ...log, timestamp: formatTimestamp(log.timestamp) }))"
        :columns="tableColumns"
        :actions="[]"
        empty-text="No logs found"
        mobile-card-title-key="name"
        mobile-card-subtitle-key="action"
        :mobile-card-meta-keys="['timestamp', 'email', 'role']"
      />

      <div class="flex items-center justify-center gap-2 pt-2">
        <button class="rounded border border-gray-300 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button v-for="page in totalPages" :key="page" class="h-9 w-9 rounded-full text-sm transition" :class="currentPage === page ? 'bg-[#263e30] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'" @click="goToPage(page)">
          {{ page }}
        </button>
        <button class="rounded border border-gray-300 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>