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
              <a
                href="https://apps.apple.com/us/app/ninja-tab-split-travel-bills/id6761298804"
                target="_blank"
                rel="noopener"
                class="flex justify-center transition-transform hover:scale-[1.02]"
                aria-label="Download Ninja Tab on the App Store"
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  class="h-12 w-auto"
                />
              </a>
            </div>
          </div>
        </template>
      </div>
    </UContainer>
  </UMain>
</template>
