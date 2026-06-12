/**
 * Integration tests for the payment API client (paymentApi.js).
 *
 * MSW-mocked backend; verifies the HTTP contract (URL, method, body) for the
 * surviving payment hooks. Frontend half of the payment module audit — paired
 * with backend/tests/test_payment_mocked.py.
 *
 * After the audit the client exposes exactly three hooks (cart create-order,
 * vendor registration create-order, vendor registration verify). The removed
 * booking/history hooks are asserted gone so they can't silently creep back.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { paymentApi } from './paymentApi';
import * as paymentApiModule from './paymentApi';

const BASE = 'http://localhost:8000/api/v1/payments';

function makeStore() {
  return configureStore({
    reducer: { [paymentApi.reducerPath]: paymentApi.reducer },
    middleware: (getDefault) => getDefault().concat(paymentApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

// =====================================================================
// POST /payments/cart/create-order
// =====================================================================
describe('createCartPaymentOrder', () => {
  it('POSTs to /payments/cart/create-order (no body required)', async () => {
    let seenPath = null;
    let method = null;
    server.use(
      http.post(`${BASE}/cart/create-order`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        method = request.method;
        return HttpResponse.json({
          order_id: 'order_abc',
          amount: 100,
          amount_paise: 10000,
          currency: 'INR',
          key_id: 'test_key_id',
          breakdown: { booking_fee: 100, pay_at_salon: 1000 },
        });
      })
    );

    const res = await store.dispatch(paymentApi.endpoints.createCartPaymentOrder.initiate());
    expect(seenPath).toBe('/api/v1/payments/cart/create-order');
    expect(method).toBe('POST');
    expect(res.data.order_id).toBe('order_abc');
    expect(res.data.breakdown.booking_fee).toBe(100);
  });

  it('surfaces a 400 (empty cart) as an error result', async () => {
    server.use(
      http.post(`${BASE}/cart/create-order`, () =>
        HttpResponse.json({ detail: 'Cart is empty' }, { status: 400 })
      )
    );

    const res = await store.dispatch(paymentApi.endpoints.createCartPaymentOrder.initiate());
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(400);
  });
});

// =====================================================================
// POST /payments/registration/create-order
// =====================================================================
describe('createVendorRegistrationOrder', () => {
  it('POSTs with vendor_request_id as a query param', async () => {
    let seenUrl = null;
    server.use(
      http.post(`${BASE}/registration/create-order`, ({ request }) => {
        seenUrl = new URL(request.url);
        return HttpResponse.json({
          order_id: 'order_reg',
          amount: 1500,
          amount_paise: 150000,
          currency: 'INR',
          key_id: 'test_key_id',
        });
      })
    );

    const res = await store.dispatch(
      paymentApi.endpoints.createVendorRegistrationOrder.initiate('vr1')
    );
    expect(seenUrl.pathname).toBe('/api/v1/payments/registration/create-order');
    expect(seenUrl.searchParams.get('vendor_request_id')).toBe('vr1');
    expect(res.data.amount).toBe(1500);
  });

  it('surfaces a 400 (not approved / already paid) as an error result', async () => {
    server.use(
      http.post(`${BASE}/registration/create-order`, () =>
        HttpResponse.json({ detail: 'Vendor request must be approved before payment' }, { status: 400 })
      )
    );

    const res = await store.dispatch(
      paymentApi.endpoints.createVendorRegistrationOrder.initiate('vr1')
    );
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(400);
  });
});

// =====================================================================
// POST /payments/registration/verify
// =====================================================================
describe('verifyVendorRegistrationPayment', () => {
  it('POSTs the razorpay payload to /payments/registration/verify', async () => {
    let body = null;
    server.use(
      http.post(`${BASE}/registration/verify`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          message: 'Payment verified successfully! Your salon is now active.',
          payment_id: 'pay_reg_1',
          salon_id: 's1',
          salon_name: 'Test Salon',
        });
      })
    );

    const payload = {
      razorpay_order_id: 'order_reg',
      razorpay_payment_id: 'pay_reg_1',
      razorpay_signature: 'sig_1',
    };
    const res = await store.dispatch(
      paymentApi.endpoints.verifyVendorRegistrationPayment.initiate(payload)
    );
    expect(body).toEqual(payload);
    expect(res.data.success).toBe(true);
    expect(res.data.salon_id).toBe('s1');
  });

  it('surfaces a 400 (invalid signature) as an error result', async () => {
    server.use(
      http.post(`${BASE}/registration/verify`, () =>
        HttpResponse.json({ detail: 'Invalid payment signature' }, { status: 400 })
      )
    );

    const res = await store.dispatch(
      paymentApi.endpoints.verifyVendorRegistrationPayment.initiate({
        razorpay_order_id: 'order_reg',
        razorpay_payment_id: 'pay_reg_1',
        razorpay_signature: 'bad',
      })
    );
    expect(res.data).toBeUndefined();
    expect(res.error.status).toBe(400);
  });
});

// =====================================================================
// Wiring — surviving hooks present, removed hooks gone
// =====================================================================
describe('exports', () => {
  it('exposes exactly the three surviving payment hooks', () => {
    expect(paymentApiModule.useCreateCartPaymentOrderMutation).toBeTypeOf('function');
    expect(paymentApiModule.useCreateVendorRegistrationOrderMutation).toBeTypeOf('function');
    expect(paymentApiModule.useVerifyVendorRegistrationPaymentMutation).toBeTypeOf('function');
  });

  it('no longer exports the removed booking/history hooks', () => {
    expect(paymentApiModule.useCreateBookingOrderMutation).toBeUndefined();
    expect(paymentApiModule.useVerifyBookingPaymentMutation).toBeUndefined();
    expect(paymentApiModule.useGetPaymentHistoryQuery).toBeUndefined();
  });
});
