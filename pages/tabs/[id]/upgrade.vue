<template>
  <UMain class="bg-gray-50 dark:bg-gray-900">
    <UContainer class="py-2 max-w-lg">
      <div class="text-center space-y-8">
        <!-- Icon -->
        <div class="flex justify-center" v-if="!isNativeApp">
            <img src="/logo.png" alt="Tab Ninja logo" class="w-18 md:w-30 md:mt-12" />
        </div>

        <!-- Limitations Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 text-center">
            Free tab
          </h2>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-gray-400 mt-0.5"/>
              <div>
                <span class="text-gray-900 dark:text-white font-medium">7 total expenses</span>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-receipt-percent" class="w-5 h-5 text-gray-400 mt-0.5"/>
              <div>
                <span class="text-gray-900 dark:text-white font-medium">1 itemised bill</span>
                <span class="text-gray-500 dark:text-gray-400"> max 12 items</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Upgrade Card -->
        <div class="bg-gradient-to-br from-primary-100 to-primary-300 rounded-xl p-6 shadow-xl space-y-5 border-orange-400 border-5">
          <div class="flex flex-col items-center gap-1 justify-center align-middle">
            <h2 class="text-sm font-semibold text-black uppercase tracking-wide mb-1">Pro Tab</h2>
            <span class="text-3xl font-semibold text-black/50 line-through">£1 per person</span>
            <span class="text-6xl font-bold text-black">Free</span>
          </div>

          <p class="text-sm text-primary-950">
            That's it. We'll add this as a <strong>shared expense</strong> so you get paid back. Fair and square. <strong>No subscriptions</strong>
          </p>

          <div class="pt-2">
            <UButton
              block
              size="xl"
              class="cursor-pointer font-bold text-black shadow-lg hover:shadow-xl transition-shadow text-lg py-4 border-2 border-green-800 bg-orange-400 hover:bg-orange-300 active:bg-orange-200"
              :loading="upgrading"
              @click="upgradeToPro"
            >
              Go Pro on this tab!
            </UButton>
          </div>

          <div class="flex flex-col sm:flex-row justify-around gap-2 sm:gap-0 text-sm text-primary-900">
            <div class="flex items-center gap-1 justify-center"><UIcon name="i-heroicons-lock-open" class="w-4 h-4"/> No expense limits</div>
            <div class="flex items-center gap-1 justify-center"><UIcon name="i-heroicons-camera" class="w-4 h-4"/> Receipt scanning</div>
          </div>
        </div>

        <!-- Back link -->
        <div class="flex flex-row justify-around">
          <UButton
              variant="ghost"
              color="neutral"
              @click="goBack"
          >
            Maybe later, take me back
          </UButton>
<!--          <UButton-->
<!--              variant="ghost"-->
<!--              color="neutral"-->
<!--              @click="goBack"-->
<!--          >-->
<!--            Settle the tab now-->
<!--          </UButton>-->
        </div>
      </div>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from 'vue-router'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const api = useApi()

const tabId = computed(() => route.params.id as string)
const upgrading = ref(false)

const upgradeToPro = async () => {
  upgrading.value = true
  try {
    await api.tabs.upgrade(tabId.value)
    router.replace({ path: `/tabs/${tabId.value}/upgraded`, query: route.query })
  } catch (error) {
    console.error('Failed to upgrade tab:', error)
  } finally {
    upgrading.value = false
  }
}

const { isNativeApp } = useNativeApp()

const goBack = () => {
  if (isNativeApp.value && window.NinjaTabApp) {
    window.NinjaTabApp.postMessage('close')
  } else {
    router.back()
  }
}
</script>
