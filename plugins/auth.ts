import type { AuthUser } from '~/types'

export default defineNuxtPlugin(() => {
  const userCookie = useCookie<AuthUser | null>('ninjatab_user')
  const authStore = useAuthStore()
  if (userCookie.value) {
    authStore.user = userCookie.value
  }
})
