/**
 * Product API - RTK Query
 * 
 * Handles public product catalog API calls.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Products', 'ProductDetails', 'Categories'],
  endpoints: (builder) => ({
    // Get all public products
    getProducts: builder.query({
      query: (filters = {}) => ({
        url: '/api/v1/products',
        method: 'get',
        params: filters,
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ id }) => ({ type: 'Products', id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get single product by ID
    getProductById: builder.query({
      query: (productId) => ({
        url: `/api/v1/products/${productId}`,
        method: 'get',
      }),
      providesTags: (result, error, id) => [{ type: 'ProductDetails', id }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get single product by Slug
    getProductBySlug: builder.query({
      query: (slug) => ({
        url: `/api/v1/products/slug/${slug}`,
        method: 'get',
      }),
      providesTags: (result, error, slug) => [{ type: 'ProductDetails', id: slug }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get product categories
    getProductCategories: builder.query({
      query: () => ({
        url: '/api/v1/products/categories',
        method: 'get',
      }),
      providesTags: ['Categories'],
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetProductCategoriesQuery,
} = productApi;

export default productApi;
