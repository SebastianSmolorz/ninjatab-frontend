<template>
  <UMain class="relative bg-gray-900">
    <!-- Overlay: logo + burger menu (outside hero so dropdown isn't clipped) -->
    <div class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none">
      <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto pointer-events-auto" />
      <div class="pointer-events-auto">
        <UDropdownMenu :items="navItems" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }" :modal="false">
          <UButton icon="i-lucide-menu" variant="ghost" color="neutral" aria-label="Open menu" />
        </UDropdownMenu>
      </div>
    </div>

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
                Download now
              </UButton>
            </div>
          </div>

          <!-- Device mockup carousel column -->
          <div class="relative flex items-center justify-center">
            <UCarousel
              v-slot="{ item }"
              loop
              fade
              arrows
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

    <!-- Problem framing -->
    <section class="relative py-20 lg:py-28 bg-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">The problem</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Group trips end the same way every time.
          </h2>
          <p class="mt-6 text-lg text-gray-300 leading-relaxed">
            A messy group chat. Bunch of pictures of receipts. Nobody can remember what they had.
            Welcome home. Here's some maths homework.
          </p>
        </div>

        <div class="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div v-for="pain in painPoints" :key="pain.title" class="p-6 rounded-xl bg-gray-800/40 ring-1 ring-white/5">
            <UIcon :name="pain.icon" class="size-7 text-primary-400 mb-3" />
            <h3 class="font-semibold text-white mb-1">{{ pain.title }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">{{ pain.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-900 to-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-14">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">How it works</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Three steps. No spreadsheets. No drama.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Ninja Tab keeps every expense in one shared tab and works out the simplest way to settle up.
          </p>
        </div>

        <ol class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <li v-for="(step, i) in steps" :key="step.title" class="relative p-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <div class="absolute -top-4 -left-2 size-10 rounded-full bg-primary-500 text-gray-950 font-bold flex items-center justify-center text-lg shadow-lg shadow-primary-500/30">
              {{ i + 1 }}
            </div>
            <UIcon :name="step.icon" class="size-8 text-primary-400 mt-2 mb-4" />
            <h3 class="text-xl font-semibold text-white mb-2">{{ step.title }}</h3>
            <p class="text-gray-400 leading-relaxed">{{ step.description }}</p>
          </li>
        </ol>

        <div class="mt-12 flex justify-center">
          <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
        </div>
      </UContainer>
    </section>

    <!-- Use cases -->
    <section class="relative py-20 lg:py-28 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-14">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Made for groups</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Built for every kind of shared spend.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            From a single dinner to a two-week trip across three currencies — Ninja Tab handles it.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div
            v-for="useCase in useCases"
            :key="useCase.title"
            class="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/20 ring-1 ring-white/10 hover:ring-primary-500/40 transition"
          >
            <UIcon :name="useCase.icon" class="size-8 text-primary-400 mb-4" />
            <h3 class="text-lg font-semibold text-white mb-2">{{ useCase.title }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">{{ useCase.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Feature highlights — alternating rows -->
    <section class="relative py-20 lg:py-28 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-16">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Features</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Less time on the maths. More time enjoying the trip.
          </h2>
        </div>

        <div class="flex flex-col gap-16 lg:gap-24 max-w-6xl mx-auto">
          <div
            v-for="(highlight, i) in highlights"
            :key="highlight.title"
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            <div :class="[i % 2 === 1 ? 'lg:order-2' : '', 'flex flex-col gap-4']">
              <UIcon :name="highlight.icon" class="size-10 text-primary-400" />
              <h3 class="text-2xl sm:text-3xl font-bold text-white">{{ highlight.title }}</h3>
              <p class="text-gray-300 text-lg leading-relaxed">{{ highlight.description }}</p>
              <ul class="flex flex-col gap-2 mt-2">
                <li v-for="bullet in highlight.bullets" :key="bullet" class="flex items-start gap-2 text-gray-300">
                  <UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>
            <div :class="[i % 2 === 1 ? 'lg:order-1' : '', 'relative']">
              <!-- Placeholder visual — swap with annotated screenshots when ready -->
              <div class="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/5 ring-1 ring-primary-500/20 flex items-center justify-center overflow-hidden">
                <img
                  :src="highlight.image"
                  :alt="highlight.title"
                  class="w-full h-full object-contain p-8 drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Comparison: vs spreadsheets / Splitwise -->
    <section class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-950 to-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Why Ninja Tab</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Built for groups, not for accountants.
          </h2>
        </div>

        <div class="max-w-4xl mx-auto overflow-hidden rounded-2xl ring-1 ring-white/10 bg-gray-900/60">
          <table class="w-full text-left">
            <thead class="bg-gray-800/60">
              <tr>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400">&nbsp;</th>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-primary-400">Ninja Tab</th>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400">Spreadsheets</th>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400">Group chats</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="row in comparison" :key="row.feature">
                <td class="px-4 sm:px-6 py-4 text-gray-200 font-medium">{{ row.feature }}</td>
                <td class="px-4 sm:px-6 py-4">
                  <UIcon name="i-lucide-check-circle-2" class="size-5 text-primary-400" />
                </td>
                <td class="px-4 sm:px-6 py-4 text-gray-500">
                  <UIcon :name="row.spreadsheet ? 'i-lucide-circle-dashed' : 'i-lucide-x'" class="size-5" />
                </td>
                <td class="px-4 sm:px-6 py-4 text-gray-500">
                  <UIcon name="i-lucide-x" class="size-5" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-center mt-6">
          <NuxtLink to="/splitwise-alternative" class="text-primary-400 hover:text-primary-300 text-sm font-medium">
            See how Ninja Tab compares to Splitwise →
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="relative py-20 lg:py-28 bg-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Pricing</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Every feature, free. Pay only when the tab gets massive.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Free gets you the full Ninja Tab experience: receipt scanning, smart settlement, multi-currency, all of it. The only thing that changes on a paid tab is the cap on expenses.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="relative p-8 rounded-2xl bg-gray-800/50 ring-1 ring-white/10 flex flex-col">
            <span class="absolute -top-3 right-6 bg-gray-200 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">Great for smaller plans</span>
            <h3 class="text-xl font-semibold text-white">Free</h3>
            <p class="text-gray-400 mt-1">Get started, no card required.</p>
            <div class="mt-6 flex items-baseline gap-2">
              <span class="text-5xl font-bold text-white">£0</span>
              <span class="text-gray-400">forever</span>
            </div>
            <ul class="mt-6 flex flex-col gap-3 text-gray-300">
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Every Ninja Tab feature included</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Up to 7 expenses per tab</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />1 receipt scan per tab (mobile)</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Unlimited people, smart settlement, multi-currency</li>
            </ul>
            <UButton to="/join" variant="soft" size="lg" class="mt-8 justify-center" block>Start free</UButton>
          </div>

          <div class="relative p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/5 ring-2 ring-primary-500/40 flex flex-col">
            <span class="absolute -top-3 right-6 bg-primary-500 text-gray-950 text-xs font-bold px-3 py-1 rounded-full">Best for group trips</span>
            <span class="absolute -top-3 left-6 bg-amber-400 text-gray-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">Free during launch</span>
            <h3 class="text-xl font-semibold text-white">Unlimited tab</h3>
            <p class="text-gray-400 mt-1">For bigger groups and longer trips.</p>
            <div class="mt-6 flex items-baseline gap-2">
              <span class="text-5xl font-bold text-white"><span class="line-through text-gray-500 text-3xl mr-2">£1</span>£0</span>
              <span class="text-gray-400">per person, free for our launch period</span>
            </div>
            <ul class="mt-6 flex flex-col gap-3 text-gray-300">
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Everything in Free</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Unlimited expenses on the tab</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Unlimited receipt scans</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />The fee is added to the tab so everyone pays £1</li>
            </ul>
            <UButton to="/join" size="lg" class="mt-8 justify-center" block>Get started</UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- App launching countdown -->
    <section class="relative py-20 lg:py-24 bg-gray-900">
      <UContainer>
        <UPageCard
          icon="i-lucide-smartphone"
          spotlight
          spotlight-color="primary"
          highlight
          highlight-color="primary"
          title="Mobile app launching 21 May 2026"
          description="Receipt scanning with built-in translation, automatic currency and date detection. Scan it, split it, done."
          :ui="{ leading: 'items-center', body: 'items-center text-center', title: 'text-center', description: 'text-center' }"
        >
          <div class="flex flex-col items-center gap-6">
            <AppLaunchCountdown />
            <UButton to="/join" size="lg" label="Download" />
          </div>
        </UPageCard>
      </UContainer>
    </section>

    <!-- FAQ -->
    <section id="faq" class="relative py-20 lg:py-28 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-10">
            <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">FAQ</span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Frequently asked questions
            </h2>
          </div>
          <UAccordion :items="faqItems" />
        </div>
      </UContainer>
    </section>

    <!-- Final CTA -->
    <section class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--ui-color-primary-500)/15%,_transparent_60%)]" />
      <UContainer class="relative">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Stick the next trip on a tab.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Free to start, no card required. Open a tab in seconds and skip the maths.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Start your free tab</UButton>
            <UButton size="xl" variant="ghost" color="neutral" to="#how-it-works">See how it works</UButton>
          </div>
        </div>
      </UContainer>
    </section>

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
import type { DropdownMenuItem } from '@nuxt/ui'

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

