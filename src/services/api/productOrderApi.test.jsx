/**
 * Integration tests for the storefront product-order API client (productOrderApi.js).
 *
 * MSW-mocked backend; verifies the HTTP contract (URL, method, body) for the
 * customer order/checkout flow. Frontend half of the product_order_service audit
 * — paired with backend/tests/test_product_order_mocked.py.
 *
 * verify/dev-verify mutations refetch getMyProductOrders in onQueryStarted, so
 * those tests also register a /my-orders handler.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { productOrderApi } from './productOrderApi';
import * as orderApiModule from './productOrderApi';

const BASE = 'http://localhost:8000/api/v1/product-orders';

function makeStore() {
  return configureStore({
    reducer: { [productOrderApi.reducerPath]: productOrderApi.reducer },
    middleware: (getDefault) => getDefault().concat(productOrderApi.middleware),
  });
}

// Handler for the post-mutation refetch.
function serveMyOrders(orders = []) {
  server.use(http.get(`${BASE}/my-orders`, () => HttpResponse.json(orders)));
}

let store;
beforeEach(() => {
  store = makeStore();
});

// =====================================================================
// POST /product-orders/create
// =====================================================================
describe('createProductOrder', () => {
  it('POSTs the order payload to /product-orders/create', async () => {
    let body = null;
    server.use(
      http.post(`${BASE}/create`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          order: { id: 'o1', total_amount: 2000 },
          razorpay_order_id: 'dev_order_abc',
          dev_mode: true,
        });
      })
    );

    const payload = {
      shipping_address: { line1: '1 St' },
      discount_total: 0,
      items: [{ product_id: 'p1', quantity: 2 }],
    };
    const res = await store.dispatch(productOrderApi.endpoints.createProductOrder.initiate(payload));
    expect(body).toEqual(payload);
    expect(res.data.dev_mode).toBe(true);
  });

  it('surfaces a 400 (e.g. product not found) as an error result', async () => {
    server.use(
      http.post(`${BASE}/create`, () =>
        HttpResponse.json({ detail: 'Product not found' }, { status: 400 })
      )
    );

    const res = await store.dispatch(
      productOrderApi.endpoints.createProductOrder.initiate({ items: [] })
    );
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(400);
  });
});

// =====================================================================
// POST /product-orders/verify
// =====================================================================
describe('verifyProductPayment', () => {
  it('POSTs the razorpay payload to /product-orders/verify', async () => {
    serveMyOrders();
    let body = null;
    server.use(
      http.post(`${BASE}/verify`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, order_id: 'o1', order_number: 'ORD-1' });
      })
    );

    const payload = {
      razorpay_order_id: 'order_x',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig_1',
    };
    const res = await store.dispatch(productOrderApi.endpoints.verifyProductPayment.initiate(payload));
    expect(body).toEqual(payload);
    expect(res.data.success).toBe(true);
  });
});

// =====================================================================
// POST /product-orders/dev-verify/{orderId}
// =====================================================================
describe('devVerifyProductPayment', () => {
  it('POSTs to /product-orders/dev-verify/{orderId}', async () => {
    serveMyOrders();
    let seenPath = null;
    server.use(
      http.post(`${BASE}/dev-verify/:orderId`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, dev_mode: true });
      })
    );

    const res = await store.dispatch(
      productOrderApi.endpoints.devVerifyProductPayment.initiate('o1')
    );
    expect(seenPath).toBe('/api/v1/product-orders/dev-verify/o1');
    expect(res.data.dev_mode).toBe(true);
  });
});

// =====================================================================
// GET /product-orders/my-orders
// =====================================================================
describe('getMyProductOrders', () => {
  it('hits GET /product-orders/my-orders and returns the list', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/my-orders`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json([{ id: 'o1', order_number: 'ORD-1', items: [] }]);
      })
    );

    const res = await store.dispatch(productOrderApi.endpoints.getMyProductOrders.initiate());
    expect(seenPath).toBe('/api/v1/product-orders/my-orders');
    expect(res.data).toHaveLength(1);
  });
});

// =====================================================================
// Wiring
// =====================================================================
describe('exports', () => {
  it('exposes all four product-order hooks', () => {
    expect(orderApiModule.useCreateProductOrderMutation).toBeTypeOf('function');
    expect(orderApiModule.useVerifyProductPaymentMutation).toBeTypeOf('function');
    expect(orderApiModule.useDevVerifyProductPaymentMutation).toBeTypeOf('function');
    expect(orderApiModule.useGetMyProductOrdersQuery).toBeTypeOf('function');
  });
});
