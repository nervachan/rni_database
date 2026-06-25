<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Component declaration -->
    <SidebarNav />

    <!-- Main Workspace Container -->
    <!-- The 'md:pl-64' pushes this layer precisely out from behind the fixed sidebar width -->
    <main class="md:pl-64 min-h-screen w-full transition-all duration-300">
      <div class="p-6 sm:p-10">
        <h1 class="text-2xl font-bold text-gray-800">Main Display Window</h1>
        <p class="text-gray-500 mt-1">Your core app content will render right here.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarNav from './components/SidebarNav.vue'
</script>