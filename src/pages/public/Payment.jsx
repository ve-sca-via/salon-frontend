/**
 * Payment.jsx - Payment Processing & Booking Creation Component
 * 
 * PURPOSE:
 * - Display payment summary
 * - Process payment with animated modal (3 steps: Initiating → Processing → Success)
 * - Create booking in database after successful payment
 * - Clear cart automatically
 * - Navigate to booking confirmation
 * 
 * FLOW:
 * 1. Receives checkout data from navigation state
 * 2. Shows payment summary
 * 3. User clicks "Pay Now"
 * 4. Payment modal with 3-step animation (total 4 seconds)
 * 5. Creates booking via RTK Query
 * 6. Clears cart
 * 7. Navigates to /booking-confirmation with booking details
 * 
 * DATA:
 * - Receives: cart, selectedDate, selectedTimes, pricing from Checkout component
 * - Creates: booking via useCreateBookingMutation
 * - Clears: cart via useClearCartMutation
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useCreateBookingMutation } from "../../services/api/bookingApi";
import { useClearCartMutation } from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Get checkout data from navigation state
  const checkoutData = location.state;
  
  // Mutations
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [clearCartMutation] = useClearCartMutation();
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Initiating, 2: Processing, 3: Success

  // Redirect if no checkout data or user not logged in
  useEffect(() => {
    if (!checkoutData) {
      showErrorToast("Invalid checkout session", { position: "top-center" });
      navigate("/cart");
      return;
    }
    if (!user) {
      showErrorToast("Please login to complete payment", { position: "top-center" });
      navigate("/login");
    }
  }, [checkoutData, user, navigate]);

  if (!checkoutData) return null;

  const { cart, selectedDate, selectedTimes, bookingFeePercentage, pricing } = checkoutData;
  const { servicesTotalAmount, bookingFee, gst, totalBookingAmount, remainingAmount } = pricing;

  /**
   * Process payment with 3-step animation
   * Then create booking and navigate to confirmation
   */
  const handlePayNow = async () => {
    setShowPaymentModal(true);
    setPaymentStep(1);

    try {
      // Step 1: Initiating (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaymentStep(2);

      // Step 2: Processing (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStep(3);

      // Step 3: Success (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Prepare booking data
      const bookingData = {
        salon_id: cart.salon_id,
        booking_date: selectedDate,
        booking_time: selectedTimes.join(", "),
        services: cart.items.map((item) => ({
          service_id: item.service_id,
          service_name: item.service_name,
          plan_name: item.plan_name,
          category: item.category,
          duration: item.duration,
          price: item.price,
          quantity: item.quantity,
        })),
        total_amount: servicesTotalAmount,
        booking_fee: bookingFee,
        gst_amount: gst,
        amount_paid: totalBookingAmount,
        remaining_amount: remainingAmount,
        payment_status: 'paid',
        payment_method: 'demo',
        notes: `Cart checkout - ${cart.items.length} services | Booking Fee: ${bookingFeePercentage}%`,
      };

      // Create booking
      const newBooking = await createBooking(bookingData).unwrap();

      // Clear cart
      await clearCartMutation().unwrap().catch(err => {
        console.warn("Cart clear failed after booking:", err);
      });

      // Close modal
      setShowPaymentModal(false);

      // Show success toast
      showSuccessToast("Booking confirmed! 🎉", {
        position: "top-center",
        autoClose: 3000,
      });

      // Navigate to confirmation
      navigate("/booking-confirmation", {
        state: { booking: newBooking },
        replace: true,
      });
    } catch (error) {
      console.error("Payment/Booking error:", error);
      setShowPaymentModal(false);
      showErrorToast(error?.data?.message || "Payment failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/checkout")}
            className="flex items-center gap-2 text-neutral-gray-500 hover:text-neutral-black mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checkout
          </button>
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Payment
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Review and complete your payment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Details */}
          <div className="bg-primary-white rounded-lg p-6 shadow-lg">
            <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
              Booking Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Salon</p>
                <p className="font-body font-semibold text-neutral-black">{cart.salon_name}</p>
              </div>

              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Date</p>
                <p className="font-body font-semibold text-neutral-black">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    weekday: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Time Slots</p>
                <p className="font-body font-semibold text-neutral-black">
                  {selectedTimes.join(", ")}
                </p>
              </div>

              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Services</p>
                <p className="font-body font-semibold text-neutral-black">
                  {cart.items.length} service{cart.items.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-primary-white rounded-lg p-6 shadow-lg">
            <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
              Payment Summary
            </h3>

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
              <div className="pt-3 border-t-2 border-neutral-gray-600">
                <div className="flex justify-between font-body text-[18px]">
                  <span className="text-neutral-black font-bold">Pay Now</span>
                  <span className="text-accent-orange font-bold">₹{totalBookingAmount}</span>
                </div>
                <p className="text-[12px] text-neutral-gray-500 mt-2">
                  Pay ₹{remainingAmount} at salon after service
                </p>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isCreatingBooking || showPaymentModal}
              className="w-full bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingBooking ? "Processing..." : "Pay Now"}
            </button>

            <p className="text-[11px] text-neutral-gray-500 text-center mt-3">
              Demo payment - No actual charge
            </p>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-neutral-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            {/* Step 1: Initiating */}
            {paymentStep === 1 && (
              <>
                <div className="w-16 h-16 bg-accent-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-orange"></div>
                </div>
                <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
                  Initiating Payment
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Please wait...
                </p>
              </>
            )}

            {/* Step 2: Processing */}
            {paymentStep === 2 && (
              <>
                <div className="w-16 h-16 bg-accent-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-pulse">
                    <svg className="w-10 h-10 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
                  Processing Payment
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Securely processing your payment...
                </p>
              </>
            )}

            {/* Step 3: Success */}
            {paymentStep === 3 && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
                  Payment Successful!
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Creating your booking...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
