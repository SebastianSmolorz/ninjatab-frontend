<script setup lang="ts">
import type { TripCardData } from '~/utils/tripCard'

defineProps<{ trip: TripCardData, eager?: boolean }>()
</script>

<template>
  <NuxtLink
    :to="`/t/${trip.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl bg-gray-800/60 ring-1 ring-white/5 hover:ring-primary-500/40 hover:bg-gray-800 transition"
  >
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="trip.image"
        :src="trip.image"
        :alt="trip.imageAlt"
        :loading="eager ? 'eager' : 'lazy'"
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
          v-if="trip.recorded"
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
          v-if="trip.style"
          color="neutral"
          variant="solid"
          size="sm"
          :icon="trip.style === 'adventure' ? 'i-lucide-mountain-snow' : 'i-lucide-sun'"
          class="rounded-full capitalize"
        >
          {{ trip.style }}
        </UBadge>
      </div>
      <div class="absolute bottom-3 left-4 right-4">
        <div class="flex items-center gap-1.5 text-base font-semibold text-white">
          <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-primary-400" />
          <span class="truncate">{{ trip.place }}</span>
        </div>
        <div v-if="trip.flights && trip.flightsFrom" class="flex items-center gap-1 text-[11px] text-gray-400">
          <UIcon name="i-lucide-plane-takeoff" class="size-3" />
          From {{ trip.flightsFrom }}
        </div>
        <div class="flex items-baseline gap-1.5 text-white">
          <span class="text-3xl font-bold tracking-tight">{{ trip.perPerson ?? '-' }}</span>
          <span class="text-sm text-gray-300">avg per person</span>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-users" class="size-3.5" />{{ trip.people }} {{ trip.people === 1 ? 'person' : 'people' }}
        </span>
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-receipt-text" class="size-3.5" />{{ trip.expenses }} expenses
        </span>
        <span class="flex items-center gap-1" :class="trip.flights ? 'text-indigo-300' : ''">
          <UIcon :name="trip.flights ? 'i-lucide-plane' : 'i-lucide-plane-landing'" class="size-3.5" />
          {{ trip.flights ? `incl. ${trip.flights} flights` : 'No flights' }}
        </span>
      </div>
      <p class="text-sm text-gray-300 line-clamp-2">{{ trip.blurb }}</p>

      <div v-if="trip.segments.length" class="mt-auto pt-1">
        <div class="flex h-5 overflow-hidden rounded-md bg-white/5">
          <!-- ponytail: CSS-only fit check. The zero-width spacer pins line 1;
               an icon wider than its segment wraps to line 2 and is clipped. -->
          <div
            v-for="s in trip.segments"
            :key="s.key"
            class="min-w-0 flex flex-wrap justify-center overflow-hidden"
            :class="CATEGORY_COLORS[s.key] ?? 'bg-gray-500'"
            :style="{ flex: `${s.amount} 0 0` }"
            :title="`${s.label} ${trip.money(s.amount)}`"
          >
            <span class="h-full w-0" aria-hidden="true" />
            <span class="self-center flex px-1 text-gray-950">
              <UIcon :name="CATEGORY_ICONS[s.key] ?? 'i-lucide-ellipsis'" class="size-3.5" />
            </span>
          </div>
        </div>
        <div class="mt-2 flex justify-between text-xs text-gray-500">
          <span>Biggest: {{ [...trip.segments].sort((a, b) => b.amount - a.amount)[0]!.label }}</span>
          <span class="flex items-center gap-1 text-primary-400 group-hover:gap-1.5 transition-all">
            See breakdown <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
