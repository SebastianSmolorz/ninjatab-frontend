<script setup lang="ts">
// Every public trip on one page, filterable. Same sources as the trip pages:
// copy from `trips`, figures from `tripData`, the split by category from
// `tripCategories`. All static, so the page prerenders.
const { data } = await useAsyncData('trips-index', async () => {
  const [trips, stats, categories] = await Promise.all([
    queryCollection('trips').order('order', 'ASC').all(),
    queryCollection('tripData').select('slug', 'settlement_currency', 'group_spend', 'people', 'bills').all(),
    queryCollection('tripCategories').select('slug', 'categories', 'people').all(),
  ])
  return { trips, stats, categories }
})

import type { TripCardData } from '~/utils/tripCard'

type Filter = { key: string, label: string, icon: string, test: (t: TripCardData) => boolean }

const cards = computed(() => (data.value?.trips ?? []).map(t => toTripCard(t, data.value!)))

// One choice per group; picking the active item again clears the group.
const groups: { key: string, label: string, filters: Filter[] }[] = [
  {
    key: 'flights',
    label: 'Flights',
    filters: [
      { key: 'with', label: 'Flights included', icon: 'i-lucide-plane', test: t => !!t.flights },
      { key: 'without', label: 'No flights', icon: 'i-lucide-plane-landing', test: t => !t.flights },
    ],
  },
  {
    key: 'costs',
    label: 'Costs',
    filters: [
      { key: 'recorded', label: 'Every expense logged', icon: 'i-lucide-receipt', test: t => t.recorded },
      { key: 'modelled', label: 'Itinerary', icon: 'i-lucide-map', test: t => !t.recorded },
    ],
  },
  {
    key: 'style',
    label: 'Style',
    filters: [
      { key: 'adventure', label: 'Adventure', icon: 'i-lucide-mountain-snow', test: t => t.style === 'adventure' },
      { key: 'holiday', label: 'Holiday', icon: 'i-lucide-sun', test: t => t.style === 'holiday' },
    ],
  },
]
const active = ref<Record<string, string | undefined>>({})
const toggle = (group: string, key: string) => {
  active.value = { ...active.value, [group]: active.value[group] === key ? undefined : key }
}
const activeCount = computed(() => Object.values(active.value).filter(Boolean).length)
const count = (f: Filter) => cards.value.filter(f.test).length

// Each group is a section of the menu; preventDefault keeps it open while picking.
const menuItems = computed(() => groups.map(g => [
  { label: g.label, type: 'label' as const },
  ...g.filters.map(f => ({
    label: `${f.label} (${count(f)})`,
    icon: f.icon,
    type: 'checkbox' as const,
    checked: active.value[g.key] === f.key,
    onUpdateChecked: () => toggle(g.key, f.key),
    onSelect: (e: Event) => e.preventDefault(),
  })),
]))

const visible = computed(() => cards.value.filter(t => groups.every((g) => {
  const f = g.filters.find(f => f.key === active.value[g.key])
  return !f || f.test(t)
})))

// One answer per trip, built only from figures the card shows, so the visible
// text and the FAQPage markup say the same thing. Answer engines quote these.
const faqs = computed(() => cards.value.filter(t => t.perPerson).map((t) => {
  const top = [...t.segments].sort((a, b) => b.amount - a.amount).slice(0, 2)
    .map(s => `${s.label.toLowerCase()} (${t.money(Math.round(s.amount / 100) * 100)})`)
  return {
    slug: t.slug,
    question: `How much does a trip to ${t.place} cost?`,
    answer: [
      `About ${t.perPerson} per person for ${t.people} ${t.people === 1 ? 'traveller' : 'travellers'}, ${
        t.flights ? `including ${t.flights} of flights${t.flightsFrom ? ` from ${t.flightsFrom}` : ''}` : 'not including flights'}.`,
      top.length ? `The biggest costs per person were ${top.join(' and ')}.` : '',
      t.recorded ? 'Every expense was logged during the trip.' : 'Based on a fully costed itinerary.',
    ].filter(Boolean).join(' '),
  }
}))

// Destination names are the search terms; the first part of "Bali, Indonesia".
const destinations = computed(() => cards.value.map(t => t.place.split(',')[0]!.trim()))

const canonical = `${SITE}/trips`
const title = 'How Much Does a Trip Cost? Real Group Travel Budgets | Ninja Tab'
const description = computed(() =>
  `Real per-person trip costs for ${destinations.value.join(', ')}. Every expense itemised: flights, accommodation, food, transport and activities.`)
const ogImage = computed(() => `${SITE}${cards.value.find(t => t.image)?.image ?? '/logo-v2.png'}`)

