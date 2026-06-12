/**
 * Integration tests for the RM-portal API client (rmApi.js).
 *
 * MSW-mocked backend; verifies the HTTP contract (URL, method, query flags, body)
 * for the RM vendor-onboarding flow. Frontend half of the rm_service audit —
 * paired with backend/tests/test_rm_mocked.py.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { rmApi } from './rmApi';
import * as rmApiModule from './rmApi';

const BASE = 'http://localhost:8000/api/v1/rm';

function makeStore() {
  return configureStore({
    reducer: { [rmApi.reducerPath]: rmApi.reducer },
    middleware: (getDefault) => getDefault().concat(rmApi.middleware),
  });
}

let store;
beforeEach(() => {
  store = makeStore();
});

const VR = { business_name: 'Biz', business_type: 'salon', city: 'Testville' };

// =====================================================================
// POST /rm/vendor-requests
// =====================================================================
describe('submitVendorRequest', () => {
  it('POSTs to /rm/vendor-requests (no draft flag by default)', async () => {
    let url = null, body = null;
    server.use(
      http.post(`${BASE}/vendor-requests`, async ({ request }) => {
        url = new URL(request.url);
        body = await request.json();
        return HttpResponse.json({ id: 'r1', status: 'pending' });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.submitVendorRequest.initiate({ requestData: VR }));
    expect(url.pathname).toBe('/api/v1/rm/vendor-requests');
    expect(url.searchParams.get('is_draft')).toBeNull();
    expect(body).toEqual(VR);
    expect(res.data.status).toBe('pending');
  });

  it('adds ?is_draft=true when saving a draft', async () => {
    let url = null;
    server.use(
      http.post(`${BASE}/vendor-requests`, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({ id: 'r1', status: 'draft' });
      })
    );

    await store.dispatch(rmApi.endpoints.submitVendorRequest.initiate({ requestData: VR, isDraft: true }));
    expect(url.searchParams.get('is_draft')).toBe('true');
  });
});

// =====================================================================
// GET /rm/vendor-requests (+ {id})
// =====================================================================
describe('getOwnVendorRequests', () => {
  it('GETs /rm/vendor-requests with status_filter', async () => {
    let url = null;
    server.use(
      http.get(`${BASE}/vendor-requests`, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({ success: true, message: 'ok', data: [{ id: 'r1' }], count: 1 });
      })
    );

    const res = await store.dispatch(
      rmApi.endpoints.getOwnVendorRequests.initiate({ status_filter: 'pending' })
    );
    expect(url.pathname).toBe('/api/v1/rm/vendor-requests');
    expect(url.searchParams.get('status_filter')).toBe('pending');
    expect(res.data.count).toBe(1);
  });
});

describe('getVendorRequestById', () => {
  it('GETs /rm/vendor-requests/{id}', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/vendor-requests/:id`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ id: 'r1', status: 'draft' });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.getVendorRequestById.initiate('r1'));
    expect(seenPath).toBe('/api/v1/rm/vendor-requests/r1');
    expect(res.data.id).toBe('r1');
  });
});

// =====================================================================
// PUT/DELETE /rm/vendor-requests/{id}
// =====================================================================
describe('updateVendorRequest', () => {
  it('PUTs /rm/vendor-requests/{id} with ?submit_for_approval=true', async () => {
    let url = null, body = null;
    server.use(
      http.put(`${BASE}/vendor-requests/:id`, async ({ request }) => {
        url = new URL(request.url);
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', data: { id: 'r1', status: 'pending' } });
      })
    );

    const res = await store.dispatch(
      rmApi.endpoints.updateVendorRequest.initiate({ requestId: 'r1', requestData: VR, submitForApproval: true })
    );
    expect(url.pathname).toBe('/api/v1/rm/vendor-requests/r1');
    expect(url.searchParams.get('submit_for_approval')).toBe('true');
    expect(body).toEqual(VR);
    expect(res.data.success).toBe(true);
  });
});

describe('deleteVendorRequest', () => {
  it('DELETEs /rm/vendor-requests/{id}', async () => {
    let seenPath = null;
    server.use(
      http.delete(`${BASE}/vendor-requests/:id`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, message: 'Draft deleted successfully' });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.deleteVendorRequest.initiate('r1'));
    expect(seenPath).toBe('/api/v1/rm/vendor-requests/r1');
    expect(res.data.success).toBe(true);
  });
});

// =====================================================================
// Profile / dashboard / score / salons / leaderboard
// =====================================================================
describe('getRMProfile (dashboard)', () => {
  it('GETs /rm/dashboard', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/dashboard`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ profile: { id: 'rm1' }, statistics: {}, recent_scores: [] });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.getRMProfile.initiate());
    expect(seenPath).toBe('/api/v1/rm/dashboard');
    expect(res.data.profile.id).toBe('rm1');
  });
});

describe('updateRMProfile', () => {
  it('PUTs /rm/profile with the body', async () => {
    let body = null;
    server.use(
      http.put(`${BASE}/profile`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'Profile updated successfully', data: {} });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.updateRMProfile.initiate({ full_name: 'New', phone: '999' }));
    expect(body).toEqual({ full_name: 'New', phone: '999' });
    expect(res.data.success).toBe(true);
  });
});

describe('getRMSalons', () => {
  it('GETs /rm/salons with include_inactive', async () => {
    let url = null;
    server.use(
      http.get(`${BASE}/salons`, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({ success: true, message: 'ok', data: [], count: 0 });
      })
    );

    await store.dispatch(rmApi.endpoints.getRMSalons.initiate({ includeInactive: true }));
    expect(url.pathname).toBe('/api/v1/rm/salons');
    expect(url.searchParams.get('include_inactive')).toBe('true');
  });
});

describe('getRMLeaderboard', () => {
  it('GETs /rm/leaderboard', async () => {
    let seenPath = null;
    server.use(
      http.get(`${BASE}/leaderboard`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, message: 'ok', data: [{ rank: 1, profiles: { full_name: 'Top' } }], total: 1 });
      })
    );

    const res = await store.dispatch(rmApi.endpoints.getRMLeaderboard.initiate({}));
    expect(seenPath).toBe('/api/v1/rm/leaderboard');
    expect(res.data.data[0].profiles).not.toHaveProperty('email');
  });
});

// =====================================================================
// Wiring
// =====================================================================
describe('exports', () => {
  it('exposes all RM portal hooks', () => {
    for (const h of [
      'useSubmitVendorRequestMutation', 'useGetOwnVendorRequestsQuery',
      'useGetVendorRequestByIdQuery', 'useUpdateVendorRequestMutation',
      'useDeleteVendorRequestMutation', 'useGetRMProfileQuery',
      'useUpdateRMProfileMutation', 'useGetRMScoreHistoryQuery',
      'useGetRMLeaderboardQuery', 'useGetRMSalonsQuery',
    ]) {
      expect(rmApiModule[h]).toBeTypeOf('function');
    }
  });
});
