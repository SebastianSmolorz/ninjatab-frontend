<template>
  <UMain class="relative bg-gray-900">
    <!-- Overlay: logo + back to home -->
    <div class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none">
      <NuxtLink to="/" class="pointer-events-auto">
        <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto" />
      </NuxtLink>
      <div class="pointer-events-auto">
        <UButton to="/join" size="md" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
      </div>
    </div>

    <!-- Hero -->
    <section class="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gray-900">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/20%,_transparent_50%)] opacity-40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/25%,_transparent_55%)] opacity-50" />
      <UContainer class="relative">
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Splitwise alternative</span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            The free <span class="text-primary-400">Splitwise alternative</span> built for group trips.
          </h1>
          <p class="mt-6 text-lg lg:text-xl text-gray-300 leading-relaxed">
            No daily expense limits. No £40 subscriptions. No locking currency conversion behind Pro.
            Ninja Tab is a modern expense splitting app for the real way groups actually spend.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
            <UButton size="xl" variant="ghost" color="neutral" to="#comparison">Skip to the comparison</UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Why people search -->
    <section class="relative py-20 lg:py-24 bg-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">The gripes</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Why people search for a Splitwise alternative.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            It mostly does the job. But do you actually enjoy using it?
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div
            v-for="gripe in gripes"
            :key="gripe.title"
            class="p-6 rounded-xl bg-gray-800/40 ring-1 ring-white/5 flex gap-4"
          >
            <UIcon name="i-lucide-x-circle" class="size-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-white">{{ gripe.title }}</h3>
              <p class="text-sm text-gray-400 mt-1 leading-relaxed">{{ gripe.description }}</p>
            </div>
          </div>
        </div>

        <p class="text-center mt-10 text-gray-400 max-w-2xl mx-auto">
          Splitting a few single item bills with a flatmate? Most apps do fine.<br/>
          <span class="text-white font-medium">Organising a group holiday? Big group at a restaurant? That's a different ball game.</span>
        </p>
      </UContainer>
    </section>

    <!-- Comparison Table -->
    <section id="comparison" class="relative py-20 lg:py-24 bg-gradient-to-b from-gray-900 to-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Side-by-side</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ninja Tab vs Splitwise.
          </h2>
          <small class="text-gray-300/70 mt-1">Comparison of Android apps accurate as of 13/05/2026</small>
          <p class="mt-6 text-lg text-gray-300">
            Ninja Tab is built for event-based use. Splitwise is built around subscriptions.
          </p>
        </div>

        <div class="max-w-5xl mx-auto overflow-x-auto rounded-2xl ring-1 ring-white/10 bg-gray-900/60">
          <table class="w-full text-left min-w-[640px]">
            <thead class="bg-gray-800/60">
              <tr>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400">Feature</th>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-primary-400">Ninja Tab</th>
                <th class="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-400">Splitwise</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="row in comparison" :key="row.feature">
                <td class="px-4 sm:px-6 py-4 text-gray-200 font-medium">{{ row.feature }}</td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-start gap-2">
                    <UIcon
                      :name="row.ninjaTab.status === 'yes' ? 'i-lucide-check-circle-2' : row.ninjaTab.status === 'partial' ? 'i-lucide-circle-dashed' : 'i-lucide-x-circle'"
                      :class="['size-5 shrink-0 mt-0.5', row.ninjaTab.status === 'yes' ? 'text-primary-400' : row.ninjaTab.status === 'partial' ? 'text-yellow-400' : 'text-red-400']"
                    />
                    <span class="text-gray-200 text-sm">{{ row.ninjaTab.text }}</span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-start gap-2">
                    <UIcon
                      :name="row.splitwise.status === 'yes' ? 'i-lucide-check-circle-2' : row.splitwise.status === 'partial' ? 'i-lucide-circle-dashed' : 'i-lucide-x-circle'"
                      :class="['size-5 shrink-0 mt-0.5', row.splitwise.status === 'yes' ? 'text-primary-400' : row.splitwise.status === 'partial' ? 'text-yellow-400' : 'text-red-400']"
                    />
                    <span class="text-gray-400 text-sm">{{ row.splitwise.text }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-center text-gray-400 mt-8 max-w-2xl mx-auto">
          If you split expenses occasionally but intensely, subscriptions feel unnecessary.
        </p>
      </UContainer>
    </section>

    <!-- Pricing -->
    <section class="relative py-20 lg:py-24 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Pricing</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Pricing that matches real life.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Often less than one round of drinks for removing hours of admin. You pay once, when the value is obvious.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div
            v-for="tier in pricingExamples"
            :key="tier.title"
            :class="[
              'p-6 rounded-2xl ring-1 flex flex-col gap-2 text-center',
              tier.highlight
                ? 'bg-gradient-to-br from-primary-500/10 to-primary-700/5 ring-primary-500/40'
                : 'bg-gray-800/50 ring-white/10'
            ]"
          >
            <p class="text-sm text-gray-400">{{ tier.title }}</p>
            <p class="text-xs text-gray-500">{{ tier.scenario }}</p>
            <p class="mt-2 text-3xl font-bold text-white">
              {{ tier.price }}
              <span v-if="tier.suffix" class="text-sm font-normal text-gray-400">{{ tier.suffix }}</span>
            </p>
          </div>
        </div>

        <ul class="mt-12 max-w-2xl mx-auto flex flex-col gap-3 text-gray-300">
          <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />No £40 annual subscription</li>
          <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />No recurring commitment</li>
          <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />No premium currency unlock</li>
          <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Fee added to the tab so the group splits it</li>
        </ul>
      </UContainer>
    </section>

    <!-- Built for group travel -->
    <section class="relative py-20 lg:py-24 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Group travel</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Built for how groups actually spend on trips.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Flights, accommodation, transfers, restaurants, bar tabs, supermarket runs, activities — across multiple currencies, paid by different people at different times.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <div
            v-for="handles in groupTravelFeatures"
            :key="handles.title"
            class="p-6 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/20 ring-1 ring-white/10"
          >
            <UIcon :name="handles.icon" class="size-7 text-primary-400 mb-3" />
            <h3 class="font-semibold text-white">{{ handles.title }}</h3>
            <p class="text-sm text-gray-400 mt-1 leading-relaxed">{{ handles.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Smarter splitting -->
    <section class="relative py-20 lg:py-24 bg-gradient-to-b from-gray-950 to-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Smarter splitting</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Restaurant receipt in a foreign language? Scan it.
          </h2>
          <p class="mt-6 text-lg text-gray-300 leading-relaxed">
            Tap who had what. Item names get translated automatically. Not sure how to divide something? Let everyone claim their own items. Everyone sees the same numbers. No chasing screenshots.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Best fit -->
    <section class="relative py-20 lg:py-24 bg-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-10">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Is it for you?</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Is Ninja Tab the best Splitwise alternative?
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div class="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/5 ring-1 ring-primary-500/30">
            <h3 class="font-semibold text-white mb-4">Yes, if you:</h3>
            <ul class="flex flex-col gap-2 text-gray-200">
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Split expenses occasionally but heavily</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Organise group holidays</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Travel internationally</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Want multi-currency included as standard</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-check" class="size-5 text-primary-400 mt-0.5 shrink-0" />Don't want a subscription</li>
            </ul>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/10">
            <h3 class="font-semibold text-white mb-4">Maybe not, if you:</h3>
            <ul class="flex flex-col gap-2 text-gray-400">
              <li class="flex items-start gap-2"><UIcon name="i-lucide-minus" class="size-5 text-gray-500 mt-0.5 shrink-0" />Only split single item expenses e.g. internet bill</li>
              <li class="flex items-start gap-2"><UIcon name="i-lucide-minus" class="size-5 text-gray-500 mt-0.5 shrink-0" />Have a small number of bills</li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Final CTA -->
    <section class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--ui-color-primary-500)/15%,_transparent_60%)]" />
      <UContainer class="relative">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Group expenses? Stick it on the <span class="text-primary-400">Tab</span>.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Start a free tab. Upgrade only if the trip actually needs it. Simple splits. Fair pricing. Done.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
            <UButton size="xl" variant="ghost" color="neutral" to="/">Back to home</UButton>
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
const gripes = [
  { title: 'One expense a day on free', description: 'The free tier limits you to a single expense per day. Useless on a trip.' },
  { title: 'Everyone must join by email', description: 'No way to track expenses for a friend who hasn\'t signed up.' },
  { title: '£40 a year — one person fronts it', description: 'A subscription that one person has to subsidise for the whole group.' },
  { title: 'Pro features only for the subscriber', description: 'The rest of the group still uses the limited free experience.' },
  { title: 'No currency conversion on free', description: 'Travelling abroad? Pay up.' },
  { title: 'No receipt scanning into items', description: 'Manual entry, line by line, for every meal.' },
  { title: 'Ads on free', description: 'Even when you\'re trying to settle up after a holiday.' },
  { title: 'Outdated design', description: 'It works, but it doesn\'t feel built for 2026.' },
]

