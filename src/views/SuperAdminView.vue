<script setup>

import {ref} from 'vue';
import {useRouter} from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';
import SuperAdminDashboard from './super-admin-pages/SuperAdminDashboard.vue';

const router = useRouter();

</script>

<template>

    <div class="ViewScreen flex flex-col md:flex-row min-h-screen overflow-hidden w-full">
        <AppSidebar role="Super Admin"/>
        <div class="flex-1 overflow-auto p-3 bg-gray-100">
            <RouterView />
        </div>
    </div>

</template>

<style scoped>

</style>