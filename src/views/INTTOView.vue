<script setup>

import {ref} from 'vue';
import {useRouter} from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';

import inttoDashboard from './intto-pages/inttoDashboard.vue';


const router = useRouter();

</script>

<template>
    <div class="ViewScreen flex flex-col md:flex-row min-h-screen overflow-hidden w-full">
        <AppSidebar role="INTTO Admin"/>
        
        <div class="flex-1 overflow-auto">
            
            <RouterView />
        </div>
    </div>
</template>

<style scoped>

</style>