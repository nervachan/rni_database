<script setup>
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { computed, ref } from 'vue';
import ReusableTable from '../../components/tables/ReusableTable.vue';
import { approveApplication, getApplications, rejectApplication } from '../../services/applicationService';
import { getNotifications } from '../../services/notificationService';

const applications = ref(getApplications());
const notifications = ref(getNotifications());

// Confirmation modal state
const confirmModalOpen = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

const tableColumns = [
  { key: 'name', label: 'Name', widthClass: 'w-[14rem]' },
  { key: 'role', label: 'Role', widthClass: 'w-[8rem]' },
  { key: 'email', label: 'Email', widthClass: 'w-[16rem]' },
  { key: 'dateApplied', label: 'Date Applied', widthClass: 'w-[10rem]' },
  { key: 'actions', label: 'Actions', widthClass: 'w-[10rem]', type: 'actions' },
];

const tableActions = [
  { key: 'approve', title: 'Approve', icon: CheckIcon, className: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' },
  { key: 'reject', title: 'Reject', icon: XMarkIcon, className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
];

const pendingApplications = computed(() => applications.value);

function formatTimeAgo(value) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'just now';
}

// --- Confirmation modal helpers ---
function openConfirm(message, action) {
  confirmMessage.value = message;
  confirmAction.value = action;
  confirmModalOpen.value = true;
}

function handleConfirmYes() {
  if (confirmAction.value) confirmAction.value();
  confirmModalOpen.value = false;
  confirmAction.value = null;
}

function handleConfirmNo() {
  confirmModalOpen.value = false;
  confirmAction.value = null;
}

function handleApplicationAction({ action, row }) {
  const label = action.key === 'approve' ? 'approve' : 'reject';

  openConfirm(`Are you sure you want to ${label} this application for ${row.name}?`, () => {
    if (action.key === 'approve') {
      approveApplication(row.id);
    } else {
      rejectApplication(row.id);
    }
    applications.value = getApplications();
  });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Applications</h2>
          <p class="text-sm text-gray-500">Review pending account applications.</p>
        </div>
      </div>

      <ReusableTable
        v-if="pendingApplications.length"
        :rows="pendingApplications"
        :columns="tableColumns"
        :actions="tableActions"
        empty-text="No pending applications at this time."
        mobile-card-title-key="name"
        mobile-card-subtitle-key="email"
        :mobile-card-meta-keys="['role', 'dateApplied']"
        @action="handleApplicationAction"
      />

      <!--Table contents if no pending applications-->
      <div v-else class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No pending applications at this time.
      </div>
    </div>

    <div class="rounded-3xl border border-gray-200 bg-white p-4 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Notifications</h2>
        <p class="text-sm text-gray-500">Recent system updates and alerts.</p>
      </div>

      <div class="space-y-3">
        <div v-for="notification in notifications" :key="notification.id" class="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm text-gray-700">{{ notification.text }}</p>
            <span class="shrink-0 text-xs text-gray-500">{{ formatTimeAgo(notification.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="confirmModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" @click.self="handleConfirmNo">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p class="mb-6 text-sm text-gray-800">{{ confirmMessage }}</p>
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

<style scoped>
</style>