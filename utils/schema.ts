/**
 * One Ninja Tab identity for the whole site.
 *
 * Every page that emits JSON-LD references these `@id`s instead of describing
 * the organisation again, so the graph reconciles into a single entity rather
 * than one Ninja Tab per page. Anything added here shows up everywhere — which
 * is the point. Page-specific facts belong on the page's own nodes.
 */
export const SITE = 'https://tab.ninja'
export const ORG_ID = `${SITE}/#organization`
export const WEBSITE_ID = `${SITE}/#website`

export const organizationNode = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Ninja Tab',
  url: `${SITE}/`,
  logo: `${SITE}/logo-v2.png`,
  description: 'App for splitting group and travel expenses, with itemised bills, multi-currency support and settlement worked out for you.',
  sameAs: [
    'https://play.google.com/store/apps/details?id=ninja.tab.app',
    'https://apps.apple.com/us/app/ninja-tab-split-travel-bills/id6761298804',
  ],
}

export const webSiteNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE}/`,
  name: 'Ninja Tab',
  publisher: { '@id': ORG_ID },
}
