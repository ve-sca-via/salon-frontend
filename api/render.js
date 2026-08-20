/**
 * render.js - Vercel serverless function that server-renders public pages.
 *
 * WHY THIS EXISTS
 * This app is a Vite SPA. Before this function, `vercel.json` rewrote every URL
 * to `/`, and what any crawler received was one hardcoded title and an empty
 * `<div id="root">`. Googlebot can execute JS but defers it and is unreliable
 * for a new low-authority domain; Bing and every link unfurler do not execute
 * JS at all. Content that cannot be read cannot rank, so the blog is served as
 * real HTML from here instead.
 *
 * HOW A REQUEST GETS HERE
 * `vercel.json` routes /blog and /blog/:slug to this function with an explicit
 * `type` (and `slug`) query parameter, ahead of the SPA catch-all rewrite.
 * Passing the route via the query string rather than re-parsing req.url keeps
 * the mapping declarative and in one file.
 *
 * ADDING A PAGE TYPE
 * `/salons/:id` and `/products/:slug` have the same problem and are the pages
 * that actually earn — they were deferred, not forgotten. Adding one means: a
 * renderer in `api/_lib/<thing>.js` returning `{status, cacheControl, html}`, an
 * entry in ROUTES below, and a rewrite in vercel.json. Nothing in `_lib/html.js`
 * should need to change; it is deliberately free of blog specifics.
 */

const { renderBlogIndex, renderBlogPost } = require('./_lib/blog');
const { renderNotice } = require('./_lib/html');
const { CACHE } = require('./_lib/config');

const ROUTES = {
  'blog-index': (query) => renderBlogIndex({ tag: query.tag, page: query.page }),
  'blog-post': (query) => renderBlogPost({ slug: query.slug }),
};

/** Vercel gives repeated query params as arrays; every route here wants one value. */
const single = (value) => (Array.isArray(value) ? value[0] : value);

/**
 * `type` and `slug` are supplied by the rewrite, not by the visitor.
 *
 * Vercel merges the incoming query string into the rewrite's, so a request for
 * `/blog?type=blog-post&slug=x` arrives with two `type` values and the winner is
 * not defined by the platform. Rather than guess, treat a duplicate of either
 * as malformed: a genuine request can never produce one, and this is what stops
 * a crafted URL from rendering an article under the /blog path (a duplicate URL
 * with a canonical pointing elsewhere).
 *
 * `tag` and `page` are the visitor's to set, so duplicates there are harmless
 * and just take the first value.
 */
const isForged = (query) => Array.isArray(query.type) || Array.isArray(query.slug);

module.exports = async function handler(req, res) {
  const query = req.query || {};
  const type = single(query.type);
  const route = isForged(query) ? null : ROUTES[type];

  if (!route) {
    // Either a tampered URL (handled above) or vercel.json and ROUTES disagree,
    // which is a deploy-time mistake. Say so plainly rather than rendering a
    // misleading 404 page, and never let either answer be indexed or cached.
    const forged = isForged(query);
    console.error(`[ssr] no renderer for type=${forged ? 'duplicate' : type}`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', CACHE.error);
    res.status(forged ? 400 : 500).send(
      renderNotice({
        title: 'Page unavailable | Lubist',
        heading: forged ? 'That link is not valid' : 'Something went wrong',
        message: forged
          ? 'Check the address and try again, or start from the blog index.'
          : 'We could not render this page. Please try again shortly.',
        ctaHref: forged ? '/blog' : '/',
        ctaLabel: forged ? 'Back to the blog' : 'Go to the homepage',
        canonicalPath: '/',
      }),
    );
    return;
  }

  try {
    const { status, cacheControl, html } = await route({
      tag: single(query.tag) || '',
      page: single(query.page) || 1,
      slug: single(query.slug) || '',
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cacheControl);
    // The rendered HTML varies with nothing but the URL, but say so explicitly
    // so a proxy never keys a cache entry on a request header.
    res.setHeader('Vary', 'Accept-Encoding');
    res.status(status).send(html);
  } catch (err) {
    // A throw here is a bug in the renderer, not a backend outage. 503 + no-store
    // keeps a crawler from treating a broken deploy as a permanent removal.
    console.error(`[ssr] renderer threw for type=${type}`, err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', CACHE.error);
    res.status(503).send(
      renderNotice({
        title: 'Page temporarily unavailable | Lubist',
        heading: 'This page is taking a moment',
        message: 'Please refresh in a minute — nothing has been removed.',
        ctaHref: '/',
        ctaLabel: 'Go to the homepage',
        canonicalPath: '/',
      }),
    );
  }
};

module.exports.ROUTES = ROUTES;
