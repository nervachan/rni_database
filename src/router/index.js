import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import SuperAdminView from '../views/SuperAdminView.vue'
import RSOView from '../views/RSOView.vue'
import INTTOView from '../views/INTTOView.vue'
import SuperAdminDashboard from '../views/super-admin-pages/SuperAdminDashboard.vue'
import RSODashboard from '../views/rso-pages/RSODashboard.vue'
import inttoDashboard from '../views/intto-pages/inttoDashboard.vue'

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
                    {path: 'user-management', name: 'UserManagement', component: {template: '<div>UserManagement</div>'}},
                    {path: 'logs', name: 'Logs', component: {template: '<div>Logs</div>'}},
                    {path: 'applications-and-notifications', name: 'ApplicationsAndNotifications', component: {template: '<div>ApplicationsAndNotifications</div>'}},
                ]
            },
            {
                path: 'rso-admin',
                component: RSOView,
                children: [
                    {path: 'dashboard', name: 'RSODashboard', component: RSODashboard},
                    {path: 'research-entry-management', name: 'ResearchEntryManagement', component: {template: '<div>ResearchEntryManagement</div>'}},
                ]
            },
            {
                path: 'intto-admin',
                component: INTTOView,
                children: [
                    {path: 'dashboard', name: 'INTTODashboard', component: inttoDashboard},
                    {path: 'ip-management', name: 'IPManagement', component: {template: '<div>IPManagement</div>'}},
                    {path: 'startup-management', name: 'StartupManagement', component: {template: '<div>StartupManagement</div>'}},
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