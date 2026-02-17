<template>
  <UApp>
    <UHeader v-if="!isIndex" title="tab.ninja" to="/">
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

onMounted(() => {
  authStore.initFromStorage()
})

const headerItems = computed(() => {
  if (authStore.isAuthenticated) {
    return [
      { label: 'Tabs', to: '/tabs' },
      { label: 'Logout', icon: 'i-lucide-log-out', onSelect: handleLogout },
    ]
  }
  return [
    { label: 'Login', to: '/login' },
  ]
})

const indexLinks = [
  {
    label: 'Already have an account?',
    to: '/tabs'
  }
]

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const route = useRoute()

const isIndex = computed(() => route.name === 'index')
</script>
