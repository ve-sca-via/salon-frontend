/**
 * Review API - RTK Query
 * 
 * Handles customer reviews with cache invalidation.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Reviews', 'MyReviews'],
  endpoints: (builder) => ({
    // Get customer's own reviews
    getMyReviews: builder.query({
      query: () => ({
        url: '/api/customers/reviews/my-reviews',
        method: 'get',
      }),
      providesTags: ['MyReviews'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create a review
    createReview: builder.mutation({
      query: (reviewData) => ({
        url: '/api/customers/reviews',
        method: 'post',
        data: reviewData,
      }),
      invalidatesTags: ['MyReviews', 'Reviews'],
    }),

    // Update a review
    updateReview: builder.mutation({
      query: ({ reviewId, ...reviewData }) => ({
        url: `/api/customers/reviews/${reviewId}`,
        method: 'put',
        data: reviewData,
      }),
      invalidatesTags: ['MyReviews', 'Reviews'],
    }),
  }),
});

export const {
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} = reviewApi;

export default reviewApi;
