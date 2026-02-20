<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const authStore = useAuthStore()
const router = useRouter()
const emailSent = ref(false)

const fields: AuthFormField[] = [
  { name: 'email', type: 'email' as const, label: 'Email', placeholder: 'you@example.com', required: true },
]

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/tabs')
  }
})

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
  <UMain>
    <UContainer class="flex min-h-screen justify-center pt-10">
      <div v-if="emailSent" class="max-w-md px-4 mt-4 text-center">
        <UIcon name="i-lucide-mail-check" class="text-5xl text-primary mb-4" />
        <h2 class="text-xl font-semibold mb-2">Check your email</h2>
        <p class="text-gray-500">We've sent you a sign-in link. Click it to log in.</p>
        <UButton variant="ghost" class="mt-6" @click="emailSent = false">
          Try a different email
        </UButton>
      </div>
      <UAuthForm
        v-else
        title="Get in on the Tab"
        icon="i-lucide-user"
        :fields="fields"
        :submit="{ label: 'Send magic link', block: true }"
        :loading="authStore.isLoading"
        class="max-w-md px-4 mt-4"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="authStore.error" color="error" :title="authStore.error" />
        </template>
      </UAuthForm>
    </UContainer>
  </UMain>
</template>
