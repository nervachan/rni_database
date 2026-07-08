<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {EyeIcon, EyeSlashIcon} from '@heroicons/vue/24/outline';

const router = useRouter();
const email = ref('');
const emailError = ref ('');
const password = ref('');
const passwordError = ref('');
const loginRole = ref('RSO');

function handleLogin() {
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
}

function goToRegister() {
    router.push('/register');
}

const showPassword = ref(false);

</script>

<template>
    <div class="LoginPage bg-gradient-to-b from-[#203429] to-[#ffffff] flex items-center justify-center min-h-screen">

        <div class="LoginCard gap-4 bg-gradient-to-b from-[#9abba4] to-[#ffffff] flex flex-col items-center justify-center rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-[400px] mx-4">
            
            <div class="LogoAndName flex flex-col items-center gap-4">
                <img class="DatabaseLogo h-24 sm:h-[150px]" src="../assets/UC_Official_Seal.png">
                <h2 class="text-xl font-bold text-[#263e30] text-center">INTTO and RSO Database</h2>
            </div>

            <div class="RoleToggle relative flex w-full rounded-full bg-gray-100 p-1 shadow-md">
                <span
                    class="absolute top-1 bottom-1 left-1 rounded-full bg-[#263e30] transition-transform duration-200 ease-out"
                    :style="{ width: 'calc(50% - 0.25rem)', transform: loginRole === 'INTTO' ? 'translateX(100%)' : 'translateX(0)' }"
                ></span>
                <button
                    type="button"
                    class="relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors"
                    :class="loginRole === 'RSO' ? 'text-white' : 'text-[#263e30]'"
                    @click="loginRole = 'RSO'"
                >
                    RSO
                </button>
                <button
                    type="button"
                    class="relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors"
                    :class="loginRole === 'INTTO' ? 'text-white' : 'text-[#263e30]'"
                    @click="loginRole = 'INTTO'"
                >
                    INTTO
                </button>
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

            <div class="Buttons flex-row gap-4 flex">
                <button class="rounded-md bg-[#2e4e3c] text-white p-2 w-28 hover:opacity-80" @click="handleLogin">Login</button>
                <button class="rounded-md bg-[#2e4e3c] text-white p-2 w-28 hover:opacity-80" @click="goToRegister">Sign Up</button>
            </div>

        </div>

    </div>
</template>

<style scoped>

</style>