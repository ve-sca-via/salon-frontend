/**
 * Payment.jsx - Payment Processing & Booking Creation Component
 * 
 * PURPOSE:
 * - Display payment summary
 * - Process payment with Razorpay integration
 * - Create booking in database after successful payment verification
 * - Clear cart automatically
 * - Navigate to booking confirmation
 * 
 * FLOW:
 * 1. Receives checkout data from navigation state
 * 2. Shows payment summary
 * 3. User clicks "Pay Now"
 * 4. Creates Razorpay order via backend
 * 5. Opens Razorpay Checkout modal
 * 6. User completes payment
 * 7. Verifies payment signature via backend
 * 8. Clears cart
 * 9. Navigates to /booking-confirmation with booking details
 * 
 * DATA:
 * - Receives: cart, selectedDate, selectedTimes, pricing from Checkout component
 * - Creates: Razorpay order, verifies payment, gets booking details
 * - Clears: cart via useClearCartMutation
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useCreateBookingMutation } from "../../services/api/bookingApi";
import { useClearCartMutation } from "../../services/api/cartApi";
import { useCreateBookingOrderMutation, useVerifyBookingPaymentMutation } from "../../services/api/paymentApi";
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
  const [createBookingOrder] = useCreateBookingOrderMutation();
  const [verifyBookingPayment] = useVerifyBookingPaymentMutation();
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Redirect if no checkout data or user not logged in
  useEffect(() => {
    if (!checkoutData) {
      showErrorToast("Invalid checkout session");
      navigate("/cart");
      return;
    }
    if (!user) {
      showErrorToast("Please login to complete payment");
      navigate("/login");
    }
  }, [checkoutData, user, navigate]);

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        showErrorToast("Failed to load payment gateway");
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  if (!checkoutData) return null;

  const { cart, selectedDate, selectedTimes, bookingFeePercentage, pricing } = checkoutData;
  const { servicesTotalAmount, bookingFee, totalBookingAmount, remainingAmount } = pricing;

  /**
   * Process payment with Razorpay
   * Flow: Create booking → Create order → Open Razorpay → Verify payment
   */
  const handlePayNow = async () => {
    if (!razorpayLoaded) {
      showErrorToast("Payment gateway not loaded. Please refresh.");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create booking first (with pending payment status)
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
        amount_paid: totalBookingAmount,
        remaining_amount: remainingAmount,
        payment_status: 'pending', // Will be updated after payment verification
        payment_method: 'razorpay',
        notes: `Cart checkout - ${cart.items.length} services | Booking Fee: ${bookingFeePercentage}%`,
      };

      const newBooking = await createBooking(bookingData).unwrap();

      // Step 2: Create Razorpay order
      const orderResponse = await createBookingOrder(newBooking.id).unwrap();

      const { order_id, amount, currency, key_id } = orderResponse;

      // Step 3: Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: "Vescavia Salon",
        description: `Booking #${newBooking.id} - ${cart.items.length} service(s)`,
        handler: async function (response) {
          await verifyPayment(response, newBooking);
        },
        prefill: {
          name: user.full_name || user.email,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#FF6B35", // accent-orange
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showErrorToast("Payment cancelled", { position: "top-center" });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      setIsProcessing(false);
      showErrorToast(error?.data?.message || "Failed to initiate payment", {
        position: "top-center",
      });
    }
  };

  /**
   * Verify payment signature and update booking status
   */
  const verifyPayment = async (razorpayResponse, booking) => {
    try {
      const verifyData = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      };

      const verifyResult = await verifyBookingPayment(verifyData).unwrap();

      // Clear cart
      await clearCartMutation().unwrap().catch(err => {
        // Cart clear failed, continue anyway
      });

      // Show success toast
      showSuccessToast("Payment successful! Booking confirmed 🎉", {
        position: "top-center",
        autoClose: 3000,
      });

      // Navigate to confirmation
      navigate("/booking-confirmation", {
        state: { booking: verifyResult.booking },
        replace: true,
      });
    } catch (error) {
      setIsProcessing(false);
      showErrorToast(error?.data?.message || "Payment verification failed", {
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
              disabled={isProcessing || !razorpayLoaded}
              className="w-full bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : razorpayLoaded ? "Pay Now" : "Loading..."}
            </button>

            <div className="flex items-center justify-center gap-2 mt-3">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-[11px] text-neutral-gray-500">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
