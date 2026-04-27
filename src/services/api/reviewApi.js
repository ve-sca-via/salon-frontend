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
  tagTypes: ['Reviews', 'MyReviews', 'SalonReviews', 'FeedbackContext'],
  endpoints: (builder) => ({
    // Get customer's own reviews
    getMyReviews: builder.query({
      query: () => ({
        url: '/api/v1/customers/reviews/my-reviews',
        method: 'get',
      }),
      providesTags: ['MyReviews'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create a review
    createReview: builder.mutation({
      query: (reviewData) => ({
        url: '/api/v1/customers/reviews',
        method: 'post',
        data: reviewData,
      }),
      invalidatesTags: ['MyReviews', 'Reviews'],
    }),

    // Get public reviews for a salon
    getSalonReviews: builder.query({
      query: (salonId) => ({
        url: `/api/v1/salons/${salonId}/reviews`,
        method: 'get',
      }),
      providesTags: (result, error, salonId) => [{ type: 'SalonReviews', id: salonId }],
      keepUnusedDataFor: 300,
    }),

    // Load public feedback page context from email token
    getFeedbackContext: builder.query({
      query: ({ salonId, token }) => ({
        url: `/api/v1/salons/${salonId}/feedback`,
        method: 'get',
        params: { token },
      }),
      providesTags: (result, error, { salonId }) => [{ type: 'FeedbackContext', id: salonId }],
      keepUnusedDataFor: 60,
    }),

    // Submit review from public feedback page
    submitFeedback: builder.mutation({
      query: ({ salonId, token, rating, comment }) => ({
        url: `/api/v1/salons/${salonId}/feedback`,
        method: 'post',
        data: { token, rating, comment },
      }),
      invalidatesTags: (result, error, { salonId }) => [
        'MyReviews',
        'Reviews',
        { type: 'SalonReviews', id: salonId },
        { type: 'FeedbackContext', id: salonId },
      ],
    }),

    // Update a review
    updateReview: builder.mutation({
      query: ({ reviewId, ...reviewData }) => ({
        url: `/api/v1/customers/reviews/${reviewId}`,
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
  useGetSalonReviewsQuery,
  useGetFeedbackContextQuery,
  useSubmitFeedbackMutation,
  useUpdateReviewMutation,
} = reviewApi;

export default reviewApi;
