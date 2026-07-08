<script setup>

import { UserIcon , LightBulbIcon , BellIcon , MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const totalINTTO = 25;
const totalRSO = 15;
const totalUser = 40;
const totalPending = 5;

const recentLogs = [
  { id: 1, username: 'jdelacruz', role: 'INTTO', action: 'Approved IP submission', timestamp: '2026-06-27 09:15' },
  { id: 2, username: 'mrivera', role: 'RSO', action: 'Added research entry', timestamp: '2026-06-27 08:40' },
  { id: 3, username: 'klopez', role: 'INTTO', action: 'Reviewed startup application', timestamp: '2026-06-26 17:20' },
  { id: 4, username: 'rgarcia', role: 'RSO', action: 'Updated user profile', timestamp: '2026-06-26 14:05' },
  { id: 5, username: 'cmendoza', role: 'INTTO', action: 'Rejected incomplete form', timestamp: '2026-06-25 11:50' },
]

</script>

<template>

    <div class="dashPage flex flex-col gap-4">
        <!--4 Stat Cards-->
        <div class="statCards grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div class="logPrevTable">
            <div class="mb-3 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-800">Recent Logs</h2>
                <RouterLink to="/super-admin/logs" class="rounded-md ring-1 ring-gray-400 px-2 py-1 text-xs font-medium text-black transition hover:bg-gray-300">See All</RouterLink>
            </div>

            <div class="overflow-x-auto rounded-lg bg-white p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)]">
                <table class="min-w-full text-sm ring-1 ring-gray-300">
                    <thead class="bg-[#4d7c5e] text-left text-white">
                        <tr>
                            <th class="px-3 py-2 font-semibold">Username</th>
                            <th class="px-3 py-2 font-semibold">Role</th>
                            <th class="px-3 py-2 font-semibold">Action</th>
                            <th class="px-3 py-2 font-semibold">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(log, index) in recentLogs" :key="log.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-100'">
                            <td class="px-3 py-2">{{ log.username }}</td>
                            <td class="px-3 py-2">{{ log.role }}</td>
                            <td class="px-3 py-2">{{ log.action }}</td>
                            <td class="px-3 py-2">{{ log.timestamp }}</td>
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