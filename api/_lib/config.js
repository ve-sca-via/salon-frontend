/**
 * Runtime configuration for the server-rendering functions.
 *
 * These run on Vercel's Node runtime, NOT in the browser, so Vite's `VITE_`
 * prefixing and `import.meta.env` do not apply — they read process.env at
 * request time. The `VITE_BACKEND_URL` fallback exists because that variable is
 * already configured on the Vercel project for the client build and holds the
 * same value; setting BACKEND_URL as well is optional, not required.
 *
 * SITE_URL is the canonical origin used for <link rel="canonical">, og:url and
 * sitemap entries. It must be the production domain, so VERCEL_URL (which is a
 * per-deployment hostname) is only a last resort for preview deployments —
 * canonical tags pointing at a preview URL would split ranking signals.
 */

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const BACKEND_URL = stripTrailingSlash(
  process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:8000',
);

// The live front door. Hardcoded as the production fallback rather than left to
// VERCEL_URL, because VERCEL_URL is a per-deployment hostname: if SITE_URL were
// ever unset in the project settings, every canonical tag would point at a
// throwaway domain and split the ranking signals for the real one.
const PRODUCTION_SITE_URL = 'https://www.lubist.com';

const SITE_URL = stripTrailingSlash(
  process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_ENV === 'production' ? PRODUCTION_SITE_URL : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000',
);

const API_PREFIX = '/api/v1';

// How long Vercel's edge cache may serve a response, and how long it may keep
// serving a stale one while it revalidates. Articles change rarely; the index
// changes whenever one is published, so it is held for less.
const CACHE = {
  index: 'public, s-maxage=300, stale-while-revalidate=600',
  post: 'public, s-maxage=600, stale-while-revalidate=3600',
  sitemap: 'public, s-maxage=3600, stale-while-revalidate=86400',
  // A 404 is cached briefly: a slug that does not exist yet may exist in a
  // minute, and we do not want that answer pinned for an hour.
  notFound: 'public, s-maxage=60',
  // Backend failures must never be cached, or one bad minute is served for ten.
  error: 'no-store',
};

module.exports = { BACKEND_URL, SITE_URL, PRODUCTION_SITE_URL, API_PREFIX, CACHE, stripTrailingSlash };
