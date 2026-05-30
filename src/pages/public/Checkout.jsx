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
 *    - Convenience Fee: 10% of service total (from config)
 *    - Pay Now: Convenience Fee
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
 * - Online Payment: Convenience fee (% of service total) - Platform revenue
 * - At Salon Payment: Full service amount - Vendor revenue
 * 
 * DATA SOURCES:
 * - Cart data: RTK Query (useGetCartQuery)
 * - Convenience fee %: Backend config (convenience_fee_percentage)
 * - Max advance days: Backend config (max_booking_advance_days)
 * - Razorpay key: Backend config (razorpay_key_id)
 */

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { useGetCartQuery, useCheckoutCartMutation } from "../../services/api/cartApi";
import { bookingApi } from "../../services/api/bookingApi";
import { useCreateCartPaymentOrderMutation } from "../../services/api/paymentApi";
import { useGetPublicConfigsQuery } from "../../services/api/configApi";
import { useGetSalonByIdQuery } from "../../services/api/salonApi";
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from "../../utils/toastConfig";
import { SkeletonServiceCard } from "../../components/shared/Skeleton";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Fetch cart data
  const { data: cart, isLoading, error } = useGetCartQuery();

  // Fetch salon details for business hours
  const { data: salonData } = useGetSalonByIdQuery(cart?.salon_id, {
    skip: !cart?.salon_id,
  });
  const salon = salonData?.salon || salonData;
  
  // Fetch public configs
  const { data: configs } = useGetPublicConfigsQuery();
  
  // Mutations
  const [createPaymentOrder, { isLoading: isCreatingOrder }] = useCreateCartPaymentOrderMutation();
  const [checkoutCart, { isLoading: isCheckingOut }] = useCheckoutCartMutation();
  
  // State for appointment selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Get convenience fee from config (dynamically set by admin, no hardcoded fallback)
  const convenienceFeePercentage = configs?.convenience_fee_percentage;
  
  // Get max advance booking days from config or default to 30
  const maxAdvanceDays = configs?.max_booking_advance_days || 30;

  // Redirect to cart if empty (skip after successful checkout — cart is cleared server-side)
  useEffect(() => {
    if (checkoutComplete) return;
    if (!isLoading && (!cart || cart?.items?.length === 0)) {
      showInfoToast("Your cart is empty", { position: "top-center" });
      navigate("/cart");
    }
  }, [cart, isLoading, navigate, checkoutComplete]);

  // Check if required config is loaded
  useEffect(() => {
    if (configs && !convenienceFeePercentage) {
      showErrorToast("Payment configuration not available. Please contact support.", {
        position: "top-center"
      });
    }
  }, [configs, convenienceFeePercentage]);

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
  const generateTimeSlots = (openMinutes, closeMinutes, stepMinutes = 15) => {
    if (!Number.isFinite(openMinutes) || !Number.isFinite(closeMinutes)) return [];
    if (closeMinutes <= openMinutes) return [];

    const slots = [];
    for (let m = openMinutes; m <= closeMinutes; m += stepMinutes) {
      const hour24 = Math.floor(m / 60);
      const minute = m % 60;
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      slots.push(`${hour12}:${String(minute).padStart(2, "0")} ${ampm}`);
    }
    return slots;
  };

  const dates = generateDates();

  // Auto-select today's date so slots can be computed immediately (prevents showing fallback slots)
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].value);
    }
  }, [dates, selectedDate]);

  const getSalonHoursForSelectedDate = useMemo(() => {
    if (!salon || !selectedDate) return null;

    const dateObj = new Date(selectedDate);
    if (Number.isNaN(dateObj.getTime())) return null;
    const dayKey = dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase(); // monday..sunday

    // Parse "9:00 AM" / "9:00PM" / "09:00" into minutes since midnight
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const raw = String(timeStr).trim().toUpperCase();

      // 12-hour format: H:MM AM/PM
      const m12 = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
      if (m12) {
        let h = Number(m12[1]);
        const mins = Number(m12[2] ?? "0");
        const ap = m12[3];
        if (h === 12) h = 0;
        const hour24 = ap === "PM" ? h + 12 : h;
        return hour24 * 60 + mins;
      }

      // 24-hour format: HH:MM(:SS)?
      const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (m24) {
        const h = Number(m24[1]);
        const mins = Number(m24[2]);
        if (h >= 0 && h <= 23 && mins >= 0 && mins <= 59) return h * 60 + mins;
      }

      return null;
    };

    // New format: business_hours JSONB (e.g. "9:00 AM - 6:00 PM" or "Closed")
    // Treat empty object {} as "not configured" and fall back to legacy fields.
    if (
      salon.business_hours &&
      typeof salon.business_hours === "object" &&
      Object.keys(salon.business_hours).length > 0
    ) {
      const hours = salon.business_hours[dayKey];
      if (!hours || String(hours).toLowerCase() === "closed") return { open: null, close: null, isClosed: true };
      const parts = String(hours).split("-");
      if (parts.length < 2) return null;
      const open = parseTimeToMinutes(parts[0].trim());
      const close = parseTimeToMinutes(parts.slice(1).join("-").trim());
      if (open == null || close == null) return null;
      return { open, close, isClosed: false };
    }

    // Legacy format: opening_time/closing_time + working_days
    if (salon.opening_time && salon.closing_time) {
      const normalizeWorkingDays = (wd) => {
        if (!wd) return [];
        let arr = wd;
        if (typeof wd === "string") {
          try {
            const parsed = JSON.parse(wd);
            if (Array.isArray(parsed)) arr = parsed;
            else arr = [wd];
          } catch {
            arr = wd.split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
        if (!Array.isArray(arr)) return [];
        return arr.map((d) => String(d).trim().toLowerCase()).filter(Boolean);
      };

      const workingDays = normalizeWorkingDays(salon.working_days);
      if (workingDays.length > 0 && !workingDays.includes(dayKey)) {
        return { open: null, close: null, isClosed: true };
      }
      const open = parseTimeToMinutes(salon.opening_time);
      const close = parseTimeToMinutes(salon.closing_time);
      if (open == null || close == null) return null;
      return { open, close, isClosed: false };
    }

    return null;
  }, [salon, selectedDate]);

  const timeSlots = useMemo(() => {
    // Until a date is selected, don't show slots
    if (!selectedDate) return [];

    // If salon hours aren't available yet, avoid showing misleading hardcoded slots
    if (!getSalonHoursForSelectedDate) return [];

    if (getSalonHoursForSelectedDate.isClosed) return [];

    return generateTimeSlots(
      getSalonHoursForSelectedDate.open,
      getSalonHoursForSelectedDate.close,
      15
    );
  }, [getSalonHoursForSelectedDate, selectedDate]);

  // Clear selected times when date changes (or salon hours change)
  useEffect(() => {
    setSelectedTimes([]);
  }, [selectedDate, cart?.salon_id]);

  // Calculate pricing (only if config is loaded)
  const servicesTotalAmount = cart?.total_amount || 0;
  const originalServicesTotal = (cart?.items || []).reduce(
    (total, item) => total + (Number(item?.service_details?.price) || Number(item?.unit_price) || 0) * (item?.quantity || 1),
    0
  );
  const discountAmount = Math.max(0, originalServicesTotal - servicesTotalAmount);
  const convenienceFee = convenienceFeePercentage
    ? Math.round((originalServicesTotal * convenienceFeePercentage) / 100 * 100) / 100
    : 0;
  const totalBookingAmount = convenienceFee;
  const remainingAmount = servicesTotalAmount;
  const grandTotal = servicesTotalAmount + convenienceFee;

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
        showWarningToast("You can select up to 3 time slots only");
      }
    }
  };

  /**
   * Handle Razorpay payment and checkout
   */
  const handleProceedToPayment = async () => {
    // Validate selections
    if (!selectedDate) {
      showErrorToast("Please select a date for your appointment");
      return;
    }
    if (selectedTimes.length === 0) {
      showErrorToast("Please select at least one time slot");
      return;
    }

    // Validate config is loaded (critical for payment calculation)
    if (!convenienceFeePercentage) {
      showErrorToast("Payment configuration not available. Please refresh the page or contact support.");
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
        name: 'Lubist',
        description: 'Booking Convenience Fee',
        handler: async function (response) {
          try {
            // Step 3: After successful payment, complete checkout
            await handleCheckoutSuccess(response);
          } catch (error) {
            setIsProcessingPayment(false);
            showErrorToast('Failed to complete booking. Please contact support with your payment ID.');
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
            showInfoToast("Payment cancelled");
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setIsProcessingPayment(false);
      // Show user-friendly error message
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to initiate payment';
      showErrorToast(errorMessage);
    }
  };

  /**
   * Complete checkout after payment success
   */
  const handleCheckoutSuccess = async (paymentResponse) => {
    try {
      await checkoutCart({
        booking_date: selectedDate,
        time_slots: selectedTimes,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        payment_method: 'razorpay',
        notes: ''
      }).unwrap();

      // Prefetch fresh bookings so My Bookings shows the new appointment immediately
      await dispatch(
        bookingApi.endpoints.getMyBookings.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      
      setIsProcessingPayment(false);
      setCheckoutComplete(true);
      showSuccessToast('Booking confirmed successfully!');
      navigate('/my-bookings', { replace: true });
    } catch (error) {
      setIsProcessingPayment(false);
      showErrorToast(error?.data?.message || 'Checkout failed. Please contact support.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="animate-pulse mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonServiceCard key={i} />
              ))}
            </div>
            <div>
              <div className="bg-primary-white rounded-xl shadow-md p-4 sm:p-6 animate-pulse">
                <div className="h-5 sm:h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3 sm:space-y-4">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm sm:text-base">Failed to load cart. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-neutral-gray-500 hover:text-neutral-black mb-3 sm:mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
          <h1 className="font-display font-bold text-[24px] sm:text-[32px] text-neutral-black mb-2">
            Schedule Appointment
          </h1>
          <p className="font-body text-[14px] sm:text-[16px] text-neutral-gray-500">
            Select your preferred date and time
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Date & Time Selection */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
            {/* Date & Time Selection Card */}
            <div className="bg-primary-white rounded-lg p-4 sm:p-6 shadow-lg">
              <h3 className="font-body font-semibold text-[16px] sm:text-[18px] text-neutral-black mb-3 sm:mb-4">
                Select Date & Time
              </h3>

              {/* Selected Date Display */}
              <div className="mb-3 sm:mb-4 p-3 border border-neutral-gray-600 rounded-lg bg-gray-50">
                <p className="font-body text-[13px] sm:text-[14px] text-neutral-black font-medium">
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
              <div className="mb-4 sm:mb-6">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
                  {dates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-[70px] sm:w-16 h-[84px] sm:h-20 rounded-lg border-2 transition-all ${
                        selectedDate === date.value
                          ? "bg-neutral-black border-neutral-black text-primary-white"
                          : "border-neutral-gray-600 hover:border-accent-orange active:border-accent-orange"
                      }`}
                    >
                      <span className={`font-body font-semibold text-[11px] sm:text-[12px] mb-1 ${
                        selectedDate === date.value ? "text-primary-white" : "text-neutral-gray-500"
                      }`}>
                        {date.day}
                      </span>
                      <span className="font-body font-bold text-[22px] sm:text-[20px] mb-0.5">
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
                  <p className="font-body text-[12px] sm:text-[13px] text-neutral-gray-500">
                    Select up to 3 time slots
                  </p>
                  {selectedTimes.length > 0 && (
                    <span className="font-body text-[11px] sm:text-[12px] text-accent-orange font-semibold">
                      {selectedTimes.length}/3 selected
                    </span>
                  )}
                </div>
                {selectedDate && timeSlots.length === 0 && (
                  <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                    <p className="font-body text-[12px] text-accent-orange font-semibold">
                      This salon is closed on the selected day.
                    </p>
                    <p className="font-body text-[12px] text-neutral-gray-600">
                      Please choose a different date.
                    </p>
                  </div>
                )}
                <div
                  className="overflow-x-auto pb-2 scrollbar-hide"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: "repeat(3, auto)",
                      gridAutoFlow: "column",
                      gap: "8px",
                      width: "max-content",
                    }}
                  >
                    {timeSlots.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelection(time)}
                        className={`py-2.5 px-4 rounded-lg border text-[12px] sm:text-[13px] font-body font-medium transition-all min-h-[44px] whitespace-nowrap ${
                          selectedTimes.includes(time)
                            ? "bg-accent-orange border-accent-orange text-primary-white"
                            : "border-neutral-gray-600 text-neutral-black hover:border-accent-orange active:bg-orange-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-primary-white rounded-lg p-4 sm:p-6 shadow-lg lg:sticky lg:top-8">
              <h3 className="font-body font-semibold text-[16px] sm:text-[18px] text-neutral-black mb-3 sm:mb-4">
                Order Summary
              </h3>

              {/* Services */}
              <div className="mb-4 pb-3 sm:pb-4 border-b border-neutral-gray-600">
                <p className="font-body text-[13px] sm:text-[14px] text-neutral-gray-500 mb-2">
                  {cart?.items?.length || 0} service{cart?.items?.length !== 1 ? 's' : ''} from{" "}
                  <span className="font-semibold text-neutral-black break-words">{cart?.salon_name}</span>
                </p>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between font-body text-[13px] sm:text-[14px]">
                  <span className="text-neutral-gray-500">Service Total</span>
                  <span className="text-neutral-black font-semibold">₹{originalServicesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px] sm:text-[14px]">
                  <span className="text-neutral-gray-500">Discount</span>
                  <span className="text-green-700 font-semibold">-₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px] sm:text-[14px]">
                  <span className="text-neutral-gray-500">Discounted Service Total</span>
                  <span className="text-neutral-black font-semibold">₹{servicesTotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-[13px] sm:text-[14px]">
                  <span className="text-neutral-gray-500">Convenience Fee</span>
                  <span className="text-neutral-black font-semibold">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="pt-2.5 sm:pt-3 border-t border-neutral-gray-600">
                  <div className="flex justify-between font-body text-[15px] sm:text-[16px] mb-1">
                    <span className="text-neutral-black font-bold">Total</span>
                    <span className="text-neutral-black font-bold">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body text-[15px] sm:text-[16px]">
                    <span className="text-neutral-black font-bold">Pay Now</span>
                    <span className="text-accent-orange font-bold">₹{totalBookingAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-gray-500 mt-1">
                    Pay ₹{remainingAmount.toFixed(2)} at salon
                  </p>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedDate || selectedTimes.length === 0 || isProcessingPayment || isCreatingOrder || isCheckingOut}
                className="w-full bg-accent-orange hover:opacity-90 active:opacity-80 text-primary-white font-body font-semibold text-[14px] sm:text-[16px] py-3.5 sm:py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <Footer />
    </div>
  );
}
