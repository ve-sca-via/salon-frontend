# API Caching with RTK Query - Implementation Plan

## 🎯 Goal: 70-80% Reduction in API Calls

### Current Problems:
1. ❌ Every page load makes fresh API calls (no caching)
2. ❌ Multiple components requesting same data = duplicate calls
3. ❌ Manual loading/error state management in every thunk
4. ❌ No automatic cache invalidation
5. ❌ No request deduplication

### RTK Query Benefits:
1. ✅ Automatic caching with configurable TTL
2. ✅ Request deduplication (multiple components, one request)
3. ✅ Auto-generated hooks (useGetSalonsQuery, etc.)
4. ✅ Background refetching and cache invalidation
5. ✅ Optimistic updates for better UX
6. ✅ Built-in loading/error states

---

## 📊 Expected Impact Analysis

### API Call Reduction:
| Scenario | Before (No Cache) | After (RTK Query) | Improvement |
|----------|-------------------|-------------------|-------------|
| Browse salons page | 1 call per visit | 1 call per 5 min | **80% reduction** |
| Navigate back to salons | Full reload | Instant (cached) | **100% saved** |
| Multiple salon components | 3-5 duplicate calls | 1 call | **60-80% saved** |
| Salon detail view | 2-3 calls each time | Cached if recent | **70% saved** |
| Dashboard with stats | 5-10 calls | Cached + selective refetch | **60% saved** |

### Overall Expected Reduction:
- **70-80% fewer API calls** across the application
- **50-60% faster page loads** (instant from cache)
- **Better UX** (no loading spinners for cached data)
- **Lower backend costs** (fewer requests to handle)

---

## 🏗️ Architecture Changes

### Old Pattern (Redux Thunks):
```javascript
// Manual thunk
export const fetchSalonsThunk = createAsyncThunk(
  'customer/fetchSalons',
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await getSalons(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Component usage
const { salons, loading, error } = useSelector(state => state.customer);
useEffect(() => {
  dispatch(fetchSalonsThunk());
}, [dispatch]);
```

**Problems:**
- ❌ New API call every time component mounts
- ❌ Manual loading/error handling
- ❌ No caching
- ❌ Duplicate calls if multiple components need same data

### New Pattern (RTK Query):
```javascript
// Auto-generated API slice
const salonApi = createApi({
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Salons', 'SalonDetails'],
  endpoints: (builder) => ({
    getSalons: builder.query({
      query: (filters) => ({ url: '/api/salons/public', params: filters }),
      providesTags: ['Salons'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
});

// Auto-generated hook
export const { useGetSalonsQuery } = salonApi;

// Component usage (one line!)
const { data: salons, isLoading, error } = useGetSalonsQuery(filters);
```

**Benefits:**
- ✅ Cached for 5 minutes (configurable)
- ✅ Auto-deduplication (one request for all components)
- ✅ Built-in loading/error states
- ✅ Automatic refetch on window focus
- ✅ Background updates

---

## 📝 Implementation Steps

### Phase 1: Setup RTK Query (30 min)
1. ✅ Create API slice factory using axios baseQuery
2. ✅ Define tag types for cache invalidation
3. ✅ Configure store with API middleware
4. ✅ Set up cache behavior (TTL, refetch policies)

### Phase 2: Create API Endpoints (45 min)
Create RTK Query endpoints for:

**Public/Customer APIs:**
- `getSalons` - List all salons (cache 5 min)
- `getSalonById` - Single salon details (cache 10 min)
- `searchSalons` - Search with filters (cache 2 min)
- `getSalonServices` - Services for salon (cache 10 min)
- `getSalonStaff` - Staff for salon (cache 10 min)

**Booking APIs:**
- `getMyBookings` - Customer bookings (cache 1 min, refetch on window focus)
- `createBooking` - Create booking (invalidate bookings cache)
- `cancelBooking` - Cancel booking (invalidate bookings cache)

**Favorites APIs:**
- `getFavorites` - User favorites (cache 5 min)
- `addFavorite` - Add favorite (optimistic update + cache invalidation)
- `removeFavorite` - Remove favorite (optimistic update)

**Cart APIs:**
- `getCart` - Cart items (cache 30 sec, frequent updates)
- `addToCart` - Add item (optimistic update)
- `removeFromCart` - Remove item (optimistic update)

**Vendor APIs:**
- `getVendorSalon` - Vendor's salon (cache 5 min)
- `getVendorServices` - Vendor services (cache 5 min)
- `getVendorStaff` - Vendor staff (cache 5 min)
- `getVendorBookings` - Vendor bookings (cache 1 min)

### Phase 3: Migrate Components (60 min)
Migrate from thunks to RTK Query hooks:
- Public pages (SalonListing, SalonDetail)
- Customer pages (MyBookings, Favorites)
- Vendor pages (Dashboard, Services, Staff)
- RM pages (if applicable)

