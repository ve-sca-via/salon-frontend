/**
 * Cart API - RTK Query
 * 
 * Handles shopping cart operations with database backend.
 * All operations sync to Supabase for multi-device access.
 * Uses RTK Query for caching and automatic refetching.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    
    // Get all cart items
    getCart: builder.query({
      query: () => ({
        url: '/api/v1/customers/cart',
        method: 'get',
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: 'Cart', id })),
              { type: 'Cart', id: 'LIST' },
            ]
          : [{ type: 'Cart', id: 'LIST' }],
      keepUnusedDataFor: 30, // Cache for 30 seconds
      refetchOnFocus: true, // Refetch when user comes back to tab
      refetchOnReconnect: true, // Refetch when network reconnects
    }),

    // Add item to cart (or increment quantity if exists)
    addToCart: builder.mutation({
      query: (cartItem) => ({
        url: '/api/v1/customers/cart',
        method: 'post',
        data: cartItem,
      }),
      // Invalidate cart cache to trigger refetch
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/api/v1/customers/cart/${itemId}`,
        method: 'put',
        data: { quantity },
      }),
      // Optimistic update
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            const item = draft.items?.find((item) => item.id === itemId);
            if (item) {
              item.quantity = quantity;
              
              // Recalculate totals
              draft.total_amount = draft.items.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              );
              draft.item_count = draft.items.reduce(
                (total, item) => total + item.quantity,
                0
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
      invalidatesTags: (result, error, { itemId }) => [
        { type: 'Cart', id: itemId },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/api/v1/customers/cart/${itemId}`,
        method: 'delete',
      }),
      // Optimistic update
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            draft.items = draft.items?.filter((item) => item.id !== itemId) || [];
            
            // Recalculate totals
            draft.total_amount = draft.items.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            );
            draft.item_count = draft.items.reduce(
              (total, item) => total + item.quantity,
              0
            );
            
            // Clear salon if cart empty
            if (draft.items.length === 0) {
              draft.salon_id = null;
              draft.salon_name = null;
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, itemId) => [
        { type: 'Cart', id: itemId },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    // Clear entire cart
    clearCart: builder.mutation({
      query: () => ({
        url: '/api/v1/customers/cart/clear/all',
        method: 'delete',
      }),
      // Invalidate all cart cache
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // Checkout cart - create booking with payment details
    checkoutCart: builder.mutation({
      query: (checkoutData) => ({
        url: '/api/v1/customers/cart/checkout',
        method: 'post',
        data: checkoutData,
      }),
      // Invalidate cart cache after successful checkout
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useCheckoutCartMutation,
} = cartApi;

export default cartApi;
