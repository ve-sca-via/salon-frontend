# Branding, Sharing, Metadata & Installability — Audit Tracker

Source: full audit performed 2026-09-06. Scope: `salon-management-app` (the public
Lubist website — Vite/React SPA + Vercel serverless SSR for `/blog` and
`/blog/:slug`). Not in scope: `salon-admin-panel` (internal-only, no public
sharing/SEO surface) and `lubist_mobile_application` (separate Expo app icon
config).

How to use this doc: check items off as they ship, add a one-line note with the
date/commit. Re-run the audit periodically (new pages, new share surfaces)
rather than treating this as one-and-done.

---

## 🔴 Must Fix

- [x] **Broken favicon reference (404) + default Vite branding**
  - Fixed 2026-09-06. `lubist_logo_1.svg` turned out to bake in the *whole*
    "LUBIST / BEAUTY & SPA SALON" wordmark on a squarer canvas, not an
    icon-only mark — rasterizing it as-is produced illegible mush at 16–32px.
    Cropped out just the flame/face glyph (cutting the SVG before its
    wordmark `<g>` groups, then trimming transparent padding) and generated
    `favicon.ico` (16+32 embedded PNGs), `favicon-16x16.png`,
    `favicon-32x32.png` from that. `<link rel="icon">` updated in both
    `index.html` and `api/_lib/html.js`.

- [x] **No web app manifest — not installable as a PWA, no branded home-screen icon**
  - Fixed 2026-09-06. Added `public/manifest.webmanifest` (name, short_name,
    start_url `/`, scope `/`, display `standalone`, theme_color `#F89C02`,
    background_color `#FFFFFF`, icons at 192/512 `any` + 512 `maskable`).
    Linked from both `index.html` and `api/_lib/html.js`.

- [x] **No Apple touch icon — iOS "Add to Home Screen" shows no branding**
  - Fixed 2026-09-06. `public/apple-touch-icon.png`, 180×180, opaque white
    background, the cropped icon mark centered. Linked in both templates.

---

## 🟡 Should Fix

- [x] **Tab title never updates on client-side navigation (except blog)**
  - Fixed 2026-09-06. Wired `useDocumentMeta(title, description)` into
    `DeleteAccount` (done first, per the priority note), `Home`,
    `SalonDetail` (dynamic — salon business name + city), `ProductDetail`
    (dynamic — product name + description), `PublicSalonListing`,
    `PublicProductListing`, `PartnerWithUs`, `Careers`, `FAQ`,
    `PrivacyPolicy`, `TermsOfService`.

- [x] **Blog posts with no cover image lose their OG image entirely**
  - Fixed 2026-09-06. Generated a branded 1200×630 default
    (`public/og-default.png` — gradient background + Lubist wordmark) and
    wired it into `renderDocument()` in `api/_lib/html.js` as the fallback for
    `og:image`/`twitter:image` on **any** SSR page missing its own image (not
    just blog posts), so the Twitter card is now always
    `summary_large_image`. Also used as the fallback for the `BlogPosting`
    JSON-LD `image` field in `api/_lib/blog.js`.

- [ ] **No sitewide Organization/WebSite JSON-LD**
  - Structured data currently only exists in the blog SSR path
    (`BlogPosting`/`Blog` via `publisher()` in `api/_lib/html.js`). No
    `Organization`/`WebSite` graph anywhere, since the homepage isn't
    server-rendered yet.
  - Not urgent standalone — revisit when `/salons/:id` or the homepage get
    SSR (already flagged as the next step in `api/render.js`'s own comments).

---

## 🟢 Nice to Have

- [x] **`theme-color` / iOS status-bar meta tags**
  - Fixed 2026-09-06, done alongside the manifest work since it's the same
    head-tag block. Added `theme-color` (`#F89C02`),
    `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
    to both `index.html` and `api/_lib/html.js`.

- [x] **Bundle analyzer auto-opens on every production build**
  - Fixed 2026-09-06. `vite.config.js`: `visualizer({ open: false, ... })` —
    stats.html is still generated, it just no longer pops a browser tab.

---

## ✅ Already correct (verified, don't re-litigate)

- `public/robots.txt` — correctly scoped, no accidental `Disallow: /`,
  references sitemap.
- `api/sitemap.js` — dynamic, built from live blog data, correct production
  domain, honest priorities, fails safe (503) rather than serving an
  incomplete sitemap.
- Canonical URLs (blog pages) — absolute, HTTPS, `SITE_URL` hardcoded to
  `https://www.lubist.com` in prod (`api/_lib/config.js`), no localhost/
  staging leakage risk.
- Open Graph + Twitter Card (blog pages) — complete tag set, properly
  escaped; always `summary_large_image` now that every page has an image
  (own cover, or the default OG fallback — see Should Fix, above).
- JSON-LD (blog) — valid `Blog`/`BlogPosting` schema, escaped against
  `</script>` breakout.
- Error/404 pages emit `noindex, follow` correctly.
- Viewport meta — accessible, no zoom lockout.
- No hardcoded localhost/staging URLs leaking into production metadata.
- `render.js` rejects duplicate `type`/`slug` query params (anti-spoofing).

---

## Deferred by design (tracked elsewhere, not audit gaps)

- `/salons/:id` and `/products/:slug` SSR (OG/canonical/JSON-LD for those
  routes) — explicitly deferred per comments in `api/render.js` and
  `api/_lib/html.js`. These are the highest-value pages to SSR next.
- Homepage SSR / sitewide Organization schema — blocked on the same SSR
  expansion.

---

## Top 5 fixes, in priority order

1. ~~Fix the broken favicon (404 in prod) + replace default Vite icon with
   real Lubist branding.~~ Done 2026-09-06.
2. ~~Add a web app manifest + 192/512 icons (Android install + home-screen
   icon).~~ Done 2026-09-06.
3. ~~Add `apple-touch-icon` (iOS home-screen icon).~~ Done 2026-09-06.
4. ~~Wire `useDocumentMeta` into remaining public pages, starting with
   `DeleteAccount.jsx` (Play Store–linked URL).~~ Done 2026-09-06.
5. ~~Add a default OG image fallback for cover-image-less blog posts.~~ Done
   2026-09-06.

All Must Fix and Should Fix items are closed as of 2026-09-06. Remaining open
items are the Nice to Have "revisit later" note on sitewide Organization/
WebSite JSON-LD, and the pre-existing "Deferred by design" SSR expansion —
neither is a gap in the current scope.
