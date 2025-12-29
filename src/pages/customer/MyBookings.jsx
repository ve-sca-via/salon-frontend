/**
 * MyBookings.jsx - Customer Bookings Management Page
 * 
 * PURPOSE:
 * - Display all user's salon bookings
 * - Filter bookings by status (All, Upcoming, Past)
 * - Allow booking cancellation
 * - Navigate to salon or rebook
 * 
 * DATA MANAGEMENT:
 * - Fetches bookings via useGetMyBookingsQuery
 * - Cancel via useCancelBookingMutation
 * - Real-time updates via RTK Query cache invalidation
 * 
 * KEY FEATURES:
 * - Tab navigation (All/Upcoming/Past)
 * - Booking cards with expandable service details
 * - Payment breakdown display
 * - Cancel confirmation modal
 * - Empty states for each tab
 * - Status badges with color coding
 * 
 * USER FLOW:
 * 1. View all bookings by default
 * 2. Filter by Upcoming or Past tabs
 * 3. Expand service details if needed
 * 4. Cancel upcoming bookings
 * 5. Book again or view salon
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} from "../../services/api/bookingApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import { SkeletonBookingCard } from "../../components/shared/Skeleton";

/**
 * BookingCard - Individual booking display component
 * Shows booking details with expandable services and cancel functionality
 */
