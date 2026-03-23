<script setup lang="ts">
useSeoMeta({
  title: 'Join the Waitlist - Tab.ninja',
  description: 'Sign up to be the first to know when the Tab.ninja mobile app launches.',
})

const config = useRuntimeConfig()
const baseURL = config.public.apiBaseUrl || 'http://localhost:8000/api'

const email = ref('')
const platform = ref<'ios' | 'android' | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const submitted = ref(false)

async function onSubmit() {
  error.value = null
  loading.value = true

  try {
    const response = await fetch(`${baseURL}/marketing/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, platform: platform.value }),
    })

    if (response.status === 409) {
      error.value = "You're already on the waitlist!"
      return
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      error.value = data.detail || 'Something went wrong. Please try again.'
      return
    }

    submitted.value = true
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UMain class="bg-gray-900 min-h-screen flex flex-col">
    <UContainer class="flex-1 flex items-start justify-center pt-12 pb-16">
      <div class="max-w-md w-full px-4">
        <div class="flex justify-center mb-8">
          <img src="/logo.png" alt="Tab Ninja logo" class="w-24" />
        </div>

        <!-- Success state -->
        <div v-if="submitted" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-check-circle" class="text-3xl text-primary-400" />
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">You're on the list!</h2>
          <p class="text-gray-400">We'll let you know as soon as the app is ready.</p>
        </div>

        <!-- Form -->
        <template v-else>
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Early access</h1>
            <p class="text-gray-400">The Tab Ninja mobile app is in early access mode.</p>
            <p class="text-gray-400">Drop your email to get an invite.</p>
          </div>

          <div class="bg-gray-800/60 rounded-xl border border-gray-700 p-6 space-y-5">
            <UAlert v-if="error" color="error" :title="error" />

            <UFormField label="Email">
              <UInput
                v-model="email"
                type="email"
                placeholder="you@example.com"
                size="lg"
                class="w-full"
                :disabled="loading"
              />
            </UFormField>

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
                  <UIcon name="i-lucide-apple" class="text-xl shrink-0" />
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
                  <UIcon name="i-lucide-smartphone" class="text-xl shrink-0" />
                  <span class="font-medium">Android</span>
                </button>
              </div>
            </UFormField>

            <UButton
              size="lg"
              block
              :loading="loading"
              :disabled="!email || !platform"
              @click="onSubmit"
            >
              Join the waitlist
            </UButton>

            <p class="text-xs text-gray-500 text-center">
              By signing up you agree to our
              <NuxtLink to="/privacy" class="underline hover:text-gray-300">Privacy Policy</NuxtLink>
              and consent to occasional product updates from Tab.ninja.
            </p>
          </div>
        </template>
      </div>
    </UContainer>
    <MarketingFooter />
  </UMain>
</template>
