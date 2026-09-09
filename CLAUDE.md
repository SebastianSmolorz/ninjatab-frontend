# CLAUDE.md — frontend/ninjatab

Nuxt 4 marketing site for Ninja Tab. **Landing/marketing pages only** — the
logged-in app (`/tabs/**`, `/login`) is deprecated and not in production.

Nuxt UI v4: check https://ui.nuxt.com/docs/components for the right version
before using a component.

## Public trip pages (`/t/<slug>`)

Finished trips, rendered as static SEO pages. The numbers never move, so
nothing hits the API at request time — the page renders identically in dev, in
prod, and if the backend is down.

### The pipeline

```
Tab (is_public=True, public_slug set, in the app)
  └─ GET /api/tabs/public/<slug>          backend: _public_tab_payload()
       └─ manage.py export_public_tabs    (run from backend/, commit the output)
            └─ content/tripdata/<slug>.md          GENERATED — never hand-edit
                 + content/trips/<slug>.md         hand-written copy
                 + content/authors/<slug>.md       hand-written creator
                      └─ pages/t/[slug].vue, pages/[author].vue
```

Regenerate a trip (works from any machine, no DB needed):

```bash
cd backend && source .venv/bin/activate
python manage.py export_public_tabs <slug> --from-api https://api.tab.ninja/api
```

Without `--from-api` it reads the local DB and exports every public tab.
Re-run it whenever a tab's bills change — it only ever rewrites `tripdata/`,
so hand-written copy can't be clobbered.

### The three content collections

Schemas live in `content.config.ts`.

| Collection  | Source            | Written by | Holds |
|-------------|-------------------|------------|-------|
| `tripData`  | `tripdata/*.md`   | exporter   | name, currency, group_spend, people, bills, settlements, `bill_details` |
| `trips`     | `trips/*.md`      | by hand    | title, description, heading, og*, image, author, place, order, `costs` |
| `authors`   | `authors/*.md`    | by hand    | name, flag, tagline, avatar, website, instagram, tiktok, nationality, knowsAbout |

Split of concerns: **numbers come from the tab, words never do.** The trip doc
supplies the `<title>`, meta description, OG image, `<h1>` and intro copy; the
tab supplies every figure on the page. A trip doc's markdown body wins over the
tab's own description as intro copy.

Money is in **minor units** everywhere (`47189` = £471.89). Render through
`utils/currency.ts` — `formatMinorCurrency` for exact figures (bills,
settlements), `formatMinorCurrencyCompact` for headline/summary tiles.

### Gotchas

- **A trip needs a `trips/<slug>.md` or it 404s in prod.** Prerendered routes
  are derived from `content/trips/` (nuxt.config.ts `contentRoutes`), not from
  `tripdata/`. @nuxt/content's SQLite doesn't run in a Vercel function, so an
  unprerendered content page 404s on a direct hit even though it works in dev.
  Same rule for authors: a creator page needs `authors/<slug>.md`.
- **The sitemap is generated, not a file.** `server/routes/sitemap.xml.ts`
  renders `runtimeConfig.indexableRoutes`, built in nuxt.config.ts from
  `staticRoutes` + the content dirs, and prerendered to `/sitemap.xml`. A new
  trip, creator or post lands in it with no edit. Only a new non-content
  marketing page needs adding, to `staticRoutes`. `/giveaway` and `/join` are
  excluded on purpose. There is no `public/sitemap.xml` — a file there would
  shadow the route.
- `routeRules: {'/madlertravel': {prerender: true}}` in nuxt.config.ts is
  redundant — `contentRoutes('authors', '/')` already covers it.
- `group_spend` is `null` when a bill's currency has no exchange rate to the
  settlement currency. Every consumer must handle null (the summary strip and
  the author cards already do).
- `costs: recorded` on a trip doc only controls whether per-bill dates show on
  the drill-down. Default is `modelled`, the weaker claim. Leave it default
  when every bill carries the same date (bills created in one sitting do), or
  the page shows a timeline that isn't one.
- Receipt images are **never** exported — a presigned S3 URL expires. The
  export stores `has_receipt`; the page links to
  `/api/tabs/public/<slug>/receipt/<bill_id>`, which signs one and redirects.
- Archived tabs still serve publicly, on purpose — archiving is the app's
  soft-delete and would otherwise break live shared links. See the comment on
  `retrieve_public_tab`.
- The bill drill-down is `?bill=<id>`, not a nested route. `bill_details` is
  loaded on demand and only in the browser: the page is prerendered, so the
  build never sees a query string.

### JSON-LD

One identity for the whole site lives in `utils/schema.ts` — `SITE`, `ORG_ID`,
`WEBSITE_ID`, `organizationNode`, `webSiteNode`. Pages reference those `@id`s
instead of re-describing the org, so the graph reconciles into one entity.

`pages/t/[slug].vue` emits `@graph`: Organization, WebSite, WebPage, **Article**
(the trip), optional **Place** (`about` + `contentLocation`, from the trip doc's
`place`), optional **Person** (the creator), BreadcrumbList.

`pages/[author].vue` emits: Organization, WebSite, **ProfilePage**, **Person**,
BreadcrumbList, **ItemList** of the creator's trips.

The Person node is the same `@id` on both pages (`${SITE}/<author>#person`), so
a creator and their trips reconcile into one entity across the site. The
creator's own `url` is their profile page; `website`/`instagram`/`tiktok` go in
`sameAs`. Trips with no author fall back to Ninja Tab as the Article author.

`Article.additionalProperty` carries the figures from the summary strip and
**only** those, in the same units the reader sees, so the markup can't drift
from the page.
