<script setup>

import { BookOpenIcon , CalendarIcon } from '@heroicons/vue/24/outline';

const avgResearchDuration = 2.5;
const totalResearch = 1500;

</script>

<template>

    <div class="dashPage flex flex-col">

        <div class="statCards grid grid-cols-1 md:grid-cols-2 gap-4 p-5">

            <div class="totalUsers flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-blue-100"><BookOpenIcon class="w-6 h-6 text-blue-500"/></span>
                <p>Total Research Entries</p>
                <h1>{{ totalResearch }} Entries</h1>
            </div>
            <div class="totalINTTO flex flex-col bg-[#ffffff] rounded-lg p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] gap-1">
                <span class="w-9 h-9 flex flex-col items-center justify-center rounded-2xl bg-amber-100"><CalendarIcon class="w-6 h-6 text-amber-500"/></span>
                <p>Average Research Duration</p>
                <h1>{{ avgResearchDuration }} Years</h1>
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