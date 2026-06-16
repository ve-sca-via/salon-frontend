/**
 * Integration tests for the storefront banner API client (bannerApi.js).
 *
 * Exercises the RTK Query endpoint against a mocked backend (MSW) to verify the
 * exact HTTP contract the home carousel relies on: URL, method, and response
 * parsing. This is the web half of the banner feature — paired with the backend
 * tests/test_banner_mocked.py and the mobile useBannersAPI hook.
 *
 * Pattern: a throwaway store per test (fresh RTK Query cache) + per-test MSW
 * handlers registered via server.use(...) (reset in src/test/setup.js).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { bannerApi } from './bannerApi';

const BASE = 'http://localhost:8000/api/v1';

function makeStore() {
  return configureStore({
    reducer: { [bannerApi.reducerPath]: bannerApi.reducer },
    middleware: (getDefault) => getDefault().concat(bannerApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

// =====================================================================
// GET /banners  (public carousel feed)
// =====================================================================
describe('getBanners', () => {
  it('hits GET /banners (no auth) and returns the banners payload', async () => {
    let seenUrl = null;
    let authHeader = 'unset';
    server.use(
      http.get(`${BASE}/banners`, ({ request }) => {
        seenUrl = new URL(request.url);
        authHeader = request.headers.get('authorization');
        return HttpResponse.json({
          success: true,
          banners: [
            {
              id: 'b1',
              title: 'Flat 10% OFF',
              image_url: 'https://res.cloudinary.com/x/banners/a.jpg',
              link_url: 'https://lubist.app/sale',
              sort_order: 0,
              is_active: true,
            },
          ],
          count: 1,
        });
      })
    );

    const res = await store.dispatch(bannerApi.endpoints.getBanners.initiate());
    expect(res.data.success).toBe(true);
    expect(res.data.banners).toHaveLength(1);
    expect(res.data.banners[0].image_url).toContain('banners/a.jpg');
    expect(seenUrl.pathname).toBe('/api/v1/banners');
    expect(authHeader).toBeNull(); // public endpoint — no bearer token
  });

  it('handles an empty feed (clients fall back to the bundled hero)', async () => {
    server.use(
      http.get(`${BASE}/banners`, () =>
        HttpResponse.json({ success: true, banners: [], count: 0 })
      )
    );

    const res = await store.dispatch(bannerApi.endpoints.getBanners.initiate());
    expect(res.data.banners).toEqual([]);
    expect(res.data.count).toBe(0);
  });

  it('surfaces a backend 500 as an error result', async () => {
    server.use(
      http.get(`${BASE}/banners`, () =>
        HttpResponse.json({ detail: 'Failed to fetch banners' }, { status: 500 })
      )
    );

    const res = await store.dispatch(bannerApi.endpoints.getBanners.initiate());
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(500);
  });
});
