import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const users = ref([
    { firstName: 'Demo', lastName: 'User', email: 'demo@intto.com', password: 'demo123', role: 'intto' },
    { firstName: 'RSO', lastName: 'Admin', email: 'admin@rso.com', password: 'admin123', role: 'rso' }
  ])
  const error = ref('')

  const isAuthenticated = computed(() => !!user.value)

  function login({ email, password }) {
    const account = users.value.find((u) => u.email === email)
    if (!account || account.password !== password) {
      error.value = 'Invalid email or password.'
      return false
    }
    user.value = { firstName: account.firstName, lastName: account.lastName, email: account.email, role: account.role }
    error.value = ''
    return true
  }

  function register({ firstName, lastName, email, password, role }) {
    if (users.value.some((u) => u.email === email)) {
      error.value = 'An account with this email already exists.'
      return false
    }
    users.value.push({ firstName, lastName, email, password, role })
    error.value = ''
    return true
  }

  function logout() {
    user.value = null
  }

  return {
    user,
    users,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  }
})
