<template>
  <UMain class="bg-gray-50 dark:bg-gray-900 min-h-screen">
    <UContainer class="py-2 max-w-lg">
      <div class="text-center space-y-8">
        <!-- Icon -->
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-primary-600 dark:text-primary-400"/>
          </div>
        </div>

        <!-- Heading -->
        <div class="space-y-3">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            You've hit a limit!
          </h1>
        </div>

        <!-- Limitations Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Free tab
          </h2>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-gray-400 mt-0.5"/>
              <div>
                <span class="text-gray-900 dark:text-white font-medium">5 total expenses</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-receipt-percent" class="w-5 h-5 text-gray-400 mt-0.5"/>
              <div>
                <span class="text-gray-900 dark:text-white font-medium">1 itemised bill</span>
                <span class="text-gray-500 dark:text-gray-400"> with up to 12 items</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Upgrade Card -->
        <div class="bg-gradient-to-br from-primary-100/85 to-primary-300/85 rounded-xl p-6 shadow-xl space-y-5">
          <div class="flex flex-col items-center gap-1 justify-center align-middle">
            <span class="text-5xl font-bold text-black">£1</span>
            <span class="text-primary-700 font-medium text-sm">per person</span>
          </div>

          <p class="text-sm text-primary-950">
            That's it. We'll add this as a shared expense so you get paid back. Fair and square. <strong>No subscriptions</strong>
          </p>

          <div class="pt-2">
            <UButton
              block
              size="xl"
              class="font-bold text-black shadow-lg hover:shadow-xl transition-shadow text-lg py-4 border-2 border-green-800 bg-orange-400 hover:bg-orange-300"
              @click="upgradeToPro"
            >
              Go Pro on this tab!
            </UButton>
          </div>

          <div class="flex flex-col sm:flex-row justify-around gap-2 sm:gap-0 text-sm text-primary-900">
            <div class="flex items-center gap-1 justify-center"><UIcon name="i-heroicons-lock-open" class="w-4 h-4"/> No limits</div>
            <div class="flex items-center gap-1 justify-center"><UIcon name="i-heroicons-camera" class="w-4 h-4"/> Receipt scanning</div>
            <div class="flex items-center gap-1 justify-center"><UIcon name="i-heroicons-currency-pound" class="w-4 h-4"/> Currency conversion</div>
          </div>
        </div>

        <!-- Back link -->
        <div>
          <UButton
              variant="ghost"
              color="neutral"
              @click="goBack"
          >
            Maybe later, take me back
          </UButton>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabId = computed(() => route.params.id)

const upgradeToPro = () => {
  // TODO: Implement upgrade logic
  console.log('Upgrading tab to pro:', tabId.value)
}

const goBack = () => {
  router.back()
}
</script>
