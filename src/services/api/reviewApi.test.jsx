/**
 * Integration tests for the review API client (reviewApi.js): customer reviews
 * + public salon reviews/feedback. Paired with backend/tests/test_customer_mocked.py.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { reviewApi } from './reviewApi';

const V1 = 'http://localhost:8000/api/v1';

function makeStore() {
  return configureStore({
    reducer: { [reviewApi.reducerPath]: reviewApi.reducer },
    middleware: (g) => g().concat(reviewApi.middleware),
  });
}
let store;
beforeEach(() => { store = makeStore(); });

describe('getMyReviews', () => {
  it('GETs /customers/reviews/my-reviews', async () => {
    let p = null;
    server.use(http.get(`${V1}/customers/reviews/my-reviews`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, reviews: [{ id: 'r1' }], count: 1 });
    }));
    const res = await store.dispatch(reviewApi.endpoints.getMyReviews.initiate());
    expect(p).toBe('/api/v1/customers/reviews/my-reviews');
    expect(res.data.count).toBe(1);
  });
});

describe('createReview', () => {
  it('POSTs review data to /customers/reviews', async () => {
    let body = null;
    server.use(http.post(`${V1}/customers/reviews`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, message: 'ok', review: { id: 'r1' } });
    }));
    const payload = { salon_id: 's1', rating: 5, comment: 'Loved every minute', booking_id: 'bk1' };
    const res = await store.dispatch(reviewApi.endpoints.createReview.initiate(payload));
    expect(body).toEqual(payload);
    expect(res.data.success).toBe(true);
  });
});

describe('updateReview', () => {
  it('PUTs to /customers/reviews/{reviewId}', async () => {
    let p = null, body = null;
    server.use(http.put(`${V1}/customers/reviews/:id`, async ({ request }) => {
      p = new URL(request.url).pathname; body = await request.json();
      return HttpResponse.json({ success: true, message: 'ok', review: { id: 'r1' } });
    }));
    const res = await store.dispatch(reviewApi.endpoints.updateReview.initiate(
      { reviewId: 'r1', rating: 4, comment: 'Updated comment text' }));
    expect(p).toBe('/api/v1/customers/reviews/r1');
    expect(body).toEqual({ rating: 4, comment: 'Updated comment text' });
    expect(res.data.success).toBe(true);
  });
});

describe('getSalonReviews', () => {
  it('GETs /salons/{salonId}/reviews', async () => {
    let p = null;
    server.use(http.get(`${V1}/salons/:id/reviews`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, reviews: [], count: 0 });
    }));
    await store.dispatch(reviewApi.endpoints.getSalonReviews.initiate('s1'));
    expect(p).toBe('/api/v1/salons/s1/reviews');
  });
});

describe('getFeedbackContext', () => {
  it('GETs /salons/{salonId}/feedback with token', async () => {
    let url = null;
    server.use(http.get(`${V1}/salons/:id/feedback`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ success: true, booking: { id: 'bk1' }, salon: { id: 's1' } });
    }));
    await store.dispatch(reviewApi.endpoints.getFeedbackContext.initiate({ salonId: 's1', token: 'tok123' }));
    expect(url.pathname).toBe('/api/v1/salons/s1/feedback');
    expect(url.searchParams.get('token')).toBe('tok123');
  });
});

describe('submitFeedback', () => {
  it('POSTs {token,rating,comment} to /salons/{salonId}/feedback', async () => {
    let p = null, body = null;
    server.use(http.post(`${V1}/salons/:id/feedback`, async ({ request }) => {
      p = new URL(request.url).pathname; body = await request.json();
      return HttpResponse.json({ success: true, message: 'ok', review: { id: 'r1' } });
    }));
    const res = await store.dispatch(reviewApi.endpoints.submitFeedback.initiate(
      { salonId: 's1', token: 'tok', rating: 5, comment: 'Great service overall' }));
    expect(p).toBe('/api/v1/salons/s1/feedback');
    expect(body).toEqual({ token: 'tok', rating: 5, comment: 'Great service overall' });
    expect(res.data.success).toBe(true);
  });
});
