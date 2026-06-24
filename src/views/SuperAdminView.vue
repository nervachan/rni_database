<script setup>

import {ref} from 'vue';
import {useRouter} from 'vue-router';
import AppSidebar from '../components/AppSidebar.vue';

const router = useRouter();

</script>

<template>

    <div class="ViewScreen flex flex-row h-screen">
        <AppSidebar role="Super Admin"/>
        <RouterView />
    </div>

</template>

<style scoped>

</style>