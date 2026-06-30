/**
 * Integration tests for the vendor coupon endpoints on vendorApi.js.
 *
 * MSW-mocked backend; verifies the HTTP contract for a vendor managing
 * code-based coupons for their own salon (scope/salon/funded are forced
 * server-side, so the client just sends the form fields).
 *   - GET    /api/v1/vendors/coupons
 *   - POST   /api/v1/vendors/coupons
 *   - PATCH  /api/v1/vendors/coupons/{id}
 *   - DELETE /api/v1/vendors/coupons/{id}
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { vendorApi } from './vendorApi';

const BASE = 'http://localhost:8000/api/v1/vendors';
const COUPONS = `${BASE}/coupons`;

const sampleCoupon = (overrides = {}) => ({
  id: 'vc1',
  code: 'INSTA15',
  title: '15% off (Instagram)',
  scope: 'vendor',
  salon_id: 's1',
  applies_to: 'service',
  discount_type: 'percentage',
  discount_value: 15,
  used_count: 0,
  usage_limit_per_user: 1,
  is_active: true,
  ...overrides,
});

function makeStore() {
  return configureStore({
    reducer: { [vendorApi.reducerPath]: vendorApi.reducer },
    middleware: (g) => g().concat(vendorApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

describe('getVendorCoupons', () => {
  it('GETs /vendors/coupons', async () => {
    let p = null;
    server.use(
      http.get(COUPONS, ({ request }) => {
        p = new URL(request.url).pathname;
        return HttpResponse.json([sampleCoupon()]);
      })
    );
    const res = await store.dispatch(vendorApi.endpoints.getVendorCoupons.initiate());
    expect(p).toBe('/api/v1/vendors/coupons');
    expect(res.data[0].code).toBe('INSTA15');
  });
});

describe('createVendorCoupon', () => {
  it('POSTs the form body to /vendors/coupons', async () => {
    let body = null;
    server.use(
      http.post(COUPONS, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(sampleCoupon({ id: 'new-1', ...body }));
      })
    );
    const payload = {
      code: 'INSTA15',
      title: '15% off (Instagram)',
      applies_to: 'service',
      discount_type: 'percentage',
      discount_value: 15,
    };
    const res = await store.dispatch(vendorApi.endpoints.createVendorCoupon.initiate(payload));
    expect(body).toEqual(payload);
    expect(res.data.id).toBe('new-1');
  });

  it('surfaces a 409 (duplicate active code) as an error', async () => {
    server.use(
      http.post(COUPONS, () =>
        HttpResponse.json({ detail: 'Coupon code already exists' }, { status: 409 })
      )
    );
    const res = await store.dispatch(
      vendorApi.endpoints.createVendorCoupon.initiate({ code: 'INSTA15' })
    );
    expect(res.error.status).toBe(409);
  });
});

describe('updateVendorCoupon', () => {
  it('PATCHes /vendors/coupons/{id} with the changed fields', async () => {
    let seenPath = null, seenMethod = null, body = null;
    server.use(
      http.patch(`${COUPONS}/:id`, async ({ request, params }) => {
        seenPath = new URL(request.url).pathname;
        seenMethod = request.method;
        body = await request.json();
        return HttpResponse.json(sampleCoupon({ id: params.id, ...body }));
      })
    );
    const res = await store.dispatch(
      vendorApi.endpoints.updateVendorCoupon.initiate({
        couponId: 'vc1',
        data: { is_active: false },
      })
    );
    expect(seenMethod).toBe('PATCH');
    expect(seenPath).toBe('/api/v1/vendors/coupons/vc1');
    expect(body).toEqual({ is_active: false });
    expect(res.data.is_active).toBe(false);
  });
});

describe('deactivateVendorCoupon', () => {
  it('DELETEs /vendors/coupons/{id}', async () => {
    let seenPath = null, seenMethod = null;
    server.use(
      http.delete(`${COUPONS}/:id`, ({ request, params }) => {
        seenPath = new URL(request.url).pathname;
        seenMethod = request.method;
        return HttpResponse.json(sampleCoupon({ id: params.id, is_active: false }));
      })
    );
    const res = await store.dispatch(vendorApi.endpoints.deactivateVendorCoupon.initiate('vc1'));
    expect(seenMethod).toBe('DELETE');
    expect(seenPath).toBe('/api/v1/vendors/coupons/vc1');
    expect(res.data.is_active).toBe(false);
  });
});
