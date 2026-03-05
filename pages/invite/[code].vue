<script setup lang="ts">
definePageMeta({ auth: false })

const route = useRoute()
const api = useApi()

const code = route.params.code as string

const tabName = ref('')
const people = ref<Array<{ id: string; name: string }>>([])
const loadingInvite = ref(true)
const notFound = ref(false)
const selectedPersonId = ref<string | null>(null)
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
  } finally {
    loadingInvite.value = false
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
  <UMain class="bg-gray-900 min-h-screen flex flex-col">
    <UContainer class="flex-1 flex items-start justify-center pt-12 pb-16">
      <div class="max-w-md w-full px-4">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/logo1-small.png" alt="NinjaTab" class="w-28" />
        </div>

        <!-- Static heading -->
        <div class="text-center mb-8">
          <p class="text-primary-400 text-sm font-medium uppercase tracking-wide mb-2">You've been invited</p>
          <h2 class="text-3xl font-bold text-white">Join</h2>
          <h2 class="text-3xl font-bold text-primary-400 mb-2">
            {{ tabName || '...' }}
          </h2>
          <p class="text-gray-400">
            Pick your name and enter your email to start tracking shared expenses together.
          </p>
        </div>

        <!-- Loading -->
        <div v-if="loadingInvite" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin" />
        </div>

        <!-- Not found -->
        <div v-else-if="notFound" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <UIcon name="i-lucide-link-2-off" class="text-3xl text-gray-400" />
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Invite link not found</h2>
          <p class="text-gray-400">This invite link is invalid or has expired.</p>
        </div>

        <!-- Success state -->
        <div v-else-if="emailSent" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-mail-check" class="text-3xl text-primary-400" />
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Check your email</h2>
          <p class="text-gray-400">We've sent you a magic sign-in link. Click it to join the tab.</p>
        </div>

        <!-- No unclaimed people -->
        <div v-else-if="people.length === 0" class="bg-gray-800/60 rounded-xl border border-gray-700 p-6 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
            <UIcon name="i-lucide-user-plus" class="text-xl text-gray-400" />
          </div>
          <p class="text-gray-300">
            Let the organiser know that they need to add your name to the tab before you can join.
          </p>
        </div>

        <!-- Invite form -->
        <template v-else>
          <div class="bg-gray-800/60 rounded-xl border border-gray-700 p-6">
            <UAlert v-if="errorMessage" color="error" :title="errorMessage" class="mb-4" />

            <form class="space-y-5" @submit.prevent="onSubmit">
              <UFormField label="Who are you?" required>
                <USelect
                  v-model="selectedPersonId"
                  :items="personOptions"
                  placeholder="Select your name"
                  class="w-full"
                  size="lg"
                />
              </UFormField>

              <UFormField label="Your email" required>
                <UInput
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full"
                  size="lg"
                />
              </UFormField>

              <UButton
                type="submit"
                block
                size="lg"
                :loading="submitting"
                :disabled="!selectedPersonId || !email"
              >
                Join this tab
              </UButton>
            </form>
          </div>

          <p class="text-center text-xs text-gray-500 mt-4">
            We'll send a magic link to your email. No password needed.
          </p>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
