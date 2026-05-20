<template>
  <UMain class="relative bg-gray-900">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gray-900" />
      <picture>
        <source srcset="/group.webp" type="image/webp" />
        <img
          src="/group-optimised.jpg"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          class="absolute inset-0 w-full h-full object-cover object-[50%_30%] opacity-20"
        />
      </picture>
      <div class="absolute inset-0 bg-black/50" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/20%,_transparent_50%)] opacity-40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/25%,_transparent_55%)] opacity-50" />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

      <UContainer class="relative z-10">
        <div class="max-w-3xl mx-auto text-center pt-24 sm:pt-28 pb-12 sm:pb-16">
          <div class="flex justify-center mb-6 sm:mb-8">
            <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="w-32 sm:w-40 lg:w-48 h-auto" />
          </div>
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">
            Bank holiday giveaway
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            Win <span class="text-primary-400">£50</span> spending money
            <span class="block mt-2 text-2xl sm:text-3xl lg:text-4xl text-primary-200">for your group</span>
          </h1>
          <p class="mt-6 text-lg text-gray-300 leading-relaxed">
            We're giving away <span class="text-white font-semibold">5&nbsp;×&nbsp;£50</span> to UK groups making the most of the late May bank holiday.
            Start a tab, invite a mate, scan a receipt &ndash; you're in the draw.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Get the app</UButton>
            <UButton size="xl" variant="ghost" color="neutral" to="#how-to-enter">How to enter</UButton>
          </div>

          <p class="mt-6 text-sm text-gray-400">
            Open <span class="text-white">Thu 21 May 2026</span> &ndash; <span class="text-white">Tue 26 May 2026, 23:59 BST</span>
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Prize cards -->
    <section class="relative py-16 lg:py-20 bg-gray-900">
      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div class="p-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <UIcon name="i-lucide-gift" class="size-7 text-primary-400 mb-3" />
            <h3 class="font-semibold text-white mb-1">5 prizes</h3>
            <p class="text-sm text-gray-400 leading-relaxed">Five winning groups, £50 each, paid by bank transfer.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <UIcon name="i-lucide-calendar-days" class="size-7 text-primary-400 mb-3" />
            <h3 class="font-semibold text-white mb-1">Bank holiday window</h3>
            <p class="text-sm text-gray-400 leading-relaxed">Entries open from Thu 21 May to midnight Tue 26 May 2026.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <UIcon name="i-lucide-dices" class="size-7 text-primary-400 mb-3" />
            <h3 class="font-semibold text-white mb-1">Random draw</h3>
            <p class="text-sm text-gray-400 leading-relaxed">Winners picked at random from all eligible entries after close.</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- How to enter -->
    <section id="how-to-enter" class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-900 to-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-14">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">How to enter</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Three steps. One entry. Five winners.
          </h2>
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
          <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Start your tab</UButton>
        </div>
      </UContainer>
    </section>

    <!-- Eligibility / rules summary -->
    <section class="relative py-20 lg:py-28 bg-gray-950">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center mb-12">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Eligibility</span>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            What counts as an entry
          </h2>
        </div>

        <div class="max-w-3xl mx-auto grid grid-cols-1 gap-4">
          <div v-for="rule in rules" :key="rule.title" class="flex items-start gap-4 p-5 rounded-2xl bg-gray-800/50 ring-1 ring-white/5">
            <UIcon :name="rule.icon" class="size-6 text-primary-400 mt-0.5 shrink-0" />
            <div>
              <h3 class="font-semibold text-white">{{ rule.title }}</h3>
              <p class="text-sm text-gray-300 leading-relaxed mt-1">{{ rule.description }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Terms & conditions -->
    <section id="terms" class="relative py-20 lg:py-28 bg-gradient-to-b from-gray-950 to-gray-900">
      <UContainer>
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-10">
            <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">Terms &amp; conditions</span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              The fine print
            </h2>
          </div>

          <div class="p-6 sm:p-8 rounded-2xl bg-gray-900/60 ring-1 ring-white/10 text-gray-300 leading-relaxed text-sm sm:text-base">
            <h3 class="text-lg sm:text-xl font-semibold text-white">Ninja Tab — £50 Bank Holiday Giveaway: Terms and Conditions</h3>
            <p class="mt-4"><span class="text-white font-medium">Promoter:</span> Ninja Tab ("the Promoter", "we", "us"). This giveaway is in no way sponsored, endorsed or administered by, or associated with, any social media platform.</p>

            <p class="mt-4"><span class="text-white font-medium">In short:</span> We're giving away five £50 prizes. To enter, create a tab in the Ninja Tab app and invite a friend who signs up between 21–26 May 2026. You can enter either by scanning a qualifying receipt to your tab, or completely free by emailing us instead — both have the same chance of winning, and no purchase is necessary. You must be 18+ and a UK resident, and you can enter once. Winners are picked at random and paid by bank transfer. The full terms below set out the detail.</p>

            <h4 class="mt-6 text-white font-semibold">1. Eligibility</h4>
            <p class="mt-2">1.1 Open to residents of the United Kingdom aged 18 or over at the time of entry. Employees of the Promoter and their immediate families are not eligible.</p>
            <p class="mt-1">1.2 By entering, you confirm you meet these eligibility requirements and agree to be bound by these terms.</p>

            <h4 class="mt-6 text-white font-semibold">2. Entry period</h4>
            <p class="mt-2">2.1 The entry period runs from 00:00 BST on Thursday 21 May 2026 until 23:59 BST on Tuesday 26 May 2026 ("the entry period"). Entries received outside the entry period will not be accepted.</p>

            <h4 class="mt-6 text-white font-semibold">3. Prizes</h4>
            <p class="mt-2">3.1 Five (5) prizes are available. Each prize is £50 GBP.</p>
            <p class="mt-1">3.2 Each prize is paid by bank transfer to the winning tab creator within 14 days of the winner confirming their claim and providing valid UK bank account details under clause 7.</p>
            <p class="mt-1">3.3 There is no cash alternative, and prizes are non-transferable.</p>

            <h4 class="mt-6 text-white font-semibold">4. How to enter</h4>
            <p class="mt-2">4.1 There are two ways to enter. Both routes are entered into the same draw and every valid entry, however submitted, carries the same chance of winning.</p>
            <p class="mt-1">4.2 <span class="text-white">Paid-product route.</span> Within the entry period, an eligible person must:</p>
            <p class="mt-1 ml-4">(a) create a new tab in the Ninja Tab app;</p>
            <p class="mt-1 ml-4">(b) invite at least one friend to that tab, and that friend must create a Ninja Tab account during the entry period; and</p>
            <p class="mt-1 ml-4">(c) scan to that tab a receipt from a UK-based establishment, dated within the entry period, from an eligible establishment as defined in clause 5.</p>
            <p class="mt-1">4.3 <span class="text-white">Free entry route.</span> No purchase is necessary to enter. As an alternative to scanning a receipt, an eligible person may, within the entry period:</p>
            <p class="mt-1 ml-4">(a) create a new tab in the Ninja Tab app;</p>
            <p class="mt-1 ml-4">(b) invite at least one friend to that tab, and that friend must create a Ninja Tab account during the entry period; and</p>
            <p class="mt-1 ml-4">(c) enter free of charge by emailing <a href="mailto:seb@tab.ninja?subject=Free%20Entry" class="text-primary-400 hover:text-primary-300">seb@tab.ninja</a> with the subject line "Free Entry", stating their full name and the email address associated with their Ninja Tab account, so we can confirm the tab and invited account.</p>
            <p class="mt-1">4.4 The free entry route is available throughout the entry period at no cost and on equal terms. Entries via the free route have exactly the same chance of winning as entries via the paid-product route.</p>

            <h4 class="mt-6 text-white font-semibold">5. Eligible receipts (paid-product route only)</h4>
            <p class="mt-2">5.1 A receipt must be from a UK-based establishment and dated within the entry period.</p>
            <p class="mt-1">5.2 Eligible establishments are venues offering on-site service or experiences, including pubs, bars, clubs, restaurants, cafés, museums, and activities such as guided tours or attractions.</p>
            <p class="mt-1">5.3 The following are not eligible: receipts from purely retail purchases (for example supermarkets, off-licences, or takeaways without on-site service); receipts dated outside the entry period; receipts from non-UK establishments; and any receipt that has already been used to enter.</p>

            <h4 class="mt-6 text-white font-semibold">6. One entry per person</h4>
            <p class="mt-2">6.1 Each person may enter once only, by either route. Creating multiple tabs, inviting multiple friends across separate tabs, scanning multiple receipts, or combining the paid and free routes does not increase the chance of winning.</p>
            <p class="mt-1">6.2 For the purpose of this giveaway, a "person" is identified by their verified Ninja Tab account. We may treat multiple entries or accounts that share identifying details (including name, email, payment details, or device) as a single person, and may consolidate or disregard duplicate entries accordingly.</p>

            <h4 class="mt-6 text-white font-semibold">7. Winner selection, notification and claim</h4>
            <p class="mt-2">7.1 Five winners will be selected at random from all eligible entries within 7 days of the close of the entry period.</p>
            <p class="mt-1">7.2 Winners will be contacted via the email address associated with their Ninja Tab account.</p>
            <p class="mt-1">7.3 To claim a prize, a winner must, within 14 days of being notified, respond to confirm their claim and provide valid UK bank account details (and any reasonable verification we request under clause 8).</p>
            <p class="mt-1">7.4 If a winner does not respond, cannot be contacted, or does not provide valid bank details within 14 days of being notified, we reserve the right to disqualify that entry and select an alternative winner at random. Any prize that remains unclaimed 30 days after the original draw will lapse and need not be awarded.</p>

            <h4 class="mt-6 text-white font-semibold">8. Verification and disqualification</h4>
            <p class="mt-2">8.1 We may verify any entry before awarding a prize, including by asking an entrant to provide the original receipt, confirm tab activity, or verify that an invited account is genuine.</p>
            <p class="mt-1">8.2 We reserve the right to disqualify any entry, without notice, where we reasonably believe on objective grounds that it:</p>
            <p class="mt-1 ml-4">(a) uses a fake, altered, edited, or duplicate receipt, or a receipt that does not meet clause 5;</p>
            <p class="mt-1 ml-4">(b) is one of multiple entries or accounts attributable to the same person, contrary to clause 6;</p>
            <p class="mt-1 ml-4">(c) involves an account created solely to enter or game the giveaway (including an invited "friend" account that does not genuinely participate in the tab);</p>
            <p class="mt-1 ml-4">(d) is made using bots, scripts, or other automated means; or</p>
            <p class="mt-1 ml-4">(e) otherwise breaches these terms.</p>
            <p class="mt-1">8.3 These verification and disqualification provisions apply equally to entries made by the free route and the paid-product route.</p>

            <h4 class="mt-6 text-white font-semibold">9. General</h4>
            <p class="mt-2">9.1 We reserve the right to amend, suspend or cancel the giveaway, or these terms, if circumstances beyond our reasonable control require it. Any such change will not unfairly prejudice entrants who have already entered validly.</p>
            <p class="mt-1">9.2 By entering, you agree to these terms and to Ninja Tab's <NuxtLink to="/privacy" class="text-primary-400 hover:text-primary-300">privacy policy</NuxtLink>.</p>
            <p class="mt-1">9.3 These terms are governed by the laws of England and Wales (or, where applicable, of the entrant's home UK jurisdiction), and the courts of England and Wales have non-exclusive jurisdiction.</p>
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
            Get the app. Start a tab. You're in.
          </h2>
          <p class="mt-6 text-lg text-gray-300">
            Free to start. The next round on you might just be on us.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <UButton size="xl" to="/join" trailing-icon="i-lucide-arrow-right">Get Ninja Tab</UButton>
            <UButton size="xl" variant="ghost" color="neutral" to="#terms">Read the terms</UButton>
          </div>
        </div>
      </UContainer>
    </section>
  </UMain>
</template>

<script setup lang="ts">
const steps = [
  {
    icon: 'i-lucide-users-round',
    title: 'Start a tab',
    description: 'Open a new tab in the Ninja Tab app between Thu 21 May and Tue 26 May 2026.',
  },
  {
    icon: 'i-lucide-user-plus',
    title: 'Invite a mate',
    description: 'Invite at least one friend to the tab. They need to create a Ninja Tab account during the entry window.',
  },
  {
    icon: 'i-lucide-receipt',
    title: 'Scan a UK receipt',
    description: 'Scan a receipt from a UK pub, bar, club, restaurant, museum or activity, dated within the entry window.',
  },
]

const rules = [
  {
    icon: 'i-lucide-calendar-clock',
    title: 'Entry window',
    description: 'Tabs created and receipts dated between Thursday 21 May and 23:59 BST on Tuesday 26 May 2026.',
  },
  {
    icon: 'i-lucide-user-check',
    title: 'One entry per person',
    description: 'You only get one entry, no matter how many tabs you create or friends you invite.',
  },
  {
    icon: 'i-lucide-map-pin',
    title: 'UK establishments only',
    description: 'Receipts must be from a UK pub, bar, club, restaurant, café, museum or activity such as a guided tour.',
  },
  {
    icon: 'i-lucide-shuffle',
    title: 'Random draw',
    description: 'Five winners drawn at random from all eligible entries after the window closes.',
  },
]

const siteUrl = 'https://tab.ninja'

useSeoMeta({
  title: '£50 Bank Holiday Giveaway | Ninja Tab',
  description: 'Win one of 5 × £50 prizes for your group. Open a tab, invite a friend and scan a UK receipt between 21–26 May 2026 to enter.',
  ogType: 'website',
  ogUrl: `${siteUrl}/giveaway`,
  ogTitle: 'Ninja Tab £50 Bank Holiday Giveaway',
  ogDescription: '5 × £50 up for grabs. Start a tab, invite a mate, scan a UK receipt between 21–26 May 2026.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Ninja Tab £50 Bank Holiday Giveaway',
  twitterDescription: '5 × £50 up for grabs. Start a tab, invite a mate, scan a UK receipt between 21–26 May 2026.',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/giveaway` }],
})
</script>
