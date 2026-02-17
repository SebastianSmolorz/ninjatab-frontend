<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const step = ref<'email' | 'name'>('email')
const storedEmail = ref('')
const authStore = useAuthStore()
const router = useRouter()

const fields = computed<AuthFormField[]>(() =>
  step.value === 'email'
    ? [{ name: 'email', type: 'email' as const, label: 'Email', placeholder: 'you@example.com', required: true }]
    : [{ name: 'name', type: 'text' as const, label: 'What should we call you?', placeholder: 'Your name', required: true }],
)

const submitLabel = computed(() => step.value === 'email' ? 'Continue' : 'Get started')

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/tabs')
  }
})

async function onSubmit(event: FormSubmitEvent<{ email?: string; name?: string }>) {
  authStore.clearError()
  try {
    if (step.value === 'email') {
      const result = await authStore.login(event.data.email!)
      if (result === 'not_found') {
        storedEmail.value = event.data.email!
        step.value = 'name'
      } else {
        router.push('/tabs')
      }
    } else {
      await authStore.register(storedEmail.value, event.data.name!)
      router.push('/tabs/create')
    }
  } catch {
    // Error is set in the store
  }
}
</script>

<template>
  <UMain>
    <UContainer class="flex min-h-screen justify-center pt-10">
      <UAuthForm
        title="Get in on the Tab"
        icon="i-lucide-user"
        :fields="fields"
        :submit="{ label: submitLabel, block: true }"
        :loading="authStore.isLoading"
        class="max-w-md px-4 mt-4"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="authStore.error" color="error" :title="authStore.error" />
        </template>
        <template v-if="step === 'name'" #footer>
          <UButton variant="ghost" block @click="step = 'email'">
            Use a different email
          </UButton>
        </template>
      </UAuthForm>
    </UContainer>
  </UMain>
</template>
