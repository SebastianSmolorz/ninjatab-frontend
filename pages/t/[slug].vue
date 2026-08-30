<script setup lang="ts">
type PublicClaim = {
  person_id: string
  person_name: string
  split_value: number | null
  amount: number | null
}
type PublicLineItem = {
  id: string
  description: string
  value: number
  split_type: 'shares' | 'value'
  claims: PublicClaim[]
}
type PublicBill = {
  id: string
  description: string
  currency: string
  date: string
  total_amount: number
  created_by: string
  paid_by: string | null
  receipt_image_url: string
  person_totals: { person_id: string; person_name: string; amount: number }[]
  line_items: PublicLineItem[]
}
type PublicTab = {
  id: string
  name: string
  description: string
  settlement_currency: string
  is_settled: boolean
  is_pro: boolean
  group_spend: number | null
  people: { id: string; name: string; spend: number }[]
  bills: PublicBill[]
  settlements: { from_name: string; to_name: string; amount: number; currency: string; paid: boolean }[]
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const { data: tab, error } = await useFetch<PublicTab>(
  () => `${config.public.apiBaseUrl}/tabs/public/${route.params.slug}`
)

useSeoMeta({
  title: () => (tab.value ? `${tab.value.name} – Ninja Tab` : 'Ninja Tab'),
  ogTitle: () => (tab.value ? `${tab.value.name} on Ninja Tab` : 'Ninja Tab'),
  ogDescription: 'A shared tab, split down to the line item.',
  ogImage: 'https://tab.ninja/logo-v2.png',
  robots: 'noindex',
})

// The bill drill-down is a query param rather than a nested route: same data,
// one fetch, and the browser back button still works.
const bill = computed(() => tab.value?.bills.find(b => b.id === route.query.bill) ?? null)
const openBill = (id: string) => router.push({ query: { bill: id } })

// Downloads from a shared tab are attributed like the QR surface is: the source
// names the surface, utm_content carries the specific one (here, the slug).
const joinLink = computed(() => ({
  path: '/join',
  query: {
    go: '1',
    utm_source: 'public_tab',
    utm_medium: 'referral',
    utm_content: String(route.params.slug),
  },
}))
const closeBill = () => router.push({ query: {} })

const currency = computed(() => tab.value?.settlement_currency ?? 'GBP')
const money = (amount: number, code?: string) => formatMinorCurrency(amount, code ?? currency.value)

const longDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const showAllPeople = ref(false)

const claimFor = (item: PublicLineItem, personId: string) =>
  item.claims.find(c => c.person_id === personId)

// Even means every person on the tab is involved AND carries equal shares.
// Leaving anyone out makes it a custom split, however equal the rest are.
// Group spend averaged over the roster. Rounded to whole minor units, so the
// per-person figures need not sum back to the group total.
const perPerson = computed(() => {
  const spend = tab.value?.group_spend
  const heads = tab.value?.people.length ?? 0
  if (spend === null || spend === undefined || heads === 0) return null
  return Math.round(spend / heads)
})

const isEven = (item: PublicLineItem) =>
  item.claims.length > 0 &&
  item.claims.length === (tab.value?.people.length ?? 0) &&
  item.claims.every(c => (c.split_value ?? 0) === (item.claims[0]!.split_value ?? 0))
</script>

<template>
  <UMain class="relative min-h-screen bg-gray-900">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--ui-color-primary-500)/12%,_transparent_55%)] pointer-events-none" />

    <UContainer class="relative z-10 max-w-2xl pt-20 pb-32">
      <UAlert
        v-if="error"
        icon="i-lucide-eye-off"
        variant="soft"
        color="neutral"
        title="Tab not available"
        description="This tab is private or the link is no longer valid."
      />

      <!-- ── Bill detail ────────────────────────────────────────────────── -->
      <div v-else-if="bill" class="space-y-5">
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
              <span class="text-gray-300">{{ bill.currency }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-gray-500">
              <span>Created by <span class="text-white font-medium">{{ bill.created_by }}</span></span>
              <span v-if="bill.paid_by">Paid by <span class="text-white font-medium">{{ bill.paid_by }}</span></span>
            </div>
          </div>
        </div>

        <a
          v-if="bill.receipt_image_url"
          :href="bill.receipt_image_url"
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

        <section>
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
      <div v-else-if="tab" class="space-y-6">
        <div class="rounded-2xl bg-gray-800/60 ring-1 ring-white/5 p-5 sm:p-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ tab.name }}</h1>
          <p v-if="tab.description" class="text-gray-400 mt-2">{{ tab.description }}</p>
        </div>

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
                {{ tab.group_spend === null ? '—' : money(tab.group_spend) }}
              </div>
            </div>
            <div class="p-3 sm:p-4 text-center">
              <div class="text-xs text-gray-500">Expenses</div>
              <div class="text-base sm:text-lg font-semibold text-white mt-1">{{ tab.bills.length }}</div>
            </div>
            <div class="p-3 sm:p-4 text-center">
              <div class="text-xs text-gray-500">Per person</div>
              <div class="text-base sm:text-lg font-semibold text-white mt-1">
                {{ perPerson === null ? '—' : money(perPerson) }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between gap-3 mb-2">
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
              <div class="text-sm text-gray-300 whitespace-nowrap">{{ money(person.spend) }}</div>
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
                  {{ shortDate(b.date) }}<template v-if="b.paid_by"> · Paid by {{ b.paid_by }}</template>
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
         the tab, the bill drill-down and the not-found state alike. -->
    <div
      class="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#01e474] pb-[env(safe-area-inset-bottom)]"
    >
      <div class="mx-auto max-w-2xl px-4 py-3 flex flex-col items-center gap-1">
        <p class="text-sm sm:text-base text-gray-900 font-medium leading-snug text-center">
          <strong>Track</strong> and <strong>split</strong> your own trip expenses
        </p>
        <NuxtLink
          :to="joinLink"
          class="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          With Ninja Tab
          <UIcon name="i-lucide-arrow-right" class="size-3.5" />
        </NuxtLink>
      </div>
    </div>
  </UMain>
</template>
