// rni_database/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import SuperAdminView from '../views/SuperAdminView.vue'
import RSOView from '../views/RSOView.vue'
import INTTOView from '../views/INTTOView.vue'
import superAdminLogin from '../views/SuperAdminLogin.vue'
import SuperAdminDashboard from '../views/super-admin-pages/SuperAdminDashboard.vue'
import userMgmt from '../views/super-admin-pages/userMgmt.vue'
import logs from '../views/super-admin-pages/logs.vue'
import appliAndNotifs from '../views/super-admin-pages/appliAndNotifs.vue'
import RSODashboard from '../views/rso-pages/RSODashboard.vue'
import resEntryMgmt from '../views/rso-pages/resEntryMgmt.vue'
import inttoDashboard from '../views/intto-pages/inttoDashboard.vue'
import startupMgmt from '../views/intto-pages/startupManagement.vue'
import IPMgmt from '../views/intto-pages/ipManagement.vue'

const routes = [
    { path: '/', redirect: '/login'},
    { path: '/login', name: 'Login', component: LoginView},
    { path: '/register', name: 'Register', component: RegisterView },

    // Must be registered before the AppLayout block below, since that block
    // also nests a route at the literal path 'super-admin'. Vue Router matches
    // in insertion order, so this one wins for the exact bare path while
    // '/super-admin/dashboard' etc. still resolve through their own distinct
    // full path via the nested children.
    { path: '/super-admin', name: 'SuperAdminLogin', component: superAdminLogin },

    { path: '/',
        component: AppLayout,
        children: [
            {
                path: 'super-admin',
                component: SuperAdminView,
                children: [
                    {path: 'dashboard', name: 'SuperAdminDashboard', component: SuperAdminDashboard},
                    {path: 'user-management', name: 'UserManagement', component: userMgmt},
                    {path: 'logs', name: 'Logs', component: logs},
                    {path: 'applications-and-notifications', name: 'ApplicationsAndNotifications', component: appliAndNotifs},
                ]
            },
            {
                path: 'rso-admin',
                component: RSOView,
                children: [
                    {path: 'dashboard', name: 'RSODashboard', component: RSODashboard},
                    {path: 'research-entry-management', name: 'ResearchEntryManagement', component: resEntryMgmt},
                ]
            },
            {
                path: 'intto-admin',
                component: INTTOView,
                children: [
                    {path: 'dashboard', name: 'INTTODashboard', component: inttoDashboard},
                    {path: 'ip-management', name: 'IPManagement', component: IPMgmt},
                    {path: 'startup-management', name: 'StartupManagement', component: startupMgmt},
                ]
            }
        ]
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

import { useAuthStore } from '../stores/auth'

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const isSuperAdminSection = to.path.startsWith('/super-admin/')
  const isRsoSection = to.path.startsWith('/rso-admin/')
  const isInttoSection = to.path.startsWith('/intto-admin/')

  if (!(isSuperAdminSection || isRsoSection || isInttoSection)) {
    next()
    return
  }

  await authStore.waitForAuthReady()

  if (!authStore.isLoggedIn) {
    next(isSuperAdminSection ? '/super-admin' : '/login')
    return
  }

  if (isSuperAdminSection && authStore.userRole !== 'superadmin') {
    next('/super-admin')
    return
  }

  if ((isRsoSection || isInttoSection) && !['rso', 'intto'].includes(authStore.userRole)) {
    next('/login')
    return
  }

  next()
})

export default router