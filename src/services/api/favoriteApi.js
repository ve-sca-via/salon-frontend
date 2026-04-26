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
        url: '/api/v1/customers/favorites',
        method: 'get',
      }),
      providesTags: ['Favorites'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
      refetchOnFocus: true,
    }),

    // Add salon to favorites
    addFavorite: builder.mutation({
      query: (salonId) => ({
        url: '/api/v1/customers/favorites',
        method: 'post',
        data: { salon_id: salonId },
      }),
      // Optimistic update
      async onQueryStarted(salonId, { dispatch, queryFulfilled }) {
        const normalizedSalonId = String(salonId);
        const patchResult = dispatch(
          favoriteApi.util.updateQueryData('getFavorites', undefined, (draft) => {
            if (draft.favorites && !draft.favorites.some((fav) => String(fav.id ?? fav.salon_id) === normalizedSalonId)) {
              draft.favorites.push({
                id: salonId,
                salon_id: salonId,
                _optimistic: true,
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
        url: `/api/v1/customers/favorites/${salonId}`,
        method: 'delete',
      }),
      // Optimistic update
      async onQueryStarted(salonId, { dispatch, queryFulfilled }) {
        const normalizedSalonId = String(salonId);
        const patchResult = dispatch(
          favoriteApi.util.updateQueryData('getFavorites', undefined, (draft) => {
            if (draft.favorites) {
              draft.favorites = draft.favorites.filter(
                (fav) => String(fav.salon_id ?? fav.id) !== normalizedSalonId
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
