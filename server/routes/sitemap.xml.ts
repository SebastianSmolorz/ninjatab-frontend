import { SITE } from '../../utils/schema'

// Generated at build time from nuxt.config's `indexableRoutes`, so adding a
// trip, creator or blog post is enough — the old hand-written public/sitemap.xml
// went stale every time.
// ponytail: <loc> only. Google ignores changefreq and priority, and a lastmod
// it can't trust is worse than none. Add lastmod when the content docs carry a
// reliable updated date.
export default defineEventHandler((event) => {
  const routes = useRuntimeConfig(event).indexableRoutes as string[]
  setHeader(event, 'content-type', 'application/xml')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${SITE}${r}</loc></url>`).join('\n')}
</urlset>
`
})
