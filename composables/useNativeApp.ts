export function useNativeApp() {
  const route = useRoute()
  const headers = useRequestHeaders(['user-agent'])

  const isNativeApp = computed(() => {
    if (route.query.source === 'app') return true

    const ua = import.meta.server
      ? (headers['user-agent'] ?? '')
      : navigator.userAgent
    return ua.includes('NinjaTabApp')
  })

  return { isNativeApp }
}
