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
    }),
    getMyProductOrders: builder.query({
      query: () => ({
        url: '/api/v1/product-orders/my-orders',
        method: 'get',
      }),
      providesTags: ['ProductOrder'],
    }),
  }),
});

export const {
  useCreateProductOrderMutation,
  useVerifyProductPaymentMutation,
  useGetMyProductOrdersQuery,
} = productOrderApi;

export default productOrderApi;
