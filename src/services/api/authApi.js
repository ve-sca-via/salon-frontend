/**
 * Authentication API - RTK Query
 * 
 * Handles all authentication operations using RTK Query.
 * Token refresh is automatically handled by apiClient.js interceptors.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Signup mutation
    signup: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/signup',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Get current user profile
    getCurrentUser: builder.query({
      query: () => ({
        url: '/api/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Logout mutation
    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      // Clear all cache on logout
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Reset all API state (clears cache for all APIs)
          dispatch(authApi.util.resetApiState());
        } catch (err) {
          // Logout failed, but still clear local state
          console.error('Logout error:', err);
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout from all devices
    logoutAll: builder.mutation({
      query: (password) => ({
        url: '/api/auth/logout-all',
        method: 'POST',
        data: { password },
      }),
      // Clear all cache on logout
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.resetApiState());
        } catch (err) {
          console.error('Logout all error:', err);
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Refresh token (manual call - usually handled by apiClient interceptor)
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/auth/refresh',
        method: 'POST',
        data: { refresh_token: refreshToken },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshTokenMutation,
} = authApi;

export default authApi;
