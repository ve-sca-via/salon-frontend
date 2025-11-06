import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import salonReducer from './slices/salonSlice';
import bookingReducer from './slices/bookingSlice';
import notificationReducer from './slices/notificationSlice';
import cartReducer from './slices/cartSlice';
import agentReducer from './slices/agentSlice';
import rmAgentReducer from './slices/rmAgentSlice';
// Removed: vendorReducer, customerReducer (all thunks migrated to RTK Query)
import { cartSyncMiddleware } from './middleware/cartSyncMiddleware';

// RTK Query APIs
import { salonApi } from '../services/api/salonApi';
import { bookingApi } from '../services/api/bookingApi';
import { cartApi } from '../services/api/cartApi';
import { favoriteApi } from '../services/api/favoriteApi';
import { reviewApi } from '../services/api/reviewApi';
import { vendorApi } from '../services/api/vendorApi';
import { rmApi } from '../services/api/rmApi';
import { paymentApi } from '../services/api/paymentApi';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    salon: salonReducer,
    booking: bookingReducer,
    notification: notificationReducer,
    cart: cartReducer,
    agent: agentReducer,
    rmAgent: rmAgentReducer,
    // Removed: vendor, customer (migrated to RTK Query)
    // RTK Query API reducers
    [salonApi.reducerPath]: salonApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [favoriteApi.reducerPath]: favoriteApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [rmApi.reducerPath]: rmApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['notification/addNotification', 'persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(cartSyncMiddleware)
      // RTK Query middleware for caching, invalidation, polling, etc.
      .concat(salonApi.middleware)
      .concat(bookingApi.middleware)
      .concat(cartApi.middleware)
      .concat(favoriteApi.middleware)
      .concat(reviewApi.middleware)
      .concat(vendorApi.middleware)
      .concat(rmApi.middleware)
      .concat(paymentApi.middleware),
});

export const persistor = persistStore(store);
export default store;
