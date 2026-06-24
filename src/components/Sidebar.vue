<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-slate-100 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4">
      <h2 v-if="!isCollapsed" class="text-lg font-semibold">MyApp</h2>
      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-100 transition hover:bg-slate-800"
        @click="toggleSidebar"
      >
        {{ isCollapsed ? '☰' : '✕' }}
      </button>
    </div>

    <nav class="flex flex-1 flex-col overflow-y-auto">
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sky-300 transition hover:bg-slate-800"
        active-class="bg-slate-800 text-sky-300"
      >
        <span class="text-base">🏠</span>
        <span v-if="!isCollapsed">Dashboard</span>
      </router-link>

      <router-link
        to="/ip-management"
        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sky-300 transition hover:bg-slate-800"
        active-class="bg-slate-800 text-sky-300"
      >
        <span class="text-base">📋</span>
        <span v-if="!isCollapsed">IP Management</span>
      </router-link>

      <router-link
        to="/startup-management"
        class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sky-300 transition hover:bg-slate-800"
        active-class="bg-slate-800 text-sky-300"
      >
        <span class="text-base">🚀</span>
        <span v-if="!isCollapsed">Startup Management</span>
      </router-link>
    </nav>

    <div v-if="!isCollapsed" class="border-t border-slate-800 px-4 py-4 text-sm text-slate-400">
      <p>© 2024 MyApp</p>
    </div>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isCollapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle'])

const toggleSidebar = () => emit('toggle')
</script>