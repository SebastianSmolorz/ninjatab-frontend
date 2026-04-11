<script setup lang="ts">
useSeoMeta({
  title: 'Early Access - Tab.ninja',
  description: 'Get early access to the Tab.ninja mobile app.',
})

const platform = ref<'ios' | 'android' | null>(null)
</script>

<template>
  <UMain class="bg-gray-900 min-h-screen flex flex-col">
    <UContainer class="flex-1 flex items-start justify-center pt-12 pb-16">
      <div class="max-w-md w-full px-4">
        <div class="flex justify-center mb-8">
          <img src="/logo.png" alt="Tab Ninja logo" class="w-24" />
        </div>

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Early access</h1>
          <p class="text-gray-400">The Tab Ninja mobile app is in early access.</p>
          <p class="text-gray-400">Select your platform to get started.</p>
        </div>

        <div class="bg-gray-800/60 rounded-xl border border-gray-700 p-6 space-y-5">
          <UFormField label="Your phone">
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                :class="platform === 'ios'
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-600 bg-gray-900/50 text-gray-400 hover:border-gray-500'"
                @click="platform = 'ios'"
              >
                <UIcon name="i-simple-icons-apple" class="text-xl shrink-0" />
                <span class="font-medium">iPhone</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                :class="platform === 'android'
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-600 bg-gray-900/50 text-gray-400 hover:border-gray-500'"
                @click="platform = 'android'"
              >
                <UIcon name="i-simple-icons-googleplay" class="text-xl shrink-0" />
                <span class="font-medium">Android</span>
              </button>
            </div>
          </UFormField>

          <template v-if="platform === 'ios'">
            <p class="text-sm text-gray-400">Click the button below and follow the instructions.</p>
            <UButton
              size="lg"
              block
              to="https://testflight.apple.com/join/Vw7FSBqP"
              target="_blank"
              trailing-icon="i-lucide-arrow-right"
            >
              Download the app
            </UButton>
          </template>

          <template v-else-if="platform === 'android'">
            <p class="text-sm text-gray-400">Make sure you're <span class="text-white font-bold">signed into your Google account</span> in this browser <span class="text-white font-bold">or copy the URL into Chrome.</span></p>
            <p class="text-sm text-gray-400">1. Click the button below</p>
            <p class="text-sm text-gray-400">2. Click <span class="text-white font-bold">"Join Group"</span></p>
            <p class="text-sm text-gray-400">3. Follow the link in the group conversation to download</p>
            <UButton
              size="lg"
              block
              to="https://groups.google.com/g/tab-ninja-early"
              target="_blank"
              trailing-icon="i-lucide-arrow-right"
            >
              Download the app
            </UButton>
          </template>
        </div>
      </div>
    </UContainer>
    <MarketingFooter />
  </UMain>
</template>
