/**
 * Payment API - RTK Query
 * 
 * Handles all payment operations including Stripe integration.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['PaymentHistory', 'PaymentIntent'],
  endpoints: (builder) => ({
    // Create payment intent for booking
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/api/payments/create-intent',
        method: 'post',
        data: paymentData,
      }),
      invalidatesTags: [{ type: 'PaymentHistory', id: 'LIST' }],
    }),

    // Confirm payment after client-side Stripe processing
    confirmPayment: builder.mutation({
      query: ({ paymentIntentId, ...data }) => ({
        url: `/api/payments/confirm/${paymentIntentId}`,
        method: 'post',
        data,
      }),
      invalidatesTags: [
        { type: 'PaymentHistory', id: 'LIST' },
        { type: 'PaymentIntent', id: 'ACTIVE' },
      ],
      // After payment confirmation, bookings need refresh
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate bookings cache since payment creates booking
          dispatch({ type: 'bookingApi/invalidateTags', payload: ['CustomerBookings'] });
        } catch {}
      },
    }),

    // Get payment history for customer
    getPaymentHistory: builder.query({
      query: ({ limit = 20, offset = 0 } = {}) => ({
        url: '/api/payments/history',
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

    // Get specific payment details
    getPaymentById: builder.query({
      query: (paymentId) => ({
        url: `/api/payments/${paymentId}`,
        method: 'get',
      }),
      providesTags: (result, error, id) => [{ type: 'PaymentHistory', id }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Request refund for cancelled booking
    requestRefund: builder.mutation({
      query: ({ bookingId, reason }) => ({
        url: '/api/payments/refund',
        method: 'post',
        data: { booking_id: bookingId, reason },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'PaymentHistory', id: 'LIST' },
        { type: 'PaymentHistory', id: bookingId },
      ],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentByIdQuery,
  useRequestRefundMutation,
} = paymentApi;

export default paymentApi;
