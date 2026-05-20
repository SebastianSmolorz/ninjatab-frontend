<script setup lang="ts">
useSeoMeta({
  title: 'Early Access - Tab.ninja',
  description: 'Get early access to the Tab.ninja mobile app.',
})

const showIosDetails = ref(false)

const route = useRoute()
const config = useRuntimeConfig()

const playStoreUrl = computed(() => {
  const isQr = route.query.utm_source === 'qr'
  const referrerParams = new URLSearchParams()
  referrerParams.set('utm_source', isQr ? 'qr' : 'website')
  if (isQr) {
    const medium = String(route.query.utm_medium ?? '')
    const campaign = String(route.query.utm_campaign ?? '')
    const qrId = String(route.query.qr_id ?? '')
    if (medium) referrerParams.set('utm_medium', medium)
    if (campaign) referrerParams.set('utm_campaign', campaign)
    if (qrId) referrerParams.set('utm_content', qrId)
  }
  const url = new URL('https://play.google.com/store/apps/details')
  url.searchParams.set('id', 'ninja.tab.app')
  url.searchParams.set('referrer', referrerParams.toString())
  return url.toString()
})

onMounted(() => {
  if (route.query.utm_source !== 'qr') return

  const payload = JSON.stringify({
    qr_id: String(route.query.qr_id ?? ''),
    utm_campaign: String(route.query.utm_campaign ?? ''),
    utm_medium: String(route.query.utm_medium ?? ''),
    utm_source: String(route.query.utm_source ?? ''),
  })

  const url = `${config.public.apiBaseUrl}/marketing/qr-scanned`
  const blob = new Blob([payload], { type: 'application/json' })
  navigator.sendBeacon(url, blob)
})
</script>

<template>
  <UMain class="relative bg-gray-900 min-h-screen flex flex-col">
    <!-- Ambient background glows, matching index hero -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/15%,_transparent_55%)] opacity-50 pointer-events-none" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/20%,_transparent_60%)] opacity-50 pointer-events-none" />

    <UContainer class="relative z-10 flex-1 flex items-start justify-center pt-6 sm:pt-8 pb-24">
      <div class="max-w-3xl w-full">
        <div class="flex justify-center mb-4 sm:mb-6">
          <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="w-20 sm:w-24" />
        </div>

        <div class="text-center mb-6 sm:mb-8">
          <h1 class="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
            Get the <span class="text-primary-400">Ninja Tab</span> app
          </h1>
          <p class="mt-4 text-gray-300 leading-relaxed">
            Pick your platform and you'll be splitting tabs in under a minute.
          </p>
        </div>

        <div class="p-6 sm:p-8 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
          <div class="flex flex-col md:flex-row md:justify-center items-center gap-6 md:gap-8">
            <!-- Android -->
            <a
              :href="playStoreUrl"
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

        <!-- Reserved space below card: text + CTA, centered. Always rendered so card area + this block keep a stable total height. -->
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
      </div>
    </UContainer>
    <MarketingFooter class="fixed bottom-0 inset-x-0 z-20" />
  </UMain>
</template>
