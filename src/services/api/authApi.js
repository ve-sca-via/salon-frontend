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
        url: '/api/v1/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Signup mutation
    signup: builder.mutation({
      query: (userData) => ({
        url: '/api/v1/auth/signup',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Get current user profile
    getCurrentUser: builder.query({
      query: () => ({
        url: '/api/v1/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Update user profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/api/v1/auth/me',
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout mutation
    logout: builder.mutation({
      query: () => ({
        url: '/api/v1/auth/logout',
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
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Logout from all devices
    logoutAll: builder.mutation({
      query: (password) => ({
        url: '/api/v1/auth/logout-all',
        method: 'POST',
        data: { password },
      }),
      // Clear all cache on logout
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.resetApiState());
        } catch (err) {
          // Logout failed
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Refresh token (manual call - usually handled by apiClient interceptor)
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
        data: { refresh_token: refreshToken },
      }),
    }),

    // Forgot password (initiate password reset)
    forgotPassword: builder.mutation({
      query: (credentials) => ({
        url: '/api/v1/auth/password-reset',
        method: 'POST',
        data: credentials,
      }),
    }),

    // Reset password (confirm password reset with token)
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: '/api/v1/auth/password-reset/confirm',
        method: 'POST',
        data: resetData,
      }),
    }),

    // Phone OTP Login - Send OTP
    sendPhoneOTP: builder.mutation({
      query: (phoneData) => ({
        url: '/api/v1/auth/login/phone/send-otp',
        method: 'POST',
        data: phoneData, // { phone, country_code }
      }),
    }),

    // Phone OTP Login - Verify OTP and Login
    verifyPhoneOTP: builder.mutation({
      query: (otpData) => ({
        url: '/api/v1/auth/login/phone/verify-otp',
        method: 'POST',
        data: otpData, // { phone, otp, verification_id }
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Phone OTP Signup - Send OTP
    sendPhoneSignupOTP: builder.mutation({
      query: (phoneData) => ({
        url: '/api/v1/auth/signup/phone/send-otp',
        method: 'POST',
        data: phoneData, // { phone, country_code }
      }),
    }),

    // Phone OTP Signup - Verify OTP
    verifyPhoneSignupOTP: builder.mutation({
      query: (otpData) => ({
        url: '/api/v1/auth/signup/phone/verify-otp',
        method: 'POST',
        data: otpData, // { phone, otp, verification_id }
      }),
    }),

    // Phone verification (authenticated user)
    sendPhoneVerificationOTP: builder.mutation({
      query: (phoneData) => ({
        url: '/api/v1/auth/verify-phone/send-otp',
        method: 'POST',
        data: phoneData, // { phone, country_code }
      }),
    }),

    // Confirm phone verification OTP (authenticated user)
    confirmPhoneVerificationOTP: builder.mutation({
      query: (otpData) => ({
        url: '/api/v1/auth/verify-phone/confirm-otp',
        method: 'POST',
        data: otpData, // { phone, otp, verification_id }
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendPhoneOTPMutation,
  useVerifyPhoneOTPMutation,
  useSendPhoneVerificationOTPMutation,
  useConfirmPhoneVerificationOTPMutation,
  useSendPhoneSignupOTPMutation,
  useVerifyPhoneSignupOTPMutation,
} = authApi;

export default authApi;
