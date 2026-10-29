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

type Filter = { key: string, label: string, icon: string, test: (t: TripCard) => boolean }
type TripCard = ReturnType<typeof toCard>

const toCard = (trip: NonNullable<typeof data.value>['trips'][number]) => {
  const slug = trip.path.split('/').pop()!
  const stat = data.value!.stats.find(s => s.slug === slug)
  const cats = data.value!.categories.find(c => c.slug === slug)
  const heads = stat?.people.length ?? 0
  const code = stat?.settlement_currency ?? 'GBP'
  const spend = stat?.group_spend ?? null

  // Average per person by category, over everyone on the tab.
  const byCategory: Record<string, number> = {}
  for (const p of cats?.people ?? []) {
    for (const [k, v] of Object.entries(p.by_category)) byCategory[k] = (byCategory[k] ?? 0) + v / heads
  }
  const segments = (cats?.categories ?? [])
    .filter(c => byCategory[c.key])
    .map(c => ({ ...c, amount: Math.round(byCategory[c.key]!) }))

  return {
    slug,
    title: trip.heading ?? trip.title,
    place: trip.place?.name ?? trip.title,
    hasPlace: !!trip.place,
    blurb: trip.blurb ?? trip.description,
    image: trip.image,
    imageAlt: trip.imageAlt ?? trip.title,
    style: trip.style,
    flightsFrom: trip.flightsFrom,
    recorded: trip.costs === 'recorded',
    people: heads,
    expenses: stat?.bills.length ?? 0,
    // Whole units: a headline, and the trip page has the exact figure.
    perPerson: spend === null || heads === 0 ? null : formatMinorCurrencyCompact(Math.round(spend / heads / 100) * 100, code),
    flights: byCategory.flights ? formatMinorCurrencyCompact(Math.round(byCategory.flights / 100) * 100, code) : null,
    segments,
    segmentTotal: segments.reduce((s, c) => s + c.amount, 0),
    money: (amount: number) => formatMinorCurrencyCompact(amount, code),
  }
}

const cards = computed(() => (data.value?.trips ?? []).map(toCard))

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
        <NuxtLink
          v-for="(t, i) in visible"
          :key="t.slug"
          :to="`/t/${t.slug}`"
          class="group flex flex-col overflow-hidden rounded-2xl bg-gray-800/60 ring-1 ring-white/5 hover:ring-primary-500/40 hover:bg-gray-800 transition"
        >
          <div class="relative aspect-[16/10] overflow-hidden">
            <img
              v-if="t.image"
              :src="t.image"
              :alt="t.imageAlt"
              :loading="i < 3 ? 'eager' : 'lazy'"
              width="1000"
              height="625"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div
              v-else
              class="size-full flex items-center justify-center bg-gradient-to-br from-primary-900 via-gray-800 to-sky-900"
            >
              <UIcon name="i-lucide-map-pinned" class="size-14 text-white/20" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent" />
            <div class="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
              <UBadge
                v-if="t.recorded"
                color="primary"
                variant="solid"
                size="sm"
                icon="i-lucide-receipt"
                class="rounded-full"
              >
                Every expense
              </UBadge>
              <UBadge v-else color="neutral" variant="solid" size="sm" icon="i-lucide-map" class="rounded-full">
                Itinerary
              </UBadge>
              <UBadge
                v-if="t.style"
                color="neutral"
                variant="solid"
                size="sm"
                :icon="t.style === 'adventure' ? 'i-lucide-mountain-snow' : 'i-lucide-sun'"
                class="rounded-full capitalize"
              >
                {{ t.style }}
              </UBadge>
            </div>
            <div class="absolute bottom-3 left-4 right-4">
              <div class="flex items-center gap-1.5 text-base font-semibold text-white">
                <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-primary-400" />
                <span class="truncate">{{ t.place }}</span>
              </div>
              <div v-if="t.flights && t.flightsFrom" class="flex items-center gap-1 text-[11px] text-gray-400">
                <UIcon name="i-lucide-plane-takeoff" class="size-3" />
                From {{ t.flightsFrom }}
              </div>
              <div class="flex items-baseline gap-1.5 text-white">
                <span class="text-3xl font-bold tracking-tight">{{ t.perPerson ?? '-' }}</span>
                <span class="text-sm text-gray-300">avg per person</span>
              </div>
            </div>
          </div>

          <div class="flex flex-1 flex-col gap-3 p-4">
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-users" class="size-3.5" />{{ t.people }} {{ t.people === 1 ? 'person' : 'people' }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-receipt-text" class="size-3.5" />{{ t.expenses }} expenses
              </span>
              <span class="flex items-center gap-1" :class="t.flights ? 'text-indigo-300' : ''">
                <UIcon :name="t.flights ? 'i-lucide-plane' : 'i-lucide-plane-landing'" class="size-3.5" />
                {{ t.flights ? `incl. ${t.flights} flights` : 'No flights' }}
              </span>
            </div>
            <p class="text-sm text-gray-300 line-clamp-2">{{ t.blurb }}</p>

            <div v-if="t.segments.length" class="mt-auto pt-1">
              <div class="flex h-5 overflow-hidden rounded-md bg-white/5">
                <!-- ponytail: CSS-only fit check. The zero-width spacer pins line 1;
                     an icon wider than its segment wraps to line 2 and is clipped. -->
                <div
                  v-for="s in t.segments"
                  :key="s.key"
                  class="min-w-0 flex flex-wrap justify-center overflow-hidden"
                  :class="CATEGORY_COLORS[s.key] ?? 'bg-gray-500'"
                  :style="{ flex: `${s.amount} 0 0` }"
                  :title="`${s.label} ${t.money(s.amount)}`"
                >
                  <span class="h-full w-0" aria-hidden="true" />
                  <span class="self-center flex px-1 text-gray-950">
                    <UIcon :name="CATEGORY_ICONS[s.key] ?? 'i-lucide-ellipsis'" class="size-3.5" />
                  </span>
                </div>
              </div>
              <div class="mt-2 flex justify-between text-xs text-gray-500">
                <span>Biggest: {{ [...t.segments].sort((a, b) => b.amount - a.amount)[0]!.label }}</span>
                <span class="flex items-center gap-1 text-primary-400 group-hover:gap-1.5 transition-all">
                  See breakdown <UIcon name="i-lucide-arrow-right" class="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
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

    <!-- Same fixed download CTA as the trip pages. -->
    <div
      class="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#01e474] pb-[env(safe-area-inset-bottom)]"
    >
      <div class="mx-auto max-w-2xl px-4 py-1 flex items-baseline justify-center gap-3">
        <p class="text-sm sm:text-base text-gray-900 font-medium leading-snug">
          <strong>Split</strong> your own trip expenses
        </p>
        <NuxtLink
          :to="joinLink"
          class="inline-flex items-center gap-1 bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          Get Ninja Tab
          <UIcon name="i-lucide-arrow-right" class="size-3.5" />
        </NuxtLink>
      </div>
    </div>
  </UMain>
</template>
