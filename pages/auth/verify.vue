<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const verifying = ref(true)
const failed = ref(false)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    failed.value = true
    verifying.value = false
    authStore.error = 'No token provided'
    return
  }

  try {
    await authStore.verifyMagicLink(token)
    router.replace('/tabs')
  } catch {
    failed.value = true
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <UMain>
    <UContainer class="flex min-h-screen justify-center pt-10">
      <div class="max-w-md px-4 mt-4 text-center">
        <template v-if="verifying">
          <UIcon name="i-lucide-loader-circle" class="text-5xl text-primary mb-4 animate-spin" />
          <p class="text-gray-500">Verifying your sign-in link...</p>
        </template>
        <template v-else-if="failed">
          <UIcon name="i-lucide-circle-x" class="text-5xl text-red-500 mb-4" />
          <h2 class="text-xl font-semibold mb-2">Verification failed</h2>
          <p class="text-gray-500 mb-4">{{ authStore.error || 'This link is invalid or has expired.' }}</p>
          <UButton to="/login" variant="solid">
            Back to login
          </UButton>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
