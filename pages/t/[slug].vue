<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const slug = computed(() => String(route.params.slug))

// Everything the overview needs comes off disk via @nuxt/content: the numbers
// from the exported `tripdata` doc, the copy from the hand-written `trips` doc.
// No API call, so the page renders identically in dev, in prod and if the
// backend is down. `bill_details` is deliberately left out of the select — it
// is the bulk of the payload and only the drill-down reads it.
const { data } = await useAsyncData(`trip-${slug.value}`, async () => {
  const [copy, tab] = await Promise.all([
    queryCollection('trips').path(`/trips/${slug.value}`).first(),
    queryCollection('tripData')
      .path(`/tripdata/${slug.value}`)
      .select('name', 'settlement_currency', 'group_spend', 'people', 'settlements', 'bills', 'body')
      .first(),
  ])
  const author = copy?.author
    ? await queryCollection('authors')
      .path(`/authors/${copy.author}`)
      .select('path', 'name', 'avatar', 'tagline', 'flag', 'website', 'instagram')
      .first()
    : null
  return { copy, tab, author }
})

if (!data.value?.tab) {
  throw createError({ statusCode: 404, statusMessage: 'Tab not found', fatal: true })
}

const tab = computed(() => data.value!.tab!)
const copy = computed(() => data.value?.copy ?? null)
const author = computed(() => data.value?.author ?? null)

// A hand-written body on the trip doc wins over the tab's own description, so
// a page can carry proper intro copy without editing the tab in the app.
const introDoc = computed(() =>
  copy.value?.body?.value?.length ? copy.value : tab.value
)

const canonical = computed(() => `https://tab.ninja/t/${slug.value}`)
const heading = computed(() => copy.value?.heading ?? copy.value?.title ?? tab.value.name)
const pageTitle = computed(() =>
  copy.value?.title ? `${copy.value.title} | Ninja Tab` : `${tab.value.name} – Ninja Tab`
)
const pageDescription = computed(() =>
  copy.value?.description ?? 'A shared tab, split down to the line item.'
)
const ogImage = computed(() =>
  copy.value?.image ? `https://tab.ninja${copy.value.image}` : 'https://tab.ninja/logo-v2.png'
)

useSeoMeta({
  title: () => pageTitle.value,
  ogTitle: () => copy.value?.ogTitle ?? pageTitle.value,
  description: () => pageDescription.value,
  ogDescription: () => copy.value?.ogDescription ?? pageDescription.value,
  ogUrl: () => canonical.value,
  ogType: 'article',
  ogSiteName: 'Ninja Tab',
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
})

const SITE = 'https://tab.ninja'
const ORGANISATION = `${SITE}/#organization`

// The creator's `@id` here is the same node the author page defines, so a trip
// and its creator reconcile into one entity across the two pages. Trips without
// a creator fall back to Ninja Tab as the author.
const authorNode = computed(() => {
  const slugged = copy.value?.author
  if (!slugged || !author.value) return null
  return {
    '@type': 'Person',
    '@id': `${SITE}/${slugged}#person`,
    name: author.value.name,
    url: `${SITE}/${slugged}`,
    ...(author.value.avatar ? { image: `${SITE}${author.value.avatar}` } : {}),
    sameAs: [author.value.website, author.value.instagram].filter(Boolean),
  }
})

const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${canonical.value}#article`,
      headline: copy.value?.title ?? tab.value.name,
      description: pageDescription.value,
      image: ogImage.value,
      inLanguage: 'en',
      isAccessibleForFree: true,
      mainEntityOfPage: canonical.value,
      author: { '@id': authorNode.value?.['@id'] ?? ORGANISATION },
      publisher: { '@id': ORGANISATION },
      ...(copy.value?.date ? { datePublished: copy.value.date } : {}),
    },
    ...(authorNode.value ? [authorNode.value] : []),
    {
      '@type': 'Organization',
      '@id': ORGANISATION,
      name: 'Ninja Tab',
      url: `${SITE}/`,
      logo: `${SITE}/logo-v2.png`,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical.value}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: `${SITE}/` },
        ...(authorNode.value
          ? [{ '@type': 'ListItem', position: 2, name: authorNode.value.name, item: authorNode.value.url }]
          : []),
        {
          '@type': 'ListItem',
          position: authorNode.value ? 3 : 2,
          name: copy.value?.title ?? tab.value.name,
          item: canonical.value,
        },
      ],
    },
  ],
}))

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd.value) }],
}))

// The bill drill-down is a query param rather than a nested route: same data,
// one page, and the browser back button still works. The line items are pulled
// on demand, and always in the browser — this page is prerendered, so the build
// never sees a query string to render them from.
const { data: details, execute: loadDetails } = await useAsyncData(
  `trip-bills-${slug.value}`,
  () => queryCollection('tripData').path(`/tripdata/${slug.value}`).select('bill_details').first(),
  { immediate: false },
)

