/**
 * Tests for the server-rendering dispatcher.
 *
 * The renderers themselves are covered in _lib/blog.test.js; this file is about
 * the contract between Vercel and the function: which status code, which
 * headers, and what happens when the query string is not what vercel.json
 * intended.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '../src/test/mswServer';
import handler from './render';

const BASE = 'http://localhost:8000/api/v1';

/** Minimal stand-in for Vercel's response object. */
function makeRes() {
  const res = {
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
  return res;
}

const run = async (query) => {
  const res = makeRes();
  await handler({ query }, res);
  return res;
};

function registerBlogEndpoints() {
  server.use(
    http.get(`${BASE}/blog`, () =>
      HttpResponse.json({ success: true, posts: [], count: 0, offset: 0, limit: 12, total: 0 }),
    ),
    http.get(`${BASE}/blog/tags`, () => HttpResponse.json({ success: true, tags: [], count: 0 })),
    http.get(`${BASE}/blog/a-post`, () =>
      HttpResponse.json({
        success: true,
        message: 'ok',
        post: { slug: 'a-post', title: 'A Post', content: '<p>hi</p>', tags: [], related_posts: [] },
      }),
    ),
  );
}

beforeEach(() => {
  registerBlogEndpoints();
  // The handler logs on every failure path; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('render handler', () => {
  it('serves the blog index as cacheable HTML', async () => {
    const res = await run({ type: 'blog-index' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.headers['cache-control']).toContain('s-maxage');
    expect(res.headers.vary).toBe('Accept-Encoding');
    expect(res.body).toContain('<!DOCTYPE html>');
  });

  it('serves an article for type=blog-post', async () => {
    const res = await run({ type: 'blog-post', slug: 'a-post' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<h1>A Post</h1>');
  });

  it('forwards the visitor tag and page params to the renderer', async () => {
    let seen = null;
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json({ success: true, posts: [], count: 0, offset: 0, limit: 12, total: 0 });
      }),
    );
    await run({ type: 'blog-index', tag: 'Hair Care', page: '2' });
    expect(seen.searchParams.get('tag')).toBe('Hair Care');
    expect(seen.searchParams.get('offset')).toBe('12');
  });

  it('takes the first value when a visitor repeats their own param', async () => {
    // tag/page belong to the visitor, so a duplicate is harmless, not an attack.
    let seen = null;
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seen = new URL(request.url);
        return HttpResponse.json({ success: true, posts: [], count: 0, offset: 0, limit: 12, total: 0 });
      }),
    );
    const res = await run({ type: 'blog-index', tag: ['Hair Care', 'Skin'] });
    expect(res.statusCode).toBe(200);
    expect(seen.searchParams.get('tag')).toBe('Hair Care');
  });

  it('rejects a request that supplies its own type alongside the rewrite', async () => {
    // /blog?type=blog-post&slug=x arrives with two `type` values and Vercel does
    // not define which wins — rendering either would give the article a second
    // URL whose canonical points elsewhere.
    const res = await run({ type: ['blog-index', 'blog-post'], slug: 'a-post' });
    expect(res.statusCode).toBe(400);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body).toContain('noindex');
  });

  it('rejects a duplicated slug the same way', async () => {
    const res = await run({ type: 'blog-post', slug: ['a-post', 'other'] });
    expect(res.statusCode).toBe(400);
  });

  it('answers 500 for a type no renderer handles', async () => {
    // Only reachable if vercel.json and ROUTES disagree — a deploy-time bug.
    const res = await run({ type: 'salon-detail' });
    expect(res.statusCode).toBe(500);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('answers 500 when no type is given at all', async () => {
    const res = await run({});
    expect(res.statusCode).toBe(500);
  });

  it('survives a request with no query object', async () => {
    const res = makeRes();
    await handler({}, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toContain('<!DOCTYPE html>');
  });

  it('answers 503 rather than crashing when a renderer throws', async () => {
    const original = handler.ROUTES['blog-index'];
    handler.ROUTES['blog-index'] = () => {
      throw new Error('renderer bug');
    };
    try {
      const res = await run({ type: 'blog-index' });
      expect(res.statusCode).toBe(503);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.body).toContain('taking a moment');
    } finally {
      handler.ROUTES['blog-index'] = original;
    }
  });

  it('never serves an error page as indexable', async () => {
    for (const query of [{}, { type: 'nope' }, { type: ['a', 'b'] }]) {
      const res = await run(query);
      expect(res.body).toContain('<meta name="robots" content="noindex, follow" />');
    }
  });
});
