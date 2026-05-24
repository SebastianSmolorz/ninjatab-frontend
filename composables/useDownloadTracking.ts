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

const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details'
const APP_STORE_BASE = 'https://apps.apple.com/us/app/ninja-tab-split-travel-bills/id6761298804'
const ANDROID_APP_ID = 'ninja.tab.app'

export function useDownloadTracking() {
  const config = useRuntimeConfig()
  const route = useRoute()

  function collectUtms(overrides: Record<string, string | undefined> = {}): Record<string, string> {
    const out: Record<string, string> = {}
    for (const key of UTM_KEYS) {
      const value = route.query[key]
      if (typeof value === 'string' && value) out[key] = value
    }
    for (const [key, value] of Object.entries(overrides)) {
      if (value) out[key] = value
      else delete out[key]
    }
    if (!out.utm_source) out.utm_source = 'website'
    return out
  }

  function storeUrl(platform: DownloadPlatform, overrides: Record<string, string | undefined> = {}): string {
    const utms = collectUtms(overrides)

    if (platform === 'android') {
      const referrer = new URLSearchParams()
      for (const [key, value] of Object.entries(utms)) referrer.set(key, value)
      const url = new URL(PLAY_STORE_BASE)
      url.searchParams.set('id', ANDROID_APP_ID)
      url.searchParams.set('referrer', referrer.toString())
      return url.toString()
    }

    // iOS App Store: `ct` (campaign text, ≤40 chars) is the supported tracking token.
    const ct = (utms.utm_campaign || utms.utm_content || utms.utm_source || '').slice(0, 40)
    const url = new URL(APP_STORE_BASE)
    if (ct) url.searchParams.set('ct', ct)
    url.searchParams.set('mt', '8')
    return url.toString()
  }

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

  return { trackDownload, storeUrl }
}
