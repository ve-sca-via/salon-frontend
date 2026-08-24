/**
 * sitemap.js - serves /sitemap.xml (see the rewrite in vercel.json).
 *
 * Built at request time rather than at build time so publishing an article in
 * the admin panel puts it in the sitemap within the cache window, with no
 * redeploy. `/blog/sitemap-data` exists on the backend precisely for this: it
 * returns every live post's slug and timestamps, unconstrained by the
 * pagination that limits the public list endpoint.
 *
 * Only pages that are actually server-rendered carry real value here — a URL in
 * the sitemap that resolves to an empty SPA shell invites a crawl and gives it
 * nothing. The static entries below are the site's fixed, self-explanatory
 * pages; /salons/:id and /products/:slug are deliberately absent until they are
 * server-rendered too.
 */

const { fetchJson } = require('./_lib/http');
const { SITE_URL, CACHE } = require('./_lib/config');
const { escapeHtml } = require('./_lib/html');

// changefreq/priority are hints, not instructions; they are kept modest and
// honest rather than every page claiming daily/1.0, which crawlers discount.
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/salons', changefreq: 'daily', priority: '0.9' },
  { path: '/products', changefreq: 'daily', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/partner-with-us', changefreq: 'monthly', priority: '0.6' },
  { path: '/careers', changefreq: 'monthly', priority: '0.4' },
  { path: '/faq', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.2' },
];

/** <lastmod> wants a date or a full ISO timestamp; anything unparseable is omitted. */
const lastmod = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `\n    <lastmod>${date.toISOString().slice(0, 10)}</lastmod>`;
};

const urlEntry = ({ path, changefreq, priority, updatedAt }) => `
  <url>
    <loc>${escapeHtml(`${SITE_URL}${path}`)}</loc>${lastmod(updatedAt)}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

module.exports = async function handler(req, res) {
  const result = await fetchJson('/blog/sitemap-data');

  if (!result.ok) {
    // Returning the static pages alone would publish a sitemap that silently
    // omits every article. A 503 makes Search Console retry and keep using the
    // copy it already fetched, which is the safer failure.
    console.error('[sitemap] could not load blog entries; serving 503');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', CACHE.error);
    res.status(503).send('Sitemap temporarily unavailable');
    return;
  }

  const blogEntries = (result.data.entries || []).map((entry) => ({
    path: `/blog/${entry.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    updatedAt: entry.updated_at || entry.published_at,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...STATIC_PAGES, ...blogEntries]
    .map(urlEntry)
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', CACHE.sitemap);
  res.status(200).send(xml);
};

module.exports.STATIC_PAGES = STATIC_PAGES;
