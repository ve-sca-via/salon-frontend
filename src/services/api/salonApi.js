/**
 * Salon API - RTK Query
 * 
 * Handles all salon-related API calls with automatic caching,
 * request deduplication, and optimistic updates.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const salonApi = createApi({
  reducerPath: 'salonApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Salons', 'SalonDetails', 'SalonServices', 'SalonStaff'],
  endpoints: (builder) => ({
    // Get all public salons
    getSalons: builder.query({
      query: (filters = {}) => ({
        url: '/api/v1/salons/public',
        method: 'get',
        params: filters,
      }),
      providesTags: (result) =>
        result?.salons
          ? [
              ...result.salons.map(({ id }) => ({ type: 'Salons', id })),
              { type: 'Salons', id: 'LIST' },
            ]
          : [{ type: 'Salons', id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      transformResponse: (response) => response, // Pass through backend response
    }),

    // Get single salon by ID
    getSalonById: builder.query({
      query: (salonId) => ({
        url: `/api/v1/salons/${salonId}`,
        method: 'get',
      }),
      providesTags: (result, error, id) => [{ type: 'SalonDetails', id }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Search salons
    searchSalons: builder.query({
      query: ({ query, location, serviceType, lat, lon, radius, city, state, service_ids }) => ({
        url: query ? '/api/v1/salons/search/query' : '/api/v1/salons/search/nearby',
        method: 'get',
        params: { q: query, city: location || city, service_type: serviceType, lat, lon, radius, state, service_ids },
      }),
      providesTags: [{ type: 'Salons', id: 'SEARCH' }],
      keepUnusedDataFor: 120, // Cache searches for 2 minutes
    }),

    // Get salon services
    getSalonServices: builder.query({
      query: (salonId) => ({
        url: `/api/v1/salons/${salonId}/services`,
        method: 'get',
      }),
      providesTags: (result, error, salonId) => [{ type: 'SalonServices', id: salonId }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get salon staff
    getSalonStaff: builder.query({
      query: (salonId) => ({
        url: `/api/v1/salons/${salonId}/staff`,
        method: 'get',
      }),
      providesTags: (result, error, salonId) => [{ type: 'SalonStaff', id: salonId }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get salon available slots
    getSalonAvailableSlots: builder.query({
      query: ({ salonId, date, serviceIds }) => ({
        url: `/api/v1/salons/${salonId}/available-slots`,
        method: 'get',
        params: { date, service_ids: serviceIds },
      }),
      // Don't cache slots (need fresh data for booking)
      keepUnusedDataFor: 0,
    }),

    // Get booking fee percentage
    getBookingFeePercentage: builder.query({
      query: () => ({
        url: '/api/v1/salons/config/booking-fee-percentage',
        method: 'get',
      }),
      keepUnusedDataFor: 3600, // Cache for 1 hour (config doesn't change often)
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSalonsQuery,
  useGetSalonByIdQuery,
  useSearchSalonsQuery,
  useGetSalonServicesQuery,
  useGetSalonStaffQuery,
  useGetSalonAvailableSlotsQuery,
  useGetBookingFeePercentageQuery,
  useLazySearchSalonsQuery, // Lazy query for manual triggering
  useLazyGetSalonsQuery,
} = salonApi;

export default salonApi;
