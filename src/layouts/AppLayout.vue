<script setup>

import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Redirects away the moment isLoggedIn flips to false while someone is
// sitting on an authenticated page — this is what actually makes the
// idle-timeout in stores/auth.js visible to the user. Without this,
// the timer would sign someone out internally, but they'd stay
// sitting on the same dashboard looking normal until they happened to
// click something or refresh, at which point the router's own
// beforeEach guard (in router/index.js) would catch it. That guard
// only runs on navigation, though — it doesn't help someone who's just
// idle with no clicks happening, which is exactly the case this
// feature needs to cover.
//
// This also now covers a manual logout click (AppSidebar.vue's
// handleLogout() no longer navigates itself) — centralizing the
// "where do we send someone right after they're signed out" decision
// in one place, instead of two different places both trying to
// navigate right after a logout.
watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (!loggedIn) {
    const wasSuperAdminSection = route.path.startsWith('/super-admin')
    router.push(wasSuperAdminSection ? '/super-admin' : '/login')
  }
})

</script>

<template>

<div class="flex h-screen">
    <RouterView />
</div>

</template>