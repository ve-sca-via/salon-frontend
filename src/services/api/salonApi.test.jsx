/**
 * Integration tests for the public salon API client (salonApi.js) consumed by
 * the storefront. Confirms each hook targets the real backend route in the
 * salon_service module. Paired with backend/tests/test_salon_mocked.py.
 *
 *   getSalons               -> GET /salons/public
 *   getSalonById            -> GET /salons/{id}
 *   searchSalons (q)        -> GET /salons/search/query
 *   searchSalons (no q)     -> GET /location/salons/nearby
 *   getSalonServices        -> GET /salons/{id}/services
 *   getSalonAvailableSlots  -> GET /salons/{id}/available-slots
 *   getPopularCities        -> GET /salons/popular-cities
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { salonApi } from './salonApi';

const V1 = 'http://localhost:8000/api/v1';

function makeStore() {
  return configureStore({
    reducer: { [salonApi.reducerPath]: salonApi.reducer },
    middleware: (g) => g().concat(salonApi.middleware),
  });
}
let store;
beforeEach(() => { store = makeStore(); });

describe('getSalons', () => {
  it('GETs /salons/public with filters', async () => {
    let url = null;
    server.use(http.get(`${V1}/salons/public`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ salons: [{ id: 's1' }], count: 1, offset: 0, limit: 50 });
    }));
    const res = await store.dispatch(salonApi.endpoints.getSalons.initiate({ city: 'Mumbai', limit: 50 }));
    expect(url.pathname).toBe('/api/v1/salons/public');
    expect(url.searchParams.get('city')).toBe('Mumbai');
    expect(res.data.count).toBe(1);
  });
});

describe('getSalonById', () => {
  it('GETs /salons/{id}', async () => {
    let p = null;
    server.use(http.get(`${V1}/salons/:id`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ salon: { id: 's1' }, services: null });
    }));
    await store.dispatch(salonApi.endpoints.getSalonById.initiate('s1'));
    expect(p).toBe('/api/v1/salons/s1');
  });
});

describe('searchSalons', () => {
  it('GETs /salons/search/query when a text query is given', async () => {
    let url = null;
    server.use(http.get(`${V1}/salons/search/query`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ salons: [], query: 'glamour', count: 0, offset: 0, limit: 50 });
    }));
    await store.dispatch(salonApi.endpoints.searchSalons.initiate({ query: 'glamour', city: 'Pune' }));
    expect(url.pathname).toBe('/api/v1/salons/search/query');
    expect(url.searchParams.get('q')).toBe('glamour');
    expect(url.searchParams.get('city')).toBe('Pune');
  });

  it('GETs /location/salons/nearby when no text query (lat/lon)', async () => {
    let url = null;
    server.use(http.get(`${V1}/location/salons/nearby`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ salons: [], count: 0, query: { latitude: 19, longitude: 72.8, radius_km: 10 } });
    }));
    await store.dispatch(salonApi.endpoints.searchSalons.initiate({ lat: 19, lon: 72.8, radius: 10 }));
    expect(url.pathname).toBe('/api/v1/location/salons/nearby');
    expect(url.searchParams.get('lat')).toBe('19');
    expect(url.searchParams.get('lon')).toBe('72.8');
  });
});

describe('getSalonServices', () => {
  it('GETs /salons/{id}/services', async () => {
    let p = null;
    server.use(http.get(`${V1}/salons/:id/services`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ services: [], count: 0 });
    }));
    await store.dispatch(salonApi.endpoints.getSalonServices.initiate('s1'));
    expect(p).toBe('/api/v1/salons/s1/services');
  });
});

describe('getSalonAvailableSlots', () => {
  it('GETs /salons/{id}/available-slots with date + service_ids', async () => {
    let url = null;
    server.use(http.get(`${V1}/salons/:id/available-slots`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ salon_id: 's1', date: '2026-07-01', available_slots: ['09:00 AM'] });
    }));
    await store.dispatch(salonApi.endpoints.getSalonAvailableSlots.initiate(
      { salonId: 's1', date: '2026-07-01', serviceIds: 'svc1,svc2' }));
    expect(url.pathname).toBe('/api/v1/salons/s1/available-slots');
    expect(url.searchParams.get('date')).toBe('2026-07-01');
    expect(url.searchParams.get('service_ids')).toBe('svc1,svc2');
  });
});

describe('getPopularCities', () => {
  it('GETs /salons/popular-cities', async () => {
    let url = null;
    server.use(http.get(`${V1}/salons/popular-cities`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ cities: [{ city: 'Mumbai', salon_count: 5 }], total: 1 });
    }));
    const res = await store.dispatch(salonApi.endpoints.getPopularCities.initiate({ limit: 8 }));
    expect(url.pathname).toBe('/api/v1/salons/popular-cities');
    expect(url.searchParams.get('limit')).toBe('8');
    expect(res.data.total).toBe(1);
  });
});
