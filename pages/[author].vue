<script setup lang="ts">
// Root-level author pages: /madlertravel, /nextcreator, … Static routes win
// over this one, so it only ever sees paths nothing else claimed, and anything
// without a file in content/authors 404s.
const route = useRoute()
const slug = computed(() => String(route.params.author))

const { data } = await useAsyncData(`author-${slug.value}`, async () => {
  const author = await queryCollection('authors').path(`/authors/${slug.value}`).first()
  if (!author) return null

  const trips = await queryCollection('trips')
    .where('author', '=', slug.value)
    .order('order', 'ASC')
    .all()

  // The card stats come from the exported tabs, not from hand-written copy, so
  // re-exporting a trip updates this page too. Selected down to the summary
  // fields — the line items would be most of the payload for none of the use.
  const stats = await queryCollection('tripData')
    .select('slug', 'settlement_currency', 'group_spend', 'people', 'bills')
    .all()

  return { author, trips, stats }
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const author = computed(() => data.value!.author)

const trips = computed(() => data.value!.trips.map((trip) => {
  const tripSlug = trip.path.split('/').pop()!
  const stat = data.value!.stats.find(s => s.slug === tripSlug)
  const heads = stat?.people.length ?? 0
  const spend = stat?.group_spend ?? null
  const code = stat?.settlement_currency ?? 'GBP'
  return {
    ...trip,
    slug: tripSlug,
    spend: spend === null ? null : formatMinorCurrencyCompact(spend, code),
    perPerson: spend === null || heads === 0 ? null : formatMinorCurrencyCompact(Math.round(spend / heads), code),
    people: heads,
    expenses: stat?.bills.length ?? 0,
  }
}))

const canonical = computed(() => `https://tab.ninja/${slug.value}`)
const title = computed(() => `${author.value.title} | Ninja Tab`)
const ogImage = computed(() =>
  trips.value[0]?.image ? `https://tab.ninja${trips.value[0].image}` : 'https://tab.ninja/logo-v2.png'
)

useSeoMeta({
  title: () => title.value,
  description: () => author.value.description,
  ogTitle: () => title.value,
  ogDescription: () => author.value.description,
  ogUrl: () => canonical.value,
  ogType: 'profile',
  ogSiteName: 'Ninja Tab',
  ogImage: () => ogImage.value,
  ogImageAlt: () => trips.value[0]?.imageAlt ?? author.value.name,
  twitterCard: 'summary_large_image',
  twitterTitle: () => title.value,
  twitterDescription: () => author.value.description,
  twitterImage: () => ogImage.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': canonical.value,
          url: canonical.value,
          name: author.value.title,
          description: author.value.description,
          inLanguage: 'en',
          mainEntity: { '@id': `${canonical.value}#person` },
          breadcrumb: { '@id': `${canonical.value}#breadcrumb` },
        },
        {
          '@type': 'Person',
          '@id': `${canonical.value}#person`,
          name: author.value.name,
          description: author.value.summary,
          image: author.value.avatar ? `https://tab.ninja${author.value.avatar}` : undefined,
          url: author.value.website,
          nationality: author.value.nationality,
          knowsAbout: author.value.knowsAbout,
          sameAs: [author.value.website, author.value.instagram].filter(Boolean),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical.value}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: 'https://tab.ninja/' },
            { '@type': 'ListItem', position: 2, name: author.value.name, item: canonical.value },
          ],
        },
        {
          '@type': 'ItemList',
          name: `${author.value.name} trip cost breakdowns`,
          numberOfItems: trips.value.length,
          itemListElement: trips.value.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.title,
            url: `https://tab.ninja/t/${t.slug}`,
          })),
        },
      ],
    }),
  }],
}))
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900">
    <UContainer class="relative max-w-3xl pt-28 pb-20">
      <!-- Author -->
      <div class="rounded-2xl bg-gray-800/60 ring-1 ring-white/5 p-5 sm:p-6">
        <div class="flex items-center gap-4">
          <UAvatar
            v-if="author.avatar"
            :src="author.avatar"
            :alt="`${author.name} profile picture`"
            size="3xl"
            class="shrink-0 ring-1 ring-white/10"
          />
          <div class="min-w-0">
            <p class="text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Trips by</p>
            <h1 class="text-2xl sm:text-4xl font-bold text-white">
              {{ author.name }}
              <span v-if="author.flag">{{ author.flag }}</span>
            </h1>
            <p v-if="author.tagline" class="text-sm sm:text-base text-gray-400">{{ author.tagline }}</p>
          </div>
        </div>

        <ContentRenderer :value="author" class="mt-5 author-prose" />

        <div class="mt-5 flex flex-wrap gap-3">
          <UButton
            v-if="author.website"
            :to="author.website"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-external-link"
          >
            {{ author.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
          </UButton>
          <UButton
            v-if="author.instagram"
            :to="author.instagram"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="subtle"
            icon="i-lucide-instagram"
          >
            @{{ author.instagram.split('/').filter(Boolean).pop() }}
          </UButton>
        </div>
      </div>

      <!-- Trips -->
      <h2 class="mt-12 mb-4 text-xl font-semibold text-white">
        Trip cost breakdowns
        <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
          {{ trips.length }}
        </UBadge>
      </h2>

      <UPageGrid class="sm:grid-cols-2 lg:grid-cols-2">
        <UPageCard
          v-for="(trip, i) in trips"
          :key="trip.slug"
          :to="`/t/${trip.slug}`"
          :title="trip.title"
          :description="trip.blurb"
          variant="subtle"
          :ui="{ root: 'hover:bg-elevated/50 hover:ring-default' }"
        >
          <template v-if="trip.image" #header>
            <img
              :src="trip.image"
              :alt="trip.imageAlt ?? trip.title"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :fetchpriority="i === 0 ? 'high' : 'auto'"
              width="1000"
              height="563"
              class="w-full aspect-video object-cover rounded-lg"
            >
          </template>

          <template #footer>
            <dl class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-gray-400">
              <div v-if="trip.spend">
                <dt class="sr-only">Group spend</dt>
                <dd class="font-semibold text-primary-400">{{ trip.spend }}</dd>
              </div>
              <div v-if="trip.perPerson">
                <dt class="sr-only">Per person</dt>
                <dd>{{ trip.perPerson }} each</dd>
              </div>
              <div v-if="trip.people">
                <dt class="sr-only">People</dt>
                <dd>{{ trip.people }} {{ trip.people === 1 ? 'person' : 'people' }}</dd>
              </div>
              <div v-if="trip.expenses">
                <dt class="sr-only">Expenses</dt>
                <dd>{{ trip.expenses }} {{ trip.expenses === 1 ? 'expense' : 'expenses' }}</dd>
              </div>
            </dl>
          </template>
        </UPageCard>
      </UPageGrid>
    </UContainer>

    <MarketingFooter />
  </UMain>
</template>

<style scoped>
.author-prose {
  color: var(--color-gray-300);
  line-height: 1.625;
}
.author-prose :deep(p),
.author-prose :deep(ul),
.author-prose :deep(ol) {
  margin-block: 0;
}
.author-prose :deep(:where(p, ul, ol) + :where(p, ul, ol)) {
  margin-top: 0.75rem;
}
.author-prose :deep(a) {
  color: var(--ui-color-primary-400);
  text-decoration: underline;
}
</style>
