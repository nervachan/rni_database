<script setup>
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline';
import { computed, ref, watch, onMounted } from 'vue';
import ReusableTable from '../../components/tables/ReusableTable.vue';
import FilterControls from '../../components/filters/FilterControls.vue';
import SortControls from '../../components/filters/SortControls.vue';
import { createResearchEntry, deleteResearchEntry, getResearchEntries, updateResearchEntry } from '../../services/researchEntryService';

const TITLE_DISALLOWED = /[<>{}[\]\\|`;]/g
const NAME_DISALLOWED = /[^a-zA-Z\u00C0-\u017F\s.,'-]/g
const ISBN_DISALLOWED = /[^0-9Xx-]/g
const URL_DISALLOWED = /[<>"'\s]/g

function sanitize(value, pattern) {
  return value.replace(pattern, '')
}

const searchQuery = ref('');
const isFocused = ref(false);
const isFilterOpen = ref(false);
const isSortOpen = ref(false);
const sortBy = ref('newest');
const filterState = ref({ from: '', to: '' });
const itemsPerPage = ref(10);
const currentPage = ref(1);
const isModalOpen = ref(false);
const modalMode = ref('add');
const selectedEntry = ref(null);
const hasUnsavedChanges = ref(false);
const loadError = ref('');
const modalError = ref('');
// Confirmation modal
const confirmModalOpen = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

const createEmptyEntry = () => ({
  id: null,
  title: '',
  authors: '',
  coAuthors: '',
  startDate: '',
  endDate: '',
  isbn: '',
  scopusLink: '',
  abstract: '',
});

const formEntry = ref(createEmptyEntry());
const researchEntries = ref([]);

async function loadEntries() {
  loadError.value = '';
  try {
    researchEntries.value = await getResearchEntries();
  } catch (err) {
    loadError.value = 'Failed to load research entries. ' + err.message;
  }
}

onMounted(loadEntries);

const sortOptions = [
  { value: 'newest', label: 'Newest to Oldest' },
  { value: 'oldest', label: 'Oldest to Newest' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'author-asc', label: 'Author A-Z' },
  { value: 'author-desc', label: 'Author Z-A' },
];

const tableColumns = [
  { key: 'title', label: 'Title', widthClass: 'w-[18rem]' },
  { key: 'authors', label: 'Authors', widthClass: 'w-[14rem]' },
  { key: 'coAuthors', label: 'Co-authors', widthClass: 'w-[12rem]' },
  { key: 'startDate', label: 'Start Date', widthClass: 'w-[10rem]' },
  { key: 'scopusLink', label: 'Scopus link', widthClass: 'w-[8rem]', type: 'link' },
  { key: 'actions', label: 'Actions', widthClass: 'w-[10rem]', type: 'actions' },
];

const tableActions = [
  { key: 'view', title: 'View', icon: EyeIcon, className: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { key: 'edit', title: 'Edit', icon: PencilSquareIcon, className: 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { key: 'delete', title: 'Delete', icon: TrashIcon, className: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' },
];

const filteredEntries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return researchEntries.value.filter((entry) => {
    const matchesQuery = !q || [entry.title, entry.authors, entry.coAuthors].some((value) =>
      value?.toLowerCase().includes(q)
    );

    const from = filterState.value.from ? new Date(filterState.value.from) : null;
    const to = filterState.value.to ? new Date(filterState.value.to) : null;
    const start = entry.startDate ? new Date(entry.startDate) : null;

    const matchesDate = (!from || !start || start >= from) && (!to || !start || start <= to);

    return matchesQuery && matchesDate;
  });
});

const sortedEntries = computed(() => {
  const list = [...filteredEntries.value];
  switch (sortBy.value) {
    case 'oldest':
      return list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    case 'title-asc':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return list.sort((a, b) => b.title.localeCompare(a.title));
    case 'author-asc':
      return list.sort((a, b) => a.authors.localeCompare(b.authors));
    case 'author-desc':
      return list.sort((a, b) => b.authors.localeCompare(a.authors));
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedEntries.value.length / itemsPerPage.value)));

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedEntries.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, filterState, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(() => formEntry.value, trackFormChanges, { deep: true });

// Confirmation modal functions
function openConfirm(message, action) {
  confirmMessage.value = message;
  confirmAction.value = action;
  confirmModalOpen.value = true;
}

async function handleConfirmYes() {
  const action = confirmAction.value;
  confirmModalOpen.value = false;
  confirmAction.value = null;
  if (action) await action();
}

function handleConfirmNo() {
  confirmModalOpen.value = false;
  confirmAction.value = null;
} 
//Confirmation modal functions

function toggleFilterDropdown() {
  isFilterOpen.value = !isFilterOpen.value;
  if (isFilterOpen.value) {
    isSortOpen.value = false;
  }
}

function closeFilterDropdown() {
  isFilterOpen.value = false;
}

function clearFilters() {
  filterState.value = { from: '', to: '' };
  isFilterOpen.value = false;
}

function handleFilterApply() {
  isFilterOpen.value = false;
}

function toggleSortDropdown() {
  isSortOpen.value = !isSortOpen.value;
  if (isSortOpen.value) {
    isFilterOpen.value = false;
  }
}

function openAddModal() {
  modalMode.value = 'add';
  formEntry.value = createEmptyEntry();
  selectedEntry.value = null;
  hasUnsavedChanges.value = false;
  modalError.value = '';
  isModalOpen.value = true;
}

function openViewModal(entry) {
  modalMode.value = 'view';
  selectedEntry.value = entry;
  hasUnsavedChanges.value = false;
  modalError.value = '';
  isModalOpen.value = true;
}

function openEditModal(entry) {
  modalMode.value = 'edit';
  selectedEntry.value = entry;
  formEntry.value = { ...entry };
  hasUnsavedChanges.value = false;
  modalError.value = '';
  isModalOpen.value = true;
}

function openDeleteModal(entry) {
  modalMode.value = 'delete';
  selectedEntry.value = entry;
  hasUnsavedChanges.value = false;
  modalError.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedEntry.value = null;
  modalMode.value = 'add';
  formEntry.value = createEmptyEntry();
  hasUnsavedChanges.value = false;
  modalError.value = '';
}

function confirmDiscard() {
  if (modalMode.value === 'view' || modalMode.value === 'delete') {
    closeModal();
    return;
  }

  const hasFormContent = Object.values(formEntry.value).some((value) => String(value).trim());
  const shouldConfirm = modalMode.value === 'edit' ? hasUnsavedChanges.value : hasFormContent;

  if (!shouldConfirm) {
    closeModal();
    return;
  }

  openConfirm('Discard the changes you made?', closeModal);
}

function trackFormChanges() {
  const current = {
    title: formEntry.value.title?.trim() || '',
    authors: formEntry.value.authors?.trim() || '',
    coAuthors: formEntry.value.coAuthors?.trim() || '',
    startDate: formEntry.value.startDate || '',
    endDate: formEntry.value.endDate || '',
    isbn: formEntry.value.isbn?.trim() || '',
    scopusLink: formEntry.value.scopusLink?.trim() || '',
    abstract: formEntry.value.abstract?.trim() || '',
  };
  const original = selectedEntry.value ? {
    title: selectedEntry.value.title || '',
    authors: selectedEntry.value.authors || '',
    coAuthors: selectedEntry.value.coAuthors || '',
    startDate: selectedEntry.value.startDate || '',
    endDate: selectedEntry.value.endDate || '',
    isbn: selectedEntry.value.isbn || '',
    scopusLink: selectedEntry.value.scopusLink || '',
    abstract: selectedEntry.value.abstract || '',
  } : null;

  hasUnsavedChanges.value = original ? JSON.stringify(current) !== JSON.stringify(original) : Object.values(current).some((value) => value);
}

function saveEntry() {
  modalError.value = '';

  const title = formEntry.value.title.trim();
  const authors = formEntry.value.authors.trim();

  if (!title || !authors) {
    modalError.value = 'Title and Authors are required.';
    return;
  }

  if (formEntry.value.startDate && formEntry.value.endDate) {
    const start = new Date(formEntry.value.startDate);
    const end = new Date(formEntry.value.endDate);
    if (end < start) {
      modalError.value = 'End Date cannot be earlier than Start Date.';
      return;
    }
  }

  const isbnDigits = formEntry.value.isbn.replace(/-/g, '');
  if (isbnDigits && isbnDigits.length !== 10 && isbnDigits.length !== 13) {
    modalError.value = 'ISBN must be 10 or 13 digits (hyphens allowed).';
    return;
  }

  if (formEntry.value.scopusLink) {
    try {
      new URL(formEntry.value.scopusLink);
    } catch {
      modalError.value = 'Scopus Link must be a full URL, including https://.';
      return;
    }
  }

  const payload = {
    title,
    authors,
    coAuthors: formEntry.value.coAuthors.trim(),
    startDate: formEntry.value.startDate,
    endDate: formEntry.value.endDate,
    isbn: formEntry.value.isbn.trim(),
    scopusLink: formEntry.value.scopusLink.trim(),
    abstract: formEntry.value.abstract.trim(),
  };

  openConfirm(
    modalMode.value === 'add' ? 'Add this research entry?' : 'Save changes to this entry?',
    async () => {
      try {
        if (modalMode.value === 'add') {
          const created = await createResearchEntry(payload);
          researchEntries.value = [created, ...researchEntries.value];
        } else if (selectedEntry.value) {
          const updated = await updateResearchEntry(selectedEntry.value.id, payload);
          researchEntries.value = researchEntries.value.map((entry) => (entry.id === updated.id ? updated : entry));
        }
        closeModal();
      } catch (err) {
        modalError.value = 'Failed to save research entry. ' + err.message;
      }
    }
  );
}

async function deleteEntry() {
  if (!selectedEntry.value) return;
  const id = selectedEntry.value.id;
  try {
    await deleteResearchEntry(id);
    researchEntries.value = researchEntries.value.filter((entry) => entry.id !== id);
    closeModal();
  } catch (err) {
    modalError.value = 'Failed to delete research entry. ' + err.message;
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function handleTableAction({ action, row }) {
  if (action.key === 'view') {
    openViewModal(row);
  } else if (action.key === 'edit') {
    openEditModal(row);
  } else if (action.key === 'delete') {
    openDeleteModal(row);
  }
}

</script>

<template>
  <div class="EntryPage flex flex-col gap-4">
    <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
      {{ loadError }}
    </div>

    <div class="flex flex-col gap-4 md:flex-row">
      <div class="flex flex-1 items-center gap-1 rounded-full bg-gray-100 p-1 ring-1 ring-gray-300" :class="isFocused ? 'ring-2 ring-[#263e30]' : 'hover:ring-2 hover:ring-gray-500'">
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300">
          <MagnifyingGlassIcon class="h-5 w-5" />
        </button>
        <input v-model="searchQuery" type="text" class="h-7 flex-1 bg-transparent focus:outline-none" placeholder="Search by Title or Author" @focus="isFocused = true" @blur="isFocused = false" />
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300" @click="searchQuery = ''">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <button class="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#263e30] p-2 text-sm text-white transition hover:opacity-80" @click="openAddModal">
        <PlusIcon class="h-6 w-6 text-white" />
        Add New Entry
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 relative">
        <div v-click-outside="closeFilterDropdown" class="relative">

          <FilterControls v-model="filterState" :is-open="isFilterOpen" :show-role-filter="false" :show-status-filter="false" @apply="handleFilterApply" @clear="clearFilters">

            <template #trigger>
              <button class="flex w-20 items-center justify-center rounded-md border border-gray-300 p-1 text-sm transition hover:bg-gray-300" @click.stop="toggleFilterDropdown">
                Filter
              </button>
            </template>
          </FilterControls>
        </div>

        <SortControls v-model="sortBy" :options="sortOptions" label="Sort" :is-open="isSortOpen" @update:is-open="(value) => { isSortOpen = value; if (value) { isFilterOpen = false; } }" />
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>Showing</span>
        <select v-model="itemsPerPage" class="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
        </select>
        <span>out of {{ sortedEntries.length }}</span>
      </div>
    </div>

    <ReusableTable
      :rows="paginatedEntries"
      :columns="tableColumns"
      :actions="tableActions"
      empty-text="No research entries found"
      mobile-card-title-key="title"
      mobile-card-subtitle-key="authors"
      :mobile-card-meta-keys="['coAuthors', 'startDate']"
      @action="handleTableAction"
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

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" @click.self="confirmDiscard">
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ modalMode === 'view' ? 'Research Entry Details' : modalMode === 'delete' ? 'Delete Entry' : (modalMode === 'edit' ? 'Edit Entry' : 'Add New Entry') }}
          </h3>
          <button class="rounded-full p-2 transition hover:bg-gray-100" @click="confirmDiscard">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div v-if="modalError" class="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
          {{ modalError }}
        </div>

        <div v-if="modalMode === 'view' && selectedEntry" class="space-y-3 text-sm text-gray-700">
          <div><span class="font-semibold">Title:</span> {{ selectedEntry.title }}</div>
          <div><span class="font-semibold">Authors:</span> {{ selectedEntry.authors }}</div>
          <div><span class="font-semibold">Co-authors:</span> {{ selectedEntry.coAuthors || 'N/A' }}</div>
          <div><span class="font-semibold">Start Date:</span> {{ selectedEntry.startDate }}</div>
          <div><span class="font-semibold">End Date:</span> {{ selectedEntry.endDate }}</div>
          <div><span class="font-semibold">ISBN:</span> {{ selectedEntry.isbn || 'N/A' }}</div>
          <div><span class="font-semibold">Scopus Link:</span> <span v-if="selectedEntry.scopusLink" class="text-blue-600 underline">Link</span><span v-else>N/A</span></div>
          <div><span class="font-semibold">Abstract / Summary:</span> {{ selectedEntry.abstract || 'N/A' }}</div>
        </div>

        <div v-else-if="modalMode === 'delete' && selectedEntry" class="space-y-3 text-sm text-gray-700">
          <p>Are you sure you want to delete <span class="font-semibold">{{ selectedEntry.title }}</span>?</p>
          <div class="flex justify-end gap-2 pt-2">
            <button class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300" @click="closeModal">
              Cancel
            </button>
            <button class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700" @click="deleteEntry">
              Delete
            </button>
          </div>
        </div>

        <form v-else class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
              <input :value="formEntry.title" @input="formEntry.title = sanitize($event.target.value, TITLE_DISALLOWED)" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" required />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">Authors <span class="text-red-500">*</span></label>
              <input :value="formEntry.authors" @input="formEntry.authors = sanitize($event.target.value, NAME_DISALLOWED)" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" placeholder="Surname first, then given name(s)" required />
              <p class="mt-1 text-xs text-gray-500">Write names as Last Name, First Name (for example, Santos, Maria). Letters, spaces, commas, periods, and hyphens only.</p>
            </div>
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">Co-authors</label>
              <input :value="formEntry.coAuthors" @input="formEntry.coAuthors = sanitize($event.target.value, NAME_DISALLOWED)" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" placeholder="Surname first, then given name(s)" />
              <p class="mt-1 text-xs text-gray-500">Use commas to separate multiple co-authors; write each as Last Name, First Name.</p>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input v-model="formEntry.startDate" type="date" class="w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input v-model="formEntry.endDate" type="date" class="w-full rounded border border-gray-300 p-2 text-sm" :min="formEntry.startDate || undefined" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">ISBN</label>
              <input :value="formEntry.isbn" @input="formEntry.isbn = sanitize($event.target.value, ISBN_DISALLOWED)" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" placeholder="978-3-16-148410-0" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Scopus Link</label>
              <input :value="formEntry.scopusLink" @input="formEntry.scopusLink = sanitize($event.target.value, URL_DISALLOWED)" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" placeholder="https://..." />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700">Abstract / Summary</label>
              <textarea :value="formEntry.abstract" @input="formEntry.abstract = sanitize($event.target.value, TITLE_DISALLOWED)" rows="4" class="w-full rounded border border-gray-300 p-2 text-sm" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300" @click="confirmDiscard">
              Cancel
            </button>
            <button type="button" class="rounded-md bg-[#263e30] px-4 py-2 text-sm font-medium text-white transition hover:opacity-80" @click="saveEntry">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="confirmModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p class="mb-5 text-sm text-gray-700">{{ confirmMessage }}</p>
        <div class="flex justify-end gap-2">
          <button class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300" @click="handleConfirmNo">
            Cancel
          </button>
          <button class="rounded-md bg-[#263e30] px-4 py-2 text-sm font-medium text-white transition hover:opacity-80" @click="handleConfirmYes">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>