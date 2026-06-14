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
  tagTypes: ['VendorSalon', 'VendorServices', 'VendorBookings', 'VendorAnalytics', 'ServiceCategories', 'VendorPromotions', 'VendorCoupons'],
  endpoints: (builder) => ({
    // Get vendor's salon
    getVendorSalon: builder.query({
      query: () => ({
        url: '/api/v1/vendors/salon',
        method: 'get',
      }),
      transformResponse: (response) => {
        // DEBUG: Log raw API response
        console.log('🔍 vendorApi.getVendorSalon - Raw API Response:', response);
        console.log('🔍 registration_fee_amount:', response?.registration_fee_amount);
        
        // Backend returns salon data directly, wrap it for consistency
        const result = { salon: response };
        console.log('🔍 vendorApi.getVendorSalon - Transformed Result:', result);
        return result;
      },
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

    getActiveVendorPromotion: builder.query({
      query: () => ({
        url: '/api/v1/vendors/promotions/active',
        method: 'get',
      }),
      providesTags: ['VendorPromotions'],
      keepUnusedDataFor: 60,
    }),

    applyVendorPromotion: builder.mutation({
      query: (data) => ({
        url: '/api/v1/vendors/promotions/apply',
        method: 'post',
        data,
      }),
      invalidatesTags: ['VendorPromotions', { type: 'VendorServices', id: 'LIST' }],
    }),

    // =====================================================
    // COUPONS (code-based, this salon only)
    // =====================================================
    getVendorCoupons: builder.query({
      query: () => ({
        url: '/api/v1/vendors/coupons',
        method: 'get',
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'VendorCoupons', id })),
              { type: 'VendorCoupons', id: 'LIST' },
            ]
          : [{ type: 'VendorCoupons', id: 'LIST' }],
      keepUnusedDataFor: 120,
    }),

    createVendorCoupon: builder.mutation({
      query: (data) => ({
        url: '/api/v1/vendors/coupons',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'VendorCoupons', id: 'LIST' }],
    }),

    updateVendorCoupon: builder.mutation({
      query: ({ couponId, data }) => ({
        url: `/api/v1/vendors/coupons/${couponId}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (result, error, { couponId }) => [
        { type: 'VendorCoupons', id: couponId },
        { type: 'VendorCoupons', id: 'LIST' },
      ],
    }),

    deactivateVendorCoupon: builder.mutation({
      query: (couponId) => ({
        url: `/api/v1/vendors/coupons/${couponId}`,
        method: 'delete',
      }),
      invalidatesTags: (result, error, couponId) => [
        { type: 'VendorCoupons', id: couponId },
        { type: 'VendorCoupons', id: 'LIST' },
      ],
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
  useGetActiveVendorPromotionQuery,
  useApplyVendorPromotionMutation,
  useGetVendorCouponsQuery,
  useCreateVendorCouponMutation,
  useUpdateVendorCouponMutation,
  useDeactivateVendorCouponMutation,
} = vendorApi;

export default vendorApi;
