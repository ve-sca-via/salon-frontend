/**
 * Vendor API - RTK Query
 * 
 * Handles all vendor/salon owner operations.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['VendorSalon', 'VendorServices', 'VendorBookings', 'VendorAnalytics', 'ServiceCategories'],
  endpoints: (builder) => ({
    // Get vendor's salon
    getVendorSalon: builder.query({
      query: () => ({
        url: '/api/v1/vendors/salon',
        method: 'get',
      }),
      providesTags: ['VendorSalon'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Update vendor salon
    updateVendorSalon: builder.mutation({
      query: (salonData) => ({
        url: '/api/v1/vendors/salon',
        method: 'put',
        data: salonData,
      }),
      invalidatesTags: ['VendorSalon'],
    }),

    // Get service categories
    getServiceCategories: builder.query({
      query: () => ({
        url: '/api/v1/vendors/service-categories',
        method: 'get',
      }),
      providesTags: ['ServiceCategories'],
      keepUnusedDataFor: 3600, // Cache for 1 hour (categories don't change often)
    }),

    // Get vendor's services
    getVendorServices: builder.query({
      query: () => ({
        url: '/api/v1/vendors/services',
        method: 'get',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'VendorServices', id })),
              { type: 'VendorServices', id: 'LIST' },
            ]
          : [{ type: 'VendorServices', id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create service
    createVendorService: builder.mutation({
      query: (serviceData) => ({
        url: '/api/v1/vendors/services',
        method: 'post',
        data: serviceData,
      }),
      invalidatesTags: [{ type: 'VendorServices', id: 'LIST' }],
    }),

    // Update service
    updateVendorService: builder.mutation({
      query: ({ serviceId, ...serviceData }) => ({
        url: `/api/v1/vendors/services/${serviceId}`,
        method: 'put',
        data: serviceData,
      }),
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'VendorServices', id: serviceId },
        { type: 'VendorServices', id: 'LIST' },
      ],
    }),

    // Delete service
    deleteVendorService: builder.mutation({
      query: (serviceId) => ({
        url: `/api/v1/vendors/services/${serviceId}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'VendorServices', id: 'LIST' }],
    }),

    // Get vendor's bookings
    getVendorBookings: builder.query({
      query: ({ status, limit = 50, offset = 0 } = {}) => ({
        url: '/api/v1/vendors/bookings',
        method: 'get',
        params: { status, limit, offset },
      }),
      providesTags: ['VendorBookings'],
      keepUnusedDataFor: 60, // Cache for 1 minute (bookings change frequently)
      refetchOnFocus: true,
    }),

    // Update booking status
    updateBookingStatus: builder.mutation({
      query: ({ bookingId, status }) => ({
        url: `/api/v1/vendors/bookings/${bookingId}/status`,
        method: 'put',
        data: { status },
      }),
      invalidatesTags: ['VendorBookings'],
    }),

    // Get vendor analytics
    getVendorAnalytics: builder.query({
      query: () => ({
        url: '/api/v1/vendors/analytics',
        method: 'get',
      }),
      providesTags: ['VendorAnalytics'],
      keepUnusedDataFor: 60, // Cache for 1 minute
      refetchOnFocus: true,
    }),

    // Process vendor payment (demo)
    processVendorPayment: builder.mutation({
      query: () => ({
        url: '/api/v1/vendors/process-payment',
        method: 'post',
      }),
      invalidatesTags: ['VendorSalon'],
    }),

    // Complete vendor registration
    completeVendorRegistration: builder.mutation({
      query: (data) => ({
        url: '/api/v1/vendors/complete-registration',
        method: 'post',
        data,
      }),
    }),
  }),
});

export const {
  useGetVendorSalonQuery,
  useUpdateVendorSalonMutation,
  useGetServiceCategoriesQuery,
  useGetVendorServicesQuery,
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useGetVendorBookingsQuery,
  useUpdateBookingStatusMutation,
  useGetVendorAnalyticsQuery,
  useProcessVendorPaymentMutation,
  useCompleteVendorRegistrationMutation,
} = vendorApi;

export default vendorApi;
