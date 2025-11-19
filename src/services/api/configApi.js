/**
 * Config API - RTK Query
 * 
 * Fetches public system configurations from backend.
 * Configs are cached for 5 minutes to reduce API calls.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const configApi = createApi({
  reducerPath: 'configApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Config'],
  endpoints: (builder) => ({
    
    // Get all public configs
    getPublicConfigs: builder.query({
      query: () => ({
        url: '/api/v1/salons/config/public',
        method: 'get',
      }),
      providesTags: ['Config'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      transformResponse: (response) => response.configs || {},
    }),
    
  }),
});

export const {
  useGetPublicConfigsQuery,
} = configApi;

export default configApi;
