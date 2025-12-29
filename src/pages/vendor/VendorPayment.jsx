/**
 * VendorPayment Component
 * 
 * Purpose:
 * Handles one-time registration fee payment for vendor salon accounts.
 * Simulates payment processing in demo mode and activates salon account upon completion.
 * 
 * Data Management:
 * - Fetches salon profile via RTK Query (useGetVendorSalonQuery)
 * - Processes payment via mutation (useProcessVendorPaymentMutation)
 * - Local state for payment flow and processing status
 * 
 * Key Features:
 * - 3-step payment flow (Details → Processing → Success)
 * - Demo payment simulation (no real payment gateway)
 * - Redirect protection for already-paid accounts
 * - Automatic redirect to dashboard after success
 * - Detailed payment summary and benefits
 * - Security indicators (SSL, encryption)
 * 
 * Payment Flow:
 * 1. Check if already paid → redirect to dashboard
 * 2. Display payment details and benefits
 * 3. User clicks "Complete Payment" (demo mode)
 * 4. Simulate 3-second processing with animation
 * 5. Call backend to update subscription status
 * 6. Show success screen for 2 seconds
 * 7. Redirect to vendor dashboard
 * 
 * Demo Mode:
 * - No real payment gateway integrated
 * - Simulates successful payment after 3 seconds
 * - Click "Complete Payment" to activate account
 * 
 * Configuration:
 * - Registration fee: ₹5,000 (incl. 18% GST)
 * - Processing delay: 3 seconds
 * - Success screen duration: 2 seconds
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showInfoToast, showErrorToast } from '../../utils/toastConfig';
import { 
  FiCreditCard, FiCheckCircle, FiLock, FiShield, 
  FiDollarSign, FiCalendar, FiInfo, FiAlertTriangle
} from 'react-icons/fi';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { 
  useGetVendorSalonQuery, 
  useProcessVendorPaymentMutation 
} from '../../services/api/vendorApi';

// Payment configuration
const PAYMENT_CONFIG = {
  REGISTRATION_FEE: 5000,
  SUBTOTAL: 4237,
  GST_AMOUNT: 763,
  GST_RATE: 18,
  PROCESSING_DELAY: 3000, // 3 seconds
  SUCCESS_SCREEN_DURATION: 2000, // 2 seconds
};

const VendorPayment = () => {
  const navigate = useNavigate();
  
  // RTK Query hooks for fetching and updating payment status
  const { data: salonData, isLoading: salonLoading } = useGetVendorSalonQuery();
  const [processPayment, { isLoading: isProcessing }] = useProcessVendorPaymentMutation();
  
  const salonProfile = salonData?.salon;
  
  // Payment flow state: 1 = Details, 2 = Processing, 3 = Success
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  
  // Refs for timeout cleanup
  const processingTimeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  /**
   * Check if salon has already paid registration fee
   * Redirect to dashboard if already active to prevent duplicate payments
   */
  useEffect(() => {
    if (salonProfile?.subscription_status === 'active' || salonProfile?.registration_fee_paid) {
      showInfoToast('Your payment has already been processed!');
      // Slight delay to ensure toast displays before navigation
      const timer = setTimeout(() => navigate('/vendor/dashboard'), 500);
      return () => clearTimeout(timer);
    }
  }, [salonProfile, navigate]);

  /**
   * Cleanup timeouts on component unmount to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  /**
   * handlePayment - Simulates payment processing and updates backend
   * Demo mode: No real payment gateway, just updates subscription status
   */
  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStep(2);

    // Simulate payment gateway processing (demo mode - 3 seconds)
    processingTimeoutRef.current = setTimeout(async () => {
      try {
        // Call backend to update subscription status and mark as paid
        await processPayment().unwrap();
        
        setPaymentStep(3);
        
        // Show success screen, then redirect to dashboard after 2 seconds
        redirectTimeoutRef.current = setTimeout(() => {
          showSuccessToast('🎉 Payment successful! Your salon is now active!');
          navigate('/vendor/dashboard');
        }, PAYMENT_CONFIG.SUCCESS_SCREEN_DURATION);
      } catch (error) {
        // Differentiate error types for better user feedback
        const errorMessage = error?.data?.message || error?.message || 'Payment processing failed';
        showErrorToast(`Payment failed: ${errorMessage}`);
        
        // Reset to payment form
        setProcessing(false);
        setPaymentStep(1);
      }
    }, PAYMENT_CONFIG.PROCESSING_DELAY);
  };

  // Loading state while fetching salon data
  if (salonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <div className="py-12 space-y-4 animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Processing Payment Animation
  // Step 2: Processing Payment Animation
  if (paymentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-12">
            {/* Animated payment icon */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full w-24 h-24 flex items-center justify-center">
                <FiCreditCard className="text-white text-4xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Processing Payment...
            </h2>
            <p className="text-gray-600 font-body mb-6" role="status" aria-live="polite">
              Please wait while we process your payment securely
            </p>
            {/* Loading dots animation */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Success Screen
  // Step 3: Success Screen
  if (paymentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-green-600 text-5xl" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-600 font-body mb-2">
              Your salon account is now active!
            </p>
            <p className="text-sm text-gray-500 font-body" role="status" aria-live="polite">
              Redirecting to dashboard...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1: Payment Details Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F89C02] to-orange-600 rounded-2xl shadow-2xl mb-6">
            <FiCreditCard className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 font-body text-lg">
            One-time registration fee to activate your salon account
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Summary */}
          <div className="lg:col-span-2">
            {/* Demo Mode Warning - Prominent Display */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-6 mb-6 shadow-lg">
              <div className="flex items-start">
                <FiAlertTriangle className="text-yellow-600 mt-1 mr-4 flex-shrink-0 text-2xl" />
                <div>
                  <h3 className="font-heading font-bold text-yellow-900 text-lg mb-2">
                    🎮 DEMO MODE - Test Environment
                  </h3>
                  <p className="text-sm text-yellow-800 font-body mb-2">
                    This is a <strong>demonstration environment</strong>. No real payment will be processed.
                  </p>
                  <p className="text-sm text-yellow-800 font-body">
                    Click "Complete Payment" below to simulate a successful payment and activate your salon account.
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                Payment Summary
              </h2>
              
              {/* Registration fee details */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FiShield className="text-[#F89C02] text-3xl mr-4" />
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-lg">
                        Salon Registration
                      </h3>
                      <p className="text-sm text-gray-600 font-body">One-time activation fee</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-gray-900">₹{PAYMENT_CONFIG.REGISTRATION_FEE.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 font-body">incl. {PAYMENT_CONFIG.GST_RATE}% GST</p>
                  </div>
                </div>
              </div>

              {/* What's Included Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-heading font-bold text-gray-900 mb-4">What's Included:</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-body font-semibold text-gray-900">Lifetime Access</p>
                      <p className="text-sm text-gray-600">Full access to salon management dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-body font-semibold text-gray-900">Online Booking System</p>
                      <p className="text-sm text-gray-600">Accept bookings 24/7 from customers</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-body font-semibold text-gray-900">Analytics & Reports</p>
                      <p className="text-sm text-gray-600">Track revenue, bookings, and performance</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-body font-semibold text-gray-900">Customer Management</p>
                      <p className="text-sm text-gray-600">Manage customers, reviews, and feedback</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-body font-semibold text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-600">Dedicated support team to help you</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                Payment Method
              </h2>

              <Button
                onClick={handlePayment}
                disabled={processing || isProcessing}
                className="w-full bg-gradient-to-r from-[#F89C02] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-heading font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Complete payment of ${PAYMENT_CONFIG.REGISTRATION_FEE} rupees`}
              >
                <FiLock className="mr-2" size={20} />
                {processing || isProcessing ? 'Processing...' : `Complete Payment - ₹${PAYMENT_CONFIG.REGISTRATION_FEE.toLocaleString()}`}
              </Button>

              <p className="text-center text-sm text-gray-500 font-body mt-4">
                <FiShield className="inline mr-1" />
                Secure payment processing
              </p>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h3 className="font-heading font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 font-body">
                  <span>Subtotal</span>
                  <span>₹{PAYMENT_CONFIG.SUBTOTAL.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-body">
                  <span>GST ({PAYMENT_CONFIG.GST_RATE}%)</span>
                  <span>₹{PAYMENT_CONFIG.GST_AMOUNT.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-heading font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>₹{PAYMENT_CONFIG.REGISTRATION_FEE.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600 font-body">
                  <FiCalendar className="mr-2 text-gray-400" size={16} />
                  Instant activation
                </div>
                <div className="flex items-center text-sm text-gray-600 font-body">
                  <FiShield className="mr-2 text-gray-400" size={16} />
                  Secure checkout
                </div>
                <div className="flex items-center text-sm text-gray-600 font-body">
                  <FiDollarSign className="mr-2 text-gray-400" size={16} />
                  One-time payment
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPayment;
