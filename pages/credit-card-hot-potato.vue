<template>
  <main class="relative min-h-dvh flex flex-col items-center justify-center bg-gray-950 p-6">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--ui-color-primary-500)/15%,_transparent_55%)]" />
    <div
      class="relative w-full max-w-md rounded-2xl bg-gray-900 ring-1 px-7 pt-8 pb-6 text-center transition duration-300"
      :class="{
        'ring-white/10': phase === 'idle',
        'ring-primary-500/60 shadow-[0_0_50px_-10px_var(--ui-color-primary-500)]': phase === 'playing',
        'ring-red-500/60 shadow-[0_0_50px_-10px_var(--color-red-500)] animate-jolt': phase === 'boom',
      }"
    >
      <h1 class="mb-2 text-4xl font-extrabold text-white">Credit Card Hot Potato</h1>

      <template v-if="phase === 'idle'">
        <p class="text-gray-400">Pass it round the table. If you're holding it when it blows, you're picking up the tab!</p>
        <div class="my-7 text-8xl leading-none">💣</div>
        <button :class="btn" @click="start">START</button>

        <details class="mt-6 text-left text-sm text-gray-400 marker:text-primary-400">
          <summary class="cursor-pointer text-center text-gray-500 hover:text-gray-300">What's this for?</summary>
          <p class="mt-3 leading-relaxed">
            The most brutal and unfair way to split the dinner, a round at the bar or the taxi
            home with friends. Start it, pass it round the table. The unlucky bugger holding the phone
            when it blows picks up the tab for the table.
          </p>
          <p class="mt-2 leading-relaxed">
            A fun take on the credit card roulette game: free, no cards on the table, no app, no sign-up.
            Works in any phone browser. From
            <NuxtLink to="/" class="text-primary-400 underline underline-offset-2">Ninja Tab</NuxtLink>,
            a free app that splits a bill fairly from a photo of your receipt.
          </p>
        </details>
      </template>

      <template v-else-if="phase === 'playing'">
        <p class="text-primary-200 font-medium">Quick! Pass it on!</p>
        <div class="my-7 text-8xl leading-none animate-beat">🥔</div>
      </template>

      <template v-else>
        <p class="text-red-300 font-medium">Boom. You're paying!</p>
        <div class="my-7 text-8xl leading-none animate-shake">💥</div>
        <button :class="btn" @click="start">AGAIN</button>

        <div class="mt-7 border-t border-white/10 pt-5 text-left">
          <a
            :href="appHref"
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-primary-400 ring-1 ring-primary-500/40 transition hover:bg-primary-500/10"
            @click="trackDownload(platform, 'hot_potato_boom')"
          >
            Split Fairly Instead
          </a>
          <p class="text-sm leading-relaxed text-gray-400 mt-4 text-center">
            Scan the receipt, pick your items and pay only for what
            you had. For free!
          </p>
        </div>
      </template>

      <NuxtLink
        to="/"
        class="absolute inset-x-0 -bottom-11 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 hover:text-primary-400"
      >
        <img src="/logo-v2-240.webp" alt="Ninja Tab" class="h-5 w-auto" width="24" height="30" />
        By Ninja Tab
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const url = 'https://tab.ninja/credit-card-hot-potato'

useSeoMeta({
  title: 'Credit Card Hot Potato — The Unfair Way to Split the Bill | Ninja Tab',
  description: 'The most brutal, unfair way to settle the dinner, a round at the bar or the taxi home. Pass the phone round the table and the unlucky bugger holding it when it blows up picks up the tab. Free credit card roulette, no app, no sign-up.',
  keywords: 'credit card roulette, who pays the bill game, decide who pays, hot potato game, pass the phone game, split the bill, restaurant bill game, drinking game',
  robots: 'index, follow, max-image-preview:large',
  ogType: 'website',
  ogUrl: url,
  ogSiteName: 'Ninja Tab',
  ogTitle: 'Credit Card Hot Potato — the unlucky bugger pays',
  ogDescription: 'Pass the phone round the table. Whoever is holding it when it blows up picks up the tab.',
  ogImage: 'https://tab.ninja/og-image.jpg',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Credit Card Hot Potato',
      url,
      description: 'Credit card roulette without the cards. Pass the phone round the table to settle the dinner, a round at the bar or the taxi home — whoever is holding it when it blows picks up the tab for everyone.',
      genre: 'Party game',
      gamePlatform: 'Web browser',
      numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 2 },
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      publisher: { '@type': 'Organization', name: 'Ninja Tab', url: 'https://tab.ninja' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    }),
  }],
})

const phase = ref<'idle' | 'playing' | 'boom'>('idle')

const { trackDownload, storeUrl } = useDownloadTracking()
const platform = ref<'ios' | 'android'>('ios')
const appHref = computed(() =>
  storeUrl(platform.value, { utm_source: 'hot_potato', utm_campaign: 'hot_potato_boom' }))
onMounted(() => {
  if (/android/i.test(navigator.userAgent)) platform.value = 'android'
})

const btn = 'w-full rounded-xl bg-primary-500 py-4 text-lg font-extrabold tracking-wider ' +
  'text-gray-950 transition hover:bg-primary-400 active:scale-[0.98]'

let fuse: ReturnType<typeof setTimeout> | undefined
let ticker: ReturnType<typeof setInterval> | undefined
let audio: AudioContext | undefined

// ponytail: synthesised with WebAudio, no asset files to ship or license.
function blip(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

function explosionSound() {
  if (!audio) return
  const now = audio.currentTime
  // Noise burst: 1.5s of white noise through a decaying low-pass.
  const length = Math.floor(audio.sampleRate * 1.5)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const src = audio.createBufferSource()
  src.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2000, now)
  filter.frequency.exponentialRampToValueAtTime(120, now + 1.4)
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.6, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)
  src.connect(filter).connect(gain).connect(audio.destination)
  src.start()
  // Sub-bass thump under it.
  blip(70, 0.9, 'sine', 0.5)
}

function boom() {
  phase.value = 'boom'
  clearInterval(ticker)
  explosionSound()
  // ponytail: browsers cap a single vibrate, so buzz as a long on/off pattern instead.
  navigator.vibrate?.(Array.from({ length: 24 }, (_, i) => (i % 2 ? 120 : 600)))
}

function start() {
  audio ||= new (window.AudioContext || (window as any).webkitAudioContext)()
  audio.resume()

  navigator.vibrate?.(0)
  phase.value = 'playing'

  clearTimeout(fuse)
  fuse = setTimeout(boom, 8000 + Math.random() * 17000)
  // ponytail: steady tick, not accelerating - speeding up would leak the fuse length.
  clearInterval(ticker)
  ticker = setInterval(() => blip(1200, 0.04, 'square', 0.08), 500)
}

onUnmounted(() => {
  clearTimeout(fuse)
  clearInterval(ticker)
  audio?.close()
  navigator.vibrate?.(0)
})
</script>

<style scoped>
.animate-beat { animation: beat 900ms ease-in-out infinite; }
.animate-shake { animation: shake 500ms ease infinite; }
.animate-jolt { animation: jolt 400ms ease; }

@keyframes beat { 50% { transform: scale(1.12); } }
@keyframes shake {
  25% { transform: translateX(-8px) rotate(-4deg); }
  75% { transform: translateX(8px) rotate(4deg); }
}
@keyframes jolt {
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
