<template>
  <UApp>
    <div class="relative min-h-screen">
      <SiteMenu v-if="!hideHeader" :cta="showCta" />
      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user?.first_name) {
    await authStore.fetchUser()
  }
})

const route = useRoute()
const { isNativeApp } = useNativeApp()

const hideHeader = computed(() =>
  isNativeApp.value
  || route.name === 'splitwise-alternative'
  || route.name === 'join'
  || route.name === 'credit-card-hot-potato'
  || route.name === 'tabs-id-upgrade'
  || route.name === 'tabs-id-upgraded'
)

// Long-form reading pages carry the download CTA in the header. The trip pages
// have their own sticky banner and the home page has a hero full of buttons.
const showCta = computed(() =>
  route.name === 'author' || String(route.name ?? '').startsWith('blog')
)
</script>