const comparison = [
  {
    feature: 'Track group expenses',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'yes', text: 'Yes' },
  },
  {
    feature: 'Simplify repayments',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'yes', text: 'Yes' },
  },
  {
    feature: 'Uneven splits',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'yes', text: 'Yes' },
  },
  {
    feature: 'Receipt scanning',
    ninjaTab: { status: 'yes', text: 'Parsed into items and translated' },
    splitwise: { status: 'no', text: 'Attach image on Pro only' },
  },
  {
    feature: 'Itemised expenses like a receipt',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'no', text: 'No' },
  },
  {
    feature: 'Free for smaller plans',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'partial', text: 'Limited' },
  },
  {
    feature: 'Multi-currency conversion',
    ninjaTab: { status: 'yes', text: 'Included' },
    splitwise: { status: 'no', text: 'Pro only' },
  },
  {
    feature: 'Unlimited bills on serious trips',
    ninjaTab: { status: 'yes', text: 'Yes' },
    splitwise: { status: 'partial', text: 'Restricted on free' },
  },
  {
    feature: 'Subscription model',
    ninjaTab: { status: 'yes', text: 'Never' },
    splitwise: { status: 'no', text: 'Yes' },
  },
  {
    feature: 'Ads',
    ninjaTab: { status: 'yes', text: 'Never' },
    splitwise: { status: 'no', text: 'Yes' },
  },
  {
    feature: 'Per-event pricing',
    ninjaTab: { status: 'yes', text: '£1 per person, split evenly' },
    splitwise: { status: 'no', text: 'Trip pass via £40 subscription' },
  },
]

