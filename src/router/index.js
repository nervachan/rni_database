import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import SummaryData from '../views/SummaryData.vue'
import IntellectualPropertyManagement from '../views/IntellectualPropertyManagement.vue'
import Contact from '../views/Contact.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: SummaryData, meta: { requiresAuth: true } },
  { path: '/summarydata', name: 'SummaryData', component: IntellectualPropertyManagement, meta: { requiresAuth: true } },
  { path: '/contact', name: 'Contact', component: Contact, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    return '/dashboard'
  }
})

export default router   