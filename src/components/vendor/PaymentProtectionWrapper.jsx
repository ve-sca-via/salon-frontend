/**
 * PaymentProtectionWrapper Component
 * 
 * Purpose:
 * Wraps vendor routes to enforce payment requirement before accessing features.
 * Shows modal prompting payment if registration fee not paid.
 * 
 * Usage:
 * <PaymentProtectionWrapper>
 *   <YourProtectedComponent />
 * </PaymentProtectionWrapper>
 * 
 * Key Features:
 * - Checks salon payment status (registration_fee_paid, is_active)
 * - Shows modal dialog with payment CTA if unpaid
 * - Allows dashboard access but blocks other features
 * - Provides clear messaging about payment requirement
 * - Direct navigation to payment page
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetVendorSalonQuery } from '../../services/api/vendorApi';
import { FiCreditCard, FiLock, FiCheckCircle, FiShoppingBag, FiUsers, FiCalendar, FiStar } from 'react-icons/fi';
import Button from '../shared/Button';
import DashboardLayout from '../layout/DashboardLayout';

const PaymentProtectionWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch salon profile to check payment status
  const { data: salonData, isLoading } = useGetVendorSalonQuery();
  const salonProfile = salonData?.salon || salonData;

  // Debug logging
  console.log('🔒 Payment Protection Check:', {
    salonData,
    salonProfile,
    is_active: salonProfile?.is_active,
    registration_fee_paid: salonProfile?.registration_fee_paid,
    currentPath: location.pathname
  });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if payment is required
  const isPaymentPending = salonProfile && (!salonProfile.is_active || !salonProfile.registration_fee_paid);
  
  // Allow dashboard access even without payment
  const isDashboard = location.pathname === '/vendor/dashboard';
  const isPaymentPage = location.pathname === '/vendor/payment';
  
  // If payment pending and NOT on dashboard or payment page, show modal
  if (isPaymentPending && !isDashboard && !isPaymentPage) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 border border-gray-100">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
              <FiLock className="text-white text-5xl" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-3">
            Complete Payment Required
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 font-body text-center text-lg mb-8">
            Your salon has been verified! Complete your registration payment to unlock all features and start managing your salon.
          </p>

          {/* Payment Details Card */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8 border border-orange-200 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600 text-xl" />
                <span className="font-body font-bold text-gray-900">Admin Verified</span>
              </div>
              <span className="text-xs text-gray-600 font-body bg-white px-3 py-1 rounded-full">Approved ✓</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-orange-600 text-xl" />
                <span className="font-body font-semibold text-gray-900">Registration Fee</span>
              </div>
              <span className="text-2xl font-display font-bold text-orange-600">₹5,000</span>
            </div>
            
            <p className="text-xs text-gray-600 font-body mt-2">
              One-time payment • Includes GST
            </p>
          </div>

          {/* Features Locked Message */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="font-body font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <FiLock className="text-orange-600" />
              Features Locked Until Payment
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 font-body text-left">
              <li className="flex items-center gap-2">
                <FiShoppingBag className="text-gray-400" />
                Manage Services & Pricing
              </li>
              <li className="flex items-center gap-2">
                <FiUsers className="text-gray-400" />
                Add & Manage Staff
              </li>
              <li className="flex items-center gap-2">
                <FiCalendar className="text-gray-400" />
                Accept Customer Bookings
              </li>
              <li className="flex items-center gap-2">
                <FiStar className="text-gray-400" />
                Update Salon Profile
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/vendor/payment')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-8 text-lg font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg"
              >
                <FiCreditCard className="inline mr-2" />
                Complete Payment Now
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/vendor/dashboard')}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 py-2 px-6 hover:bg-gray-50"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-center text-xs text-gray-500 font-body mt-6">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
        </div>
      </DashboardLayout>
    );
  }

  // If payment complete or on allowed pages, show content
  return <>{children}</>;
};

export default PaymentProtectionWrapper;
