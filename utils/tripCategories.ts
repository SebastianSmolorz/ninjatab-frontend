// Presentation for the keys in content/tripcategories (see
// scripts/trip_categories.py). Full class strings so Tailwind picks them up.

export const CATEGORY_COLORS: Record<string, string> = {
  accommodation: 'bg-sky-500',
  flights: 'bg-indigo-400',
  getting_around: 'bg-teal-500',
  activities: 'bg-emerald-400',
  food_drink: 'bg-amber-400',
  alcohol: 'bg-rose-500',
  shopping: 'bg-fuchsia-400',
  other: 'bg-gray-500',
}

export const VENUE_ICONS: Record<string, string> = {
  restaurant: 'i-lucide-utensils',
  bar: 'i-lucide-beer',
  supermarket: 'i-lucide-shopping-cart',
  shop: 'i-lucide-shopping-bag',
  accommodation: 'i-lucide-bed-double',
  transport: 'i-lucide-bus',
  activity: 'i-lucide-ticket',
  other: 'i-lucide-tag',
}
