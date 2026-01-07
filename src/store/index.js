import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import locationReducer from './slices/locationSlice';


// RTK Query APIs
import { authApi } from '../services/api/authApi';
import { salonApi } from '../services/api/salonApi';
import { bookingApi } from '../services/api/bookingApi';
import { cartApi } from '../services/api/cartApi';
import { favoriteApi } from '../services/api/favoriteApi';
import { reviewApi } from '../services/api/reviewApi';
import { vendorApi } from '../services/api/vendorApi';
import { rmApi } from '../services/api/rmApi';
import { paymentApi } from '../services/api/paymentApi';
import { configApi } from '../services/api/configApi';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notification: notificationReducer,
    location: locationReducer,
  
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [salonApi.reducerPath]: salonApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [favoriteApi.reducerPath]: favoriteApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [rmApi.reducerPath]: rmApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [configApi.reducerPath]: configApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'notification/addNotification',
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        // Ignore RTK Query internal state (contains promises, AbortControllers)
        ignoredPaths: [
          'authApi',
          'salonApi',
          'bookingApi',
          'cartApi',
          'favoriteApi',
          'reviewApi',
          'vendorApi',
          'rmApi',
          'paymentApi',
          'configApi',
        ],
      },
    }).concat(
      // RTK Query middleware for caching, invalidation, polling, etc.
      authApi.middleware,
      salonApi.middleware,
      bookingApi.middleware,
      cartApi.middleware,
      favoriteApi.middleware,
      reviewApi.middleware,
      vendorApi.middleware,
      rmApi.middleware,
      paymentApi.middleware,
      configApi.middleware
    ),
});

export const persistor = persistStore(store);
export default store;
