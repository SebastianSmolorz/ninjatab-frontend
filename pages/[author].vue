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
  const [stats, categories] = await Promise.all([
    queryCollection('tripData').select('slug', 'settlement_currency', 'group_spend', 'people', 'bills').all(),
    queryCollection('tripCategories').select('slug', 'categories', 'people').all(),
  ])

  return { author, trips, stats, categories }
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const author = computed(() => data.value!.author)

const trips = computed(() => data.value!.trips.map(trip => toTripCard(trip, data.value!)))

const canonical = computed(() => `${SITE}/${slug.value}`)
const title = computed(() => `${author.value.title} | Ninja Tab`)
const ogImage = computed(() =>
  trips.value[0]?.image ? `${SITE}${trips.value[0].image}` : `${SITE}/logo-v2.png`
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

// Downloads from a creator page are attributed like the trip pages are: the
// source names the surface, utm_content carries the specific one.
const joinLink = computed(() => ({
  path: '/join',
  query: {
    go: '1',
    utm_source: 'creator_profile',
    utm_medium: 'referral',
    utm_content: slug.value,
  },
}))

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode,
        webSiteNode,
        {
          '@type': 'ProfilePage',
          '@id': `${canonical.value}#profilepage`,
          url: canonical.value,
          name: author.value.title,
          description: author.value.description,
          inLanguage: 'en',
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORG_ID },
          mainEntity: { '@id': `${canonical.value}#person` },
          breadcrumb: { '@id': `${canonical.value}#breadcrumb` },
          hasPart: { '@id': `${canonical.value}#trips` },
        },
        {
          '@type': 'Person',
          '@id': `${canonical.value}#person`,
          name: author.value.name,
          description: author.value.summary,
          image: author.value.avatar ? `${SITE}${author.value.avatar}` : undefined,
          // The profile page is the entity page being described here, so it is
          // the Person's `url`; their own site and socials are `sameAs`.
          url: canonical.value,
          nationality: author.value.nationality,
          knowsAbout: author.value.knowsAbout,
          sameAs: [author.value.website, author.value.instagram, author.value.tiktok].filter(Boolean),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical.value}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: author.value.name, item: canonical.value },
          ],
        },
        {
          '@type': 'ItemList',
          '@id': `${canonical.value}#trips`,
          name: `${author.value.name} trip cost breakdowns`,
          numberOfItems: trips.value.length,
          // Each entry is the same node the trip page defines, so the list
          // resolves into the real articles rather than a set of loose links.
          itemListElement: trips.value.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: data.value!.trips[i]!.title,
            item: {
              '@type': 'Article',
              '@id': `${SITE}/t/${t.slug}#article`,
              name: data.value!.trips[i]!.title,
              url: `${SITE}/t/${t.slug}`,
            },
          })),
        },
      ],
    }),
  }],
}))
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900 pb-12">
    <UContainer class="relative max-w-5xl pt-20 pb-20">
      <!-- Author -->
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
          <h1 class="mt-1 text-3xl sm:text-5xl font-bold text-white text-balance">
            {{ author.name }}
            <span v-if="author.flag">{{ author.flag }}</span>
          </h1>
        </div>
      </div>
      <p v-if="author.tagline" class="mt-3 max-w-2xl text-gray-400 sm:text-lg">{{ author.tagline }}</p>
      <!-- Native <details>: collapsed for readers, still in the HTML for crawlers. -->
      <details class="group/more mt-2 max-w-2xl text-sm text-gray-400">
        <summary class="inline-flex cursor-pointer list-none items-center gap-1 text-primary-400 hover:text-primary-300 [&::-webkit-details-marker]:hidden">
          About {{ author.name }}
          <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open/more:rotate-180" />
        </summary>
        <ContentRenderer :value="author" class="mt-3 author-prose" />
      </details>

      <div class="mt-5 flex flex-wrap gap-2">
        <UButton
          v-if="author.website"
          :to="author.website"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-external-link"
          class="rounded-full"
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
          class="rounded-full"
        >
          @{{ author.instagram.split('/').filter(Boolean).pop() }}
        </UButton>
        <!-- ponytail: lucide ships no TikTok glyph; music-2 until a brand icon set is worth adding -->
        <UButton
          v-if="author.tiktok"
          :to="author.tiktok"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="subtle"
          icon="i-lucide-music-2"
          class="rounded-full"
        >
          {{ author.tiktok.split('/').filter(Boolean).pop() }}
        </UButton>
      </div>

      <!-- Trips -->
      <h2 class="mt-10 text-2xl sm:text-3xl font-bold text-white">
        Trip cost breakdowns
        <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
          {{ trips.length }}
        </UBadge>
      </h2>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <TripCard v-for="(trip, i) in trips" :key="trip.slug" :trip="trip" :eager="i < 3" />
      </div>
    </UContainer>

    <MarketingFooter />

    <TripCta :to="joinLink" />
  </UMain>
</template>

<style scoped>
.author-prose {
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
