/**
 * Cart API - RTK Query
 * 
 * Handles shopping cart operations with optimistic updates
 * for instant UI feedback.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    // Get cart items
    getCart: builder.query({
      query: () => ({
        url: '/api/customers/cart',
        method: 'get',
      }),
      providesTags: ['Cart'],
      keepUnusedDataFor: 30, // Cache for 30 seconds (cart changes frequently)
      refetchOnFocus: true, // Refetch when user comes back to tab
    }),

    // Add item to cart
    addToCart: builder.mutation({
      query: (cartItem) => ({
        url: '/api/customers/cart',
        method: 'post',
        data: cartItem,
      }),
      // Optimistic update - add item to UI immediately
      async onQueryStarted(cartItem, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            // Add temporary item to draft
            if (draft.items) {
              draft.items.push({
                ...cartItem,
                id: `temp-${Date.now()}`, // Temporary ID
              });
            }
          })
        );
        try {
          const { data } = await queryFulfilled;
          // Update with real data from server
          dispatch(
            cartApi.util.updateQueryData('getCart', undefined, (draft) => {
              // Replace temp item with real one
              if (draft.items) {
                const tempIndex = draft.items.findIndex((i) => i.id?.toString().startsWith('temp-'));
                if (tempIndex !== -1 && data.item) {
                  draft.items[tempIndex] = data.item;
                }
              }
            })
          );
        } catch {
          // Rollback optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart'],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/api/customers/cart/${itemId}`,
        method: 'delete',
      }),
      // Optimistic update - remove from UI immediately
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft.items) {
              draft.items = draft.items.filter((item) => item.id !== itemId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          // Rollback on error
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart'],
    }),

    // Checkout cart
    checkoutCart: builder.mutation({
      query: (checkoutData) => ({
        url: '/api/customers/cart/checkout',
        method: 'post',
        data: checkoutData,
      }),
      // After checkout, clear cart and refetch bookings
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useCheckoutCartMutation,
} = cartApi;

export default cartApi;
