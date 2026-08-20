/**
 * Integration tests for the public blog API client (blogApi.js).
 *
 * Exercises the RTK Query endpoints against a mocked backend (MSW) to verify
 * the exact HTTP contract: URL, method, query params, and that these are public
 * reads that never attach an Authorization header.
 *
 * Pattern matches bannerApi.test.jsx: a throwaway store per test (fresh cache)
 * plus per-test MSW handlers, reset in src/test/setup.js.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { blogApi } from './blogApi';

const BASE = 'http://localhost:8000/api/v1';

function makeStore() {
  return configureStore({
    reducer: { [blogApi.reducerPath]: blogApi.reducer },
    middleware: (getDefault) => getDefault().concat(blogApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

const listPayload = (posts = []) => ({
  success: true,
  posts,
  count: posts.length,
  offset: 0,
  limit: 12,
  total: posts.length,
});

// =====================================================================
// GET /blog
// =====================================================================
describe('getBlogPosts', () => {
  it('hits GET /blog with no auth header and returns the payload', async () => {
    let seenUrl = null;
    let authHeader = 'unset';
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seenUrl = new URL(request.url);
        authHeader = request.headers.get('authorization');
        return HttpResponse.json(listPayload([{ id: 'p1', slug: 'a', title: 'A' }]));
      }),
    );

    const result = await store.dispatch(blogApi.endpoints.getBlogPosts.initiate({}));

    expect(seenUrl.pathname).toBe('/api/v1/blog');
    expect(authHeader).toBeNull();
    expect(result.data.posts).toHaveLength(1);
    expect(result.data.total).toBe(1);
  });

  it('defaults to a page size of 12 starting at offset 0', async () => {
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json(listPayload());
      }),
    );

    await store.dispatch(blogApi.endpoints.getBlogPosts.initiate({}));

    expect(seenUrl.searchParams.get('limit')).toBe('12');
    expect(seenUrl.searchParams.get('offset')).toBe('0');
  });

  it('sends tag and search when they are set', async () => {
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json(listPayload());
      }),
    );

    await store.dispatch(
      blogApi.endpoints.getBlogPosts.initiate({ tag: 'Hair Care', search: 'spa', limit: 6, offset: 12 }),
    );

    expect(seenUrl.searchParams.get('tag')).toBe('Hair Care');
    expect(seenUrl.searchParams.get('search')).toBe('spa');
    expect(seenUrl.searchParams.get('limit')).toBe('6');
    expect(seenUrl.searchParams.get('offset')).toBe('12');
  });

  it('omits empty filters instead of sending blanks the API would treat as real', async () => {
    // `?tag=` is a filter for the empty tag, which matches nothing — an unfiltered
    // list must send no tag param at all.
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/blog`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json(listPayload());
      }),
    );

    await store.dispatch(blogApi.endpoints.getBlogPosts.initiate({ tag: '', search: '' }));

    expect(seenUrl.searchParams.has('tag')).toBe(false);
    expect(seenUrl.searchParams.has('search')).toBe(false);
  });

  it('surfaces a backend failure as an error rather than empty data', async () => {
    server.use(http.get(`${BASE}/blog`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));

    const result = await store.dispatch(blogApi.endpoints.getBlogPosts.initiate({}));

    expect(result.isError).toBe(true);
    expect(result.data).toBeUndefined();
  });
});

// =====================================================================
// GET /blog/tags
// =====================================================================
describe('getBlogTags', () => {
  it('hits GET /blog/tags and returns the tag list', async () => {
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/blog/tags`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json({ success: true, tags: ['Hair Care', 'Skin'], count: 2 });
      }),
    );

    const result = await store.dispatch(blogApi.endpoints.getBlogTags.initiate());

    expect(seenUrl.pathname).toBe('/api/v1/blog/tags');
    expect(result.data.tags).toEqual(['Hair Care', 'Skin']);
  });
});

// =====================================================================
// GET /blog/{slug}
// =====================================================================
describe('getBlogPost', () => {
  it('hits GET /blog/{slug} and returns the post with related posts', async () => {
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/blog/best-hair-spa-in-delhi`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json({
          success: true,
          message: 'Blog post retrieved',
          post: {
            id: 'p1',
            slug: 'best-hair-spa-in-delhi',
            title: 'Best Hair Spa in Delhi',
            content: '<p>Body</p>',
            related_posts: [{ id: 'p2', slug: 'other', title: 'Other' }],
          },
        });
      }),
    );

    const result = await store.dispatch(
      blogApi.endpoints.getBlogPost.initiate('best-hair-spa-in-delhi'),
    );

    expect(seenUrl.pathname).toBe('/api/v1/blog/best-hair-spa-in-delhi');
    expect(result.data.post.title).toBe('Best Hair Spa in Delhi');
    expect(result.data.post.related_posts).toHaveLength(1);
  });

  it('reports a 404 as an error so the page can show its not-found state', async () => {
    server.use(
      http.get(`${BASE}/blog/nope`, () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })),
    );

    const result = await store.dispatch(blogApi.endpoints.getBlogPost.initiate('nope'));

    expect(result.isError).toBe(true);
    expect(result.error.status).toBe(404);
  });
});
