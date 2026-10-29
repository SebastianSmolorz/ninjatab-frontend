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

// One choice per group; picking the active chip again clears the group.
const groups: { key: string, filters: Filter[] }[] = [
  {
    key: 'flights',
    filters: [
      { key: 'with', label: 'Flights included', icon: 'i-lucide-plane', test: t => !!t.flights },
      { key: 'without', label: 'No flights', icon: 'i-lucide-plane-landing', test: t => !t.flights },
    ],
  },
  {
    key: 'costs',
    filters: [
      { key: 'recorded', label: 'Every expense logged', icon: 'i-lucide-receipt', test: t => t.recorded },
      { key: 'modelled', label: 'Itinerary', icon: 'i-lucide-map', test: t => !t.recorded },
    ],
  },
  {
    key: 'style',
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
const anyActive = computed(() => Object.values(active.value).some(Boolean))
const count = (f: Filter) => cards.value.filter(f.test).length

const visible = computed(() => cards.value.filter(t => groups.every((g) => {
  const f = g.filters.find(f => f.key === active.value[g.key])
  return !f || f.test(t)
})))

// The legend only lists categories some trip actually has, in category order.
const legend = computed(() => {
  const used = new Set(cards.value.flatMap(t => t.segments.map(s => s.key)))
  return (data.value?.categories[0]?.categories ?? []).filter(c => used.has(c.key))
})

const canonical = `${SITE}/trips`
const title = 'Real Trip Costs: What Group Trips Actually Cost | Ninja Tab'
const description = 'Real group trip budgets, split per person. Filter by flights, adventure or holiday, and itineraries vs trips where every single expense was logged.'
const ogImage = computed(() => `${SITE}${cards.value.find(t => t.image)?.image ?? '/logo-v2.png'}`)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonical,
  ogType: 'website',
  ogSiteName: 'Ninja Tab',
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
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
          description,
          inLanguage: 'en',
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORG_ID },
          mainEntity: { '@id': `${canonical}#trips` },
          breadcrumb: { '@id': `${canonical}#breadcrumb` },
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
            item: { '@type': 'Article', '@id': `${SITE}/t/${t.slug}#article`, name: t.title, url: `${SITE}/t/${t.slug}` },
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
    <UContainer class="relative max-w-5xl pt-28 pb-20">
      <p class="text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Real trip costs</p>
      <h1 class="mt-1 text-3xl sm:text-5xl font-bold text-white text-balance">What group trips actually cost</h1>
      <p class="mt-3 max-w-2xl text-gray-400 sm:text-lg">
        {{ cards.length }} trips split per person, every expense itemised. See where the money went, then plan yours.
      </p>

      <!-- Filters: a horizontal scroller on phones, wrapping on wider screens. -->
      <div class="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap pb-1 [scrollbar-width:none]">
        <template v-for="(g, gi) in groups" :key="g.key">
          <span v-if="gi" class="w-px shrink-0 self-stretch bg-white/10" aria-hidden="true" />
          <UButton
            v-for="f in g.filters"
            :key="f.key"
            :icon="f.icon"
            :color="active[g.key] === f.key ? 'primary' : 'neutral'"
            :variant="active[g.key] === f.key ? 'solid' : 'subtle'"
            size="sm"
            class="shrink-0 rounded-full"
            :aria-pressed="active[g.key] === f.key"
            @click="toggle(g.key, f.key)"
          >
            {{ f.label }}
            <span class="text-xs opacity-60">{{ count(f) }}</span>
          </UButton>
        </template>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
          <span v-for="c in legend" :key="c.key" class="flex items-center gap-1.5">
            <span class="size-2 rounded-full" :class="CATEGORY_COLORS[c.key] ?? 'bg-gray-500'" />
            {{ c.label }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          Showing {{ visible.length }} of {{ cards.length }}
          <UButton v-if="anyActive" size="xs" variant="link" color="neutral" icon="i-lucide-x" @click="active = {}">
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
              <div class="flex items-center gap-1 text-xs text-gray-300">
                <UIcon name="i-lucide-map-pin" class="size-3.5" />
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
              <div class="flex h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  v-for="s in t.segments"
                  :key="s.key"
                  :class="CATEGORY_COLORS[s.key] ?? 'bg-gray-500'"
                  :style="{ flex: `${s.amount} 0 0` }"
                  :title="`${s.label} ${t.money(s.amount)}`"
                />
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
