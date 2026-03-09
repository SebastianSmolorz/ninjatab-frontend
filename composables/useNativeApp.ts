export function useNativeApp() {
  const headers = useRequestHeaders(['user-agent'])
  const isNativeApp = computed(() => {
    const ua = import.meta.server
      ? (headers['user-agent'] ?? '')
      : navigator.userAgent
    return ua.includes('NinjaTabApp')
  })

  return { isNativeApp }
}
