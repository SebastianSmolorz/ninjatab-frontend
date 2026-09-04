<script setup lang="ts">
// Hard-coded rather than fetched: these are finished trips, the numbers don't
// move, and baking them in means the page renders identically on the server,
// in dev, and without the API being reachable.
const TRIPS: {
  slug: string
  name: string
  image?: string
  alt?: string
  blurb: string
  spend: string
  perPerson: string
  people: number
  expenses: number
}[] = [
  {
    slug: 'kyrgyzstan',
    name: 'Kyrgyzstan',
    image: '/trip-kyrgyzstan.jpg',
    alt: 'Looking down on the turquoise Ala-Kol lake in Kyrgyzstan',
    blurb: 'Two weeks of yurts, taxis and a five-day horse trek. Song-Köl, the Ala-Köl pass at 3,900m, and Bishkek either side.',
    spend: '$2,541',
    perPerson: '$635',
    people: 4,
    expenses: 22,
  },
  {
    slug: 'uzbekistan',
    name: 'Uzbekistan',
    image: '/trip-uzbekistan.jpg',
    alt: 'Tiled mausoleum facades at Shah-i-Zinda in Samarkand, Uzbekistan',
    blurb: 'The Silk Road by train. Tashkent, Samarkand and Bukhara.',
    spend: 'A$1,550',
    perPerson: 'A$387',
    people: 4,
    expenses: 19,
  },
  {
    slug: 'peru',
    name: 'Peru',
    image: '/trip-peru.jpg',
    alt: 'Glacial lake below the Salkantay mountains on the trek to Machu Picchu, Peru',
    blurb: 'Coast first, then the Andes: Lima, Huacachina, Cusco and the Salkantay trek into Machu Picchu.',
    spend: '$3,908',
    perPerson: '$977',
    people: 4,
    expenses: 23,
  },
  {
    slug: 'kazakhstan',
    name: 'Kazakhstan',
    image: '/trip-kazakhstan.jpg',
    alt: 'Sunken trees in Lake Kaindy, Kazakhstan',
    blurb: 'Almaty as a base for the Tian Shan lakes and canyons, plus the Mangystau desert out west.',
    spend: '$1,936',
    perPerson: '$484',
    people: 4,
    expenses: 16,
  },
  {
    slug: 'bali',
    name: 'Bali',
    image: '/trip-bali.jpg',
    alt: 'Surfers in the water off Bali at sunset',
    blurb: 'A week in Bali, four ways: villa, scooters, warung dinners, drinks in Canggu and a Nusa Penida day trip.',
    spend: 'A$3,681',
    perPerson: 'A$920',
    people: 4,
    expenses: 18,
  },
]

const canonical = 'https://tab.ninja/madlertravel'
const title = 'Madlertravel Trip Costs: 5 Real Budget Trips'
const description = 'What Madlertravel\u2019s trips actually cost: Kyrgyzstan, Uzbekistan, Peru, Kazakhstan and Bali, split four ways, every expense tracked in Ninja Tab.'
const ogImage = 'https://tab.ninja/trip-kyrgyzstan.jpg'

