/**
 * Banner API - RTK Query
 *
 * Public storefront feed for the admin-managed home carousel banners.
 * Mirrors the mobile app's `useBanners()` hook and the backend
 * `GET /api/v1/banners` contract (active, in-window banners ordered by
 * sort_order). No auth required.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const bannerApi = createApi({
  reducerPath: 'bannerApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Banners'],
  endpoints: (builder) => ({
    // Get active, in-window carousel banners (public)
    getBanners: builder.query({
      query: () => ({
        url: '/api/v1/banners',
        method: 'get',
      }),
      providesTags: (result) =>
        result?.banners
          ? [
              ...result.banners.map(({ id }) => ({ type: 'Banners', id })),
              { type: 'Banners', id: 'LIST' },
            ]
          : [{ type: 'Banners', id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes (matches mobile staleTime)
      transformResponse: (response) => response, // Pass through backend response
    }),
  }),
});

export const { useGetBannersQuery } = bannerApi;

export default bannerApi;
