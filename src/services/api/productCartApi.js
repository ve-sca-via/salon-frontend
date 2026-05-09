/**
 * Product Cart API - RTK Query
 * 
 * Handles product shopping cart operations with database backend.
 * Uses RTK Query for caching and automatic refetching.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const productCartApi = createApi({
  reducerPath: 'productCartApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ProductCart'],
  endpoints: (builder) => ({
    
    // Get all cart items
    getProductCart: builder.query({
      query: () => ({
        url: '/api/v1/customers/product-cart',
        method: 'get',
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: 'ProductCart', id })),
              { type: 'ProductCart', id: 'LIST' },
            ]
          : [{ type: 'ProductCart', id: 'LIST' }],
      keepUnusedDataFor: 300,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }),

    // Add item to product cart
    addToProductCart: builder.mutation({
      query: (cartItem) => ({
        url: '/api/v1/customers/product-cart',
        method: 'post',
        data: cartItem,
      }),
      invalidatesTags: [{ type: 'ProductCart', id: 'LIST' }],
    }),

    // Update product cart item quantity
    updateProductCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/api/v1/customers/product-cart/${itemId}`,
        method: 'put',
        data: { quantity },
      }),
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productCartApi.util.updateQueryData('getProductCart', undefined, (draft) => {
            const item = draft.items?.find((item) => item.id === itemId);
            if (item) {
              item.quantity = quantity;
              draft.total_amount = draft.items.reduce(
                (total, item) => total + (item.unit_price ?? item.price) * item.quantity,
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
        { type: 'ProductCart', id: itemId },
        { type: 'ProductCart', id: 'LIST' },
      ],
    }),

    // Remove item from product cart
    removeProductFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/api/v1/customers/product-cart/${itemId}`,
        method: 'delete',
      }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productCartApi.util.updateQueryData('getProductCart', undefined, (draft) => {
            draft.items = draft.items?.filter((item) => item.id !== itemId) || [];
            draft.total_amount = draft.items.reduce(
              (total, item) => total + (item.unit_price ?? item.price) * item.quantity,
              0
            );
            draft.item_count = draft.items.reduce(
              (total, item) => total + item.quantity,
              0
            );
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, itemId) => [
        { type: 'ProductCart', id: itemId },
        { type: 'ProductCart', id: 'LIST' },
      ],
    }),

    // Clear entire product cart
    clearProductCart: builder.mutation({
      query: () => ({
        url: '/api/v1/customers/product-cart/clear/all',
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'ProductCart', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductCartQuery,
  useAddToProductCartMutation,
  useUpdateProductCartItemMutation,
  useRemoveProductFromCartMutation,
  useClearProductCartMutation,
} = productCartApi;

export default productCartApi;