useSeoMeta({
  title: `${title} | Ninja Tab`,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonical,
  ogType: 'profile',
  ogSiteName: 'Ninja Tab',
  ogImage,
  ogImageWidth: 1000,
  ogImageHeight: 563,
  ogImageAlt: 'Looking down on the turquoise Ala-Kol lake in Kyrgyzstan',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': canonical,
          url: canonical,
          name: title,
          description,
          inLanguage: 'en',
          mainEntity: { '@id': `${canonical}#person` },
          breadcrumb: { '@id': `${canonical}#breadcrumb` },
        },
        {
          '@type': 'Person',
          '@id': `${canonical}#person`,
          name: 'Madlertravel',
          description: 'Adventure travel writer publishing firsthand budget travel guides from 37+ countries.',
          image: 'https://tab.ninja/madlertravel.jpg',
          url: 'https://madlertravel.com/',
          nationality: 'Australian',
          knowsAbout: ['Budget travel', 'Adventure travel', 'Kyrgyzstan', 'Uzbekistan', 'Peru', 'Kazakhstan', 'Bali'],
          sameAs: ['https://madlertravel.com/', 'https://instagram.com/madlertravel'],
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: 'https://tab.ninja/' },
            { '@type': 'ListItem', position: 2, name: 'Madlertravel', item: canonical },
          ],
        },
        {
          '@type': 'ItemList',
          name: 'Madlertravel trip cost breakdowns',
          numberOfItems: TRIPS.length,
          itemListElement: TRIPS.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${t.name} trip cost`,
            url: `https://tab.ninja/t/${t.slug}`,
          })),
        },
      ],
    }),
  }],
})
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900">
    <div class="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4">
      <NuxtLink to="/">
        <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto">
      </NuxtLink>
      <UButton to="/join" size="md" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
    </div>

    <UContainer class="relative max-w-3xl pt-28 pb-20">
      <!-- Author -->
      <div class="rounded-2xl bg-gray-800/60 ring-1 ring-white/5 p-5 sm:p-6">
        <div class="flex items-center gap-4">
          <UAvatar
            src="/madlertravel.jpg"
            alt="Madlertravel profile picture"
            size="3xl"
            class="shrink-0 ring-1 ring-white/10"
          />
          <div class="min-w-0">
            <p class="text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">Trips by</p>
            <h1 class="text-2xl sm:text-4xl font-bold text-white">
              Madlertravel
              <span role="img" aria-label="Australia">🇦🇺</span>
            </h1>
            <p class="text-sm sm:text-base text-gray-400">Adventure travel guides, built from real trips</p>
          </div>
        </div>

        <p class="mt-5 text-gray-300 leading-relaxed">
          Madlertravel publishes firsthand adventure travel guides from 37+ countries. Real routes,
          real decisions, no recycled advice. The focus is budget adventure travel: unusual trips most
          people never attempt, planned so they stay accessible on a normal budget.
        </p>

        <div class="mt-5 flex flex-wrap gap-3">
          <UButton
            to="https://madlertravel.com/"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide-external-link"
          >
            madlertravel.com
          </UButton>
          <UButton
            to="https://instagram.com/madlertravel"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="subtle"
            icon="i-lucide-instagram"
          >
            @madlertravel
          </UButton>
        </div>
      </div>

      <!-- Trips -->
      <h2 class="mt-12 mb-4 text-xl font-semibold text-white">
        Trip cost breakdowns
        <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
          {{ TRIPS.length }}
        </UBadge>
      </h2>

      <UPageGrid class="sm:grid-cols-2 lg:grid-cols-2">
        <UPageCard
          v-for="(trip, i) in TRIPS"
          :key="trip.slug"
          :to="`/t/${trip.slug}`"
          :title="`${trip.name} trip cost`"
          :description="trip.blurb"
          variant="subtle"
          :ui="{ root: 'hover:bg-elevated/50 hover:ring-default' }"
        >
          <template v-if="trip.image" #header>
            <img
              :src="trip.image"
              :alt="trip.alt ?? `${trip.name} trip`"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :fetchpriority="i === 0 ? 'high' : 'auto'"
              width="1000"
              height="563"
              class="w-full aspect-video object-cover rounded-lg"
            >
          </template>

          <template #footer>
            <dl class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-gray-400">
              <div>
                <dt class="sr-only">Group spend</dt>
                <dd class="font-semibold text-primary-400">{{ trip.spend }}</dd>
              </div>
              <div>
                <dt class="sr-only">Per person</dt>
                <dd>{{ trip.perPerson }} each</dd>
              </div>
              <div>
                <dt class="sr-only">People</dt>
                <dd>{{ trip.people }} people</dd>
              </div>
              <div>
                <dt class="sr-only">Expenses</dt>
                <dd>{{ trip.expenses }} expenses</dd>
              </div>
            </dl>
          </template>
        </UPageCard>
      </UPageGrid>
    </UContainer>

    <MarketingFooter />
  </UMain>
</template>
