<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const emailError = ref('');
const password = ref('');
const passwordError = ref('');
const loginError = ref('');
const isSubmitting = ref(false);

async function handleLogin() {
    if (email.value.trim() === '') {
        emailError.value = 'Email must not be empty';
        return;
    }
        emailError.value = '';

    if (!email.value.includes('@')) {
        emailError.value = 'Invalid Email';
        return;
    }
        emailError.value = '';

    if (password.value.trim() === '') {
        passwordError.value = 'Password must not be empty'
        return;
    }
        passwordError.value = '';

    loginError.value = '';
    isSubmitting.value = true;

    try {
        const role = await authStore.login(email.value, password.value);

        if (role !== 'superadmin') {
            loginError.value = 'This account does not have super admin access.';
            await authStore.logout();
            return;
        }

        router.push('/super-admin/dashboard');
    } catch (err) {
        // Same reasoning as LoginView.vue's identical catch block —
        // auth/user-disabled means the account exists but was
        // deactivated, which is a different problem than a wrong
        // password and deserves a different message.
        loginError.value = err.code === 'auth/user-disabled'
            ? 'This account has been deactivated. Contact your administrator.'
            : 'Invalid email or password.';
        password.value = '';
    } finally {
        isSubmitting.value = false;
    }
}

const showPassword = ref(false);

</script>

<template>
    <div class="SuperAdminLoginPage bg-gradient-to-b from-[#203429] to-[#ffffff] flex items-center justify-center min-h-screen">

        <div class="LoginCard gap-4 bg-gradient-to-b from-[#9abba4] to-[#ffffff] flex flex-col items-center justify-center rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-[400px] mx-4">

            <div class="LogoAndName flex flex-col items-center gap-4">
                <img class="DatabaseLogo h-24 sm:h-[150px]" src="../assets/UC_Official_Seal.png">
                <h2 class="text-xl font-bold text-[#263e30] text-center">Super Admin Access</h2>
                <p class="text-sm text-[#2e4e3c] text-center -mt-2">Restricted to authorized administrators only.</p>
            </div>

            <div class="InputFields gap-4 flex flex-col w-full">
                <input v-model="email" type="email" placeholder="Email" class="bg-gray-100 rounded-md shadow-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]">
                <p v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</p>

                <div class="relative w-full">
                    <input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Password"
                        class="bg-gray-100 rounded-md shadow-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]"
                    >
                    <p v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</p>

                    <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e4e3c] hover:bg-[#263e30] hover:text-white rounded-md p-1"
                        @click="showPassword = !showPassword">
                        <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                        <EyeSlashIcon v-else class="h-5 w-5" />
                    </button>

                </div>
            </div>

            <p v-if="loginError" class="text-red-500 text-sm text-center">{{ loginError }}</p>

            <div class="Buttons flex-row gap-4 flex">
                <button class="rounded-md bg-[#2e4e3c] text-white p-2 w-28 hover:opacity-80 disabled:opacity-50" :disabled="isSubmitting" @click="handleLogin">
                    {{ isSubmitting ? 'Logging in...' : 'Login' }}
                </button>
            </div>

        </div>

    </div>
</template>

<style scoped>

</style>