useSeoMeta({
  title,
  description: () => description.value,
  ogTitle: title,
  ogDescription: () => description.value,
  ogUrl: canonical,
  ogType: 'website',
  ogSiteName: 'Ninja Tab',
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: () => description.value,
  twitterImage: () => ogImage.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode,
        webSiteNode,
        {
          '@type': 'CollectionPage',
          '@id': `${canonical}#page`,
          url: canonical,
          name: title,
          description: description.value,
          inLanguage: 'en',
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORG_ID },
          mainEntity: { '@id': `${canonical}#trips` },
          breadcrumb: { '@id': `${canonical}#breadcrumb` },
          hasPart: { '@id': `${canonical}#faq` },
          // The trip pages' Place nodes, so the page reads as about these destinations.
          about: cards.value.filter(t => t.hasPlace).map(t => ({ '@id': `${SITE}/t/${t.slug}#place` })),
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonical}#faq`,
          url: canonical,
          name: 'How much does a trip cost?',
          inLanguage: 'en',
          isPartOf: { '@id': `${canonical}#page` },
          mainEntity: faqs.value.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer, url: `${SITE}/t/${f.slug}` },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Trips', item: canonical },
          ],
        },
        {
          '@type': 'ItemList',
          '@id': `${canonical}#trips`,
          name: 'Trip cost breakdowns',
          numberOfItems: cards.value.length,
          // Same nodes the trip pages define, so the list resolves to them.
          itemListElement: cards.value.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.title,
            item: {
              '@type': 'Article',
              '@id': `${SITE}/t/${t.slug}#article`,
              name: t.title,
              url: `${SITE}/t/${t.slug}`,
              ...(t.image ? { image: `${SITE}${t.image}` } : {}),
              ...(t.hasPlace ? { about: { '@id': `${SITE}/t/${t.slug}#place` } } : {}),
            },
          })),
        },
      ],
    }),
  }],
}))

const joinLink = { path: '/join', query: { go: '1', utm_source: 'trips_index', utm_medium: 'referral' } }
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900 pb-12">
    <UContainer class="relative max-w-5xl pt-20 pb-20">
      <p class="text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Real trip costs</p>
      <h1 class="mt-1 text-3xl sm:text-5xl font-bold text-white text-balance">What group trips actually cost</h1>
      <p class="mt-3 max-w-2xl text-gray-400 sm:text-lg">
        Fully tracked from start to finish. See every itemised expense so you can plan your own!
      </p>
      <!-- Native <details>: collapsed for readers, still in the HTML for crawlers. -->
      <details class="group/more mt-2 max-w-2xl text-sm text-gray-400">
        <summary class="inline-flex cursor-pointer list-none items-center gap-1 text-primary-400 hover:text-primary-300 [&::-webkit-details-marker]:hidden">
          How these trip costs work
          <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open/more:rotate-180" />
        </summary>
        <div class="mt-3 space-y-3 leading-relaxed">
          <p>
            Wondering how much a trip to {{ destinations.join(', ') }} really costs? These aren't
            guesses or average daily budgets. Each one is a real group trip, split in Ninja Tab, with
            every shared expense itemised and divided between the people who were there.
          </p>
          <p>
            Every trip shows the average cost per person, how many travellers went and whether flights
            are included. Open a trip to see the full breakdown by category: flights, accommodation,
            transport, activities, food and drink, alcohol and shopping. You can drill into each
            individual expense, down to the line items on the receipt, and see who paid for what and
            who owes whom at the end.
          </p>
          <p>
            Some trips were logged expense by expense while they happened. Others are fully costed
            itineraries, priced item by item before setting off. Use the filters to compare trips with
            or without flights, adventure trips against holidays, and logged trips against itineraries.
          </p>
          <p>
            Planning your own group trip? Use these real travel budgets as a starting point, then split
            the costs with your friends in Ninja Tab as you go.
          </p>
        </div>
      </details>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <UDropdownMenu :items="menuItems" :content="{ align: 'start' }">
          <UButton
            icon="i-lucide-sliders-horizontal"
            trailing-icon="i-lucide-chevron-down"
            :color="activeCount ? 'primary' : 'neutral'"
            :variant="activeCount ? 'solid' : 'subtle'"
            class="rounded-full"
          >
            Filters
            <span v-if="activeCount" class="text-xs opacity-70">{{ activeCount }}</span>
          </UButton>
        </UDropdownMenu>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          Showing {{ visible.length }} of {{ cards.length }}
          <UButton v-if="activeCount" size="xs" variant="link" color="neutral" icon="i-lucide-x" @click="active = {}">
            Clear
          </UButton>
        </div>
      </div>

      <TransitionGroup
        v-if="visible.length"
        tag="div"
        class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        move-class="transition-transform duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-active-class="transition duration-300"
        leave-active-class="hidden"
      >
        <TripCard v-for="(t, i) in visible" :key="t.slug" :trip="t" :eager="i < 3" />
      </TransitionGroup>

      <div v-else class="mt-10 rounded-2xl bg-gray-800/60 ring-1 ring-white/5 p-8 text-center">
        <UIcon name="i-lucide-search-x" class="size-8 text-gray-500" />
        <p class="mt-2 text-gray-300">No trips match those filters.</p>
        <UButton class="mt-4" variant="subtle" color="neutral" @click="active = {}">Clear filters</UButton>
      </div>

      <!-- Answer-shaped copy for search and answer engines; mirrors the FAQPage node. -->
      <section v-if="faqs.length" class="mt-16">
        <h2 class="text-2xl sm:text-3xl font-bold text-white">How much does a trip cost?</h2>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div v-for="f in faqs" :key="f.slug">
            <h3 class="font-semibold text-white">{{ f.question }}</h3>
            <p class="mt-1 text-sm text-gray-400 leading-relaxed">
              {{ f.answer }}
              <NuxtLink :to="`/t/${f.slug}`" class="text-primary-400 hover:text-primary-300">See the breakdown</NuxtLink>
            </p>
          </div>
        </div>
      </section>
    </UContainer>

    <MarketingFooter />

    <TripCta :to="joinLink" />
  </UMain>
</template>
