import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import SuperAdminView from '../views/SuperAdminView.vue'
import RSOView from '../views/RSOView.vue'
import INTTOView from '../views/INTTOView.vue'
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
    { path: '/', redirect: '/app/super-admin/dashboard'},
    { path: '/login', name: 'Login', component: LoginView},
    { path: '/register', name: 'Register', component: RegisterView },

    { path: '/app',
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

export default router