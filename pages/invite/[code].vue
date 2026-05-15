<script setup lang="ts">
definePageMeta({ auth: false })

const tabName = ref('')

useSeoMeta({
  title: () => tabName.value ? `You've been invited to join ${tabName.value}` : 'Join a Tab – Ninja Tab',
  ogTitle: () => tabName.value ? `You've been invited to join ${tabName.value}` : 'Join a Tab – Ninja Tab',
  ogDescription: 'Click to open the Ninja Tab app and join the tab.',
  ogImage: 'https://tab.ninja/logo-v2.png',
  twitterCard: 'summary',
})

const route = useRoute()
const api = useApi()

const code = route.params.code as string
const deepLink = `ninjatab://invite/${code}`

const loadingInvite = ref(true)
const notFound = ref(false)
const showIosDetails = ref(false)

onMounted(async () => {
  // Attempt to open the native app immediately. If installed, the OS will
  // intercept and switch to the app; otherwise the user stays on this page
  // and sees the download options below.
  try {
    window.location.href = deepLink
  } catch {
    // ignore — fallback UI is shown
  }

  try {
    const info = await api.tabs.getInvite(code)
    tabName.value = info.tab_name
  } catch {
    notFound.value = true
  } finally {
    loadingInvite.value = false
  }
})

function openInApp() {
  window.location.href = deepLink
}
</script>

<template>
  <UMain class="relative bg-gray-900 min-h-screen flex flex-col">
    <!-- Ambient background glows, matching /join hero -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/15%,_transparent_55%)] opacity-50 pointer-events-none" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/20%,_transparent_60%)] opacity-50 pointer-events-none" />

    <UContainer class="relative z-10 flex-1 flex items-start justify-center pt-6 sm:pt-8 pb-24">
      <div class="max-w-3xl w-full">
        <div class="flex justify-center mb-4 sm:mb-6">
          <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="w-20 sm:w-24" />
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

        <!-- Open / download -->
        <template v-else>
          <div class="text-center mb-6 sm:mb-8">
            <p class="text-primary-white text-sm font-medium uppercase tracking-wide mb-2">You've been invited to join</p>
            <h1 class="text-3xl sm:text-4xl font-bold text-primary-400 leading-tight tracking-tight mb-4">
              {{ tabName }}
            </h1>
            <p class="text-gray-300 leading-relaxed">
              Open the Ninja Tab app to join. Don't have it yet? Grab it below, then come back and tap <span class="text-white font-medium">Open in app</span>.
            </p>
          </div>

          <div class="p-6 sm:p-8 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <UButton
              block
              size="xl"
              class="justify-center mb-6"
              icon="i-lucide-external-link"
              @click="openInApp"
            >
              Open in app
            </UButton>

            <div class="flex flex-col md:flex-row md:justify-center items-center gap-6 md:gap-8">
              <!-- Android -->
              <a
                href="https://play.google.com/store/apps/details?id=ninja.tab.app"
                target="_blank"
                rel="noopener"
                class="flex justify-center transition-transform hover:scale-[1.02]"
                aria-label="Get Ninja Tab on Google Play"
              >
                <img
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  class="h-16 w-auto"
                />
              </a>

              <!-- iPhone -->
              <button
                type="button"
                class="flex justify-center transition-transform hover:scale-[1.02] cursor-pointer"
                :aria-expanded="showIosDetails"
                aria-controls="ios-details"
                @click="showIosDetails = true"
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  class="h-12 w-auto"
                />
              </button>
            </div>
          </div>

          <div
            id="ios-details"
            class="mt-6 mx-auto max-w-sm transition-opacity duration-200"
            :class="showIosDetails ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'"
            :aria-hidden="!showIosDetails"
          >
            <p class="text-sm text-gray-300 leading-relaxed text-center">
              The App Store listing goes live on <span class="text-white font-medium">21 May</span>.
              Until then you can grab early access through Apple's TestFlight.
            </p>
            <UButton
              size="lg"
              block
              class="mt-4 justify-center"
              to="https://testflight.apple.com/join/Vw7FSBqP"
              target="_blank"
              icon="i-simple-icons-apple"
              trailing-icon="i-lucide-arrow-right"
              :tabindex="showIosDetails ? 0 : -1"
            >
              Download via TestFlight
            </UButton>
          </div>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
