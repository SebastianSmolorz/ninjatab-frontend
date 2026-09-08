<template>
  <UMain class="relative bg-gray-900 min-h-screen">
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

const canonical = computed(() => `${SITE}${route.path}`)
const ogImage = computed(() =>
  page.value?.image ? `${SITE}${page.value.image}` : `${SITE}/logo-v2.png`
)

useSeoMeta({
  title: () => `${page.value?.title} — Ninja Tab`,
  description: () => page.value?.description,
  ogTitle: () => page.value?.title,
  ogDescription: () => page.value?.description,
  ogUrl: () => canonical.value,
  ogImage: () => ogImage.value,
  ogType: 'article',
  ogSiteName: 'Ninja Tab',
  twitterCard: 'summary_large_image',
})

// Same Organization and WebSite nodes as everywhere else. The post is one more
// thing Ninja Tab publishes, not a second Ninja Tab.
useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        organizationNode,
        webSiteNode,
        {
          '@type': 'BlogPosting',
          '@id': `${canonical.value}#article`,
          headline: page.value?.title,
          description: page.value?.description,
          image: ogImage.value,
          inLanguage: 'en',
          isAccessibleForFree: true,
          mainEntityOfPage: canonical.value,
          isPartOf: { '@id': WEBSITE_ID },
          datePublished: page.value?.date,
          author: { '@type': 'Person', name: page.value?.author },
          publisher: { '@id': ORG_ID },
          breadcrumb: { '@id': `${canonical.value}#breadcrumb` },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical.value}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ninja Tab', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
            { '@type': 'ListItem', position: 3, name: page.value?.title, item: canonical.value },
          ],
        },
      ],
    }),
  }],
}))
</script>

<style scoped>
.blog-prose {
  color: var(--ui-text-muted);
}
</style>