### Phase 4: Testing & Optimization (30 min)
- Test caching behavior
- Verify cache invalidation
- Test optimistic updates
- Monitor network requests

**Total Estimated Time: 2.5-3 hours**

---

## 🔧 Technical Details

### 1. Axios Base Query
RTK Query needs a custom base query since we're using axios:

```javascript
const axiosBaseQuery = () => async ({ url, method = 'get', data, params }) => {
  try {
    const result = await apiClient[method](url, data || params);
    return { data: result };
  } catch (error) {
    return { error: handleApiError(error) };
  }
};
```

### 2. Cache Configuration
```javascript
keepUnusedDataFor: 300, // 5 minutes default
refetchOnMountOrArgChange: 60, // Refetch if data older than 60s
refetchOnFocus: true, // Refetch when window focused
refetchOnReconnect: true, // Refetch when network reconnects
```

### 3. Tag-Based Invalidation
```javascript
tagTypes: ['Salons', 'Bookings', 'Cart', 'Favorites'],

// Mutation invalidates cache
addBooking: builder.mutation({
  query: (booking) => ({ url: '/api/bookings', method: 'post', data: booking }),
  invalidatesTags: ['Bookings'], // Refetch all booking queries
}),
```

### 4. Optimistic Updates
```javascript
addToCart: builder.mutation({
  query: (item) => ({ url: '/api/cart', method: 'post', data: item }),
  async onQueryStarted(item, { dispatch, queryFulfilled }) {
    // Optimistic update (instant UI)
    const patchResult = dispatch(
      api.util.updateQueryData('getCart', undefined, (draft) => {
        draft.items.push(item);
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patchResult.undo(); // Rollback if fails
    }
  },
  invalidatesTags: ['Cart'],
}),
```

---

## 📦 File Structure

```
src/
├── services/
│   ├── api/
│   │   ├── baseQuery.js          # Axios base query wrapper
│   │   ├── salonApi.js            # Salon endpoints
│   │   ├── bookingApi.js          # Booking endpoints
│   │   ├── cartApi.js             # Cart endpoints
│   │   ├── favoriteApi.js         # Favorite endpoints
│   │   ├── vendorApi.js           # Vendor endpoints
│   │   └── index.js               # Export all APIs
│   ├── apiClient.js               # Existing axios client
│   └── backendApi.js              # Keep for non-cached calls
├── store/
│   ├── index.js                   # Add RTK Query middleware
│   └── slices/
│       └── (keep existing slices for auth, notifications, etc.)
```

---

## 🎯 Migration Strategy

### Option A: Gradual Migration (Recommended)
1. **Week 1:** Set up RTK Query infrastructure
2. **Week 2:** Migrate public pages (salons, search)
3. **Week 3:** Migrate customer pages (bookings, favorites)
4. **Week 4:** Migrate vendor/admin pages

**Pros:**
- Less risky
- Can A/B test
- Easier rollback
- Team can learn gradually

### Option B: Full Migration (Faster)
1. **Day 1:** Set up infrastructure + migrate salons
2. **Day 2:** Migrate bookings + cart
3. **Day 3:** Migrate vendor pages
4. **Day 4:** Testing + refinement

**Pros:**
- Faster benefits
- Consistent architecture
- Less maintenance overhead

---

## 📈 Success Metrics

### Network Performance:
- [ ] API calls reduced by 70-80%
- [ ] Page load time improved by 50-60%
- [ ] Time to interactive (TTI) improved by 40-50%

### User Experience:
- [ ] Instant navigation for cached pages
- [ ] No loading spinners for cached data
- [ ] Optimistic updates feel instant

### Developer Experience:
- [ ] 50% less boilerplate code
- [ ] Auto-generated TypeScript types (future)
- [ ] Easier to add new endpoints

---

## 🚀 Quick Start Commands

After implementation:

```bash
# Start dev server
npm run dev

# Test caching (open DevTools Network tab)
# 1. Navigate to salons page → 1 API call
# 2. Navigate away and back → 0 API calls (cached!)
# 3. Wait 5 minutes → 1 API call (cache expired)

# Test deduplication
# 1. Open multiple components using same data
# 2. Check Network tab → only 1 request made
```

---

## 🔄 Rollback Plan

If issues occur:

1. **Disable RTK Query middleware** (instant rollback)
2. **Components still work** with old thunks (keep both temporarily)
3. **Remove RTK Query** after verification period

**Risk Level:** Low (can run both systems in parallel)

---

## 💡 Future Enhancements

After basic RTK Query:
1. **Prefetching:** Prefetch next page while viewing current
2. **Streaming updates:** Real-time cache updates via WebSocket
3. **Offline support:** Cache persistence with IndexedDB
4. **Code splitting:** Lazy load API slices per route

---

**Ready to implement? This will be a game-changer for performance!** 🚀
