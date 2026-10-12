<template>
  <div class="w-full flex flex-col items-center gap-3 p-6 sm:p-10">
    <template v-for="(panel, i) in panels" :key="panel.label">
      <UIcon v-if="i > 0" name="i-lucide-arrow-down" class="size-7 text-primary-400" />
      <figure class="w-full max-w-sm flex flex-col items-center gap-2">
        <figcaption :class="[i ? 'text-primary-300' : 'text-gray-400', 'text-sm font-semibold uppercase tracking-wide']">
          {{ panel.label }}
        </figcaption>
        <svg viewBox="0 0 300 185" class="w-full" role="img" :aria-label="panel.aria">
          <defs>
            <marker :id="`settle-arrow-${i}`" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" :class="i ? 'fill-primary-400' : 'fill-gray-400'" />
            </marker>
          </defs>
          <g v-for="t in panel.transfers" :key="t.amount + t.d">
            <path :d="t.d" :class="i ? 'stroke-primary-400' : 'stroke-gray-400'" stroke-width="3" fill="none" :marker-end="`url(#settle-arrow-${i})`" />
            <text :x="t.lx" :y="t.ly" text-anchor="middle" font-size="16" font-weight="700" :class="i ? 'fill-primary-300' : 'fill-gray-200'">{{ t.amount }}</text>
          </g>
          <g v-for="p in people" :key="p.name">
            <circle :cx="p.x" :cy="p.y" r="26" :class="i && p.name === 'Ben' ? 'fill-gray-800 stroke-gray-600' : 'fill-gray-800 stroke-primary-500'" stroke-width="2" />
            <text :x="p.x" :y="p.y + 5" text-anchor="middle" font-size="14" font-weight="600" :class="i && p.name === 'Ben' ? 'fill-gray-500' : 'fill-white'">{{ p.name }}</text>
          </g>
          <text v-if="i" x="150" y="86" text-anchor="middle" font-size="13" class="fill-gray-400">all square</text>
        </svg>
      </figure>
    </template>
  </div>
</template>

<script setup lang="ts">
// Steve owes Ben £20, Ben owes Seb £20, Steve owes Seb £10.
// Net: Steve -£30, Ben £0, Seb +£30 → one payment. Lines stop short of the 26px circles.
const people = [
  { name: 'Steve', x: 50, y: 145 },
  { name: 'Ben', x: 150, y: 35 },
  { name: 'Seb', x: 250, y: 145 },
]

const steveToSeb = 'M80,145 L218,145'

const panels = [
  {
    label: 'Before: 3 payments',
    aria: 'Steve pays Ben £20, Ben pays Seb £20, Steve pays Seb £10',
    transfers: [
      { d: 'M70,123 L128,59', amount: '£20', lx: 82, ly: 82 },
      { d: 'M170,57 L228,121', amount: '£20', lx: 218, ly: 82 },
      { d: steveToSeb, amount: '£10', lx: 150, ly: 172 },
    ],
  },
  {
    label: 'With Ninja Tab: 1 payment',
    aria: 'Steve pays Seb £30, Ben is all square',
    transfers: [
      { d: steveToSeb, amount: '£30', lx: 150, ly: 172 },
    ],
  },
]
</script>
