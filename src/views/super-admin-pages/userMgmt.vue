<script setup>
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/outline';
import { computed, ref, watch } from 'vue';
import ReusableTable from '../../components/tables/ReusableTable.vue';
import FilterControls from '../../components/filters/FilterControls.vue';
import SortControls from '../../components/filters/SortControls.vue';
import { getUsers, updateUser } from '../../services/userService';

const searchQuery = ref('');
const isFocused = ref(false);
const isFilterOpen = ref(false);
const isSortOpen = ref(false);
const sortBy = ref('newest');
const filterState = ref({ from: '', to: '', role: '', status: '' });
const itemsPerPage = ref(10);
const currentPage = ref(1);
const isModalOpen = ref(false);
const selectedUser = ref(null);
const formUser = ref({ id: null, name: '', role: 'INTTO', email: '' });
const hasUnsavedChanges = ref(false);

const sortOptions = [
  { value: 'newest', label: 'Newest to Oldest' },
  { value: 'oldest', label: 'Oldest to Newest' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
];

const tableColumns = [
  { key: 'name', label: 'Name', widthClass: 'w-[14rem]' },
  { key: 'role', label: 'Role', widthClass: 'w-[8rem]' },
  { key: 'email', label: 'Email', widthClass: 'w-[16rem]' },
  { key: 'approvedAt', label: 'Date Approved', widthClass: 'w-[10rem]' },
  { key: 'status', label: 'Status', widthClass: 'w-[8rem]', type: 'status-select' },
  { key: 'actions', label: 'Actions', widthClass: 'w-[7rem]', type: 'actions' },
];

const tableActions = [
  { key: 'edit', title: 'Edit', icon: PencilSquareIcon, className: 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' },
];

const users = ref(getUsers());

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return users.value.filter((user) => {
    const matchesQuery = !q || [user.name, user.email].some((value) => value?.toLowerCase().includes(q));

    const from = filterState.value.from ? new Date(filterState.value.from) : null;
    const to = filterState.value.to ? new Date(filterState.value.to) : null;
    const approved = user.approvedAt ? new Date(user.approvedAt) : null;
    const matchesDate = (!from || !approved || approved >= from) && (!to || !approved || approved <= to);

    const matchesRole = !filterState.value.role || user.role === filterState.value.role;
    const matchesStatus = !filterState.value.status || user.status === filterState.value.status;

    return matchesQuery && matchesDate && matchesRole && matchesStatus;
  });
});

const sortedUsers = computed(() => {
  const list = [...filteredUsers.value];
  switch (sortBy.value) {
    case 'oldest':
      return list.sort((a, b) => new Date(a.approvedAt) - new Date(b.approvedAt));
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));
  }
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / itemsPerPage.value)));

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedUsers.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, filterState, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(() => formUser.value, trackFormChanges, { deep: true });

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
  filterState.value = { from: '', to: '', role: '', status: '' };
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

function closeSortDropdown() {
  isSortOpen.value = false;
}

function openEditModal(user) {
  selectedUser.value = user;
  formUser.value = { id: user.id, name: user.name, role: user.role, email: user.email };
  hasUnsavedChanges.value = false;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedUser.value = null;
  formUser.value = { id: null, name: '', role: 'INTTO', email: '' };
  hasUnsavedChanges.value = false;
}

function confirmDiscard() {
  if (!hasUnsavedChanges.value) {
    closeModal();
    return;
  }

  if (window.confirm('Discard the changes you made?')) {
    closeModal();
  }
}

function trackFormChanges() {
  const current = {
    name: formUser.value.name?.trim() || '',
    role: formUser.value.role || '',
    email: formUser.value.email?.trim() || '',
  };
  const original = selectedUser.value ? {
    name: selectedUser.value.name || '',
    role: selectedUser.value.role || '',
    email: selectedUser.value.email || '',
  } : null;

  hasUnsavedChanges.value = original ? JSON.stringify(current) !== JSON.stringify(original) : false;
}

function saveUser() {
  const name = formUser.value.name.trim();
  const email = formUser.value.email.trim();

  if (!name || !email) {
    window.alert('Name and Email are required.');
    return;
  }

  if (window.confirm('Save changes to this user?')) {
    updateUser(selectedUser.value.id, {
      name,
      role: formUser.value.role,
      email,
    });
    users.value = getUsers();
    closeModal();
  }
}

function updateStatus(user, value) {
  if (window.confirm(`Change ${user.name}'s status to ${value}?`)) {
    updateUser(user.id, { status: value });
    users.value = getUsers();
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function handleTableAction({ action, row }) {
  if (action.key === 'edit') {
    openEditModal(row);
  }
}

function handleCellAction({ column, row, value }) {
  if (column.key === 'status') {
    updateStatus(row, value);
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 md:flex-row">
      <div class="flex flex-1 items-center gap-1 rounded-full bg-gray-100 p-1 ring-1 ring-gray-300" :class="isFocused ? 'ring-2 ring-[#263e30]' : 'hover:ring-2 hover:ring-gray-500'">
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300">
          <MagnifyingGlassIcon class="h-5 w-5" />
        </button>
        <input v-model="searchQuery" type="text" class="h-7 flex-1 bg-transparent focus:outline-none" placeholder="Search by Name or Email" @focus="isFocused = true" @blur="isFocused = false" />
        <button class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-300" @click="searchQuery = ''">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 relative">
        <div v-click-outside="closeFilterDropdown" class="relative">
          <FilterControls v-model="filterState" :is-open="isFilterOpen" @apply="handleFilterApply" @clear="clearFilters">
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
        <span>out of {{ sortedUsers.length }}</span>
      </div>
    </div>

    <ReusableTable
      :rows="paginatedUsers"
      :columns="tableColumns"
      :actions="tableActions"
      empty-text="No users found"
      mobile-card-title-key="name"
      mobile-card-subtitle-key="email"
      :mobile-card-meta-keys="['role', 'approvedAt', 'status']"
      @action="handleTableAction"
      @cell-action="handleCellAction"
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
      <div class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Edit User</h3>
          <button class="rounded-full p-2 transition hover:bg-gray-100" @click="confirmDiscard">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
              <input v-model="formUser.name" type="text" class="w-full rounded border border-gray-300 p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select v-model="formUser.role" class="w-full rounded border border-gray-300 p-2 text-sm">
                <option value="INTTO">INTTO</option>
                <option value="RSO">RSO</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Email <span class="text-red-500">*</span></label>
              <input v-model="formUser.email" type="email" class="w-full rounded border border-gray-300 p-2 text-sm" required />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300" @click="confirmDiscard">
              Cancel
            </button>
            <button type="submit" class="rounded-md bg-[#263e30] px-4 py-2 text-sm font-medium text-white transition hover:opacity-80">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>