function BookingCard({ booking, onCancel }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  /**
   * getStatusColor - Returns Tailwind color class for booking status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "completed":
        return "text-green-700";
      case "cancelled":
        return "text-red-700";
      default:
        return "text-accent-orange";
    }
  };

  /**
   * handleCancel - Cancels booking with confirmation
   */
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(booking.id);
      setShowCancelConfirm(false);
    } catch (error) {
      // Cancel failed
    } finally {
      setCancelling(false);
    }
  };

  // Upcoming: pending, confirmed only
  // Past: completed, cancelled, no_show
  const isUpcoming =
    booking.status === "pending" || booking.status === "confirmed";

  return (
    <div className="bg-primary-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden mb-6">
      {/* Header with Salon Info */}
      <div className="bg-neutral-black p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-display font-bold text-[20px] text-primary-white mb-1">
              {booking.salon_name || "Salon"}
            </h3>
            <p className="font-body text-[12px] text-primary-white/80">
              Booking #{booking.booking_number || booking.id?.substring(0, 8)}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full font-body text-[11px] font-bold uppercase tracking-wide ${getStatusColor(
              booking.status
            )} bg-primary-white`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Date & Time Section */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-4 border-b border-neutral-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-body text-[11px] text-neutral-gray-500 mb-0.5">
                Appointment Date
              </p>
              <p className="font-body text-[14px] text-neutral-black font-semibold">
                {new Date(booking.booking_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-body text-[11px] text-neutral-gray-500 mb-0.5">
                Time Slot
              </p>
              <p className="font-body text-[14px] text-neutral-black font-semibold">
                {booking.all_booking_times || booking.booking_time}
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-body text-[14px] text-neutral-black font-bold">
              Services Booked ({booking.services?.length || 0})
            </h4>
          </div>
          <div className="space-y-2">
            {booking.services && booking.services
              .slice(0, showDetails ? undefined : 2)
              .map((service, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start gap-3 bg-bg-secondary rounded-lg p-3 hover:bg-neutral-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-body text-[14px] text-neutral-black font-semibold">
                      {service.service_name}
                    </p>
                    {service.quantity > 1 && (
                      <p className="font-body text-[12px] text-neutral-gray-500 mt-0.5">
                        Quantity: {service.quantity}
                      </p>
                    )}
                    {service.duration_minutes && (
                      <p className="font-body text-[11px] text-accent-orange mt-1">
                        {service.duration_minutes} mins
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-body text-[16px] text-accent-orange font-bold">
                      ₹{(service.unit_price * service.quantity).toFixed(2)}
                    </p>
                    {service.quantity > 1 && (
                      <p className="font-body text-[11px] text-neutral-gray-500">
                        ₹{service.unit_price.toFixed(2)} × {service.quantity}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {booking.services && booking.services.length > 2 && !showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="w-full font-body text-[13px] text-accent-orange font-semibold hover:text-neutral-black transition-colors py-2"
              >
                + Show {booking.services.length - 2} more service(s)
              </button>
            )}
            {showDetails && booking.services && booking.services.length > 2 && (
              <button
                onClick={() => setShowDetails(false)}
                className="w-full font-body text-[13px] text-accent-orange font-semibold hover:text-neutral-black transition-colors py-2"
              >
                Show less
              </button>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-body text-[13px] text-neutral-gray-500">
                Services Total
              </span>
              <span className="font-body text-[13px] text-neutral-black font-semibold">
                ₹{(booking.service_price || 0).toFixed(2)}
              </span>
            </div>
            {booking.convenience_fee > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Booking Fee (Paid Online)
                </span>
                <span className="font-body text-[13px] text-neutral-black">
                  ₹{(booking.convenience_fee || 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-gray-600">
              <span className="font-body text-[15px] text-neutral-black font-bold">
                Total Paid
              </span>
              <span className="font-body text-[20px] text-accent-orange font-bold">
                ₹{(booking.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          {/* Payment Instructions */}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.service_price > 0 && (
            <div className="bg-blue-50 mt-3 p-3 rounded-lg">
              <p className="font-body text-[13px] text-blue-700 font-semibold">
                💰 Pay ₹{(booking.service_price || 0).toFixed(2)} at salon after service
              </p>
            </div>
          )}
        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate(`/salons/${booking.salon_id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[14px] py-3 rounded-lg transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            View Salon
          </button>
          
          {!isUpcoming && (
            <button
              onClick={() => navigate(`/salons/${booking.salon_id}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-black font-body font-semibold text-[14px] py-3 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Again
            </button>
          )}
          
          {/* Three Dot Menu for Cancel */}
          {isUpcoming && (
            <div className="relative">
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-gray-600 transition-colors"
                title="More options"
              >
                <svg className="w-5 h-5 text-neutral-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-neutral-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
              Cancel Booking?
            </h3>
            <p className="font-body text-[14px] text-neutral-gray-500 mb-6">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-black font-body font-medium text-[14px] py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-primary-white font-body font-medium text-[14px] py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: bookingsData, isLoading: loading, error } = useGetMyBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  
  const bookings = bookingsData?.data || [];
  
  // Local UI state - default to upcoming
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past

  /**
   * handleCancelBooking - Cancels booking via API mutation
   */
  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId).unwrap();
      showSuccessToast("Booking cancelled successfully", {
        position: "top-center",
      });
    } catch (error) {
      showErrorToast(error?.message || "Failed to cancel booking");
    }
  };

  /**
   * filterAndSortBookings - Filters and intelligently sorts bookings
   * Upcoming: confirmed first, then by date (earliest first)
   * Past: latest first (most recent completed/cancelled)
   */
  const filterAndSortBookings = () => {
    let filtered;
    
    if (activeTab === "upcoming") {
      // Upcoming: pending, confirmed only
      filtered = bookings.filter(
        (b) => b.status === "pending" || b.status === "confirmed"
      );
      
      // Sort: confirmed first, then by date (earliest upcoming first)
      filtered.sort((a, b) => {
        // Confirmed bookings come first
        if (a.status === "confirmed" && b.status !== "confirmed") return -1;
        if (a.status !== "confirmed" && b.status === "confirmed") return 1;
        
        // Then sort by date (earliest first)
        return new Date(a.booking_date) - new Date(b.booking_date);
      });
    } else {
      // Past: completed, cancelled, no_show
      filtered = bookings.filter(
        (b) => b.status === "completed" || b.status === "cancelled" || b.status === "no_show"
      );
      
      // Sort by date descending (latest first)
      filtered.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    }
    
    return filtered;
  };

  const filteredBookings = filterAndSortBookings();

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            My Bookings
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Manage all your salon appointments
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-neutral-gray-600">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`font-body font-medium text-[16px] px-6 py-3 transition-colors ${
              activeTab === "upcoming"
                ? "text-accent-orange border-b-2 border-accent-orange"
                : "text-neutral-gray-500 hover:text-neutral-black"
            }`}
          >
            Upcoming (
            {
              bookings.filter(
                (b) => b.status === "pending" || b.status === "confirmed"
              ).length
            }
            )
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`font-body font-medium text-[16px] px-6 py-3 transition-colors ${
              activeTab === "past"
                ? "text-accent-orange border-b-2 border-accent-orange"
                : "text-neutral-gray-500 hover:text-neutral-black"
            }`}
          >
            Past (
            {
              bookings.filter(
                (b) => b.status === "completed" || b.status === "cancelled" || b.status === "no_show"
              ).length
            }
            )
          </button>
        </div>

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div>
            {[1, 2, 3].map((i) => (
              <SkeletonBookingCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-primary-white rounded-lg p-12 text-center shadow-md">
            <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-neutral-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
              No bookings found
            </h3>
            <p className="font-body text-[14px] text-neutral-gray-500 mb-6">
              {activeTab === "upcoming"
                ? "You have no upcoming bookings"
                : "You have no past bookings"}
            </p>
            <button
              onClick={() => navigate("/salons")}
              className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] px-8 py-3 rounded-lg transition-opacity"
            >
              Browse Salons
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
