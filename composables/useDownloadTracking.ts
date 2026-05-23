export type DownloadPlatform = 'android' | 'ios'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
] as const

export function useDownloadTracking() {
  const config = useRuntimeConfig()
  const route = useRoute()

  function trackDownload(platform: DownloadPlatform, location?: string) {
    if (!import.meta.client) return

    const query = route.query
    const payload: Record<string, string> = { platform }
    if (location) payload.location = location
    payload.page_path = window.location.pathname + window.location.search
    if (document.referrer) payload.referrer = document.referrer

    for (const key of UTM_KEYS) {
      const value = query[key]
      if (typeof value === 'string' && value) {
        payload[key] = value
      }
    }

    const url = `${config.public.apiBaseUrl}/marketing/download-click`
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' })

    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return
    } catch {
      // fall through to fetch fallback
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }

  return { trackDownload }
}
