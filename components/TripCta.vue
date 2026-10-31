<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

// Each page passes its own /join link, so downloads stay attributed per surface.
defineProps<{ to: RouteLocationRaw }>()
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#01e474] pb-[env(safe-area-inset-bottom)]"
  >
    <div class="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-base sm:text-lg font-bold text-gray-900 leading-tight">Going on your own trip?</p>
        <p class="text-xs sm:text-sm text-gray-800 leading-snug">Track and split your shared expenses</p>
      </div>
      <NuxtLink
        :to="to"
        class="shrink-0 inline-flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
      >
        Get the app
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </div>
  </div>
</template>
