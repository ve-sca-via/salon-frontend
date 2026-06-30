/**
 * Payment API - RTK Query
 *
 * Handles all payment operations using Razorpay integration.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    // Cart Checkout Payment - Create Razorpay Order
    // Optionally pass { coupon_code } to apply a coupon to this order.
    createCartPaymentOrder: builder.mutation({
      query: (body) => ({
        url: '/api/v1/payments/cart/create-order',
        method: 'post',
        data: body?.coupon_code ? { coupon_code: body.coupon_code } : {},
      }),
    }),

    // Vendor Registration Payment - Create Order
    createVendorRegistrationOrder: builder.mutation({
      query: (vendorRequestId) => ({
        url: `/api/v1/payments/registration/create-order?vendor_request_id=${vendorRequestId}`,
        method: 'post',
      }),
    }),

    // Vendor Registration Payment - Verify
    verifyVendorRegistrationPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/api/v1/payments/registration/verify',
        method: 'post',
        data: paymentData,
      }),
      invalidatesTags: ['VendorSalon'],
    }),
  }),
});

export const {
  useCreateCartPaymentOrderMutation,
  useCreateVendorRegistrationOrderMutation,
  useVerifyVendorRegistrationPaymentMutation,
} = paymentApi;

export default paymentApi;
