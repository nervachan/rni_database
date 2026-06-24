<template>
  <div class="min-h-screen bg-[#b5c4b1] flex flex-col gap-4 sm:gap-7 font-sans p-3 sm:p-5">
    <StartupStats />
    <IPStats />
  </div>
</template>

<script setup>
import StartupStats from '@/components/dashboard/StartupStats.vue'
import IPStats from '@/components/dashboard/IPStats.vue'
</script>