<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Navbar (visible only on mobile screens) -->
    <Navbar v-if="showLayout" class="md:hidden" @toggle-sidebar="toggleSidebar" />

    <div :class="['flex flex-1', showLayout ? 'md:mt-0 mt-14' : '']">
      <!-- Sidebar (visible on md+ screens, hidden on mobile) -->
      <Sidebar v-if="showLayout" class="hidden md:block" :is-collapsed="isCollapsed" @toggle="toggleSidebar" />

      <!-- Main content area -->
      <main
        :class="[
          'flex-1 transition-all duration-300 w-full overflow-auto',
          showLayout ? (isCollapsed ? 'md:ml-16 md:w-[calc(100%-4rem)]' : 'md:ml-[250px] md:w-[calc(100%-250px)]') : ''
        ]"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const isCollapsed = ref(false)

const showLayout = computed(() => !['/login', '/register'].includes(route.path))

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
   