const deviceMockups = [
  '/screen1.webp',
  '/screen2.webp',
  '/screen3.webp',
]

const painPoints = [
  {
    icon: 'i-lucide-message-circle-off',
    title: 'The bottomless group chat',
    description: 'Receipts, screenshots and "who paid for the Uber?" buried under 400 messages.',
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Calculator madness',
    description: 'Have fun working out a 10 person, 30 expense trip by hand. Don\'t forget the exchange rate.',
  },
  {
    icon: 'i-lucide-clock-alert',
    title: 'The endless settle-up',
    description: 'If Steve owes Ben £100, but Ben owes Seb £25....no wonder your gang put it off',
  },
]

const steps = [
  {
    icon: 'i-lucide-users-round',
    title: 'Open a tab',
    description: 'Create a shared tab and add the group. Friends don\'t need to sign up — add them by name.',
  },
  {
    icon: 'i-lucide-receipt',
    title: 'Add bills as you go',
    description: 'Scan a receipt or enter a bill. Split by shares, by item, or evenly — whatever fits.',
  },
  {
    icon: 'i-lucide-hand-coins',
    title: 'Settle in fewer payments',
    description: 'Ninja Tab works out the minimum transfers needed so the group squares up fast.',
  },
]

const useCases = [
  {
    icon: 'i-lucide-plane',
    title: 'Group holidays',
    description: 'Track flights, villas, food and taxis across multiple currencies. Settle in one go when you\'re home.',
  },
  {
    icon: 'i-lucide-home',
    title: 'House shares',
    description: 'Rent, bills, groceries and that one flatmate who always buys the loo roll. Keep it fair month after month.',
  },
  {
    icon: 'i-lucide-utensils',
    title: 'Dinners & nights out',
    description: 'Someone always covers the card. Split the bill by what each person actually ordered, not awkward maths.',
  },
  {
    icon: 'i-lucide-mountain-snow',
    title: 'Trips & festivals',
    description: 'Ski lift passes, festival vans, the joint kitty for snacks. Capture every cost without breaking the vibe.',
  },
]

