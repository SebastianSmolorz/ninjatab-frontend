<script setup lang="ts">
useSeoMeta({
  title: 'Get Started - Tab.ninja',
  description: 'Start splitting group expenses now. Get the app or start now in browser.',
})
</script>

<template>
  <UMain class="bg-gray-900 h-svh flex flex-col">
    <UContainer class="flex-1 flex items-center justify-center overflow-hidden">
      <div class="w-full max-w-2xl px-4">
        <div class="flex justify-center mb-4">
          <img src="/logo.png" alt="Tab Ninja logo" class="w-24" />
        </div>

        <div class="text-center mb-6">
          <h1 class="text-3xl sm:text-4xl font-bold text-white mb-3">Ready to split?</h1>
          <p class="text-gray-400">Use Tab Ninja right now in your browser, or get early access to the mobile app.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Browser option -->
          <NuxtLink
            to="/login"
            class="group flex flex-col gap-4 p-6 rounded-xl border border-gray-700 bg-gray-800/60 hover:border-primary hover:bg-gray-800 transition-colors"
          >
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-monitor" class="text-2xl text-primary" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white mb-1">Start in browser now</h2>
              <p class="text-sm text-gray-400">No download needed. Open a tab and start splitting expenses right now.</p>
            </div>
            <div class="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
              Get started
              <UIcon name="i-lucide-arrow-right" class="transition-transform group-hover:translate-x-1" />
            </div>
          </NuxtLink>

          <!-- Mobile app option -->
          <NuxtLink
            to="/early-access"
            class="group flex flex-col gap-4 p-6 rounded-xl border border-gray-700 bg-gray-800/60 hover:border-primary hover:bg-gray-800 transition-colors"
          >
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-smartphone" class="text-2xl text-primary" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white mb-1">Get the app</h2>
              <p class="text-sm text-gray-400">iOS and Android. <span class="text-primary font-bold">Scan receipts</span>. Join early access.</p>
            </div>
            <div class="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
              Join early access
              <UIcon name="i-lucide-arrow-right" class="transition-transform group-hover:translate-x-1" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </UContainer>
    <MarketingFooter />
  </UMain>
</template>
