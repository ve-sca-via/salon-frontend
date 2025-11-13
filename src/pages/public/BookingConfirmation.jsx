/**
 * BookingConfirmation.jsx - Booking Success Confirmation Component
 * 
 * PURPOSE:
 * - Display booking confirmation after successful payment
 * - Show booking details (date, time, services, salon info)
 * - Provide actions: View all bookings, Book again, Go home
 * 
 * DATA:
 * - Receives booking details from Payment component via navigation state
 * - booking object contains all booking information from database
 */

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { toast } from "react-toastify";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const booking = location.state?.booking;

  // Redirect to home if no booking data
  useEffect(() => {
    if (!booking) {
      toast.info("No booking found", { position: "top-center" });
      navigate("/");
    }
  }, [booking, navigate]);

  if (!booking) return null;

  // Parse services from special_requests if available
  const services = booking.services || [];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Booking Confirmed!
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-primary-white rounded-lg p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-gray-600">
            <h2 className="font-display font-bold text-[20px] text-neutral-black">
              Booking Details
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 font-body text-[12px] font-bold rounded-full">
              CONFIRMED
            </span>
          </div>

          <div className="space-y-4">
            {/* Booking Number */}
            {booking.booking_number && (
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Booking Number</p>
                <p className="font-body font-semibold text-[16px] text-neutral-black">
                  #{booking.booking_number}
                </p>
              </div>
            )}

            {/* Salon Name */}
            {booking.salon_name && (
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Salon</p>
                <p className="font-body font-semibold text-[16px] text-neutral-black">
                  {booking.salon_name}
                </p>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Date</p>
                <p className="font-body font-semibold text-[16px] text-neutral-black">
                  {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    weekday: "short",
                    year: "numeric",
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-1">Time</p>
                <p className="font-body font-semibold text-[16px] text-neutral-black">
                  {booking.all_booking_times || booking.booking_time || 'N/A'}
                </p>
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <p className="text-[12px] text-neutral-gray-500 mb-2">Services Booked</p>
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between items-start bg-bg-secondary p-3 rounded-lg">
                      <div>
                        <p className="font-body font-semibold text-[14px] text-neutral-black">
                          {service.service_name}
                        </p>
                        {service.plan_name && (
                          <p className="text-[12px] text-neutral-gray-500">{service.plan_name}</p>
                        )}
                      </div>
                      <p className="font-body font-semibold text-[14px] text-accent-orange">
                        ₹{service.price * (service.quantity || 1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="pt-4 border-t border-neutral-gray-600">
              <div className="flex justify-between mb-2">
                <p className="font-body text-[14px] text-neutral-gray-500">Amount Paid</p>
                <p className="font-body font-semibold text-[16px] text-green-600">
                  ₹{booking.amount_paid || booking.total_amount}
                </p>
              </div>
              {booking.remaining_amount > 0 && (
                <div className="flex justify-between">
                  <p className="font-body text-[14px] text-neutral-gray-500">Pay at Salon</p>
                  <p className="font-body font-semibold text-[16px] text-accent-orange">
                    ₹{booking.remaining_amount}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-body font-semibold text-[14px] text-blue-900 mb-1">
                Important Information
              </p>
              <p className="font-body text-[13px] text-blue-700">
                Please arrive 10 minutes before your appointment time. A confirmation has been sent to your email.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-neutral-black hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/salons")}
            className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity"
          >
            Book Again
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-neutral-gray-500 hover:text-neutral-black font-body text-[14px] py-2 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
