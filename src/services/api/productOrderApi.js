import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const productOrderApi = createApi({
  reducerPath: 'productOrderApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ProductOrder'],
  endpoints: (builder) => ({
    createProductOrder: builder.mutation({
      query: (orderData) => ({
        url: '/api/v1/product-orders/create',
        method: 'post',
        data: orderData,
      }),
      invalidatesTags: [{ type: 'ProductOrder', id: 'LIST' }],
    }),
    verifyProductPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/api/v1/product-orders/verify',
        method: 'post',
        data: paymentData,
      }),
      invalidatesTags: [{ type: 'ProductOrder', id: 'LIST' }],
      async onQueryStarted(_paymentData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(
            productOrderApi.endpoints.getMyProductOrders.initiate(undefined, { forceRefetch: true })
          ).unwrap();
        } catch {
          // Payment verification failed
        }
      },
    }),
    devVerifyProductPayment: builder.mutation({
      query: (orderId) => ({
        url: `/api/v1/product-orders/dev-verify/${orderId}`,
        method: 'post',
      }),
      invalidatesTags: [{ type: 'ProductOrder', id: 'LIST' }],
      async onQueryStarted(_orderId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(
            productOrderApi.endpoints.getMyProductOrders.initiate(undefined, { forceRefetch: true })
          ).unwrap();
        } catch {
          // Dev verification failed
        }
      },
    }),
    getMyProductOrders: builder.query({
      query: () => ({
        url: '/api/v1/product-orders/my-orders',
        method: 'get',
      }),
      providesTags: [{ type: 'ProductOrder', id: 'LIST' }],
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),
  }),
});

export const {
  useCreateProductOrderMutation,
  useVerifyProductPaymentMutation,
  useDevVerifyProductPaymentMutation,
  useGetMyProductOrdersQuery,
} = productOrderApi;

export default productOrderApi;
