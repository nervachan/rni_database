<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="showNavbar && showLayout" @toggle-sidebar="toggleSidebar" />

    <div :class="['flex flex-1', showLayout ? (showNavbar ? 'mt-14' : 'mt-0') : '']">
      <Sidebar v-if="showLayout" :is-collapsed="isCollapsed" @toggle="toggleSidebar" />

      <main
        :class="[
          'flex-1 transition-all duration-300 px-0 py-0 md:px-0 w-full',
          showLayout ? (isCollapsed ? 'lg:ml-16 lg:w-[calc(100%-4rem)]' : 'lg:ml-[250px] lg:w-[calc(100%-250px)]') : '',
          'md:ml-0 md:w-full'
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
const showNavbar = ref(false)

const showLayout = computed(() => !['/login', '/register'].includes(route.path))

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
   