<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeftIcon } from '@heroicons/vue/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');

function handleSignUp() {
    if (password.value !== confirmPassword.value) {
        passwordError.value = 'Passwords do not match';
        return;
    }
        passwordError.value = '';
} 

function goBack() {
    router.push('/login');
}

</script>

<template> 

    <div class="RegistrationPage bg-gradient-to-b from-[#203429] to-[#ffffff] flex items-center justify-center min-h-screen">
        
        <div class="RegistrationCard bg-gradient-to-b from-[#9abba4] to-[#ffffff] flex flex-col items-center justify-start rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-[400px] mx-4 relative">
            
            <button class="BackButton absolute top-3 left-3 w-7 h-8 bg-[#2e4e3c] hover:opacity-80 rounded-sm flex items-center justify-center" @click="goBack"><ChevronLeftIcon class="h-5 w-5 text-white"/></button>

            <div class="CardContent flex flex-col items-center gap-4 w-full mt-4">

                <div class="LogoAndName flex flex-col items-center gap-4">
                    <img class="DatabaseLogo h-24 sm:h-[90px]" src="../assets/UC_Official_Seal.png" alt="UC Seal">
                    <h2 class="text-md font-bold text-[#263e30] text-center">INTTO and RSO Database</h2>
                </div>

                <div class="RegisFields gap-2 flex flex-col w-full">
                    <input type="text" placeholder="First Name" class="bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]">
                    <input type="text" placeholder="Last Name" class="bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]">
                    <input type="email" placeholder="Email" class="bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]">
                    
                    <div class="relative w-full">
                        <input 
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'" 
                            placeholder="Password" 
                            class="bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]"
                        >
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e4e3c] hover:bg-[#263e30] hover:text-white rounded-md p-1"
                            @click="showPassword = !showPassword"
                        >
                            <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                            <EyeSlashIcon v-else class="h-5 w-5" />
                        </button>
                    </div>

                    <div class="relative w-full">
                        <input 
                            v-model="confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            placeholder="Confirm Password" 
                            class="bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]"
                        >
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e4e3c] hover:bg-[#263e30] hover:text-white rounded-md p-1"
                            @click="showConfirmPassword = !showConfirmPassword"
                        >
                            <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                            <EyeSlashIcon v-else class="h-5 w-5" />
                        </button>
                    </div>
                    <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
                </div>

                <div class="BottomRow flex flex-row gap-2 w-full">
                    <select class="flex-1 bg-gray-100 drop-shadow-md rounded-md p-2 w-full hover:outline-none hover:ring-2 hover:ring-[#263e30] focus:outline-none focus:ring-2 focus:ring-[#263e30]">
                        <option value="" disabled selected>Select role</option>
                        <option value="intto">INTTO</option>
                        <option value ="rso">RSO</option>
                    </select>
                    <button @click="handleSignUp" class="fixed-width bg-[#2e4e3c] text-white rounded-md p-2 hover:outline-none hover:opacity-80">Sign Up</button>
                </div>

            </div>

        </div>
    </div>

</template>  