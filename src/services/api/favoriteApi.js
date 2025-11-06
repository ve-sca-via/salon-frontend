/**
 * Favorites API - RTK Query
 * 
 * Handles user favorites with optimistic updates.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const favoriteApi = createApi({
  reducerPath: 'favoriteApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    // Get user's favorites
    getFavorites: builder.query({
      query: () => ({
        url: '/api/customers/favorites',
        method: 'get',
      }),
      providesTags: ['Favorites'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      refetchOnFocus: true,
    }),

    // Add salon to favorites
    addFavorite: builder.mutation({
      query: (salonId) => ({
        url: '/api/customers/favorites',
        method: 'post',
        data: { salon_id: salonId },
      }),
      // Optimistic update
      async onQueryStarted(salonId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          favoriteApi.util.updateQueryData('getFavorites', undefined, (draft) => {
            if (draft.favorites) {
              draft.favorites.push({
                salon_id: salonId,
                id: `temp-${Date.now()}`,
              });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Favorites'],
    }),

    // Remove salon from favorites
    removeFavorite: builder.mutation({
      query: (salonId) => ({
        url: `/api/customers/favorites/${salonId}`,
        method: 'delete',
      }),
      // Optimistic update
      async onQueryStarted(salonId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          favoriteApi.util.updateQueryData('getFavorites', undefined, (draft) => {
            if (draft.favorites) {
              draft.favorites = draft.favorites.filter(
                (fav) => fav.salon_id !== salonId
              );
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoriteApi;

export default favoriteApi;
