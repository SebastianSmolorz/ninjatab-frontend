<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ auth: false })

const tabName = ref('')

useSeoMeta({
  title: () => tabName.value ? `You've been invited to join ${tabName.value}` : 'Join a Tab – Tab Ninja',
  ogTitle: () => tabName.value ? `You've been invited to join ${tabName.value}` : 'Join a Tab – Tab Ninja',
  ogDescription: 'Click to join the tab and start tracking shared expenses together.',
  ogImage: 'https://tab.ninja/logo-120.png',
  twitterCard: 'summary',
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const authStore = useAuthStore()

const code = route.params.code as string

const tabId = ref('')
const people = ref<Array<{ id: string; name: string }>>([])
const loadingInvite = ref(true)
const notFound = ref(false)
const selectedPersonId = ref<string | null>(null)
const email = ref('')
const submitting = ref(false)
const emailSent = ref(false)
const errorMessage = ref('')

const isLoggedIn = computed(() => authStore.isAuthenticated)

onMounted(async () => {
  try {
    const info = await api.tabs.getInvite(code)
    tabId.value = info.tab_id
    tabName.value = info.tab_name
    people.value = info.people

    if (info.user_already_on_tab) {
      router.replace(`/tabs/${info.tab_id}`)
      return
    }

    if (isLoggedIn.value && authStore.user?.email) {
      email.value = authStore.user.email
    }
  } catch {
    notFound.value = true
  } finally {
    loadingInvite.value = false
  }
})

const personOptions = computed(() =>
  people.value.map(p => ({ label: p.name, value: p.id }))
)

const canSubmit = computed(() => {
  return !!selectedPersonId.value && !!email.value
})

async function onSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  errorMessage.value = ''
  try {
    await api.tabs.claimInvite(code, { person_id: selectedPersonId.value!, email: email.value })
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
        <!-- Loading -->
        <div v-if="loadingInvite" class="flex flex-col items-center py-12">
          <div class="flex justify-center mb-8">
            <img src="/logo.png" alt="Tab Ninja logo" class="w-28" />
          </div>
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin" />
        </div>

        <!-- Success state -->
        <div v-else-if="emailSent" class="text-center">
          <template v-if="isLoggedIn">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="text-3xl text-primary-400" />
            </div>
            <h2 class="text-xl font-semibold text-white mb-2">You're in!</h2>
            <p class="text-gray-400 mb-4">You've joined {{ tabName }}.</p>
            <UButton :to="`/tabs/${tabId}`" size="lg">Go to tab</UButton>
          </template>
          <template v-else>
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-mail-check" class="text-3xl text-primary-400" />
            </div>
            <h2 class="text-xl font-semibold text-white mb-2">Check your email</h2>
            <p class="text-gray-400">We've sent you a magic sign-in link. Click it to join the tab.</p>
          </template>
        </div>

        <template v-else>
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/logo.png" alt="Tab Ninja logo" class="w-28" />
        </div>

        <!-- Heading -->
        <div class="text-center mb-8">
          <p class="text-primary-white text-sm font-medium uppercase tracking-wide mb-2">You've been invited to join</p>
          <h2 class="text-3xl font-bold text-primary-400 mb-2">
            {{ tabName }}
          </h2>
          <p class="text-gray-400">
            Pick your name and confirm your email to start tracking shared expenses together.
          </p>
        </div>

        <!-- Not found -->
        <div v-if="notFound" class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <UIcon name="i-lucide-link-2-off" class="text-3xl text-gray-400" />
          </div>
          <h2 class="text-xl font-semibold text-white mb-2">Invite link not found</h2>
          <p class="text-gray-400">This invite link is invalid or has expired.</p>
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
              <UFormField label="Who are you?" help="Don't see your name? Let the person who sent you this link know they need to add your name to the tab." required>
                <USelect
                  v-model="selectedPersonId"
                  :items="personOptions"
                  placeholder="Select your name"
                  class="w-full"
                  size="lg"
                />
              </UFormField>

              <UFormField label="Your email" :help="isLoggedIn ? 'Is this not you? Press Log out at the top of the page.' : undefined" required>
                <UInput
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full"
                  size="lg"
                  :disabled="isLoggedIn"
                />
              </UFormField>

              <UButton
                type="submit"
                block
                size="lg"
                :loading="submitting"
                :disabled="!canSubmit"
              >
                Join this tab
              </UButton>
            </form>
          </div>

          <p v-if="!isLoggedIn" class="text-center text-xs text-gray-500 mt-4">
            We'll send a magic link to your email. No password needed.
          </p>
        </template>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
