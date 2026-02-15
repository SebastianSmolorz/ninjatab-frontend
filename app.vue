<template>
  <UApp>
    <UHeader v-if="!isIndex" title="tab.ninja" to="/">
      <template #right>
        <UNavigationMenu :items="navLinks" />
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-muted ml-4">{{ authStore.user?.email }}</span>
          <UButton variant="ghost" icon="i-lucide-log-out" class="ml-2" @click="handleLogout">
            Logout
          </UButton>
        </template>
        <UButton v-else variant="ghost" to="/login" class="ml-4">
          Login
        </UButton>
      </template>

      <template #body>
        <UNavigationMenu :items="navLinks" orientation="vertical" class="-mx-2.5" />
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

const navLinks = [
  {
    label: 'Tabs',
    to: '/tabs'
  }
]


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
