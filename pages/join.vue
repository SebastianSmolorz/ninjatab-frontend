<script setup lang="ts">
useSeoMeta({
  title: 'Download Ninja Tab - Bill Splitting App for iPhone & Android',
  description: 'Download the free Ninja Tab app for iOS and Android. Split bills, scan receipts and settle up with friends in a few taps.',
})

// Self-referencing canonical: /join is hit with a swarm of ?go=/utm_* params,
// which Search Console flags as duplicates without one.
useHead({ link: [{ rel: 'canonical', href: 'https://tab.ninja/join' }] })

const route = useRoute()
const config = useRuntimeConfig()
const { trackDownload, storeUrl } = useDownloadTracking()

const storeOverrides = computed<Record<string, string | undefined>>(() => {
  if (route.query.utm_source !== 'qr') return {}
  const qrId = typeof route.query.qr_id === 'string' ? route.query.qr_id : ''
  return qrId ? { utm_content: qrId } : {}
})

const playStoreUrl = computed(() => storeUrl('android', storeOverrides.value))
const appStoreUrl = computed(() => storeUrl('ios', storeOverrides.value))

// `?go=1` turns this page into a store proxy: detect the platform and bounce
// straight to the right store, UTMs and all. Desktop just sees the page.
// ponytail: naive UA sniff, good enough for iOS vs Android.
onMounted(() => {
  if (!route.query.go) return
  const ua = navigator.userAgent
  const platform = /android/i.test(ua)
    ? 'android'
    : /iphone|ipad|ipod/i.test(ua) ? 'ios' : null
  if (!platform) return
  trackDownload(platform, 'join_redirect')
  window.location.replace(platform === 'android' ? playStoreUrl.value : appStoreUrl.value)
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
              @click="trackDownload('android', 'join_page')"
            >
              <img
                src="/google-play-badge.png"
                alt="Get it on Google Play"
                class="h-16 w-auto"
              />
            </a>

            <!-- iPhone -->
            <a
              :href="appStoreUrl"
              target="_blank"
              rel="noopener"
              class="flex justify-center transition-transform hover:scale-[1.02]"
              aria-label="Download Ninja Tab on the App Store"
              @click="trackDownload('ios', 'join_page')"
            >
              <img
                src="/app-store-badge.svg"
                alt="Download on the App Store"
                class="h-12 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </UContainer>
    <MarketingFooter class="fixed bottom-0 inset-x-0 z-20" />
  </UMain>
</template>