watch(() => route.query.bill, (id) => {
  if (id && !details.value) loadDetails()
}, { immediate: true })

const bill = computed(() => {
  const summary = tab.value.bills.find(b => b.id === route.query.bill)
  if (!summary) return null
  const detail = details.value?.bill_details?.find(d => d.id === summary.id)
  return { ...summary, person_totals: detail?.person_totals ?? [], line_items: detail?.line_items ?? [] }
})

const openBill = (id: string) => router.push({ query: { bill: id } })
const closeBill = () => router.push({ query: {} })

// Downloads from a shared tab are attributed like the QR surface is: the source
// names the surface, utm_content carries the specific one (here, the slug).
const joinLink = computed(() => ({
  path: '/join',
  query: {
    go: '1',
    utm_source: 'public_tab',
    utm_medium: 'referral',
    utm_content: slug.value,
  },
}))

const currency = computed(() => tab.value.settlement_currency)
const money = (amount: number, code?: string) => formatMinorCurrency(amount, code ?? currency.value)
// Headline figures only — bills and settlements stay exact to the cent.
const summaryMoney = (amount: number) => formatMinorCurrencyCompact(amount, currency.value)

const longDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const showAllPeople = ref(false)
const showDescription = ref(false)

const claimFor = (item: { claims: { person_id: string }[] }, personId: string) =>
  item.claims.find(c => c.person_id === personId)

// Even means every person on the tab is involved AND carries equal shares.
// Leaving anyone out makes it a custom split, however equal the rest are.
const isEven = (item: { claims: { split_value: number | null }[] }) =>
  item.claims.length > 0 &&
  item.claims.length === tab.value.people.length &&
  item.claims.every(c => (c.split_value ?? 0) === (item.claims[0]!.split_value ?? 0))

