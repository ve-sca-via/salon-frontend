/**
 * Integration tests for the service-cart API client (cartApi.js).
 * MSW-mocked backend; verifies URL/method/body for the customer service cart.
 * Paired with backend/tests/test_customer_mocked.py.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { cartApi } from './cartApi';
import { bookingApi } from './bookingApi';

const BASE = 'http://localhost:8000/api/v1/customers';

function makeStore() {
  return configureStore({
    reducer: { [cartApi.reducerPath]: cartApi.reducer, [bookingApi.reducerPath]: bookingApi.reducer },
    middleware: (g) => g().concat(cartApi.middleware, bookingApi.middleware),
  });
}
function serveCart(items = []) {
  server.use(http.get(`${BASE}/cart`, () =>
    HttpResponse.json({ success: true, items, total_amount: 0, item_count: items.length, salon_id: 's1' })));
}
let store;
beforeEach(() => { store = makeStore(); });

describe('getCart', () => {
  it('GETs /customers/cart', async () => {
    let p = null;
    server.use(http.get(`${BASE}/cart`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, items: [{ id: 'i1' }], total_amount: 0, item_count: 1 });
    }));
    const res = await store.dispatch(cartApi.endpoints.getCart.initiate());
    expect(p).toBe('/api/v1/customers/cart');
    expect(res.data.item_count).toBe(1);
  });
});

describe('addToCart', () => {
  it('POSTs the cart item to /customers/cart', async () => {
    let body = null;
    server.use(http.post(`${BASE}/cart`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, message: 'Item added to cart' });
    }));
    const res = await store.dispatch(cartApi.endpoints.addToCart.initiate({ service_id: 'svc1', quantity: 2 }));
    expect(body).toEqual({ service_id: 'svc1', quantity: 2 });
    expect(res.data.success).toBe(true);
  });

  it('surfaces a 400 (different salon) as an error', async () => {
    server.use(http.post(`${BASE}/cart`, () =>
      HttpResponse.json({ message: 'Cannot add services from different salons.' }, { status: 400 })));
    const res = await store.dispatch(cartApi.endpoints.addToCart.initiate({ service_id: 'svc1' }));
    expect(res.error.status).toBe(400);
  });
});

describe('updateCartItem', () => {
  it('PUTs {quantity} to /customers/cart/{itemId}', async () => {
    serveCart([{ id: 'i1', unit_price: 100, quantity: 1 }]);
    await store.dispatch(cartApi.endpoints.getCart.initiate()); // prime optimistic cache
    let p = null, body = null;
    server.use(http.put(`${BASE}/cart/:id`, async ({ request }) => {
      p = new URL(request.url).pathname; body = await request.json();
      return HttpResponse.json({ success: true, message: 'Cart item updated successfully' });
    }));
    const res = await store.dispatch(cartApi.endpoints.updateCartItem.initiate({ itemId: 'i1', quantity: 3 }));
    expect(p).toBe('/api/v1/customers/cart/i1');
    expect(body).toEqual({ quantity: 3 });
    expect(res.data.success).toBe(true);
  });
});

describe('removeFromCart', () => {
  it('DELETEs /customers/cart/{itemId}', async () => {
    serveCart([{ id: 'i1', unit_price: 100, quantity: 1 }]);
    await store.dispatch(cartApi.endpoints.getCart.initiate());
    let p = null;
    server.use(http.delete(`${BASE}/cart/:id`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, message: 'Item removed from cart' });
    }));
    const res = await store.dispatch(cartApi.endpoints.removeFromCart.initiate('i1'));
    expect(p).toBe('/api/v1/customers/cart/i1');
    expect(res.data.success).toBe(true);
  });
});

describe('clearCart', () => {
  it('DELETEs /customers/cart/clear/all', async () => {
    let p = null;
    server.use(http.delete(`${BASE}/cart/clear/all`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, message: 'Cart cleared', deleted_count: 2 });
    }));
    const res = await store.dispatch(cartApi.endpoints.clearCart.initiate());
    expect(p).toBe('/api/v1/customers/cart/clear/all');
    expect(res.data.deleted_count).toBe(2);
  });
});

describe('checkoutCart', () => {
  it('POSTs checkout data to /customers/cart/checkout', async () => {
    let body = null;
    server.use(http.post(`${BASE}/cart/checkout`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ id: 'bk1', booking_number: 'BK1', status: 'confirmed' });
    }));
    const res = await store.dispatch(cartApi.endpoints.checkoutCart.initiate(
      { booking_date: '2026-07-01', time_slots: ['10:00'] }));
    expect(body.booking_date).toBe('2026-07-01');
    expect(res.data.booking_number).toBe('BK1');
  });

  it('forwards an applied coupon_code in the checkout body', async () => {
    let body = null;
    server.use(http.post(`${BASE}/cart/checkout`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({
        id: 'bk2', booking_number: 'BK2', status: 'confirmed',
        coupon_code: body.coupon_code, discount_amount: 200,
      });
    }));
    const res = await store.dispatch(cartApi.endpoints.checkoutCart.initiate(
      { booking_date: '2026-07-01', time_slots: ['10:00'], coupon_code: 'SAVE20' }));
    expect(body.coupon_code).toBe('SAVE20');
    expect(res.data.discount_amount).toBe(200);
  });
});

// =====================================================================
// POST /customers/cart/validate-coupon  ("Apply coupon" at checkout)
// =====================================================================
describe('validateCoupon', () => {
  it('POSTs { code } to /customers/cart/validate-coupon and returns the breakdown', async () => {
    let p = null, body = null;
    server.use(http.post(`${BASE}/cart/validate-coupon`, async ({ request }) => {
      p = new URL(request.url).pathname; body = await request.json();
      return HttpResponse.json({
        valid: true, reason: null, coupon_id: 'c1', coupon_code: 'SAVE20',
        breakdown: {
          subtotal_service_price: 1000, discount_amount: 200, service_total_due: 800,
          convenience_fee_base: 100, convenience_fee_discount: 0, convenience_fee_due: 100,
          total_amount: 900, discount_source: 'coupon',
        },
      });
    }));
    const res = await store.dispatch(cartApi.endpoints.validateCoupon.initiate('SAVE20'));
    expect(p).toBe('/api/v1/customers/cart/validate-coupon');
    expect(body).toEqual({ code: 'SAVE20' });
    expect(res.data.valid).toBe(true);
    expect(res.data.breakdown.discount_amount).toBe(200);
  });

  it('returns valid:false with a reason for an ineligible coupon', async () => {
    server.use(http.post(`${BASE}/cart/validate-coupon`, () =>
      HttpResponse.json({
        valid: false, reason: 'A better discount is already applied at this salon.',
        coupon_id: null, coupon_code: null, breakdown: null,
      })));
    const res = await store.dispatch(cartApi.endpoints.validateCoupon.initiate('SAVE10'));
    expect(res.data.valid).toBe(false);
    expect(res.data.reason).toMatch(/better discount/i);
  });
});
