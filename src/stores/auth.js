// rni_database/src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

let resolveAuthReady
const authReadyPromise = new Promise((resolve) => { resolveAuthReady = resolve })

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref('')
  const activeRole = ref('')
  const isLoggedIn = ref(false)

  const isReadOnly = computed(() => {
    if (userRole.value === 'superadmin') return false
    if (!activeRole.value || !userRole.value) return true
    return activeRole.value !== userRole.value
  })

  async function login(email, password, selectedRole = null) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await credential.user.getIdTokenResult()

    user.value = credential.user
    userRole.value = tokenResult.claims.role || ''
    activeRole.value = selectedRole || userRole.value
    isLoggedIn.value = true

    return userRole.value
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    userRole.value = ''
    activeRole.value = ''
    isLoggedIn.value = false
  }

  async function getToken() {
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }

  function waitForAuthReady() {
    return authReadyPromise
  }

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult()
      user.value = firebaseUser
      userRole.value = tokenResult.claims.role || ''
      if (!activeRole.value) activeRole.value = userRole.value
      isLoggedIn.value = true
    } else {
      user.value = null
      userRole.value = ''
      activeRole.value = ''
      isLoggedIn.value = false
    }
    resolveAuthReady()
  })

  return { user, userRole, activeRole, isLoggedIn, isReadOnly, login, logout, getToken, waitForAuthReady }
})