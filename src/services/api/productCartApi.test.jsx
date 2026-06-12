/**
 * Integration tests for the storefront product-cart API client (productCartApi.js).
 *
 * These exercise the RTK Query endpoints against a mocked backend (MSW), verifying
 * the exact HTTP contract: URL, method, and request body. They are the frontend
 * half of the product_cart_service audit — paired with
 * backend/tests/test_product_cart_mocked.py. (There is no admin product cart.)
 *
 * Pattern: a throwaway store per test (fresh RTK Query cache) + per-test MSW
 * handlers via server.use(...) (reset in src/test/setup.js). The update/remove
 * mutations run optimistic cache patches over getProductCart, so those tests
 * prime that cache first.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { productCartApi } from './productCartApi';
import * as cartApiModule from './productCartApi';

const BASE = 'http://localhost:8000/api/v1/customers';

function makeStore() {
  return configureStore({
    reducer: { [productCartApi.reducerPath]: productCartApi.reducer },
    middleware: (getDefault) => getDefault().concat(productCartApi.middleware),
  });
}

// Handler that serves a one-line cart, used to prime the cache before mutations.
function serveCart(items) {
  server.use(
    http.get(`${BASE}/product-cart`, () =>
      HttpResponse.json({
        success: true,
        items,
        total_amount: items.reduce((t, i) => t + i.price * i.quantity, 0),
        item_count: items.reduce((t, i) => t + i.quantity, 0),
      })
    )
  );
}

let store;
beforeEach(() => {
  store = makeStore();
});

// =====================================================================
// GET /customers/product-cart
// =====================================================================
describe('getProductCart', () => {
  it('hits GET /customers/product-cart and returns the cart', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/product-cart`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({
          success: true,
          items: [{ id: 'i1', product_id: 'p1', name: 'Serum', price: 1000, quantity: 2, total: 2000 }],
          total_amount: 2000,
          item_count: 2,
        });
      })
    );

    const res = await store.dispatch(productCartApi.endpoints.getProductCart.initiate());
    expect(seenPath).toBe('/api/v1/customers/product-cart');
    expect(res.data.item_count).toBe(2);
    expect(res.data.items[0].total).toBe(2000);
  });
});

// =====================================================================
// POST /customers/product-cart  (add)
// =====================================================================
describe('addToProductCart', () => {
  it('POSTs {product_id, quantity} to /customers/product-cart', async () => {
    let body = null;
    server.use(
      http.post(`${BASE}/product-cart`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Product added to cart' });
      })
    );

    const res = await store.dispatch(
      productCartApi.endpoints.addToProductCart.initiate({ product_id: 'p1', quantity: 2 })
    );
    expect(body).toEqual({ product_id: 'p1', quantity: 2 });
    expect(res.data.success).toBe(true);
  });

  it('surfaces a 400 (out of stock) as an error result', async () => {
    server.use(
      http.post(`${BASE}/product-cart`, () =>
        HttpResponse.json({ detail: 'Requested quantity exceeds available stock' }, { status: 400 })
      )
    );

    const res = await store.dispatch(
      productCartApi.endpoints.addToProductCart.initiate({ product_id: 'p1', quantity: 99 })
    );
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(400);
  });
});

// =====================================================================
// PUT /customers/product-cart/{itemId}  (update qty)
// =====================================================================
describe('updateProductCartItem', () => {
  it('PUTs {quantity} to /customers/product-cart/{itemId}', async () => {
    serveCart([{ id: 'i1', product_id: 'p1', price: 1000, quantity: 1 }]);
    await store.dispatch(productCartApi.endpoints.getProductCart.initiate()); // prime cache

    let seenPath = null;
    let body = null;
    server.use(
      http.put(`${BASE}/product-cart/:itemId`, async ({ request }) => {
        seenPath = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Cart updated' });
      })
    );

    const res = await store.dispatch(
      productCartApi.endpoints.updateProductCartItem.initiate({ itemId: 'i1', quantity: 4 })
    );
    expect(seenPath).toBe('/api/v1/customers/product-cart/i1');
    expect(body).toEqual({ quantity: 4 });
    expect(res.data.success).toBe(true);
  });
});

// =====================================================================
// DELETE /customers/product-cart/{itemId}  (remove)
// =====================================================================
describe('removeProductFromCart', () => {
  it('DELETEs /customers/product-cart/{itemId}', async () => {
    serveCart([{ id: 'i1', product_id: 'p1', price: 1000, quantity: 1 }]);
    await store.dispatch(productCartApi.endpoints.getProductCart.initiate()); // prime cache

    let seenPath = null;
    server.use(
      http.delete(`${BASE}/product-cart/:itemId`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, message: 'Item removed' });
      })
    );

    const res = await store.dispatch(
      productCartApi.endpoints.removeProductFromCart.initiate('i1')
    );
    expect(seenPath).toBe('/api/v1/customers/product-cart/i1');
    expect(res.data.success).toBe(true);
  });
});

// =====================================================================
// DELETE /customers/product-cart/clear/all  (clear)
// =====================================================================
describe('clearProductCart', () => {
  it('DELETEs /customers/product-cart/clear/all', async () => {
    let seenPath = null;
    server.use(
      http.delete(`${BASE}/product-cart/clear/all`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, message: 'Cart cleared' });
      })
    );

    const res = await store.dispatch(productCartApi.endpoints.clearProductCart.initiate());
    expect(seenPath).toBe('/api/v1/customers/product-cart/clear/all');
    expect(res.data.success).toBe(true);
  });
});

// =====================================================================
// Wiring: all five hooks are exported
// =====================================================================
describe('exports', () => {
  it('exposes all five product-cart hooks', () => {
    expect(cartApiModule.useGetProductCartQuery).toBeTypeOf('function');
    expect(cartApiModule.useAddToProductCartMutation).toBeTypeOf('function');
    expect(cartApiModule.useUpdateProductCartItemMutation).toBeTypeOf('function');
    expect(cartApiModule.useRemoveProductFromCartMutation).toBeTypeOf('function');
    expect(cartApiModule.useClearProductCartMutation).toBeTypeOf('function');
  });
});
