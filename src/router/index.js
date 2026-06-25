import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import SuperAdminView from '../views/SuperAdminView.vue'
import RSOView from '../views/RSOView.vue'
import INTTOView from '../views/INTTOView.vue'
import InntoDashboard from '../views/admin/InntoDashboard.vue'
import InntoIPManagement from '../views/admin/InntoIPManagement.vue'
import InntoStartupManagement from '../views/admin/InntoStartupManagement.vue'

const routes = [
    { path: '/', redirect: '/app/super-admin/dashboard' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },

    {
        path: '/app',
        component: AppLayout,
        children: [
            {
                path: 'super-admin',
                component: SuperAdminView,
                children: [
                    { path: 'dashboard',                    name: 'SuperAdminDashboard',          component: { template: '<div class="p-6 text-white">Super Admin Dashboard</div>' } },
                    { path: 'user-management',              name: 'UserManagement',               component: { template: '<div class="p-6 text-white">User Management</div>' } },
                    { path: 'logs',                         name: 'Logs',                         component: { template: '<div class="p-6 text-white">Logs</div>' } },
                    { path: 'applications-and-notifications', name: 'ApplicationsAndNotifications', component: { template: '<div class="p-6 text-white">Applications & Notifications</div>' } },
                ],
            },
            {
                path: 'rso-admin',
                component: RSOView,
                children: [
                    { path: 'dashboard',                name: 'RSODashboard',             component: { template: '<div class="p-6 text-white">RSO Dashboard</div>' } },
                    { path: 'research-entry-management', name: 'ResearchEntryManagement', component: { template: '<div class="p-6 text-white">Research Entry Management</div>' } },
                ],
            },
            {
                path: 'intto-admin',
                component: INTTOView,
                children: [
                    { path: 'dashboard',          name: 'INTTODashboard',    component: InntoDashboard },
                    { path: 'ip-management',      name: 'IPManagement',      component: InntoIPManagement },
                    { path: 'startup-management', name: 'StartupManagement', component: InntoStartupManagement },
                ],
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
