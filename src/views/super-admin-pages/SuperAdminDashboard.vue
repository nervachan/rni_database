<script setup>

import { UserIcon , LightBulbIcon , BellIcon , MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getUsers } from '../../services/userService'
import { getLogs } from '../../services/logService'
import { useApplicationsStore } from '../../stores/applications'

// Reads the same shared pendingCount AppSidebar.vue's ping indicator
// uses, instead of this dashboard fetching /api/applications on its
// own. AppSidebar already keeps this fresh (mount + its own 25s poll,
// regardless of which page is open) — fetching it a second time here
// was firing the exact same request twice on every dashboard load.
const applicationsStore = useApplicationsStore()
const users = ref([])
const recentLogs = ref([])
const loadError = ref('')
const isLoading = ref(true)

// isRefreshing guards against overlapping polling requests: if a fetch
// is still in flight when the next interval fires, this skips starting
// a second one instead of letting requests stack up.
let isRefreshing = false
let pollIntervalId = null

// showLoadingState is only true on the very first call — background
// polling refreshes shouldn't flash the full-page spinner every 25
// seconds while someone's actively looking at the dashboard.
async function loadData(showLoadingState = true) {
  if (isRefreshing) return
  isRefreshing = true
  if (showLoadingState) isLoading.value = true
  loadError.value = ''
  try {
    const [usersResult, logsResult] = await Promise.all([
      getUsers(),
      getLogs(),
    ])
    users.value = usersResult
    recentLogs.value = logsResult.slice(0, 5)
  } catch (err) {
    loadError.value = 'Failed to load dashboard data. ' + err.message
  } finally {
    if (showLoadingState) isLoading.value = false
    isRefreshing = false
  }
}

onMounted(() => {
  loadData()
  // Polls every 25 seconds so new applications/logs show up without a
  // manual refresh — same interval and reasoning as AppSidebar.vue and
  // appliAndNotifs.vue.
  pollIntervalId = setInterval(() => loadData(false), 25000)
})

onUnmounted(() => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId)
  }
})

const totalUser  = computed(() => users.value.length)
const totalINTTO = computed(() => users.value.filter((u) => u.role === 'INTTO').length)
const totalRSO   = computed(() => users.value.filter((u) => u.role === 'RSO').length)
const totalPending = computed(() => applicationsStore.pendingCount)

function formatTimestamp(value) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

</script>

<template>

    <div class="dashPage flex flex-col gap-4">

        <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
          {{ loadError }}
        </div>

        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <svg class="h-6 w-6 animate-spin text-[#263e30]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>

        <!--4 Stat Cards-->
        <div v-else class="statCards grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="totalUsers flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-blue-100"><UserIcon class="w-6 h-6 text-blue-500"/></span>
                <p>Total Users</p>
                <h1>{{ totalUser }}</h1>
            </div>
            <div class="totalINTTO flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-amber-100"><LightBulbIcon class="w-6 h-6 text-amber-500"/></span>
                <p>INTTO Admins</p>
                <h1>{{ totalINTTO }}</h1>
            </div>
            <div class="totalRSO flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-purple-100"><MagnifyingGlassIcon class="w-6 h-6 text-purple-500"/></span>
                <p>RSO Admins</p>
                <h1>{{ totalRSO }}</h1>
            </div>
            <div class="totalPending flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <div class="flex items-center justify-between">
                    <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-red-100"><BellIcon class="w-6 h-6 text-red-500" /></span>
                    <RouterLink :to="'/super-admin/applications-and-notifications'" class="text-xs text-black font-medium rounded-md ring-1 ring-gray-400 p-1 hover:bg-gray-300">See All</RouterLink>
                </div>
                <p>Applications</p>
                <h1>{{ totalPending }}</h1>
            </div>
        </div>

        <!--Logs Preview Section-->
        <div v-if="!isLoading" class="logPrevTable">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-800">Recent Logs</h2>
                <RouterLink to="/super-admin/logs" class="rounded-md ring-1 ring-gray-400 px-2 py-1 text-xs font-medium text-black transition hover:bg-gray-300">See All</RouterLink>
            </div>

            <div class="overflow-x-auto rounded-lg bg-white p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
                <table class="min-w-full text-sm ring-1 ring-gray-300">
                    <thead class="bg-[#4d7c5e] text-left text-white">
                        <tr>
                            <th class="px-3 py-2 font-semibold">Name</th>
                            <th class="px-3 py-2 font-semibold">Role</th>
                            <th class="px-3 py-2 font-semibold">Action</th>
                            <th class="px-3 py-2 font-semibold">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(log, index) in recentLogs" :key="log.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-100'">
                            <td class="px-3 py-2">{{ log.name }}</td>
                            <td class="px-3 py-2">{{ log.role }}</td>
                            <td class="px-3 py-2">{{ log.action }}</td>
                            <td class="px-3 py-2">{{ formatTimestamp(log.timestamp) }}</td>
                        </tr>
                    </tbody>
                </table>
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