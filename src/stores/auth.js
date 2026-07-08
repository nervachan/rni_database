import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref('')
  const isLoggedIn = ref(false)

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await credential.user.getIdTokenResult()

    user.value = credential.user
    userRole.value = tokenResult.claims.role || ''
    isLoggedIn.value = true

    return userRole.value
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    userRole.value = ''
    isLoggedIn.value = false
  }

  async function getToken() {
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }

  // Keeps store in sync on page refresh, since Firebase persists sessions
  // but Pinia state resets on reload.
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult()
      user.value = firebaseUser
      userRole.value = tokenResult.claims.role || ''
      isLoggedIn.value = true
    } else {
      user.value = null
      userRole.value = ''
      isLoggedIn.value = false
    }
  })

  return { user, userRole, isLoggedIn, login, logout, getToken }
})