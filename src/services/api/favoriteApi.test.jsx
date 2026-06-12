/**
 * Integration tests for the favorites API client (favoriteApi.js).
 * Paired with backend/tests/test_customer_mocked.py.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { favoriteApi } from './favoriteApi';

const BASE = 'http://localhost:8000/api/v1/customers/favorites';

function makeStore() {
  return configureStore({
    reducer: { [favoriteApi.reducerPath]: favoriteApi.reducer },
    middleware: (g) => g().concat(favoriteApi.middleware),
  });
}
function serveFavorites(favorites = []) {
  server.use(http.get(BASE, () => HttpResponse.json({ success: true, favorites, count: favorites.length })));
}
let store;
beforeEach(() => { store = makeStore(); });

describe('getFavorites', () => {
  it('GETs /customers/favorites', async () => {
    let p = null;
    server.use(http.get(BASE, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, favorites: [{ id: 's1' }], count: 1 });
    }));
    const res = await store.dispatch(favoriteApi.endpoints.getFavorites.initiate());
    expect(p).toBe('/api/v1/customers/favorites');
    expect(res.data.count).toBe(1);
  });
});

describe('addFavorite', () => {
  it('POSTs {salon_id} to /customers/favorites', async () => {
    serveFavorites([]); // prime optimistic cache
    await store.dispatch(favoriteApi.endpoints.getFavorites.initiate());
    let body = null;
    server.use(http.post(BASE, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, message: 'Added to favorites' });
    }));
    const res = await store.dispatch(favoriteApi.endpoints.addFavorite.initiate('s1'));
    expect(body).toEqual({ salon_id: 's1' });
    expect(res.data.success).toBe(true);
  });
});

describe('removeFavorite', () => {
  it('DELETEs /customers/favorites/{salonId}', async () => {
    serveFavorites([{ id: 's1', salon_id: 's1' }]);
    await store.dispatch(favoriteApi.endpoints.getFavorites.initiate());
    let p = null;
    server.use(http.delete(`${BASE}/:id`, ({ request }) => {
      p = new URL(request.url).pathname;
      return HttpResponse.json({ success: true, message: 'Removed from favorites' });
    }));
    const res = await store.dispatch(favoriteApi.endpoints.removeFavorite.initiate('s1'));
    expect(p).toBe('/api/v1/customers/favorites/s1');
    expect(res.data.success).toBe(true);
  });
});
