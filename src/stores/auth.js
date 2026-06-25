import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref('')
    const userRole = ref('')
    const isLoggedIn = ref(false)
    return {user, userRole, isLoggedIn}
})