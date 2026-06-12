/**
 * Integration tests for the storefront product API client (productApi.js).
 *
 * These exercise the RTK Query endpoints against a mocked backend (MSW), so they
 * verify the exact HTTP contract the storefront relies on: URL, method, query
 * params, and response parsing. They are the frontend half of the product_service
 * audit — paired with backend/tests/test_product_mocked.py.
 *
 * Pattern: a throwaway store per test (fresh RTK Query cache) + per-test MSW
 * handlers registered via server.use(...) (reset in src/test/setup.js).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { productApi } from './productApi';
import * as productApiModule from './productApi';

const BASE = 'http://localhost:8000/api/v1';

function makeStore() {
  return configureStore({
    reducer: { [productApi.reducerPath]: productApi.reducer },
    middleware: (getDefault) => getDefault().concat(productApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

// =====================================================================
// GET /products  (public list)
// =====================================================================
describe('getProducts', () => {
  it('hits GET /products and returns the products payload', async () => {
    let seenUrl = null;
    server.use(
      http.get(`${BASE}/products`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json({
          success: true,
          products: [{ id: 'p1', name: 'Serum' }],
          count: 1,
          total: 1,
        });
      })
    );

    const res = await store.dispatch(productApi.endpoints.getProducts.initiate({}));
    expect(res.data.success).toBe(true);
    expect(res.data.products).toHaveLength(1);
    expect(seenUrl.pathname).toBe('/api/v1/products');
  });

  it('forwards filters (category/search) as query params', async () => {
    let params = null;
    server.use(
      http.get(`${BASE}/products`, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ success: true, products: [], count: 0, total: 0 });
      })
    );

    await store.dispatch(
      productApi.endpoints.getProducts.initiate({ category: 'haircare', search: 'argan' })
    );
    expect(params.get('category')).toBe('haircare');
    expect(params.get('search')).toBe('argan');
  });

  it('forwards the featured-carousel filter (is_featured + limit)', async () => {
    let params = null;
    server.use(
      http.get(`${BASE}/products`, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ success: true, products: [], count: 0, total: 0 });
      })
    );

    await store.dispatch(
      productApi.endpoints.getProducts.initiate({ is_featured: true, limit: 10 })
    );
    expect(params.get('is_featured')).toBe('true');
    expect(params.get('limit')).toBe('10');
  });

  it('surfaces a backend 500 as an error result', async () => {
    server.use(
      http.get(`${BASE}/products`, () =>
        HttpResponse.json({ detail: 'Failed to fetch products' }, { status: 500 })
      )
    );

    const res = await store.dispatch(productApi.endpoints.getProducts.initiate({}));
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(500);
  });
});

// =====================================================================
// GET /products/slug/{slug}  (detail page)
// =====================================================================
describe('getProductBySlug', () => {
  it('hits GET /products/slug/{slug}', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/products/slug/:slug`, ({ request, params }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, product: { slug: params.slug } });
      })
    );

    const res = await store.dispatch(
      productApi.endpoints.getProductBySlug.initiate('hair-serum-250ml')
    );
    expect(seenPath).toBe('/api/v1/products/slug/hair-serum-250ml');
    expect(res.data.product.slug).toBe('hair-serum-250ml');
  });
});

// =====================================================================
// GET /products/categories
// =====================================================================
describe('getProductCategories', () => {
  it('hits GET /products/categories and returns the list', async () => {
    server.use(
      http.get(`${BASE}/products/categories`, () =>
        HttpResponse.json({ success: true, categories: ['haircare', 'skincare'] })
      )
    );

    const res = await store.dispatch(
      productApi.endpoints.getProductCategories.initiate()
    );
    expect(res.data.categories).toEqual(['haircare', 'skincare']);
  });
});

// =====================================================================
// Regression: getProductById was dead code, removed in P1 cleanup
// =====================================================================
describe('product_service P1 cleanup', () => {
  it('no longer exports a getProductById hook', () => {
    expect(productApiModule.useGetProductByIdQuery).toBeUndefined();
    expect(productApi.endpoints.getProductById).toBeUndefined();
  });
});
