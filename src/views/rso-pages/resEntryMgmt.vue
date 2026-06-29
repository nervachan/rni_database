<script setup>

import { MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const searchQuery = ref('');
const isFocused = ref(false);

</script>

<template>
    
    <div class="EntryPage flex flex-col bg-gray-100 gap-2">
        <!--Search Bar and Add Entry Button-->
        <div class="SearchAndAdd flex flex-col md:flex-row gap-4">

            <div class="bg-gray-100 flex flex-row items-center justify-center rounded-4xl p-1 gap-1 flex-1" :class="isFocused ? 'ring-2 ring-[#263e30]' : 'ring-1 ring-gray-400 hover:ring-2 hover:ring-gray-500'">
                <button class="flex flex-col items-center justify-center w-9 h-9 hover:bg-gray-300 rounded-2xl"><MagnifyingGlassIcon class="w-6 h-6"/></button>
                <input type="text" v-model="searchQuery" class="flex flex-1 h-11 focus:outline-none" placeholder="Search by Title or Author" @focus="isFocused = true" @blur="isFocused = false">
                <button class="flex flex-col items-center justify-center w-9 h-9 hover:bg-gray-300 rounded-2xl"><XMarkIcon class="w-6 h-6" @click="searchQuery = ''"/></button>
            </div>

            <button class="bg-[#263e30] text-white flex flex-row justify-center items-center p-2 rounded-lg hover:opacity-80 gap-2 shrink-0"><PlusIcon class="text-white w-6 h-6"/> Add New Entry</button>

        </div>
        <!--Filter, sort, pagination sect>ion-->
        <div>

        </div>
        <!--Table and pageNav Section-->
        <div>

        </div>

    </div>

</template>

<style scopde>



</style>