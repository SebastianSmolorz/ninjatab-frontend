<template>
  <UMain class="bg-gray-900">
    <UHeader class="bg-gray-900 border-none" :toggle="false">
      <template #title>
        <img src="/logo-v2.png" alt="Tab Ninja logo" class="h-10 w-auto" />
      </template>
      <template #right>
        <UDropdownMenu :items="navItems">
          <UButton icon="i-lucide-menu" variant="ghost" color="neutral" aria-label="Open menu" />
        </UDropdownMenu>
      </template>
    </UHeader>

    <!-- Hero Section — full viewport minus header, outside container -->
    <div class="relative w-full overflow-hidden" style="height: calc(100svh - var(--ui-header-height));">
      <picture>
        <source srcset="/group.webp" type="image/webp" />
        <img
          src="/group-optimised.jpg"
          alt="Friends enjoying on a holiday"
          fetchpriority="high"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </picture>
      <div class="absolute inset-0 " />
      <div class="relative z-10 flex flex-col items-center justify-center h-full gap-6 py-16 text-center">
        <div class="flex flex-col items-center gap-6 bg-black/70 rounded-2xl px-8 py-5">
          <h1 class="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            Stick it on the tab<span class="text-primary-400 animate-pulse [animation-duration:1.5s]">.ninja</span>
          </h1>
          <h2 class="text-gray-200 text-base sm:text-lg max-w-md drop-shadow">
            Like a bar tab, but for your shared holiday, night out or restaurant trip.<br/>
          </h2>
          <div class="w-full max-w-xs">
            <UButton size="xl" block to="/join">
              Get started now
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UContainer>
      <UPageSection
        title="Less time splitting expenses. More time enjoying the trip."
        :features="features"
      />
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
      <UPageCard
          icon="i-lucide-smartphone"
          spotlight
          class="pb-6 mb-16 mt-16"
          spotlight-color="primary"
          highlight
          highlight-color="primary"
          title="App is in early access"
          description="Very soon Tab Ninja will hit the Android and Apple mobile app stores. Mobile only features will include receipt scanning with built in translation, date and currency detection. No more guessing, just scan it and split it."
      >
        <div>
          <UButton to="/early-access" label="Join early access" class="p-3"/>
        </div>
      </UPageCard>
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

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright Tab Ninja © {{ new Date().getFullYear() }}
        </p>
      </template>
      <UNavigationMenu :items="footerLinks" variant="link" orientation="vertical" class="sm:hidden" />
      <UNavigationMenu :items="footerLinks" variant="link" class="hidden sm:flex" />
    </UFooter>
  </UMain>
</template>

<script setup lang="ts">
import type { PageFeatureProps, DropdownMenuItem } from '@nuxt/ui'

definePageMeta({ middleware: 'guest' })

const navItems: DropdownMenuItem[][] = [
  [
    { label: 'Web log in', icon: 'i-lucide-log-in', to: '/login' },
  ],
  [
    { label: 'Google Play', icon: 'i-simple-icons-googleplay', to: '/join' },
    { label: 'App Store', icon: 'i-simple-icons-apple', to: '/join' },
  ],
]

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

const footerLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Splitwise Alternative', to: '/splitwise-alternative' },
]

useSeoMeta({
  title: 'App to Split Trip Bills & Expenses Easily | Tab Ninja',
  description: 'Split bills and expenses with Tab Ninja. Start a tab, add friends, scan receipts and simplify settling for trips, nights out and shared costs.',
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
