<template>
<header class="fixed inset-x-0 top-0 z-50 h-14 border-b border-slate-800 bg-slate-950 text-slate-100 shadow-sm">
    <div class="flex h-full items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <!-- Mobile menu button (only on small screens) -->
        <button
          class="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-100 transition hover:bg-slate-800"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          ☰
        </button>
        <div>
          <div class="text-lg font-semibold text-white">MyApp</div>
          <div v-if="auth.isAuthenticated" class="hidden sm:block text-sm text-slate-500">Welcome, {{ auth.user.firstName }}</div>
        </div>
      </div>

      <div class="hidden md:flex flex-1 items-center justify-end gap-3">
        <input
          class="w-60 rounded-2xl border border-slate-700 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder="Search..."
        />
        <button @click="handleLogout" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
          Logout
        </button>
      </div>

      <!-- Mobile logout button -->
      <button @click="handleLogout" class="md:hidden rounded-2xl bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700">
        Logout
      </button>
    </div>

    <!-- Mobile Navigation Menu (visible only on md and below) -->
    <nav v-show="isMobileMenuOpen" class="md:hidden absolute top-14 left-0 right-0 bg-slate-800 border-b border-slate-600 shadow-md z-40">
      <router-link
        to="/dashboard"
        class="block px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-600 border-b border-slate-500"
        active-class="bg-sky-50 text-sky-600"
        @click="isMobileMenuOpen = false"
      >
        🏠 Dashboard
      </router-link>

      <router-link
        to="/summarydata"
        class="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 border-b border-slate-100"
        active-class="bg-sky-50 text-sky-600"
        @click="isMobileMenuOpen = false"
      >
        ℹ️ Intellectual Property Management
      </router-link>

      <router-link
        to="/contact"
        class="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
        active-class="bg-sky-50 text-sky-600"
        @click="isMobileMenuOpen = false"
      >
        📧 Startup Management
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { ref, onMounted } from 'vue'

const auth = useAuthStore()
const isMobileMenuOpen = ref(false)

const handleLogout = () => {
  auth.logout()
  window.location.href = '/login'
}

// Close mobile menu when screen resizes to md+ breakpoint
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      isMobileMenuOpen.value = false
    }
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})
</script>