// Group spend averaged over the roster. Rounded to whole minor units, so the
// per-person figures need not sum back to the group total.
const perPerson = computed(() => {
  const spend = tab.value.group_spend
  const heads = tab.value.people.length
  if (spend === null || spend === undefined || heads === 0) return null
  return Math.round(spend / heads)
})
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--ui-color-primary-500)/12%,_transparent_55%)] pointer-events-none" />

    <UContainer class="relative z-10 max-w-2xl pt-20 pb-32">
      <!-- ── Bill detail ────────────────────────────────────────────────── -->
      <div v-if="bill" class="space-y-5">
        <button
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          @click="closeBill"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
          <span>Back</span>
        </button>

        <h1 class="text-xl sm:text-2xl font-bold text-white">{{ bill.description }}</h1>

        <div class="rounded-2xl bg-gray-800/60 ring-1 ring-white/5 overflow-hidden">
          <div class="py-8 text-center">
            <div class="text-4xl sm:text-5xl font-bold text-primary-400">
              {{ money(bill.total_amount, bill.currency) }}
            </div>
          </div>
          <div class="border-t border-white/5 p-4 sm:p-5 space-y-2 text-sm">
            <div class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-2 text-gray-300">
                <UIcon name="i-lucide-calendar" class="size-4 text-gray-500" />
                {{ longDate(bill.date) }}
              </span>
              <span class="text-gray-300">{{ getCurrencySymbol(bill.currency) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-gray-500">
              <span>Created by <span class="text-white font-medium">{{ bill.created_by }}</span></span>
              <span v-if="bill.paid_by">Paid by <span class="text-white font-medium">{{ bill.paid_by }}</span></span>
            </div>
          </div>
        </div>

        <!-- Presigned S3 URLs expire, so they are never exported. This hits an
             endpoint that signs one on the spot and redirects. -->
        <a
          v-if="bill.has_receipt"
          :href="`${config.public.apiBaseUrl}/tabs/public/${slug}/receipt/${bill.id}`"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-center gap-2 w-full py-3 rounded-xl ring-1 ring-white/10 text-gray-200 hover:bg-white/5 transition-colors"
        >
          <UIcon name="i-lucide-receipt" class="size-5" />
          View receipt
        </a>

        <section v-if="bill.person_totals.length">
          <h2 class="text-lg font-semibold text-white mb-2">Per person</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="pt in bill.person_totals"
              :key="pt.person_id"
              class="rounded-xl bg-gray-800/60 ring-1 ring-white/5 p-3"
            >
              <div class="text-white font-medium truncate">{{ pt.person_name }}</div>
              <div class="text-gray-400">{{ money(pt.amount, bill.currency) }}</div>
            </div>
          </div>
        </section>

        <section v-if="bill.line_items.length">
          <h2 class="text-lg font-semibold text-white mb-2">
            Items
            <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
              {{ bill.line_items.length }}
            </UBadge>
          </h2>
          <div class="space-y-3">
            <div
              v-for="item in bill.line_items"
              :key="item.id"
              class="rounded-xl bg-gray-800/60 ring-1 ring-white/5 p-4 space-y-3"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-white font-medium">{{ item.description }}</span>
                <span class="text-primary-400 font-semibold whitespace-nowrap">
                  {{ money(item.value, bill.currency) }}
                </span>
              </div>

              <!-- Split mode. Rendered as inert divs, not buttons: this view is
                   read-only, so nothing here should look or behave tappable. -->
              <div class="grid grid-cols-2 gap-2" role="img" :aria-label="isEven(item) ? 'Split evenly' : 'Custom split'">
                <div
                  v-for="mode in ['Split evenly', 'Custom split']"
                  :key="mode"
                  class="rounded-lg py-2 text-center text-sm font-medium"
                  :class="(mode === 'Split evenly') === isEven(item)
                    ? 'bg-primary-500 text-gray-900'
                    : 'ring-1 ring-white/10 text-gray-500'"
                >
                  {{ mode }}
                </div>
              </div>

              <template v-if="item.claims.length">
                <!-- An even split is fully described by the per-person amounts
                     below, so the name/share grid is only for custom splits. -->
                <div v-if="!isEven(item)">
                  <p class="text-sm text-gray-500 mb-2">Who's involved</p>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div v-for="person in tab.people" :key="person.id" class="space-y-1">
                      <div
                        class="rounded-lg py-2 px-2 text-center text-sm font-medium truncate"
                        :class="claimFor(item, person.id)
                          ? 'bg-primary-500 text-gray-900'
                          : 'ring-1 ring-white/10 text-gray-500'"
                      >
                        {{ person.name }}
                      </div>
                      <div
                        v-if="item.split_type === 'shares' && claimFor(item, person.id)"
                        class="mx-auto w-fit rounded-md ring-1 ring-white/10 px-1.5 py-0.5 text-xs text-gray-300"
                      >
                        {{ claimFor(item, person.id)!.split_value }}x
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-white/5 pt-3 space-y-1.5">
                  <div
                    v-for="claim in item.claims"
                    :key="claim.person_id"
                    class="flex items-center justify-between gap-3 text-sm"
                  >
                    <span class="text-gray-300 truncate">{{ claim.person_name }}</span>
                    <span class="text-gray-200 whitespace-nowrap">
                      {{ money(claim.amount ?? 0, bill.currency) }}
                    </span>
                  </div>
                </div>
              </template>
              <p v-else class="text-sm text-gray-500">Not split yet</p>
            </div>
          </div>
        </section>
      </div>

      <!-- ── Tab overview ───────────────────────────────────────────────── -->
      <div v-else class="space-y-5">
        <div class="rounded-2xl bg-gray-800/60 ring-1 ring-white/5 p-5 sm:p-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ heading }}</h1>
          <!-- Clamped with CSS, not JS: the full description stays in the HTML
               for crawlers even while it renders as a couple of lines. -->
          <button
            class="flex items-start gap-1 w-full mt-1 text-left"
            :aria-expanded="showDescription"
            @click="showDescription = !showDescription"
          >
            <ContentRenderer
              :value="introDoc"
              class="flex-1 trip-prose"
              :class="!showDescription && 'line-clamp-2'"
            />
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 shrink-0 mt-1.5 text-gray-400 transition-transform"
              :class="showDescription && 'rotate-180'"
            />
          </button>
        </div>

        <!-- Author byline. The tab links to the creator's page and the creator's
             page links back, so a trip is never a dead end. -->
        <NuxtLink
          v-if="author"
          :to="`/${copy!.author}`"
          class="flex items-center gap-3 rounded-2xl bg-gray-800/60 ring-1 ring-white/5 px-4 py-2.5 hover:bg-gray-800 transition-colors"
        >
          <UAvatar :src="author.avatar" :alt="author.name" size="lg" class="shrink-0 ring-1 ring-white/10" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-400">Trip by</p>
            <p class="text-white font-small truncate">
              {{ author.name }} <span v-if="author.flag">{{ author.flag }}</span>
            </p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-5 text-gray-500 shrink-0" />
        </NuxtLink>

        <!-- Read-only: no Pay action here, unlike the in-app view. -->
        <section v-if="tab.settlements.length">
          <h2 class="text-lg font-semibold text-white mb-2">Who pays who</h2>
          <div class="rounded-xl bg-gray-800/60 ring-1 ring-white/5 divide-y divide-white/5">
            <div
              v-for="(s, i) in tab.settlements"
              :key="i"
              class="flex items-center gap-2 px-3 py-2.5 text-sm"
            >
              <span class="text-white font-medium truncate">{{ s.from_name }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-500 shrink-0" />
              <span class="text-white font-medium truncate">{{ s.to_name }}</span>
              <span class="ml-auto flex items-center gap-2 shrink-0">
                <span class="font-semibold" :class="s.paid ? 'text-gray-500 line-through' : 'text-primary-400'">
                  {{ money(s.amount, s.currency) }}
                </span>
                <UIcon v-if="s.paid" name="i-lucide-check" class="size-4 text-primary-400" />
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-white mb-2">Spending summary</h2>
          <div class="grid grid-cols-3 rounded-xl bg-gray-800/60 ring-1 ring-white/5 divide-x divide-white/10">
            <div class="p-3 sm:p-4 text-center">
              <div class="text-xs text-gray-500">Group spend</div>
              <div class="text-base sm:text-lg font-semibold text-white mt-1">
                {{ tab.group_spend === null ? '—' : summaryMoney(tab.group_spend) }}
              </div>
            </div>
            <div class="p-3 sm:p-4 text-center">
              <div class="text-xs text-gray-500">Expenses</div>
              <div class="text-base sm:text-lg font-semibold text-white mt-1">{{ tab.bills.length }}</div>
            </div>
            <div class="p-3 sm:p-4 text-center">
              <div class="text-xs text-gray-500">Per person</div>
              <div class="text-base sm:text-lg font-semibold text-white mt-1">
                {{ perPerson === null ? '—' : summaryMoney(perPerson) }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between gap-1 mb-2">
            <h2 class="text-lg font-semibold text-white">
              People
              <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
                {{ tab.people.length }}
              </UBadge>
            </h2>
            <button
              class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              @click="showAllPeople = !showAllPeople"
            >
              {{ showAllPeople ? 'Hide people' : 'Show people' }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 transition-transform"
                :class="showAllPeople && 'rotate-180'"
              />
            </button>
          </div>
          <div v-if="showAllPeople" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="person in tab.people"
              :key="person.id"
              class="flex items-center gap-3 rounded-xl bg-gray-800/60 ring-1 ring-white/5 p-3"
            >
              <div
                class="size-10 shrink-0 rounded-full flex items-center justify-center font-semibold bg-primary-900/60 text-primary-300"
              >
                {{ person.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-white font-medium truncate">{{ person.name }}</div>
              </div>
              <div class="text-sm text-gray-300 whitespace-nowrap">{{ summaryMoney(person.spend) }}</div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-white mb-2">
            Expenses
            <UBadge color="neutral" variant="subtle" size="md" class="ml-2 rounded-full align-middle">
              {{ tab.bills.length }}
            </UBadge>
          </h2>
          <div v-if="tab.bills.length" class="space-y-3">
            <button
              v-for="b in tab.bills"
              :key="b.id"
              class="w-full flex items-center gap-3 text-left rounded-xl bg-gray-800/60 ring-1 ring-white/5 p-4 hover:bg-gray-800 transition-colors"
              @click="openBill(b.id)"
            >
              <div class="min-w-0 flex-1">
                <div class="text-white font-medium truncate">{{ b.description }}</div>
                <div class="text-sm text-gray-500 truncate">
                  <template v-if="b.paid_by">Paid by {{ b.paid_by }}</template>
                </div>
              </div>
              <span class="font-semibold text-white whitespace-nowrap">
                {{ money(b.total_amount, b.currency) }}
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 text-gray-500 shrink-0" />
            </button>
          </div>
          <p v-else class="text-gray-500">No expenses on this tab yet.</p>
        </section>
      </div>
    </UContainer>

    <!-- Fixed download CTA. Lives outside the view branches so it is present on
         the tab and the bill drill-down alike. -->
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

<style scoped>
/* Nuxt UI's prose components ship `my-5`, which is right for an article body
   and far too much inside a header card — it opens a 20px gap under the h1 and
   drops the text away from the caret. Outer margins go, spacing between blocks
   stays. */
.trip-prose {
  color: var(--color-gray-400);
}
.trip-prose :deep(p),
.trip-prose :deep(ul),
.trip-prose :deep(ol) {
  margin-block: 0;
}
.trip-prose :deep(:where(p, ul, ol) + :where(p, ul, ol)) {
  margin-top: 0.75rem;
}
.trip-prose :deep(strong) {
  color: var(--color-gray-200);
}
.trip-prose :deep(a) {
  color: var(--ui-color-primary-400);
  text-decoration: underline;
}
.trip-prose :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
</style>