const highlights = [
  {
    icon: 'i-lucide-scan-line',
    title: 'Scan the receipt. Split the items.',
    description: 'Snap a photo of any receipt and let Ninja Tab pull out the line items, currency and date. Then everyone claims what they had.',
    bullets: [
      'Auto-detects currency and date',
      'Built-in translation for receipts abroad',
      'Tap to claim items per person',
    ],
    image: '/screen3.webp',
  },
  {
    icon: 'i-lucide-split',
    title: 'Split however the group actually spent.',
    description: 'Forget rigid even splits. Use shares when people had different portions, fixed amounts when one person ordered more, or split evenly when it doesn\'t matter.',
    bullets: [
      'Shares, fixed amounts or even splits per line item',
      'Different splits on different items in the same bill',
      'Edit any bill at any time',
    ],
    image: '/screen1.webp',
  },
  {
    icon: 'i-lucide-route',
    title: 'Smart settlement, fewer transfers.',
    description: 'Instead of everyone paying everyone back, Ninja Tab works out the smallest set of transfers that settle the whole group.',
    bullets: [
      'Minimises the number of payments',
      'Handles multi-currency tabs',
      'See exactly who pays whom, and how much',
    ],
    image: '/screen2.webp',
  },
]

const comparison = [
  { feature: 'Add bills in seconds', spreadsheet: true },
  { feature: 'Receipt scanning', spreadsheet: false },
  { feature: 'Smart settlement (minimum transfers)', spreadsheet: false },
  { feature: 'Multi-currency on one tab', spreadsheet: false },
  { feature: 'Friends join without signing up', spreadsheet: true },
  { feature: 'Updates in real time for everyone', spreadsheet: false },
  { feature: 'Works on phone and web', spreadsheet: true },
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
    content: 'The Ninja Tab mobile app launches on 21 May 2026 on both the Google Play Store and Apple App Store, with exclusive features like receipt scanning with automatic currency and date detection. Download it as soon as it goes live.',
  },
]

const footerLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Splitwise Alternative', to: '/splitwise-alternative' },
]

const siteUrl = 'https://www.tab.ninja'
const ogImage = `${siteUrl}/og-image.jpg`

useSeoMeta({
  title: 'Split Group Expenses & Trip Bills | Ninja Tab',
  description: 'Split group expenses the easy way. Open a shared tab, scan receipts, split bills by item or share, and settle up in the fewest payments. Free to start.',
  keywords: 'split bills, split expenses, group expenses, expense splitting app, trip cost splitter, splitwise alternative, holiday expenses, group travel app',
  applicationName: 'Ninja Tab',
  author: 'Ninja Tab',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1',
  themeColor: '#0a0a0a',

  ogType: 'website',
  ogUrl: siteUrl,
  ogSiteName: 'Ninja Tab',
  ogLocale: 'en_GB',
  ogTitle: 'Ninja Tab — Stick it on the Tab',
  ogDescription: 'Split trips, dinners, house bills and nights out. Smart settlement, multi-currency, free to start.',
  ogImage,
  ogImageAlt: 'Group of friends — Ninja Tab splits group expenses fairly',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',

  twitterCard: 'summary_large_image',
  twitterTitle: 'Ninja Tab — Stick it on the Tab',
  twitterDescription: 'Split trips, dinners, house bills and nights out. Smart settlement, multi-currency, free to start.',
  twitterImage: ogImage,
  twitterImageAlt: 'Group of friends — Ninja Tab splits group expenses fairly',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  htmlAttrs: { lang: 'en-GB' },
})

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim()

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ninja Tab",
    url: siteUrl,
    logo: `${siteUrl}/logo-v2.png`,
    sameAs: [
      "https://play.google.com/store/apps/details?id=ninja.tab.app",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ninja Tab",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "FinanceApplication",
    url: siteUrl,
    description: "Split group expenses, trips and bills with smart settlement, receipt scanning and multi-currency support.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "GBP",
      },
      {
        "@type": "Offer",
        name: "Unlimited tab",
        price: "1",
        priceCurrency: "GBP",
        description: "One-off per person for unlimited bills on a tab.",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(item => ({
      "@type": "Question",
      name: item.label,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(item.content),
      },
    })),
  },
]

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
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
