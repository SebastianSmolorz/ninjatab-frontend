import type { Collections } from '@nuxt/content'

type TripStat = Pick<Collections['tripData'], 'slug' | 'settlement_currency' | 'group_spend' | 'people' | 'bills'>
type TripCategories = Pick<Collections['tripCategories'], 'slug' | 'categories' | 'people'>

export type TripCardData = ReturnType<typeof toTripCard>

// The card every trip listing shows: copy from `trips`, figures from `tripData`,
// the split by category from `tripCategories`.
export const toTripCard = (
  trip: Collections['trips'],
  { stats, categories }: { stats: TripStat[], categories: TripCategories[] },
) => {
  const slug = trip.path.split('/').pop()!
  const stat = stats.find(s => s.slug === slug)
  const cats = categories.find(c => c.slug === slug)
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
