import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const userRole = ref('')
    const isLoggedIn = ref(false)

    function logout() {
        user.value = null
        userRole.value = ''
        isLoggedIn.value = false
    }

    return { user, userRole, isLoggedIn, logout }
})
