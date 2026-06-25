<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const emailError = ref('');
const password = ref('');
const passwordError = ref('');
const showPassword = ref(false);

const DEMO_ACCOUNTS = [
  { email: 'demo@intto.com', password: 'password', role: 'INTTO Admin', redirect: '/app/intto-admin/dashboard' },
  { email: 'demo@rso.com',   password: 'password', role: 'RSO Admin',   redirect: '/app/rso-admin/dashboard' },
  { email: 'demo@super.com', password: 'password', role: 'Super Admin', redirect: '/app/super-admin/dashboard' },
]

function handleLogin() {
  emailError.value = '';
  passwordError.value = '';

  if (email.value.trim() === '') {
    emailError.value = 'Email must not be empty';
    return;
  }
  if (!email.value.includes('@')) {
    emailError.value = 'Invalid email';
    return;
  }
  if (password.value.trim() === '') {
    passwordError.value = 'Password must not be empty';
    return;
  }

  const account = DEMO_ACCOUNTS.find(
    a => a.email === email.value.trim() && a.password === password.value
  );

  if (!account) {
    passwordError.value = 'Invalid email or password';
    return;
  }

  auth.isLoggedIn = true;
  auth.userRole = account.role;
  auth.user = { email: account.email, role: account.role };

  router.push(account.redirect);
}

function goToRegister() {
  router.push('/register');
}
</script>

<template>
    <div class="LoginPage bg-gradient-to-b from-[#203429] to-[#ffffff] flex items-center justify-center min-h-screen">

        <div class="LoginCard gap-4 bg-gradient-to-b from-[#9abba4] to-[#ffffff] flex flex-col items-center justify-center rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-[400px] mx-4">
            
            <div class="LogoAndName flex flex-col items-center gap-4">
                <img class="DatabaseLogo h-24 sm:h-[150px]" src="../assets/UC_Official_Seal.png">
                <h2 class="text-xl font-bold text-[#263e30] text-center">INTTO and RSO Database</h2>
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
                    <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e4e3c] hover:bg-[#263e30] hover:text-white rounded-md p-1"
                        @click="showPassword = !showPassword">
                        <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                        <EyeSlashIcon v-else class="h-5 w-5" />
                    </button>
                </div>
                <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
            </div>

            <div class="Buttons flex-row gap-4 flex">
                <button class="rounded-md bg-[#2e4e3c] text-white p-2 w-28 hover:opacity-80" @click="handleLogin">Login</button>
                <button class="rounded-md bg-[#2e4e3c] text-white p-2 w-28 hover:opacity-80" @click="goToRegister">Sign Up</button>
            </div>

        </div>

    </div>
</template>