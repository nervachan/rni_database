<script setup>

import AppSidebar from '../components/AppSidebar.vue'

</script>

<template>

<div class="flex h-screen">
    <AppSidebar role="INTTO Admin" />
    <main class="flex-1 overflow-auto">
        <RouterView />
    </main>
</div>

</template>