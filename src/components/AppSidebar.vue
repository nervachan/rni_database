<script setup>

import { computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeftStartOnRectangleIcon, Bars3Icon } from '@heroicons/vue/24/solid'
import { HomeIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { LightBulbIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { UserIcon, CircleStackIcon, BellIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useApplicationsStore } from '../stores/applications'

const props = defineProps({
    role: {
        type: String,
        required: true
    }
})

const authStore = useAuthStore()
const applicationsStore = useApplicationsStore()

const navItems = {
    'RSO Admin': [
        {label: 'Dashboard', route: '/rso-admin/dashboard', icon:HomeIcon},
        {label: 'Research Entry Management', route: '/rso-admin/research-entry-management', icon:BookOpenIcon},
    ],
    'INTTO Admin': [
        {label: 'Dashboard', route: '/intto-admin/dashboard', icon:HomeIcon},
        {label: 'IP Management', route: '/intto-admin/ip-management', icon:ShieldCheckIcon},
        {label: 'Startup Management', route: '/intto-admin/startup-management', icon:LightBulbIcon},
    ],
    'Super Admin': [
        {label: 'Dashboard', route: '/super-admin/dashboard', icon:HomeIcon},
        {label: 'User Management', route: '/super-admin/user-management', icon:UserIcon},
        {label: 'Logs', route: '/super-admin/logs', icon:CircleStackIcon},
        {label: 'Applications and Notifications', route: '/super-admin/applications-and-notifications', icon:BellIcon},
    ]
}

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const navItemsForRole = computed(() => {
    return navItems[props.role] || [];
});

// Polling still lives here — it's what keeps the ping accurate when
// the Applications page isn't open at all (e.g. a super admin sitting
// on the Dashboard the whole time a new application comes in). When
// the Applications page IS open, its own loadData() pushes updates to
// applicationsStore instantly on every load/approve/reject, so the
// ping doesn't have to wait for this interval to catch up in that case.
let pollIntervalId = null;

onMounted(() => {
    if (props.role === 'Super Admin') {
        applicationsStore.refreshPendingCount();
        pollIntervalId = setInterval(() => applicationsStore.refreshPendingCount(), 25000);
    }
});

onUnmounted(() => {
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
    }
});

function closeMobileMenu() {
    isMobileOpen.value = false;
}

async function handleLogout() {
    await authStore.logout()
}

</script>

<template>
    <div class="w-full md:w-auto md:h-screen md:flex-shrink-0">
    <!--  Mobile View NavBar -->
    <div class="Mobile-NavBar md:hidden w-screen max-w-full h-[75px] bg-[#263e30] relative flex items-center justify-between p-4">
        <button class="Logout-Button text-white w-8 h-8 hover:text-red-500 hover:bg-white rounded-sm flex flex-row justify-center items-center transition-all duration-300" @click="handleLogout"><ArrowLeftStartOnRectangleIcon class="h-5 w-5" /></button>
        <span class="absolute left-1/2 -translate-x-1/2 text-white">{{ props.role }}</span>
        <button :class="['Collapse-Button text-white hover:text-[#263e30] hover:bg-white rounded-sm w-8 h-8 flex flex-row justify-center items-center transition-transform duration-300', isMobileOpen ? 'open' : '']" @click="isMobileOpen = !isMobileOpen"><Bars3Icon class="h-5 w-5"/></button>
    </div>

    <transition name="mobile-nav">
    <div v-if="isMobileOpen" class="NavLinks md:hidden absolute left-0 right-0 top-[75px] bg-[#263e30] p-2 z-50">
        <ul>
            <li v-for="navItem in navItemsForRole" :key="navItem.label">
                <RouterLink
                    :to="navItem.route"
                    class="relative flex h-10 w-full items-center justify-center gap-2 text-white rounded hover:bg-white/10 transition-all duration-300"
                    active-class="bg-white/10"
                    @click="closeMobileMenu"
                >
                    <component :is="navItem.icon" class="w-5 h-5 shrink-0"/>
                    <span class="text-sm">{{ navItem.label }}</span>
                    <!-- Ping indicator: only shown on the Applications and
                         Notifications item, and only while there's at least
                         one pending application waiting on review. Reads
                         applicationsStore.pendingCount, which appliAndNotifs.vue
                         updates the instant a super admin approves/rejects
                         something — not just on this component's own poll. -->
                    <span v-if="navItem.route === '/super-admin/applications-and-notifications' && applicationsStore.pendingCount > 0" class="relative flex size-3">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                        <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                    </span>
                </RouterLink>
            </li>
        </ul>
    </div>
    </transition>

    <!-- Desktop View Sidebar -->
    <div class="Sidebar-Container h-screen bg-[#263e30] hidden md:flex flex-col text-white transition-all duration-300 ease-in-out" :class="isCollapsed ? 'w-16' : 'w-64'">

        <div class="Logo-And-Collapse-Section p-4 h-[100px] flex flex-row items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
            <img class="Website-Logo h-16 shrink-0 transition-all duration-300" src="../assets/UC_Official_Seal.png" v-if="!isCollapsed">
            <button class="Collapse-Button hover:text-[#263e30] hover:bg-white rounded-sm w-8 h-8 flex flex-row justify-center items-center transition-all duration-300" @click="isCollapsed = !isCollapsed">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5">
                    <g clip-path="url(#clip0_644_4321)">
                        <rect x="1" y="1" width="30" height="30" rx="1" stroke="currentColor" stroke-width="2"/>
                        <line x1="11" x2="11" y2="32" stroke="currentColor" stroke-width="2"/>
                    </g>
                    <defs>
                            <clipPath id="clip0_644_4321">
                            <rect width="32" height="32" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </button>
        </div>

        <div class="Sidebar-Nav-Items flex-1 p-2">
            <ul>
                <li v-for="navItem in navItemsForRole" :key="navItem.label">
                    <RouterLink
                        :to="navItem.route"
                        class="relative flex h-10 w-full items-center Sidebar-Nav-Link rounded hover:bg-white/10 hover:text-white transition-all duration-300 ease-in-out"
                        active-class="bg-white/10 text-white"
                        :class="isCollapsed ? 'justify-center px-0' : 'pl-12 pr-3'"
                    >
                        <span
                            class="icon-wrapper absolute w-10 h-full flex items-center justify-center transition-all duration-300"
                            :class="isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-3 translate-x-0'"
                        >
                            <span class="relative inline-flex">
                                <component :is="navItem.icon" class="w-5 h-5 shrink-0"/>
                                <span v-if="navItem.route === '/super-admin/applications-and-notifications' && applicationsStore.pendingCount > 0" class="absolute -top-1 -right-1 flex size-3">
                                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                                    <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                                </span>
                            </span>
                        </span>
                        <transition name="fade-label">
                            <span
                                v-show="!isCollapsed"
                                class="sidebar-label ml-2 overflow-hidden text-sm"
                            >
                                {{ navItem.label }}
                            </span>
                        </transition>
                    </RouterLink>
                </li>
            </ul>
        </div>

        <div class="Role-And-Logout-Section relative flex flex-row p-4 items-center transition-all duration-300 ease-in-out" :class="isCollapsed ? 'justify-center' : 'justify-between'">
            <span
                class="User-Role overflow-hidden whitespace-nowrap text-sm transition-all duration-200 ease-in-out"
                :class="isCollapsed ? 'absolute left-4 opacity-0 pointer-events-none' : 'relative opacity-100 mr-2'"
            >
                {{ props.role }}
            </span>
            <button class="Logout-Button w-8 h-8 hover:text-red-500 hover:bg-white rounded-sm flex flex-row justify-center items-center transition-all duration-300" @click="handleLogout"><ArrowLeftStartOnRectangleIcon class="h-5 w-5" /></button>
        </div>

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

<style scoped>
.mobile-nav-enter-active,
.mobile-nav-leave-active {
    transition: transform 0.18s ease, opacity 0.18s ease;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
    transform: translateY(-6px);
    opacity: 0;
}
.mobile-nav-enter-to,
.mobile-nav-leave-from {
    transform: translateY(0);
    opacity: 1;
}
.Collapse-Button.open svg {
    transform: rotate(90deg);
    transition: transform 0.28s ease;
    transform-origin: center;
}
</style>