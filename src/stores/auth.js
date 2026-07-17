// rni_database/src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

let resolveAuthReady
const authReadyPromise = new Promise((resolve) => { resolveAuthReady = resolve })

// How long a user can go with no interaction before being signed out
// automatically. Five minutes was the specific number requested — not
// a fixed rule, so this one constant is the only thing to change if
// it turns out to feel too short or too long once people are actually
// using it day to day.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

// DOM events treated as "the user is still here." These fire at the
// window level regardless of which portal (Super Admin/RSO/INTTO) is
// currently active, so the timeout applies uniformly everywhere without
// needing to be wired into each portal separately. mousemove/scroll can
// fire very often, so resetIdleTimer() below is kept cheap — it only
// clears and re-arms a single setTimeout, no other state writes.
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

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

  // Plain variable, not a ref — nothing in the template or elsewhere
  // needs to react to this value changing, it's purely internal
  // bookkeeping for the timer itself.
  let idleTimeoutId = null

  function resetIdleTimer() {
    if (idleTimeoutId) clearTimeout(idleTimeoutId)
    idleTimeoutId = setTimeout(() => {
      logout()
    }, IDLE_TIMEOUT_MS)
  }

  function startIdleWatch() {
    resetIdleTimer()
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true })
    })
  }

  function stopIdleWatch() {
    if (idleTimeoutId) clearTimeout(idleTimeoutId)
    idleTimeoutId = null
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, resetIdleTimer)
    })
  }

  // Starts/stops the idle watch alongside real login state, covering
  // both an explicit login() call and onAuthStateChanged firing on
  // page load with an existing session — one place, instead of
  // duplicating "start the timer" in both spots. Also means logout()
  // (whether triggered by this timer or by a manual logout click)
  // automatically tears the listeners down again, since logout() sets
  // isLoggedIn.value = false at the end and this watch reacts to that.
  watch(isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      startIdleWatch()
    } else {
      stopIdleWatch()
    }
  })

  async function login(email, password, selectedRole = null) {
    let credential
    try {
      credential = await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      // Failed login — no valid Firebase session exists here, so this
      // can't go through the normal authenticated flow. Fired as a plain,
      // unauthenticated request to the one endpoint in the backend that
      // doesn't require a token. Logging failure never blocks the real
      // error from reaching the caller — the original err is always
      // re-thrown regardless of whether this succeeds.
      try {
        await fetch('/api/logs/failed-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      } catch (logErr) {
        console.error('Failed to record failed login attempt:', logErr)
      }
      throw err
    }

    const tokenResult = await credential.user.getIdTokenResult()

    user.value = credential.user
    userRole.value = tokenResult.claims.role || ''
    activeRole.value = selectedRole || userRole.value
    isLoggedIn.value = true

    try {
      const token = await credential.user.getIdToken()
      await fetch('/api/logs/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (logErr) {
      console.error('Failed to record login:', logErr)
    }

    return userRole.value
  }

  async function logout() {
    // Logged BEFORE signOut() — once signOut() completes there's no valid
    // token left to authenticate this request with.
    try {
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        await fetch('/api/logs/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (logErr) {
      console.error('Failed to record logout:', logErr)
    }

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