const pricingExamples = [
  { title: 'A night out', scenario: 'Predrinks, taxi, restaurant, taxi back', price: 'Free', suffix: '', highlight: false },
  { title: 'Long weekend (6 people)', scenario: '', price: '£1', suffix: 'per person', highlight: true },
  { title: 'Big stag do abroad (20 people)', scenario: 'Still just', price: '£1', suffix: 'per person', highlight: false },
]

const groupTravelFeatures = [
  { icon: 'i-lucide-split', title: 'Uneven splits', description: 'Shares, fixed amounts, or evenly — per line item.' },
  { icon: 'i-lucide-list-checks', title: 'Item-level splits', description: 'Claim only what you actually had on the bill.' },
  { icon: 'i-lucide-scan-line', title: 'Receipt scanning', description: 'Snap, auto-detect items, currency and date.' },
  { icon: 'i-lucide-languages', title: 'Receipt translation', description: 'Foreign menus translated into something you recognise.' },
  { icon: 'i-lucide-activity', title: 'Live balances', description: 'Everyone sees who\'s ahead and behind in real time.' },
  { icon: 'i-lucide-globe', title: 'Automatic currency conversion', description: 'Multiple currencies on one tab. No Pro tier required.' },
  { icon: 'i-lucide-route', title: 'Clean final settlement', description: 'Minimum transfers to square up the entire group.' },
  { icon: 'i-lucide-shield-check', title: 'Fair, transparent pricing', description: '£1 per person on the tab. Group splits the fee.' },
]

const footerLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Home', to: '/' },
]

useSeoMeta({
  title: 'Best Free Splitwise Alternative (UK) — Ninja Tab',
  description: 'Looking for a Splitwise alternative? Ninja Tab is a modern expense splitting app for group trips. No subscriptions, multi-currency included, just £1 per person.',
  ogTitle: 'Ninja Tab — The free Splitwise alternative built for trips',
  ogDescription: 'No daily limits, no £40 subscription, multi-currency included. Built for the way groups actually spend.',
  ogImage: 'https://www.tab.ninja/og-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>
