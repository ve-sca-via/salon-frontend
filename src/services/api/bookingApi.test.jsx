/**
 * Integration tests for the booking API client (bookingApi.js) — the customer
 * bookings list + cancel. Paired with backend/tests/test_customer_mocked.py.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { bookingApi } from './bookingApi';

const BASE = 'http://localhost:8000/api/v1/customers/bookings';

function makeStore() {
  return configureStore({
    reducer: { [bookingApi.reducerPath]: bookingApi.reducer },
    middleware: (g) => g().concat(bookingApi.middleware),
  });
}
let store;
beforeEach(() => { store = makeStore(); });

describe('getMyBookings', () => {
  it('GETs /customers/bookings/my-bookings', async () => {
    let p = null;
    server.use(http.get(`${BASE}/my-bookings`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, data: [{ id: 'bk1', status: 'confirmed' }], count: 1 });
    }));
    const res = await store.dispatch(bookingApi.endpoints.getMyBookings.initiate());
    expect(p).toBe('/api/v1/customers/bookings/my-bookings');
    expect(res.data.count).toBe(1);
  });
});

describe('cancelBooking', () => {
  it('PUTs /customers/bookings/{id}/cancel', async () => {
    // prime getMyBookings for the optimistic patch
    server.use(http.get(`${BASE}/my-bookings`, () =>
      HttpResponse.json({ success: true, data: [{ id: 'bk1', status: 'confirmed' }], count: 1 })));
    await store.dispatch(bookingApi.endpoints.getMyBookings.initiate());

    let p = null;
    server.use(http.put(`${BASE}/:id/cancel`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, message: 'Booking cancelled successfully', booking: { id: 'bk1', status: 'cancelled' } });
    }));
    const res = await store.dispatch(bookingApi.endpoints.cancelBooking.initiate('bk1'));
    expect(p).toBe('/api/v1/customers/bookings/bk1/cancel');
    expect(res.data.booking.status).toBe('cancelled');
  });
});
