// rni_database/src/stores/applications.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getApplications } from '../services/applicationService';

// Shared pending-applications count, read by AppSidebar.vue to drive
// the notification ping. Previously the sidebar tracked this count
// entirely on its own, polling independently of the Applications page
// — so approving the last pending application updated that page
// instantly, but the sidebar's ping stayed lit until its own next poll
// fired (up to 25 seconds later). Centralizing the count in a shared
// store means the Applications page can push an immediate update the
// moment it reloads its own data (which it already does after every
// approve/reject), and the sidebar picks that change up right away
// since both are reading the same reactive value.
export const useApplicationsStore = defineStore('applications', () => {
  const pendingCount = ref(0);

  // Used by AppSidebar.vue's own polling — fetches independently, for
  // when the Applications page isn't open at all.
  async function refreshPendingCount() {
    try {
      const applications = await getApplications();
      pendingCount.value = applications.length;
    } catch (err) {
      console.error('Failed to refresh pending applications count:', err);
    }
  }

  // Used by appliAndNotifs.vue to push a count it already has on hand
  // (from its own loadData()), avoiding a second, redundant API call
  // just to tell the sidebar the same thing.
  function setPendingCount(count) {
    pendingCount.value = count;
  }

  return { pendingCount, refreshPendingCount, setPendingCount };
});
