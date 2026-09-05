<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

// The one header. Every page that shows a logo and a burger uses this — there
// is no second copy to drift out of sync.
const { cta = false } = defineProps<{ cta?: boolean }>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { trackDownload, storeUrl } = useDownloadTracking()

// Keeps the existing analytics split between the home page menu and the rest.
const location = computed(() => (route.name === 'index' ? 'index_menu' : 'global_menu'))

const items = computed<DropdownMenuItem[][]>(() => {
  const authed = authStore.isAuthenticated
  return [
    [
      { label: 'Home', icon: 'i-lucide-home', to: '/' },
      ...(authed ? [{ label: 'My Tabs', icon: 'i-lucide-list', to: '/tabs' }] : []),
      { label: 'Blog', icon: 'i-lucide-book-open', to: '/blog' },
      { label: 'Contact', icon: 'i-lucide-mail', to: '/contact' },
    ],
    [
      { label: 'Google Play', icon: 'i-simple-icons-googleplay', to: storeUrl('android'), target: '_blank', onSelect: () => trackDownload('android', location.value) },
      { label: 'App Store', icon: 'i-simple-icons-apple', to: storeUrl('ios'), target: '_blank', onSelect: () => trackDownload('ios', location.value) },
    ],
    [
      { label: 'Splitwise Alternative', icon: 'i-lucide-repeat', to: '/splitwise-alternative' },
      { label: 'Credit Card Hot Potato', icon: 'i-lucide-bomb', to: '/credit-card-hot-potato' },
    ],
    [
      { label: 'Trips', type: 'label' },
      { label: 'By Madlertravel', icon: 'i-lucide-user-round', to: '/madlertravel' },
      { label: 'Bali trip', to: '/t/bali' },
      { label: 'Kyrgyzstan trip', to: '/t/kyrgyzstan' },
      { label: 'Sardinia trip', to: '/t/sardinia' },
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
</script>

<template>
  <div
    class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none"
  >
    <NuxtLink to="/" class="pointer-events-auto">
      <img src="/logo-v2-240.webp" alt="Ninja Tab logo" class="h-10 w-auto">
    </NuxtLink>
    <div class="pointer-events-auto flex items-center gap-2">
      <UButton v-if="cta" to="/join" size="md" trailing-icon="i-lucide-arrow-right">
        Start a free tab
      </UButton>
      <UDropdownMenu
        :items="items"
        :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
        :modal="false"
        :external-icon="false"
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
</template>
