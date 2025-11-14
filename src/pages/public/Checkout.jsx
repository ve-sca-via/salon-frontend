/**
 * Checkout.jsx - Appointment Scheduling & Checkout Component
 * 
 * PURPOSE:
 * - Display cart summary from database
 * - Allow date and time slot selection for appointment
 * - Show pricing breakdown (service total, booking fee, GST, remaining)
 * - Navigate to payment on confirmation
 * 
 * FLOW:
 * 1. User views cart items summary
 * 2. Selects appointment date (next 21 days)
 * 3. Selects time slots (up to 3, 15-min intervals)
 * 4. Reviews pricing breakdown
 * 5. Clicks "Proceed to Payment" → navigates to /payment with state
 * 
 * DATA:
 * - Cart data fetched via RTK Query
 * - Booking fee percentage fetched from backend
 * - All selections passed to Payment component via navigation state
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetCartQuery } from "../../services/api/cartApi";
import { useGetPublicConfigsQuery } from "../../services/api/configApi";
import { toast } from "react-toastify";
import { showInfoToast } from "../../utils/toastConfig";

export default function Checkout() {
  const navigate = useNavigate();
  
  // Fetch cart data
  const { data: cart, isLoading, error } = useGetCartQuery();
  
  // Fetch public configs
  const { data: configs } = useGetPublicConfigsQuery();
  
  // State for appointment selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Get booking fee from config or default to 10
  const bookingFeePercentage = configs?.convenience_fee_percentage || 10;
  
  // Get max advance booking days from config or default to 30
  const maxAdvanceDays = configs?.max_booking_advance_days || 30;

  // Redirect to cart if empty
  useEffect(() => {
    if (!isLoading && (!cart || cart?.items?.length === 0)) {
      showInfoToast("Your cart is empty", { position: "top-center" });
      navigate("/cart");
    }
  }, [cart, isLoading, navigate]);

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

  // Calculate pricing
  const servicesTotalAmount = cart?.total_amount || 0;
  const bookingFee = Math.round((servicesTotalAmount * bookingFeePercentage) / 100);
  const gst = Math.round(bookingFee * 0.18);
  const totalBookingAmount = bookingFee + gst;
  const remainingAmount = servicesTotalAmount - bookingFee;

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
   * Proceed to payment with all checkout data
   */
  const handleProceedToPayment = () => {
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

    // Navigate to payment with checkout data
    navigate("/payment", {
      state: {
        cart,
        selectedDate,
        selectedTimes,
        bookingFeePercentage,
        pricing: {
          servicesTotalAmount,
          bookingFee,
          gst,
          totalBookingAmount,
          remainingAmount,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
          <p className="mt-4 text-neutral-gray-500">Loading checkout...</p>
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
                disabled={!selectedDate || selectedTimes.length === 0}
                className="w-full bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
