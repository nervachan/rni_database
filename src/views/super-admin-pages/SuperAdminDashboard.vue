<script setup>

import { UserIcon , LightBulbIcon , BellIcon , MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const totalINTTO = 25;
const totalRSO = 15;
const totalUser = 40;
const totalPending = 5;

</script>

<template>

    <div class="dashPage flex flex-col">
        <!--Stat Cards-->
        <div class="statCards grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
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
                    <RouterLink :to="'/app/super-admin/applications-and-notifications'" class="text-xs text-black rounded-md ring-1 ring-gray-400 p-1 hover:bg-gray-300">See All</RouterLink>
                </div>
                <p>Applications</p>
                <h1>{{ totalPending }}</h1>
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