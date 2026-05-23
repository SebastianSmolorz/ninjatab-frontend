<template>
  <UApp>
    <div class="relative min-h-screen">
      <!-- Global overlay: logo + burger menu (matches index style) -->
      <div
        v-if="!hideHeader"
        class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none"
      >
        <NuxtLink to="/" class="pointer-events-auto">
          <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto" />
        </NuxtLink>
        <div class="pointer-events-auto">
          <UDropdownMenu
            :items="navItems"
            :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
            :modal="false"
          >
            <UButton icon="i-lucide-menu" variant="ghost" color="neutral" aria-label="Open menu" />
            <template #item-trailing="{ item }">
              <UIcon
                v-if="item.target === '_blank'"
                name="i-lucide-external-link"
                class="size-4 text-gray-400"
              />
            </template>
          </UDropdownMenu>
        </div>
      </div>

      <NuxtPage />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user?.first_name) {
    await authStore.fetchUser()
  }
})

const navItems = computed<DropdownMenuItem[][]>(() => {
  const authed = authStore.isAuthenticated
  return [
    [
      ...(authed ? [{ label: 'My Tabs', icon: 'i-lucide-list', to: '/tabs' }] : []),
      { label: 'Contact', icon: 'i-lucide-mail', to: '/contact' },
    ],
    [
      { label: 'Google Play', icon: 'i-simple-icons-googleplay', to: 'https://play.google.com/store/apps/details?id=ninja.tab.app&referrer=utm_source%3Dwebsite', target: '_blank' },
      { label: 'App Store', icon: 'i-simple-icons-apple', to: 'https://apps.apple.com/us/app/ninja-tab-split-travel-bills/id6761298804', target: '_blank' },
    ],
    [
      { label: 'Splitwise Alternative', icon: 'i-lucide-repeat', to: '/splitwise-alternative' },
    ],
    ...(authed
      ? [[{ label: 'Logout', icon: 'i-lucide-log-out', onSelect: handleLogout }]]
      : []),
  ]
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

const route = useRoute()
const { isNativeApp } = useNativeApp()

const hideHeader = computed(() =>
  isNativeApp.value
  || route.name === 'index'
  || route.name === 'splitwise-alternative'
  || route.name === 'join'
  || route.name === 'tabs-id-upgrade'
  || route.name === 'tabs-id-upgraded'
)
</script>
