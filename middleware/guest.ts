export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    return navigateTo('/tabs', { replace: true })
  }
})
