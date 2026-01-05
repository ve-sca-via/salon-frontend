/**
 * Checkout.jsx - Appointment Scheduling & Checkout Component
 * 
 * PURPOSE:
 * - Display cart summary from database
 * - Allow date and time slot selection for appointment
 * - Show pricing breakdown (service total, booking fee, GST)
 * - Integrate Razorpay payment
 * - Complete checkout after payment success
 * 
 * COMPLETE PAYMENT FLOW (14 Steps):
 * 1. User adds services to cart → POST /api/v1/customers/cart
 * 2. User navigates to /checkout
 * 3. Component fetches cart data → GET /api/v1/customers/cart
 * 4. User selects appointment date (from config: max_booking_advance_days)
 * 5. User selects time slots (up to 3, 15-min intervals)
 * 6. Component displays pricing:
 *    - Service Total: Sum of all service prices
 *    - Booking Fee: 10% of service total (from config)
 *    - GST: 18% of booking fee
 *    - Pay Now: Booking Fee + GST (convenience fee)
 *    - Pay at Salon: Service Total (full service amount)
 * 7. User clicks "Proceed to Payment"
 * 8. Component calls POST /api/v1/payments/cart/create-order
 *    - Backend creates Razorpay order
 *    - Returns: order_id, amount_paise, key_id
 * 9. Component opens Razorpay modal with order details
 * 10. User completes payment on Razorpay
 * 11. Razorpay returns payment response:
 *     - razorpay_order_id
 *     - razorpay_payment_id
 *     - razorpay_signature
 * 12. Component calls POST /api/v1/customers/cart/checkout with:
 *     - booking_date, time_slots
 *     - razorpay_order_id, razorpay_payment_id, razorpay_signature
 * 13. Backend:
 *     - Verifies payment signature
 *     - Creates booking from cart items
 *     - Creates booking_payment record
 *     - Clears cart
 * 14. Component redirects to /customer/bookings
 * 
 * PAYMENT SPLIT MODEL:
 * - Online Payment: Convenience fee (10% + GST) - Platform revenue
 * - At Salon Payment: Full service amount - Vendor revenue
 * 
 * DATA SOURCES:
 * - Cart data: RTK Query (useGetCartQuery)
 * - Booking fee %: Backend config (convenience_fee_percentage)
 * - Max advance days: Backend config (max_booking_advance_days)
 * - Razorpay key: Backend config (razorpay_key_id)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetCartQuery, useCheckoutCartMutation } from "../../services/api/cartApi";
import { useCreateCartPaymentOrderMutation } from "../../services/api/paymentApi";
import { useGetPublicConfigsQuery } from "../../services/api/configApi";
import { toast } from "react-toastify";
import { showInfoToast } from "../../utils/toastConfig";
import { SkeletonServiceCard } from "../../components/shared/Skeleton";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Fetch cart data
  const { data: cart, isLoading, error } = useGetCartQuery();
  
  // Fetch public configs
  const { data: configs } = useGetPublicConfigsQuery();
  
  // Mutations
  const [createPaymentOrder, { isLoading: isCreatingOrder }] = useCreateCartPaymentOrderMutation();
  const [checkoutCart, { isLoading: isCheckingOut }] = useCheckoutCartMutation();
  
  // State for appointment selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get booking fee from config (dynamically set by admin, no hardcoded fallback)
  const bookingFeePercentage = configs?.convenience_fee_percentage;
  
  // Get max advance booking days from config or default to 30
  const maxAdvanceDays = configs?.max_booking_advance_days || 30;

  // Redirect to cart if empty
  useEffect(() => {
    if (!isLoading && (!cart || cart?.items?.length === 0)) {
      showInfoToast("Your cart is empty", { position: "top-center" });
      navigate("/cart");
    }
  }, [cart, isLoading, navigate]);

  // Check if required config is loaded
  useEffect(() => {
    if (configs && !bookingFeePercentage) {
      toast.error("Payment configuration not available. Please contact support.", {
        position: "top-center"
      });
    }
  }, [configs, bookingFeePercentage]);

  /**
   * Generate date selection based on max_booking_advance_days config
   */
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < maxAdvanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        full: date,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        value: date.toISOString().split("T")[0],
      });
    }
    return dates;
  };

  /**
   * Generate time slots from 2:30 PM to 8:15 PM (15-min intervals)
   */
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 14; // 2 PM
    let currentMinute = 30;

    while (currentHour < 20 || (currentHour === 20 && currentMinute <= 15)) {
      const hour12 = currentHour > 12 ? currentHour - 12 : currentHour;
      const ampm = currentHour >= 12 ? "PM" : "AM";
      slots.push(`${hour12}:${currentMinute.toString().padStart(2, "0")} ${ampm}`);
      
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  // Calculate pricing (only if config is loaded)
  const servicesTotalAmount = cart?.total_amount || 0;
  const bookingFee = bookingFeePercentage ? Math.round((servicesTotalAmount * bookingFeePercentage) / 100) : 0;
  const gst = Math.round(bookingFee * 0.18);
  const totalBookingAmount = bookingFee + gst;
  const remainingAmount = servicesTotalAmount;

  /**
   * Handle time slot selection (max 3 slots)
   */
  const handleTimeSelection = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      if (selectedTimes.length < 3) {
        setSelectedTimes([...selectedTimes, time]);
      } else {
        toast.warning("You can select up to 3 time slots only", {
          position: "bottom-right",
        });
      }
    }
  };

  /**
   * Handle Razorpay payment and checkout
   */
  const handleProceedToPayment = async () => {
    // Validate selections
    if (!selectedDate) {
      toast.error("Please select a date for your appointment", {
        position: "top-center",
      });
      return;
    }
    if (selectedTimes.length === 0) {
      toast.error("Please select at least one time slot", {
        position: "top-center",
      });
      return;
    }

    // Validate config is loaded (critical for payment calculation)
    if (!bookingFeePercentage) {
      toast.error("Payment configuration not available. Please refresh the page or contact support.", {
        position: "top-center",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Step 1: Create Razorpay order
      const orderData = await createPaymentOrder().unwrap();
      
      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        order_id: orderData.order_id,
        name: 'Salon Platform',
        description: 'Booking Convenience Fee',
        handler: async function (response) {
          try {
            // Step 3: After successful payment, complete checkout
            await handleCheckoutSuccess(response);
          } catch (error) {
            setIsProcessingPayment(false);
            toast.error('Failed to complete booking. Please contact support with your payment ID.', {
              position: "top-center"
            });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled", { position: "top-center" });
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setIsProcessingPayment(false);
      toast.error(error?.data?.message || 'Failed to initiate payment', {
        position: "top-center"
      });
    }
  };

  /**
   * Complete checkout after payment success
   */
  const handleCheckoutSuccess = async (paymentResponse) => {
    try {
      const result = await checkoutCart({
        booking_date: selectedDate,
        time_slots: selectedTimes,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        payment_method: 'razorpay',
        notes: ''
      }).unwrap();
      
      setIsProcessingPayment(false);
      toast.success('Booking confirmed successfully!', { position: "top-center" });
      
      // Small delay to ensure user sees the success message
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (error) {
      setIsProcessingPayment(false);
      toast.error(error?.data?.message || 'Checkout failed. Please contact support.', {
        position: "top-center"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonServiceCard key={i} />
              ))}
            </div>
            <div>
              <div className="bg-primary-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Failed to load cart. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-neutral-gray-500 hover:text-neutral-black mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Schedule Appointment
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Select your preferred date and time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Date & Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time Selection Card */}
            <div className="bg-primary-white rounded-lg p-6 shadow-lg">
              <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
                Select Date & Time
              </h3>

              {/* Selected Date Display */}
              <div className="mb-4 p-3 border border-neutral-gray-600 rounded-lg">
                <p className="font-body text-[14px] text-neutral-black">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        weekday: "short",
                        year: "numeric",
                      })
                    : "Select a date below"}
                </p>
              </div>

              {/* Date Selector */}
              <div className="mb-6">
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {dates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 transition-all ${
                        selectedDate === date.value
                          ? "bg-neutral-black border-neutral-black text-primary-white"
                          : "border-neutral-gray-600 hover:border-accent-orange"
                      }`}
                    >
                      <span className={`font-body font-semibold text-[12px] mb-1 ${
                        selectedDate === date.value ? "text-primary-white" : "text-neutral-gray-500"
                      }`}>
                        {date.day}
                      </span>
                      <span className="font-body font-bold text-[20px] mb-0.5">
                        {date.date}
                      </span>
                      <span className="font-body text-[10px] uppercase">
                        {date.month}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[13px] text-neutral-gray-500">
                    You can select up to 3 time slots
                  </p>
                  {selectedTimes.length > 0 && (
                    <span className="font-body text-[12px] text-accent-orange font-semibold">
                      {selectedTimes.length}/3 selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelection(time)}
                      className={`py-2 px-3 rounded-lg border text-[13px] font-body font-medium transition-all ${
                        selectedTimes.includes(time)
                          ? "bg-accent-orange border-accent-orange text-primary-white"
                          : "border-neutral-gray-600 text-neutral-black hover:border-accent-orange"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-primary-white rounded-lg p-6 shadow-lg sticky top-8">
              <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
                Order Summary
              </h3>

              {/* Services */}
              <div className="mb-4 pb-4 border-b border-neutral-gray-600">
                <p className="font-body text-[14px] text-neutral-gray-500 mb-2">
                  {cart?.items?.length || 0} service{cart?.items?.length !== 1 ? 's' : ''} from{" "}
                  <span className="font-semibold text-neutral-black">{cart?.salon_name}</span>
                </p>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-neutral-gray-500">Service Total</span>
                  <span className="text-neutral-black font-semibold">₹{servicesTotalAmount}</span>
                </div>
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-neutral-gray-500">Booking Fee ({bookingFeePercentage}%)</span>
                  <span className="text-neutral-black font-semibold">₹{bookingFee}</span>
                </div>
                <div className="flex justify-between font-body text-[14px]">
                  <span className="text-neutral-gray-500">GST (18%)</span>
                  <span className="text-neutral-black font-semibold">₹{gst}</span>
                </div>
                <div className="pt-3 border-t border-neutral-gray-600">
                  <div className="flex justify-between font-body text-[16px]">
                    <span className="text-neutral-black font-bold">Pay Now</span>
                    <span className="text-accent-orange font-bold">₹{totalBookingAmount}</span>
                  </div>
                  <p className="text-[11px] text-neutral-gray-500 mt-1">
                    Pay ₹{remainingAmount} at salon
                  </p>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedDate || selectedTimes.length === 0 || isProcessingPayment || isCreatingOrder || isCheckingOut}
                className="w-full bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isProcessingPayment || isCreatingOrder || isCheckingOut) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
