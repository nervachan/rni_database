<script setup>

import { ref, computed } from 'vue'
import { ArrowLeftStartOnRectangleIcon, Bars3Icon } from '@heroicons/vue/24/solid' //Sidebar Icons
import { HomeIcon, BookOpenIcon } from '@heroicons/vue/24/outline' //RSO Icons
import { LightBulbIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'//INTTO Icons
import { UserIcon, CircleStackIcon, BellIcon } from '@heroicons/vue/24/outline' // Super Admin Icons

const props = defineProps({
    role: {
        type: String,
        required: true
    }
})

const navItems = {
    'RSO Admin': [
        {label: 'Dashboard', route: '/app/rso-admin/dashboard', icon:HomeIcon},
        {label: 'Research Entry Management', route: '/app/rso-admin/research-entry-management', icon:BookOpenIcon},
    ],
    'INTTO Admin': [
        {label: 'Dashboard', route: '/app/intto-admin/dashboard', icon:HomeIcon},
        {label: 'IP Management', route: '/app/intto-admin/ip-management', icon:ShieldCheckIcon},
        {label: 'Startup Management', route: '/app/intto-admin/startup-management', icon:LightBulbIcon},
    ],
    'Super Admin': [
        {label: 'Dashboard', route: '/app/super-admin/dashboard', icon:HomeIcon},
        {label: 'User Management', route: '/app/super-admin/user-management', icon:UserIcon},
        {label: 'Logs', route: '/app/super-admin/logs', icon:CircleStackIcon},
        {label: 'Applications and Notifications', route: '/app/super-admin/applications-and-notifications', icon:BellIcon},
    ]
}

const isCollapsed = ref(false);

const navItemsForRole = computed(() => {
    return navItems[props.role] || [];
});

</script>

<template>

    <div class="Sidebar-Container h-screen bg-[#263e30] flex flex-col text-white transition-all duration-300 ease-in-out" :class="isCollapsed ? 'w-16' : 'w-64'">

        <div class="Logo-And-Collapse-Section p-4 h-[100px] flex flex-row items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
            <img class="Website-Logo h-16 shrink-0 transition-all duration-300" src="../assets/UC_Official_Seal.png" v-if="!isCollapsed">
            <button class="Collapse-Button hover:text-[#263e30] hover:bg-white rounded-sm w-8 h-8 flex flex-row justify-center items-center transition-all duration-300" @click="isCollapsed = !isCollapsed"><Bars3Icon class="w-5 h-5"/></button>
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
                            <component :is="navItem.icon" class="w-5 h-5 shrink-0"/>
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
            <button class="Logout-Button w-8 h-8 hover:text-red-500 hover:bg-white rounded-sm flex flex-row justify-center items-center transition-all duration-300"><ArrowLeftStartOnRectangleIcon class="h-5 w-5" /></button>
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