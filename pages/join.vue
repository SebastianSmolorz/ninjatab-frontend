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

// Visitor's phone platform, so their store badge leads. null on desktop.
// ponytail: naive UA sniff, good enough for iOS vs Android.
const platform = ref<'ios' | 'android' | null>(null)

// `?go=1` turns this page into a store proxy: detect the platform and bounce
// straight to the right store, UTMs and all. Desktop just sees the page.
onMounted(() => {
  const ua = navigator.userAgent
  platform.value = /android/i.test(ua)
    ? 'android'
    : /iphone|ipad|ipod/i.test(ua) ? 'ios' : null
  if (!route.query.go || !platform.value) return
  trackDownload(platform.value, 'join_redirect')
  window.location.replace(platform.value === 'android' ? playStoreUrl.value : appStoreUrl.value)
})

const perks = ['Free', 'No subscription', 'Any receipt, any currency']

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
  <UMain class="relative bg-gray-950 bg-texture-lines min-h-screen flex flex-col overflow-hidden">
    <!-- Ambient background glows, matching index hero -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/15%,_transparent_55%)] opacity-50 pointer-events-none" />
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/20%,_transparent_60%)] opacity-50 pointer-events-none" />

    <UContainer class="relative z-10 flex-1 flex items-center pt-6 sm:pt-10 pb-28">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center max-w-6xl w-full mx-auto">
        <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
          <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="w-16 sm:w-20 mb-5" />

          <span class="text-primary-400 font-semibold tracking-wide uppercase text-xs sm:text-sm mb-2">
            Free on iPhone &amp; Android
          </span>
          <h1 class="text-3xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
            <span class="text-primary-200">Stick the whole trip </span>
            <span class="text-primary-400 whitespace-nowrap">on one tab.</span>
          </h1>
          <p class="mt-4 text-lg sm:text-xl text-gray-300 leading-snug text-balance">
            Snap the receipt, tap what you had, settle up.
          </p>

          <!-- Badges: the visitor's own store leads on a phone -->
          <div class="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-3">
            <a
              :href="playStoreUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex transition-transform hover:scale-[1.03]"
              aria-label="Get Ninja Tab on Google Play"
              @click="trackDownload('android', 'join_page')"
            >
              <img src="/google-play-badge.png" alt="Get it on Google Play" class="h-16 w-auto" />
            </a>
            <a
              :href="appStoreUrl"
              target="_blank"
              rel="noopener"
              :class="['inline-flex p-2 transition-transform hover:scale-[1.03]', platform === 'ios' && 'order-first']"
              aria-label="Download Ninja Tab on the App Store"
              @click="trackDownload('ios', 'join_page')"
            >
              <img src="/app-store-badge.svg" alt="Download on the App Store" class="h-12 w-auto" />
            </a>
          </div>

          <ul class="mt-5 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-300">
            <li v-for="perk in perks" :key="perk" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-check" class="size-4 text-primary-400" />
              {{ perk }}
            </li>
          </ul>

          <!-- Desktop only: get it onto a phone without typing a URL -->
          <div v-if="!platform" class="hidden lg:flex items-center gap-4 mt-10 p-4 pr-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/10">
            <img src="/join-qr.svg" alt="QR code to download Ninja Tab" class="size-24 p-2 rounded-lg bg-white" />
            <div>
              <p class="font-semibold text-white">On your computer?</p>
              <p class="text-sm text-gray-400 leading-snug">Scan with your phone camera to<br>go straight to your app store.</p>
            </div>
          </div>
        </div>

        <AppPhones class="glow-centre h-[320px] sm:h-[440px] lg:h-[560px]" />
      </div>
    </UContainer>
    <MarketingFooter class="fixed bottom-0 inset-x-0 z-20" />
  </UMain>
</template>
