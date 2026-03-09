<template>
  <UApp>
    <UHeader v-if="!hideHeader" to="/">
      <template #title>
        <img src="/logo1-small.png" alt="Tab Ninja logo" class="w-14" />
      </template>
      <template #right>
        <UNavigationMenu :items="headerItems" class="hidden lg:flex" />
      </template>

      <template #body>
        <UNavigationMenu :items="headerItems" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
    <UNavigationMenu v-if="isIndex" :items="indexLinks" orientation="vertical" class="absolute right-0 top-0" />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user?.first_name) {
    await authStore.fetchUser()
  }
})

const headerItems = computed(() => {
  if (authStore.isAuthenticated) {
    return [
      { label: 'Tabs', to: '/tabs' },
      { label: 'Contact', to: '/contact' },
      { label: 'Logout', icon: 'i-lucide-log-out', onSelect: handleLogout },
    ]
  }
  return [
    { label: 'Login', to: '/login' },
    { label: 'Contact', to: '/contact' },
  ]
})

const indexLinks = [
  {
    label: 'Already have an account?',
    to: '/tabs'
  }
]

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

const route = useRoute()
const { isNativeApp } = useNativeApp()

const isIndex = computed(() => route.name === 'index')
const hideHeader = computed(() => isNativeApp.value || isIndex.value || route.name === 'tabs-id-upgrade' || route.name === 'tabs-id-upgraded')
</script>
