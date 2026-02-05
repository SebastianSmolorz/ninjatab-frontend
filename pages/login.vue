<template>
  <UMain class="flex items-center justify-center min-h-[60vh]">
    <UContainer>
      <UCard class="max-w-sm w-full">
        <template #header>
          <h2 class="text-xl font-semibold text-center">Login to NinjaTab</h2>
        </template>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              size="lg"
              required
            />
          </UFormField>

          <UButton type="submit" block size="lg" :loading="authStore.isLoading">
            Login
          </UButton>

          <p v-if="authStore.error" class="text-sm text-red-500 text-center">
            {{ authStore.error }}
          </p>
        </form>
      </UCard>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
const email = ref('')
const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/tabs')
  }
})

async function handleLogin() {
  authStore.clearError()
  try {
    await authStore.login(email.value)
    router.push('/tabs')
  } catch {
    // Error is set in the store
  }
}
</script>
