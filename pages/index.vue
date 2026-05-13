<template>
  <UMain class="bg-gray-900">
    <!-- Hero Section — full viewport, outside container -->
    <div class="relative w-full overflow-hidden" style="min-height: 100svh;">
      <!-- Background: dimmed photo + layered gradients + radial glows -->
      <div class="absolute inset-0 bg-gray-900" />
      <picture>
        <source srcset="/group.webp" type="image/webp" />
        <img
          src="/group-optimised.jpg"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          class="absolute inset-0 w-full h-full object-cover opacity-25"
        />
      </picture>
      <div class="absolute inset-0 bg-black/30" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/20%,_transparent_50%)] opacity-40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/25%,_transparent_55%)] opacity-50" />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

      <!-- Fixed overlay: logo + burger menu -->
      <div class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
        <img src="/logo-v2.png" alt="Ninja Tab logo" class="h-10 w-auto" />
        <UDropdownMenu :items="navItems">
          <UButton icon="i-lucide-menu" variant="ghost" color="neutral" aria-label="Open menu" />
        </UDropdownMenu>
      </div>

      <UContainer class="relative z-10 h-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center pt-20 pb-12 lg:pt-24 lg:pb-20" style="min-height: 100svh;">
          <!-- Text column -->
          <div class="flex flex-col items-center lg:items-start gap-3 lg:gap-6 text-center lg:text-left">
            <h1 class="font-bold text-white leading-[1.05] tracking-tight drop-shadow-lg">
              <span class="block text-2xl sm:text-3xl lg:text-4xl">Group Expenses?</span>
              <span class="block text-4xl sm:text-5xl lg:text-6xl mt-2 mb-2">
                <span class="text-primary-200 mr-2">Stick it on the</span>
                <span class="text-primary-400 animate-pulse [animation-duration:1.8s]">Tab</span>
              </span>
            </h1>
            <h2 class="text-gray-300 text-base sm:text-lg lg:text-xl max-w-lg leading-relaxed">
              Stick the group costs on one shared tab.<br/> Scan receipts, split who had what, and settle up without the maths.
            </h2>
            <div class="lg:pt-2">
              <UButton size="xl" to="/join" class="justify-center">
                Get started now
              </UButton>
            </div>
          </div>

          <!-- Device mockup carousel column -->
          <div class="relative flex items-center justify-center -mt-6 lg:mt-0">
            <UCarousel
              v-slot="{ item }"
              loop
              dots
              fade
              :autoplay="{ delay: 3500 }"
              :items="deviceMockups"
              class="relative w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[420px]"
              :ui="{ container: 'items-center ml-0', item: 'pl-0 min-w-0 basis-full', dots: 'mt-6', dot: 'bg-white/30 data-[state=active]:bg-primary-400' }"
            >
              <div class="flex items-center justify-center">
                <img
                  :src="item"
                  alt="Ninja Tab app screen"
                  loading="eager"
                  fetchpriority="high"
                  class="w-full h-auto max-h-[50vh] lg:max-h-[70vh] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.6)]"
                />
              </div>
            </UCarousel>
          </div>
        </div>
      </UContainer>
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
          title="App launching 21 May 2026"
          description="Ninja Tab is coming to the Android and Apple mobile app stores. Mobile only features will include receipt scanning with built in translation, date and currency detection. No more guessing, just scan it and split it."
          :ui="{ leading: 'items-center', body: 'items-center text-center', title: 'text-center', description: 'text-center' }"
      >
        <div class="flex flex-col items-center gap-6">
          <AppLaunchCountdown />
          <UButton to="/join" label="Join early access" class="p-3"/>
        </div>
      </UPageCard>
    <article id="how-it-works">
      <h2 class="text-2xl mb-2 text-primary font-bold">How it works</h2>
      <div class="flex flex-col mb-24">
        <p>
          Ninja Tab is an expense splitting app that helps groups track shared expenses. It makes it easy to split expenses between friends and see exactly who owes what.
          It works great for smaller plans such as a night out or house share cost splitting, but it really shines when it comes to larger plans such as a summer holiday, festival or ski trip.
        </p>
        <h3 class="font-bold mt-2">A smarter way to track group expenses</h3>
        <p>
          Add bills in seconds, split expenses your way, and let Ninja Tab automatically calculate the simplest
          settlement, reducing the number of payments needed so all debts are settled. It makes it easy to split expenses with friends without spreadsheets, group chat maths,
          or awkward money conversations.
        </p>
        </div>
    </article>
    <article class="mb-24">
      <h2 class="text-2xl mb-6 text-primary font-bold">Frequently asked questions</h2>
      <UAccordion :items="faqItems" />
    </article>
    </UContainer>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright Ninja Tab © {{ new Date().getFullYear() }}
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
  // [
  //   { label: 'Web log in', icon: 'i-lucide-log-in', to: '/login' },
  // ],
  [
    { label: 'Google Play', icon: 'i-simple-icons-googleplay', to: 'https://play.google.com/store/apps/details?id=ninja.tab.app', target: '_blank' },
    { label: 'App Store', icon: 'i-simple-icons-apple', to: '/join' },
  ],
  [
    { label: 'Splitwise Alternative', icon: 'i-lucide-repeat', to: '/splitwise-alternative' },
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

const deviceMockups = [
  '/screen1.png',
  '/screen2.png',
  '/screen3.png',
]

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

const faqItems = [
  {
    label: 'Is Ninja Tab free to use?',
    content: 'Yes — opening a tab and adding expenses is completely free. For larger groups, there is a small £1 per person fee for unlimited bills on a tab, added directly to the tab so the group can split it like any other expense.',
  },
  {
    label: 'Do my friends need to sign up to join a tab?',
    content: 'No sign-up is needed for friends to be added to a tab. You can add people by name and manage splits on their behalf. If they want to log in and view the tab themselves, they can create a free account.',
  },
  {
    label: 'How does the smart settlement work?',
    content: 'Once all expenses are added, Ninja Tab calculates the minimum number of payments needed to settle all debts across the group. Instead of everyone paying everyone else back, you get a simple list of who pays whom and how much.',
  },
  {
    label: 'Can I split bills unevenly?',
    content: 'Yes. Each line item is split using shares, so you can give people different numbers of shares to reflect what they actually used or consumed. For example, if one person has two portions and another has one, just assign shares accordingly.',
  },
  {
    label: 'What currencies does Ninja Tab support?',
    content: 'Ninja Tab supports 14 currencies: USD, EUR, GBP, JPY, CAD, TRY, PLN, CZK, AUD, CHF, HUF, BGN, MXN, and THB. Each bill can use a different currency, making it ideal for international trips where you are spending in multiple currencies.',
  },
  {
    label: 'When will the mobile app be available?',
    content: 'The Ninja Tab mobile app launches on 21 May 2026 on both the Google Play Store and Apple App Store, with exclusive features like receipt scanning with automatic currency and date detection. Join the early access list to be first in line.',
  },
]

const footerLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Splitwise Alternative', to: '/splitwise-alternative' },
]

useSeoMeta({
  title: 'App to Split Trip Bills & Expenses Easily | Ninja Tab',
  description: 'Split bills and expenses with Ninja Tab. Start a tab, add friends, scan receipts and simplify settling for trips, nights out and shared costs.',
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
