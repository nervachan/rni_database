<script setup>

import { BookOpenIcon , CalendarIcon } from '@heroicons/vue/24/outline';
import { ref, computed, onMounted } from 'vue';
import { getResearchEntries } from '../../services/researchEntryService';

const researchEntries = ref([]);
const loadError = ref('');
const isLoading = ref(true);

async function loadData() {
  isLoading.value = true;
  loadError.value = '';
  try {
    researchEntries.value = await getResearchEntries();
  } catch (err) {
    loadError.value = 'Failed to load research entries. ' + err.message;
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadData);

const totalResearch = computed(() => researchEntries.value.length);
const avgResearchDuration = computed(() => {
  if (!researchEntries.value.length) return 0;
  const totalDays = researchEntries.value.reduce((sum, entry) => {
    if (!entry.startDate || !entry.endDate) return sum;
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    return sum + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, 0);
  return (totalDays / researchEntries.value.length).toFixed(1);
});

const recentEntries = computed(() => researchEntries.value.slice(0, 5).map((entry) => ({
  id: entry.id,
  title: entry.title,
  authors: entry.coAuthors && entry.coAuthors !== 'N/A' ? `${entry.authors}, ${entry.coAuthors}` : entry.authors,
  date: entry.startDate,
})));

</script>

<template>

    <div class="dashPage flex flex-col gap-4">

        <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
          {{ loadError }}
        </div>

        <!-- fixed inset-0 + bg-black/50 matches the delete-confirmation
             modal pattern already used elsewhere in this app — centers a
             loading card over a dimmed backdrop instead of a confirm dialog. -->
        <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
            <svg class="h-8 w-8 animate-spin text-[#263e30]" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span class="text-sm font-medium text-black">Loading dashboard…</span>
          </div>
        </div>

        <!--2 Stat Cards-->
        <div class="statCards grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="totalUsers flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1" :class="{ 'animate-pulse': isLoading }">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-blue-100"><BookOpenIcon class="w-6 h-6 text-blue-500"/></span>
                <p>Total Research Entries</p>
                <h1>{{ totalResearch }} Entries</h1>
            </div>
            <div class="totalINTTO flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1" :class="{ 'animate-pulse': isLoading }">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-amber-100"><CalendarIcon class="w-6 h-6 text-amber-500"/></span>
                <p>Average Research Duration</p>
                <h1>{{ avgResearchDuration }} Years</h1>
            </div>

            <!--Recent Entries Section-->
            <div class="RecEntriesTable md:col-span-2" :class="{ 'animate-pulse': isLoading }">
                <div class="mb-3 flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-800">Recent Entries</h2>
                    <RouterLink to="/rso-admin/research-entry-management" class="rounded-md ring-1 ring-gray-400 px-2 py-1 text-xs font-medium text-black transition hover:bg-gray-300">See All</RouterLink>
                </div>

                <div class="overflow-x-auto rounded-lg bg-white p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
                    <table class="min-w-full text-sm ring-1 ring-gray-300">
                        <thead class="bg-[#4d7c5e] text-left text-white">
                            <tr>
                                <th class="px-3 py-2 font-semibold">Research Title</th>
                                <th class="px-3 py-2 font-semibold">Author(s)</th>
                                <th class="px-3 py-2 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(entry, index) in recentEntries" :key="entry.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-200'">
                                <td class="px-3 py-2">{{ entry.title }}</td>
                                <td class="px-3 py-2">{{ entry.authors }}</td>
                                <td class="px-3 py-2">{{ entry.date }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

    </div>

</template>

<style scoped>

h1 {
    font-weight: 500;
    font-size: x-large;
}

p {
    font-weight: 400;
    color: gray;
}

</style>