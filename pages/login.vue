<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest',
})
useSeoMeta({ title: 'Login - Tab.ninja' })

const authStore = useAuthStore()
const emailSent = ref(false)

const fields: AuthFormField[] = [
  { name: 'email', type: 'email' as const, label: 'Email', placeholder: 'you@example.com', required: true },
]

async function onSubmit(event: FormSubmitEvent<{ email: string }>) {
  authStore.clearError()
  try {
    await authStore.sendMagicLink(event.data.email)
    emailSent.value = true
  } catch {
    // Error is set in the store
  }
}
</script>

<template>
  <UMain class="bg-gray-900 min-h-screen flex flex-col">
    <UContainer class="flex-1 flex items-start justify-center pt-12 pb-16">
      <div class="max-w-md w-full px-4">
        <!-- Logo -->
        <div v-if="!emailSent" class="flex justify-center mb-8">
          <img src="/logo-v2.png" alt="Tab Ninja logo" class="w-28" />
        </div>

        <!-- Email sent confirmation -->
        <div v-if="emailSent" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-mail-check" class="text-3xl text-primary-400" />
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Check your email</h2>
          <p class="text-gray-400 mb-6">We've sent you a magic sign-in link. Click it to log in.</p>
          <UButton variant="ghost" color="neutral" @click="emailSent = false">
            Try a different email
          </UButton>
        </div>

        <!-- Login form -->
        <template v-else>
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Get in on the Tab</h1>
            <p class="text-gray-400">No passwords. We'll send a magic link to your email.</p>
          </div>

          <div class="bg-gray-800/60 rounded-xl border border-gray-700 p-6">
            <UAlert v-if="authStore.error" color="error" :title="authStore.error" class="mb-4" />

            <UAuthForm
              :fields="fields"
              :submit="{ label: 'Send magic link', block: true, size: 'lg' }"
              :loading="authStore.isLoading"
              @submit="onSubmit"
            />
          </div>

          <div class="flex items-center gap-3 mt-6 text-sm text-gray-500 justify-center">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-zap" class="w-4 h-4 text-primary-400" />
              <span>No password needed</span>
            </div>
          </div>

          <p class="mt-4 text-center text-xs text-gray-500">
            By logging in, you agree to our
            <NuxtLink to="/terms" class="underline hover:text-gray-300">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="underline hover:text-gray-300">Privacy Policy</NuxtLink>.
          </p>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
