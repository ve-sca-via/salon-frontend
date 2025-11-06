/**
 * Booking API - RTK Query
 * 
 * Handles all booking-related operations with cache invalidation
 * and optimistic updates for better UX.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Bookings', 'CustomerBookings'],
  endpoints: (builder) => ({
    // Get customer's bookings
    getMyBookings: builder.query({
      query: () => ({
        url: '/api/customers/bookings/my-bookings',
        method: 'get',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'CustomerBookings', id })),
              { type: 'CustomerBookings', id: 'LIST' },
            ]
          : [{ type: 'CustomerBookings', id: 'LIST' }],
      keepUnusedDataFor: 60, // Cache for 1 minute (bookings change frequently)
      // Refetch on window focus (user might book from another tab)
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),

    // Create a booking
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/api/bookings',
        method: 'post',
        data: bookingData,
      }),
      // Invalidate bookings cache after creating a booking
      invalidatesTags: [{ type: 'CustomerBookings', id: 'LIST' }],
      // Also invalidate cart since we might book from cart
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Could trigger cart refetch here if needed
        } catch {
          // Error handled by component
        }
      },
    }),

    // Cancel a booking
    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/api/customers/bookings/${bookingId}/cancel`,
        method: 'put',
      }),
      // Optimistic update - immediately update UI
      async onQueryStarted(bookingId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bookingApi.util.updateQueryData('getMyBookings', undefined, (draft) => {
            const booking = draft.data?.find((b) => b.id === bookingId);
            if (booking) {
              booking.status = 'cancelled';
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // Rollback optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, bookingId) => [
        { type: 'CustomerBookings', id: bookingId },
      ],
    }),

    // Get customer bookings (alternative endpoint)
    getCustomerBookings: builder.query({
      query: () => ({
        url: '/api/customers/bookings/my-bookings',
        method: 'get',
      }),
      providesTags: [{ type: 'CustomerBookings', id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useGetCustomerBookingsQuery,
} = bookingApi;

export default bookingApi;
