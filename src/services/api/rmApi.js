/**
 * RM (Relationship Manager) API - RTK Query
 * 
 * Handles all RM operations for vendor onboarding.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const rmApi = createApi({
  reducerPath: 'rmApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['VendorRequests', 'VendorRequest', 'RMProfile', 'RMScore'],
  endpoints: (builder) => ({
    // Submit vendor join request
    submitVendorRequest: builder.mutation({
      query: ({ requestData, isDraft = false }) => ({
        url: `/api/v1/rm/vendor-requests${isDraft ? '?is_draft=true' : ''}`,
        method: 'post',
        data: requestData,
      }),
      invalidatesTags: [{ type: 'VendorRequests', id: 'LIST' }],
    }),

    // Get RM's own vendor requests
    getOwnVendorRequests: builder.query({
      query: ({ status_filter, limit = 50, offset = 0 } = {}) => ({
        url: '/api/v1/rm/vendor-requests',
        method: 'get',
        params: { status_filter: status_filter, limit, offset },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'VendorRequests', id })),
              { type: 'VendorRequests', id: 'LIST' },
            ]
          : [{ type: 'VendorRequests', id: 'LIST' }],
      keepUnusedDataFor: 120, // Cache for 2 minutes
      refetchOnFocus: true,
    }),

    // Get specific vendor request
    getVendorRequestById: builder.query({
      query: (requestId) => ({
        url: `/api/v1/rm/vendor-requests/${requestId}`,
        method: 'get',
      }),
      providesTags: (result, error, id) => [{ type: 'VendorRequest', id }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Update vendor request
    updateVendorRequest: builder.mutation({
      query: ({ requestId, requestData, submitForApproval = false }) => ({
        url: `/api/v1/rm/vendor-requests/${requestId}${submitForApproval ? '?submit_for_approval=true' : ''}`,
        method: 'put',
        data: requestData,
      }),
      invalidatesTags: (result, error, { requestId }) => [
        { type: 'VendorRequest', id: requestId },
        { type: 'VendorRequests', id: 'LIST' },
      ],
    }),

    // Delete vendor request
    deleteVendorRequest: builder.mutation({
      query: (requestId) => ({
        url: `/api/v1/rm/vendor-requests/${requestId}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'VendorRequests', id: 'LIST' }],
    }),

    // Get RM profile and dashboard stats
    getRMProfile: builder.query({
      query: () => ({
        url: '/api/v1/rm/dashboard',
        method: 'get',
      }),
      providesTags: ['RMProfile'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      refetchOnFocus: true,
    }),

    // Update RM profile
    updateRMProfile: builder.mutation({
      query: (profileData) => ({
        url: '/api/v1/rm/profile',
        method: 'put',
        data: profileData,
      }),
      invalidatesTags: ['RMProfile'],
    }),

    // Get RM score history
    getRMScoreHistory: builder.query({
      query: ({ limit = 50, offset = 0 } = {}) => ({
        url: '/api/v1/rm/score-history',
        method: 'get',
        params: { limit, offset },
      }),
      providesTags: ['RMScore'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get service categories for dropdown
    getServiceCategories: builder.query({
      query: () => ({
        url: '/api/v1/rm/service-categories',
        method: 'get',
      }),
      keepUnusedDataFor: 600, // Cache for 10 minutes (rarely changes)
      refetchOnFocus: false, // No need to refetch on focus
    }),

    // Get RM leaderboard
    getRMLeaderboard: builder.query({
      query: ({ limit = 20 } = {}) => ({
        url: '/api/v1/rm/leaderboard',
        method: 'get',
        params: { limit },
      }),
      keepUnusedDataFor: 300, // Cache for 5 minutes
      refetchOnFocus: true,
    }),

    // Get RM's salons list
    getRMSalons: builder.query({
      query: ({ includeInactive = false } = {}) => ({
        url: '/api/v1/rm/salons',
        method: 'get',
        params: { include_inactive: includeInactive },
      }),
      providesTags: ['RMProfile'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      refetchOnFocus: true,
    }),
  }),
});

export const {
  useSubmitVendorRequestMutation,
  useGetOwnVendorRequestsQuery,
  useGetVendorRequestByIdQuery,
  useUpdateVendorRequestMutation,
  useDeleteVendorRequestMutation,
  useGetRMProfileQuery,
  useUpdateRMProfileMutation,
  useGetRMScoreHistoryQuery,
  useGetServiceCategoriesQuery,
  useGetRMLeaderboardQuery,
  useGetRMSalonsQuery,
} = rmApi;

export default rmApi;
