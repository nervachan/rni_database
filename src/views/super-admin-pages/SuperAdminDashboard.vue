<script setup>

const totalINTTO = 25;
const totalRSO = 15;
const totalUser = 40;
const totalPending = 5;

</script>

<template>

    <div class="dashPage flex flex-col">
        <div class="statCards grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
            <div class="totalUsers flex flex-col bg-[#9abba4] rounded-lg shadow-2xl p-2 border-2 border-[#4d7c5e]">
                <h2>Total Users</h2>
                <h1>{{ totalUser }}</h1>
                <p>Users</p>
            </div>
            <div class="totalINTTO flex flex-col bg-[#9abba4] rounded-lg shadow-2xl p-2 border-2 border-[#4d7c5e]">
                <h2>Total INTTO</h2>
                <h2>{{ totalINTTO }}</h2>
                <p>Users</p>
            </div>
            <div class="totalRSO flex flex-col bg-[#9abba4] rounded-lg shadow-2xl p-2 border-2 border-[#4d7c5e]">
                <h2>Total RSO</h2>
                <h2>{{ totalRSO }}</h2>
                <p>Users</p>
            </div>
            <div class="totalPending flex flex-col bg-[#9abba4] rounded-lg shadow-2xl p-2 border-2 border-[#4d7c5e]">
                <h2>Pending Applications</h2>
                <h2>{{ totalPending }}</h2>
                <button>See All</button>
            </div>
        </div>
    </div>

</template>

<style scoped>



</style>