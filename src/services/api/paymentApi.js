/**
 * Payment API - RTK Query
 * 
 * Handles all payment operations using Razorpay integration.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['PaymentHistory', 'VendorEarnings'],
  endpoints: (builder) => ({
    // Cart Checkout Payment - Create Razorpay Order
    createCartPaymentOrder: builder.mutation({
      query: () => ({
        url: '/api/v1/payments/cart/create-order',
        method: 'post',
      }),
    }),

    // Booking Payment - Create Razorpay Order
    createBookingOrder: builder.mutation({
      query: (bookingId) => ({
        url: '/api/v1/payments/booking/create-order',
        method: 'post',
        data: { booking_id: bookingId },
      }),
    }),

    // Booking Payment - Verify Razorpay Signature
    verifyBookingPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/api/v1/payments/booking/verify',
        method: 'post',
        data: paymentData,
      }),
      invalidatesTags: [{ type: 'PaymentHistory', id: 'LIST' }],
      // After payment verification, bookings need refresh
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate bookings cache since payment confirms booking
          dispatch({ type: 'bookingApi/invalidateTags', payload: ['CustomerBookings'] });
        } catch {}
      },
    }),

    // Vendor Registration Payment - Create Order
    createVendorRegistrationOrder: builder.mutation({
      query: () => ({
        url: '/api/v1/payments/registration/create-order',
        method: 'post',
      }),
    }),

    // Vendor Registration Payment - Verify
    verifyVendorRegistrationPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/api/v1/payments/registration/verify',
        method: 'post',
        data: paymentData,
      }),
    }),

    // Get payment history for customer
    getPaymentHistory: builder.query({
      query: ({ limit = 20, offset = 0 } = {}) => ({
        url: '/api/v1/payments/history',
        method: 'get',
        params: { limit, offset },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'PaymentHistory', id })),
              { type: 'PaymentHistory', id: 'LIST' },
            ]
          : [{ type: 'PaymentHistory', id: 'LIST' }],
      keepUnusedDataFor: 180, // Cache for 3 minutes
      refetchOnFocus: true,
    }),

    // Get vendor earnings
    getVendorEarnings: builder.query({
      query: ({ vendorId, startDate, endDate }) => {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        return {
          url: `/api/v1/payments/vendor/${vendorId}/earnings`,
          method: 'get',
          params,
        };
      },
      providesTags: (result, error, { vendorId }) => [
        { type: 'VendorEarnings', id: vendorId },
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
});

export const {
  useCreateCartPaymentOrderMutation,
  useCreateBookingOrderMutation,
  useVerifyBookingPaymentMutation,
  useCreateVendorRegistrationOrderMutation,
  useVerifyVendorRegistrationPaymentMutation,
  useGetPaymentHistoryQuery,
  useGetVendorEarningsQuery,
} = paymentApi;

export default paymentApi;
