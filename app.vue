<template>
  <UApp>
    <UHeader title="NinjaTab" to="/">
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

    <!-- Page content -->
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

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
