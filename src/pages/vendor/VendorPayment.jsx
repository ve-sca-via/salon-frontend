import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiCreditCard, FiCheckCircle, FiLock, FiShield, 
  FiDollarSign, FiCalendar, FiInfo 
} from 'react-icons/fi';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { 
  useGetVendorSalonQuery, 
  useProcessVendorPaymentMutation 
} from '../../services/api/vendorApi';

const VendorPayment = () => {
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: salonData } = useGetVendorSalonQuery();
  const [processPayment] = useProcessVendorPaymentMutation();
  
  const salonProfile = salonData?.salon;
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Processing, 3: Success

  // Check if already paid
  useEffect(() => {
    if (salonProfile?.subscription_status === 'active') {
      toast.info('Your payment has already been processed!');
      navigate('/vendor/dashboard');
    }
  }, [salonProfile, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStep(2);

    // Simulate payment processing (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Call backend to update subscription status
      await processPayment().unwrap();
      
      setPaymentStep(3);
      
      // Show success and redirect after 2 seconds
      setTimeout(() => {
        toast.success('🎉 Payment successful! Your salon is now active!');
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
      setProcessing(false);
      setPaymentStep(1);
    }
  };

  if (paymentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-12">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full w-24 h-24 flex items-center justify-center">
                <FiCreditCard className="text-white text-4xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Processing Payment...
            </h2>
            <p className="text-gray-600 font-body mb-6">
              Please wait while we process your payment securely
            </p>
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
            <p className="text-sm text-gray-500 font-body">
              Redirecting to dashboard...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Payment Details Page
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
            <Card className="mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                Payment Summary
              </h2>
              
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
                    <p className="text-3xl font-display font-bold text-gray-900">₹5,000</p>
                    <p className="text-sm text-gray-500 font-body">incl. GST</p>
                  </div>
                </div>
              </div>

              {/* What's Included */}
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

            {/* Fake Payment Form */}
            <Card>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FiInfo className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-body font-semibold text-blue-900 mb-1">Demo Mode</p>
                    <p className="text-sm text-blue-700 font-body">
                      This is a demonstration. Click "Complete Payment" to simulate a successful payment.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-[#F89C02] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-heading font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FiLock className="mr-2" size={20} />
                Complete Payment - ₹5,000
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
                  <span>₹4,237</span>
                </div>
                <div className="flex justify-between text-gray-700 font-body">
                  <span>GST (18%)</span>
                  <span>₹763</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-heading font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>₹5,000</span>
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
