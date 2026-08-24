# `api/` — server-rendered routes

Vercel serverless functions that return real HTML for pages that have to be
indexable. Everything else in this app stays a Vite SPA.

## Why

The SPA sends every crawler the same document: one hardcoded `<title>` and an
empty `<div id="root">`. Googlebot can execute JS but defers it and is
unreliable for a new low-authority domain; Bing and every link unfurler
(WhatsApp, LinkedIn, X) do not execute JS at all. So `/blog` and `/blog/:slug`
are served from here instead, as complete documents with real meta tags and the
article body in the markup.

## Routing — the one rule that matters

`vercel.json` rewrites are evaluated **in order**, and the last entry is the SPA
catch-all `"/(.*)" → "/"`. Any server-rendered route must be listed **above** it
or it will never be reached. Static files in `public/` are served before
rewrites are consulted at all, which is why `robots.txt` needs no entry.

```
/sitemap.xml   → /api/sitemap
/blog          → /api/render?type=blog-index
/blog/:slug    → /api/render?type=blog-post&slug=:slug
/(.*)          → /                                  ← must stay last
```

## Layout

| File | Role |
| --- | --- |
| `render.js` | Entry point. Maps `type` to a renderer, owns status codes and cache headers. |
| `sitemap.js` | Builds `sitemap.xml` at request time from `/blog/sitemap-data`. |
| `_lib/html.js` | Page-agnostic: escaping, the document shell, JSON-LD, header/footer. No blog specifics. |
| `_lib/blog.js` | Blog-specific markup and structured data. |
| `_lib/prose.js` | The article stylesheet as a string (see the drift guard below). |
| `_lib/http.js` | Backend fetch that distinguishes "not found" from "backend down". |
| `_lib/config.js` | Env resolution and cache policy. |

Files prefixed `_` are not routable — that is a Vercel convention, not a
formality; renaming `_lib` would expose those modules as endpoints.

These are CommonJS (`module.exports`). `package.json` has no `"type": "module"`,
and adding one would change how Vite, PostCSS and Tailwind load their configs —
not worth it for four files.

## Adding a page type

`/salons/:id` and `/products/:slug` have exactly the same problem and are the
pages that actually earn; they were deferred, not forgotten. To add one:

1. Write `_lib/<thing>.js` exporting a renderer that returns
   `{ status, cacheControl, html }`.
2. Add it to `ROUTES` in `render.js`.
3. Add a rewrite in `vercel.json`, above the catch-all.
4. Add its URLs to `sitemap.js`.

Nothing in `_lib/html.js` should need to change.

## The prose stylesheet has three copies

Article typography is defined once, in
`salon-admin-panel/src/components/blog/prose.css`, and copied:

1. → `src/components/blog/prose.css` (this repo, **verbatim**; `diff` must be empty)
2. → `api/_lib/prose.js` as a string, because a server-rendered document cannot
   import CSS

`api/_lib/prose.test.js` fails if 2 drifts from 1. Nothing can check 1 against
the admin panel across repos, so `diff` those two by hand when either changes —
if they diverge, the admin Preview tab silently stops being a preview.

## Environment

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` (or the existing `VITE_BACKEND_URL`) | API origin these functions fetch from. |
| `SITE_URL` | Canonical origin for `rel=canonical`, `og:url` and sitemap entries. Defaults to `https://www.lubist.com` in production. |

## Verifying a deploy

The whole point is what a client that runs no JavaScript receives:

```bash
curl -s https://www.lubist.com/blog/<slug> | grep -E '<title>|og:title|application/ld\+json'
curl -s https://www.lubist.com/blog/<slug> | grep -c '<h2'      # article body present
curl -s -o /dev/null -w '%{http_code}\n' https://www.lubist.com/blog/does-not-exist   # 404
curl -s https://www.lubist.com/sitemap.xml | head
```

If the title is `Lubist - Beauty. Booking. Simplified.`, the request fell
through to the SPA catch-all — check the rewrite order.
