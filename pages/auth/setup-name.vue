<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
useSeoMeta({ title: 'Welcome - Tab.ninja' })

const authStore = useAuthStore()
const router = useRouter()
const firstName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  const name = firstName.value.trim()
  if (!name) return

  loading.value = true
  error.value = null

  try {
    await authStore.updateFirstName(name)
    router.replace('/tabs')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
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
          <img src="/logo-v2.png" alt="Tab Ninja logo" class="w-28" />
        </div>

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">What's your name?</h1>
          <p class="text-gray-400">So your friends know who to split with.</p>
        </div>

        <div class="bg-gray-800/60 rounded-xl border border-gray-700 p-6">
          <UAlert v-if="error" color="error" :title="error" class="mb-4" />

          <form @submit.prevent="onSubmit" class="space-y-4">
            <UFormField label="First name">
              <UInput
                v-model="firstName"
                placeholder="e.g. Alex"
                size="lg"
                class="w-full"
                autofocus
                :disabled="loading"
              />
            </UFormField>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
              :disabled="!firstName.trim()"
            >
              Let's go
            </UButton>
          </form>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
