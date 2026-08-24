/**
 * Tests for /sitemap.xml.
 *
 * The sitemap is built per request from the backend, so publishing an article
 * lists it without a redeploy. What matters here is that the XML is well-formed,
 * that URLs are absolute against the canonical origin, and that a backend
 * failure produces a retryable 503 rather than a valid-looking sitemap that
 * silently omits every article.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '../src/test/mswServer';
import handler, { STATIC_PAGES } from './sitemap';

const BASE = 'http://localhost:8000/api/v1';

function makeRes() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

const run = async () => {
  const res = makeRes();
  await handler({}, res);
  return res;
};

function registerSitemapData(entries) {
  server.use(
    http.get(`${BASE}/blog/sitemap-data`, () =>
      HttpResponse.json({ success: true, entries, count: entries.length }),
    ),
  );
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('sitemap handler', () => {
  it('serves well-formed XML with the sitemap namespace', async () => {
    registerSitemapData([]);
    const res = await run();
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/xml; charset=utf-8');
    expect(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(res.body).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(res.body.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('lists every static page as an absolute URL', async () => {
    registerSitemapData([]);
    const res = await run();
    STATIC_PAGES.forEach(({ path }) => {
      expect(res.body).toContain(`<loc>http://localhost:3000${path}</loc>`);
    });
  });

  it('lists published articles with a lastmod date', async () => {
    registerSitemapData([
      { slug: 'best-hair-spa-in-delhi', updated_at: '2026-08-05T09:00:00Z', published_at: '2026-08-01T09:00:00Z' },
    ]);
    const res = await run();
    expect(res.body).toContain('<loc>http://localhost:3000/blog/best-hair-spa-in-delhi</loc>');
    expect(res.body).toContain('<lastmod>2026-08-05</lastmod>');
  });

  it('falls back to published_at when a post has never been edited', async () => {
    registerSitemapData([{ slug: 'a', updated_at: null, published_at: '2026-07-04T00:00:00Z' }]);
    const res = await run();
    expect(res.body).toContain('<lastmod>2026-07-04</lastmod>');
  });

  it('omits lastmod rather than emitting an invalid date', async () => {
    registerSitemapData([{ slug: 'a', updated_at: 'not-a-date', published_at: null }]);
    const res = await run();
    expect(res.body).toContain('<loc>http://localhost:3000/blog/a</loc>');
    expect(res.body).not.toContain('not-a-date');
    expect(res.body).not.toContain('<lastmod>Invalid');
  });

  it('escapes characters that would break the XML', async () => {
    registerSitemapData([{ slug: 'spa-&-salon', updated_at: null, published_at: null }]);
    const res = await run();
    expect(res.body).toContain('spa-&amp;-salon');
    expect(res.body).not.toMatch(/spa-&-salon/);
  });

  it('is cached at the edge', async () => {
    registerSitemapData([]);
    const res = await run();
    expect(res.headers['cache-control']).toContain('s-maxage');
  });

  it('answers 503 rather than publishing a sitemap missing every article', async () => {
    // Search Console retries a 503 and keeps the copy it already has; a 200 that
    // silently dropped the articles would be taken at face value.
    server.use(
      http.get(`${BASE}/blog/sitemap-data`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
    );
    const res = await run();
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('does not advertise pages that are still SPA-only', async () => {
    // A URL in the sitemap that resolves to an empty shell invites a crawl and
    // gives it nothing. /salons/:id and /products/:slug wait for their renderer.
    registerSitemapData([]);
    const res = await run();
    expect(res.body).toContain('<loc>http://localhost:3000/salons</loc>');
    expect(res.body).not.toMatch(/<loc>[^<]*\/salons\/[^<]+<\/loc>/);
    expect(res.body).not.toMatch(/<loc>[^<]*\/products\/[^<]+<\/loc>/);
  });
});
