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

        <!-- Description -->
        <p class="text-gray-400 text-md max-w-lg text-center mb-10">
          Group holidays, nights out, shared meals, group tickets...<br/>
          This app makes it a doddle. Add shared expenses, keeps track of balances, and makes settling up simple. No more maths.
        </p>

        <!-- CTA Button -->
        <div class="w-full max-w-sm">
          <UButton
            size="xl"
            block
            to="/login"
          >
            Start a free tab now
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
        title="How does it work?"
        description="Like a bar tab, but for your holiday, night out or restaurant trip."
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
    </UContainer>
  </UMain>
</template>

<script setup lang="ts">
import type { PageFeatureProps } from '@nuxt/ui'

const features = ref<PageFeatureProps[]>([
  {
    title: 'Step 1: Start a tab',
    description: 'It is free. Add your mates\'s names and send them an invite (or do it all yourself if you wish)',
    icon: 'i-lucide-smile',
  },
  {
    title: 'Step 2: Put some bills on the tab',
    description: 'Big or small. Scan the receipt with your phone, or type it in. Then select who had what (or let your mates claim it).',
    icon: 'i-lucide-a-large-small',
  },
  {
    title: 'Step 3: Settle up',
    description: 'See running totals, convert currency, and settle everything in one click.',
    icon: 'i-lucide-sun-moon',
  }
])
const logoActive = ref(false)
const phase = ref(0)

const benefits = [
  {
    icon: 'i-lucide-message-circle-off',
    title: 'Ditch the notes app',
    description: 'Stop the endless "who owes what" messages after a holiday. We sort it.'
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Simplified settlements',
    description: 'Reduce number of payments with a clear breakdown of who pays whom.'
  },
  {
    icon: 'i-lucide-heart',
    title: 'Free to use',
    description: 'Generous free usage. No subscriptions.'
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
