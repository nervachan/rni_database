<template>
  <header class="fixed inset-x-0 top-0 z-50 h-14 bg-white border-b border-slate-200 shadow-sm">
    <div class="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
          @click="toggleMenu"
        >
          ☰
        </button>
        <div>
          <div class="text-lg font-semibold text-slate-900">MyApp</div>
          <div v-if="auth.isAuthenticated" class="text-sm text-slate-500">Welcome, {{ auth.user.firstName }}</div>
        </div>
      </div>

      <div class="flex flex-1 items-center justify-end gap-3">
        <input
          class="hidden sm:inline-flex w-60 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder="Search..."
        />
        <button @click="handleLogout" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { defineEmits } from 'vue'

const emit = defineEmits(['toggle-sidebar'])
const auth = useAuthStore()

const toggleMenu = () => emit('toggle-sidebar')
const handleLogout = () => {
  auth.logout()
  window.location.href = '/login'
}
</script>
