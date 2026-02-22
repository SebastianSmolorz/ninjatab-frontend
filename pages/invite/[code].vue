<script setup lang="ts">
definePageMeta({ auth: false })

const route = useRoute()
const api = useApi()

const code = route.params.code as string

const tabName = ref('')
const people = ref<Array<{ id: number; name: string }>>([])
const notFound = ref(false)
const selectedPersonId = ref<number | null>(null)
const email = ref('')
const submitting = ref(false)
const emailSent = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const info = await api.tabs.getInvite(code)
    tabName.value = info.tab_name
    people.value = info.people
  } catch {
    notFound.value = true
  }
})

const personOptions = computed(() =>
  people.value.map(p => ({ label: p.name, value: p.id }))
)

async function onSubmit() {
  if (!selectedPersonId.value || !email.value) return

  submitting.value = true
  errorMessage.value = ''
  try {
    await api.tabs.claimInvite(code, { person_id: selectedPersonId.value, email: email.value })
    emailSent.value = true
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UMain>
    <UContainer class="flex min-h-screen justify-center pt-10">
      <div class="max-w-md w-full px-4 mt-4">
        <!-- Not found -->
        <div v-if="notFound" class="text-center">
          <UIcon name="i-lucide-link-2-off" class="text-5xl text-gray-400 mb-4" />
          <h2 class="text-xl font-semibold mb-2">Invite link not found</h2>
          <p class="text-gray-500">This invite link is invalid or has expired.</p>
        </div>

        <!-- Success state -->
        <div v-else-if="emailSent" class="text-center">
          <UIcon name="i-lucide-mail-check" class="text-5xl text-primary mb-4" />
          <h2 class="text-xl font-semibold mb-2">Check your email</h2>
          <p class="text-gray-500">We've sent you a sign-in link. Click it to log in.</p>
        </div>

        <!-- Invite form -->
        <div v-else>
          <h2 class="text-2xl font-bold mb-1">Join the tab</h2>
          <p class="text-gray-500 mb-6">You've been invited to <strong>{{ tabName }}</strong>. Select your name and enter your email to join.</p>

          <UAlert v-if="errorMessage" color="error" :title="errorMessage" class="mb-4" />

          <form class="space-y-4" @submit.prevent="onSubmit">
            <UFormField label="Who are you?" required>
              <USelect
                v-model="selectedPersonId"
                :items="personOptions"
                placeholder="Select your name"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Your email" required>
              <UInput
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
              />
            </UFormField>

            <UButton
              type="submit"
              block
              :loading="submitting"
              :disabled="!selectedPersonId || !email"
            >
              Send magic link
            </UButton>
          </form>
        </div>
      </div>
    </UContainer>
  </UMain>
</template>
