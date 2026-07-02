<script setup>

import {ref} from 'vue';
import {useRouter} from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';
<<<<<<< HEAD
import inttoDashboard from './intto-pages/inttoDashboard.vue';
=======
>>>>>>> 03b6dfa9928365d5d30f90b0bb8fedbe027d3dc5

const router = useRouter();

</script>

<template>
    <div class="ViewScreen flex flex-col md:flex-row min-h-screen overflow-hidden w-full">
        <AppSidebar role="INTTO Admin"/>
<<<<<<< HEAD
        <div class="flex-1 overflow-auto p-3 bg-gray-100">
=======
        <div class="flex-1 overflow-auto">
>>>>>>> 03b6dfa9928365d5d30f90b0bb8fedbe027d3dc5
            <RouterView />
        </div>
    </div>
</template>

<style scoped>

</style>