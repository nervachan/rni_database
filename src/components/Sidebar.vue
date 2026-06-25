<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ArrowLeftStartOnRectangleIcon, Bars3Icon } from '@heroicons/vue/24/solid'
import { HomeIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { LightBulbIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { UserIcon, CircleStackIcon, BellIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const auth = useAuthStore()
const isCollapsed = ref(false)

const navItems = {
  'rso': [
    { label: 'Dashboard',                  route: '/dashboard',          icon: HomeIcon },
    { label: 'Research Entry Management',  route: '/research-management', icon: BookOpenIcon },
  ],
  'intto': [
    { label: 'Dashboard',           route: '/dashboard',          icon: HomeIcon },
    { label: 'IP Management',       route: '/ip-management',      icon: ShieldCheckIcon },
    { label: 'Startup Management',  route: '/startup-management', icon: LightBulbIcon },
  ],
  'super': [
    { label: 'Dashboard',                      route: '/dashboard',                       icon: HomeIcon },
    { label: 'User Management',                route: '/user-management',                 icon: UserIcon },
    { label: 'Logs',                           route: '/logs',                            icon: CircleStackIcon },
    { label: 'Applications and Notifications', route: '/applications-and-notifications',  icon: BellIcon },
  ],
}

const navItemsForRole = computed(() => navItems[auth.user?.role] ?? [])

const roleLabel = computed(() => {
  const map = { intto: 'INTTO Admin', rso: 'RSO Admin', super: 'Super Admin' }
  return map[auth.user?.role] ?? ''
})

function handleLogout() {
  auth.logout()
  window.location.href = '/login'
}
</script>

<template>
  <div
    class="fixed left-0 top-0 z-40 h-screen bg-[#263e30] flex flex-col text-white transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo + collapse -->
    <div
      class="p-4 h-[100px] flex flex-row items-center border-b border-white/10"
      :class="isCollapsed ? 'justify-center' : 'justify-between'"
    >
      <img
        v-if="!isCollapsed"
        class="h-16 shrink-0 transition-all duration-300"
        src="../assets/UC_Official_Seal.png"
      />
      <button
        class="hover:text-[#263e30] hover:bg-white rounded-sm w-8 h-8 flex items-center justify-center transition-all duration-300"
        @click="isCollapsed = !isCollapsed"
      >
        <Bars3Icon class="w-5 h-5" />
      </button>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 p-2 overflow-y-auto">
      <ul>
        <li v-for="item in navItemsForRole" :key="item.label">
          <RouterLink
            :to="item.route"
            class="relative flex h-10 w-full items-center rounded hover:bg-white/10 hover:text-white transition-all duration-300 ease-in-out"
            active-class="bg-white/10 text-white"
            :class="isCollapsed ? 'justify-center px-0' : 'pl-12 pr-3'"
          >
            <span
              class="icon-wrapper absolute w-10 h-full flex items-center justify-center transition-all duration-300"
              :class="isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-3 translate-x-0'"
            >
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
            </span>
            <transition name="fade-label">
              <span v-show="!isCollapsed" class="ml-2 overflow-hidden text-sm">
                {{ item.label }}
              </span>
            </transition>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Role + logout -->
    <div
      class="relative flex flex-row p-4 items-center border-t border-white/10 transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'justify-center' : 'justify-between'"
    >
      <span
        class="overflow-hidden whitespace-nowrap text-sm transition-all duration-200 ease-in-out"
        :class="isCollapsed ? 'absolute left-4 opacity-0 pointer-events-none' : 'relative opacity-100 mr-2'"
      >
        {{ roleLabel }}
      </span>
      <button
        class="w-8 h-8 hover:text-red-500 hover:bg-white rounded-sm flex items-center justify-center transition-all duration-300"
        @click="handleLogout"
      >
        <ArrowLeftStartOnRectangleIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-label-enter-active,
.fade-label-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-label-enter-from,
.fade-label-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
.fade-label-enter-to,
.fade-label-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>