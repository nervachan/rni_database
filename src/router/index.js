import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'

const routes = [
    { path: '/', redirect: '/app/dashboard'},
    { path: '/login', name: 'Login', component: LoginView},
    { path: '/register', name: 'Register', component: RegisterView },

    { path: '/app',
        component: AppLayout,
        children: [
            {path: 'dashboard', name: 'Dashboard', component: {template: '<div>Dashboard</div>'}},
        ]
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router