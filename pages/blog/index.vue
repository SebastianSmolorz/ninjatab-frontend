<template>
  <UMain class="relative bg-gray-900 min-h-screen">
    <!-- Header -->
    <section class="relative overflow-hidden pt-28 pb-12 lg:pt-36 lg:pb-16 bg-gray-900">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/20%,_transparent_50%)] opacity-40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/25%,_transparent_55%)] opacity-50" />
      <UContainer class="relative">
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block text-primary-400 font-semibold tracking-wide uppercase text-sm mb-3">The blog</span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            Splitting costs, done <span class="text-primary-400">fairly</span>.
          </h1>
          <p class="mt-6 text-lg text-gray-300 leading-relaxed">
            Honest guides on group expenses, fair splitting, and keeping friendships intact when money's involved.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Articles -->
    <section class="relative pb-20 lg:pb-28 bg-gray-900">
      <UContainer>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <NuxtLink
            v-for="article in articles"
            :key="article.path"
            :to="article.path"
            class="group flex flex-col rounded-2xl overflow-hidden bg-gray-800/40 ring-1 ring-white/5 hover:ring-primary-400/40 transition-all"
          >
            <div class="aspect-video overflow-hidden bg-gray-800">
              <img
                v-if="article.image"
                :src="article.image"
                :alt="article.imageAlt || article.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="flex flex-col flex-1 p-5">
              <h2 class="font-semibold text-white leading-snug group-hover:text-primary-300 transition-colors">
                {{ article.title }}
              </h2>
              <p class="mt-2 text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1">
                {{ article.description }}
              </p>
              <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>{{ article.author }}</span>
                <span class="size-1 rounded-full bg-gray-600" />
                <time :datetime="article.date">{{ formatDate(article.date) }}</time>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="!articles?.length" class="text-center text-gray-400 py-16">
          No articles yet. Check back soon.
        </p>
      </UContainer>
    </section>

    <MarketingFooter />
  </UMain>
</template>

<script setup lang="ts">
const { data: articles } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .all()
)

function formatDate(date?: string) {
  return date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
}

useSeoMeta({
  title: 'Blog — Ninja Tab',
  description: 'Honest guides on group expenses, fair splitting, and keeping friendships intact when money is involved.',
  ogTitle: 'Ninja Tab Blog',
  ogDescription: 'Honest guides on group expenses, fair splitting, and keeping friendships intact.',
  ogImage: 'https://tab.ninja/og-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>
