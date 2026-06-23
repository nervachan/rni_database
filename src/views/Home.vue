<template>
  <div class="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-4 text-slate-900 sm:p-6">
    <div class="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
      <div class="space-y-4">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard Home</h1>
          <p class="mt-2 text-sm text-slate-600 sm:text-base">
            Welcome to your Vue application. Use the sidebar or top nav to navigate.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h3 class="text-sm font-medium text-slate-500">Stats</h3>
            <p class="mt-3 text-2xl font-semibold text-slate-900">1,234 Users</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h3 class="text-sm font-medium text-slate-500">Revenue</h3>
            <p class="mt-3 text-2xl font-semibold text-slate-900">$5,678</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <h3 class="text-sm font-medium text-slate-500">Tasks</h3>
            <p class="mt-3 text-2xl font-semibold text-slate-900">12 Pending</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
   