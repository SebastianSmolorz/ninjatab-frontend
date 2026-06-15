<template>
  <UMain class="relative bg-gray-900 min-h-screen">
    <!-- Overlay: logo + back to home -->
    <div class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none">
      <NuxtLink to="/" class="pointer-events-auto">
        <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto" />
      </NuxtLink>
      <div class="pointer-events-auto">
        <UButton to="/join" size="md" trailing-icon="i-lucide-arrow-right">Start a free tab</UButton>
      </div>
    </div>

    <template v-if="page">
      <!-- Hero -->
      <section class="relative overflow-hidden pt-28 pb-10 lg:pt-36 lg:pb-12 bg-gray-900">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--ui-color-primary-500)/20%,_transparent_50%)] opacity-40" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--ui-color-primary-700)/25%,_transparent_55%)] opacity-50" />
        <UContainer class="relative">
          <div class="max-w-3xl mx-auto">
            <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-semibold text-sm mb-5 transition-colors">
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              Blog
            </NuxtLink>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              {{ page.title }}
            </h1>
            <p v-if="page.description" class="mt-5 text-lg text-gray-300 leading-relaxed">
              {{ page.description }}
            </p>
            <div class="mt-6 flex items-center gap-3 text-sm text-gray-400">
              <span class="font-medium text-gray-300">{{ page.author }}</span>
              <span class="size-1 rounded-full bg-gray-600" />
              <time :datetime="page.date">{{ formattedDate }}</time>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- Hero image -->
      <UContainer v-if="page.image" class="relative">
        <div class="max-w-3xl mx-auto">
          <img
            :src="page.image"
            :alt="page.imageAlt || page.title"
            class="w-full rounded-2xl ring-1 ring-white/10 object-cover"
          />
        </div>
      </UContainer>

      <!-- Body -->
      <UContainer class="relative py-12 lg:py-16">
        <div class="max-w-3xl mx-auto">
          <ContentRenderer :value="page" class="blog-prose" />
        </div>
      </UContainer>
    </template>

    <div v-else class="pt-40 pb-32 text-center">
      <UContainer>
        <h1 class="text-3xl font-bold text-white">Article not found</h1>
        <p class="mt-4 text-gray-400">This article doesn't exist or has been moved.</p>
        <UButton to="/blog" class="mt-8" trailing-icon="i-lucide-arrow-right">Back to the blog</UButton>
      </UContainer>
    </div>

    <MarketingFooter />
  </UMain>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`blog-${route.path}`, () =>
  queryCollection('blog').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const formattedDate = computed(() =>
  page.value?.date
    ? new Date(page.value.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
)

useSeoMeta({
  title: () => `${page.value?.title} — Ninja Tab`,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogImage: () => page.value?.image,
  ogType: 'article',
  twitterCard: 'summary_large_image',
})
</script>

<style scoped>
.blog-prose {
  color: var(--ui-text-muted);
}
</style>
