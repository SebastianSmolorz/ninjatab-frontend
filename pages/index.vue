<template>
  <UMain class="bg-gray-900">
    <UContainer>
      <!-- Hero Section -->
      <div class="flex flex-col items-center pt-16">
        <!-- Logo with hover/click toggle -->
        <div
          class="logo-container relative mb-8 cursor-pointer select-none"
          :class="{ 'logo-active': logoActive }"
          @click="logoActive = !logoActive"
        >
          <img
            src="/logo1-small.png"
            alt="NinjaTab"
            class="logo-base w-40"
          />
          <img
            src="/logo1-small-hover.png"
            alt="NinjaTab hover"
            class="logo-hover w-40 absolute top-0 left-0"
          />
        </div>

        <!-- Animated Tagline -->
        <div class="text-center mb-10">
          <h1 class="text-3xl md:text-4xl font-bold text-white leading-tight">
            Stick it on the tab<span
              class="text-primary-400 transition-opacity duration-700"
              :class="phase >= 1 ? 'opacity-100' : 'opacity-0'"
            >.ninja</span>
          </h1>
        </div>

        <h2 class="text-gray-400 text-md max-w-lg text-center mb-10">
          Like a bar tab, but for your shared holiday, night out or restaurant trip.<br/>
          No more maths.
          This app makes settling shared costs a breeze.
        </h2>

        <!-- CTA Button -->
        <div class="w-full max-w-sm">
          <UButton
            size="xl"
            block
            to="/login"
          >
            Open a free tab now
          </UButton>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
        <UPageFeature
          v-for="benefit in benefits"
          :key="benefit.title"
          :icon="benefit.icon"
          :title="benefit.title"
          :description="benefit.description"
          orientation="vertical"
          class="text-center p-6 rounded-xl bg-gray-800/50"
        >
        </UPageFeature>
      </div>

      <UPageSection
        title="Less time splitting expenses. More time enjoying the trip."
        :features="features"
      />

      <div class="flex flex-col items-center mb-24">
        <div class="w-full max-w-sm">
          <UButton
            size="xl"
            block
            to="/login"
          >
            Try it yourself
          </UButton>
        </div>
      </div>
    <article>
      <h2 class="text-2xl mb-2 text-primary font-bold">How it works</h2>
      <div class="flex flex-col mb-24">
        <p>
          Tab Ninja is an expense splitting app that helps groups track shared expenses. It makes it easy to split expenses between friends and see exactly who owes what.
          It works great for smaller plans such as a night out or house share cost splitting, but it really shines when it comes to larger plans such as a summer holiday, festival or ski trip.
        </p>
        <h3 class="font-bold mt-2">A smarter way to track group expenses</h3>
        <p>
          Add bills in seconds, split expenses your way, and let Tab Ninja automatically calculate the simplest
          settlement, reducing the number of payments needed so all debts are settled. It makes it easy to split expenses with friends without spreadsheets, group chat maths,
          or awkward money conversations.
        </p>
        </div>
    </article>
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
import type { PageFeatureProps } from '@nuxt/ui'

const features = ref<PageFeatureProps[]>([
  {
    title: 'Open a tab',
    description: 'Create a shared tab in seconds. Add friends or manage everything yourself. Completely free to start.',
    icon: 'i-lucide-smile',
  },
  {
    title: 'Add expenses in seconds',
    description: 'Scan a receipt or enter expenses manually. Split costs exactly how you want, or let friends claim their items.',
    icon: 'i-lucide-receipt-pound-sterling',
  },
  {
    title: 'Settle with fewer payments',
    description: 'See who owes what at a glance. Our smart settlement minimises transfers so your group can square up fast.',
    icon: 'i-lucide-hand-coins',
  }
])

const logoActive = ref(false)
const phase = ref(0)

const benefits = [
  {
    icon: 'i-lucide-message-circle-off',
    title: 'Stop tracking expenses in chat',
    description: 'Everything stays organised in one shared tab.'
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Fewer payments',
    description: 'Our smart settlement reduces the number of transfers needed to settle up quickly.'
  },
  {
    icon: 'i-lucide-heart',
    title: 'Fair and transparent pricing',
    description: 'Free for smaller tabs. £1 per person for unlimited. Added directly to the tab.'
  }
]

useSeoMeta({
  title: 'Tab.ninja - Free app keep track of and settle shared costs',
  description: 'Start a tab, add or scan receipts, simplify settling up.',
})

onMounted(() => {
  setTimeout(() => { phase.value = 1 }, 1000)
})
</script>

<style scoped>
/* Logo crossfade */
.logo-hover {
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.logo-container:hover .logo-hover,
.logo-active .logo-hover {
  opacity: 1;
}

.logo-container:hover .logo-base,
.logo-active .logo-base {
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.logo-base {
  transition: opacity 0.4s ease-in-out;
}

</style>
