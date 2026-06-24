import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../views/Home.vue'
import InntoDashboard from '../views/admin/InntoDashboard.vue'
import InntoIPManagement from '../views/admin/InntoIPManagement.vue'
import InntoStartupManagement from '../views/admin/InntoStartupManagement.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard',          name: 'Dashboard',         component: InntoDashboard,          meta: { requiresAuth: true } },
  { path: '/ip-management',      name: 'IPManagement',      component: InntoIPManagement,       meta: { requiresAuth: true } },
  { path: '/startup-management', name: 'StartupManagement', component: InntoStartupManagement,  meta: { requiresAuth: true } },
  { path: '/login',              name: 'Login',             component: LoginView },
  { path: '/register',          name: 'Register',           component: RegisterView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) return '/dashboard'
})

export default router