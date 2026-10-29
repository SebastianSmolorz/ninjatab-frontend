// In dev every page's payload is `<route>/_payload.json?dev`, the same URL after
// a content edit, so a browser can keep serving the old one on client-side
// navigation while a refresh shows the new data. Production payload URLs carry
// the build id, so this only matters here.
export default defineEventHandler((event) => {
  if (import.meta.dev && event.path.includes('/_payload.json')) {
    setResponseHeader(event, 'cache-control', 'no-store')
  }
})
