import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetMyBookingsQuery } from "../../services/api/bookingApi";
import { FiUser, FiMail, FiPhone, FiCalendar, FiHeart, FiMessageSquare, FiShoppingBag } from "react-icons/fi";

export default function CustomerProfile() {
  const navigate = useNavigate();

  // Redux state
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // RTK Query for bookings
  const { data: myBookings = [], isLoading: bookingsLoading } = useGetMyBookingsQuery(undefined, {
    skip: !isAuthenticated
  });

  // Local state
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Calculate stats
  const stats = {
    totalBookings: myBookings.length,
    completedBookings: myBookings.filter((b) => b.status === "completed").length,
    upcomingBookings: myBookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    ).length,
    cancelledBookings: myBookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-[36px] text-neutral-black mb-2">
            My Profile
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Manage your account and view your booking history
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-primary-white rounded-lg shadow-lg overflow-hidden sticky top-24">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 h-24"></div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-primary-white">
                    <FiUser className="w-12 h-12 text-purple-600" />
                  </div>
                </div>

                <h2 className="font-display font-bold text-[24px] text-neutral-black text-center mb-1">
                  {user?.email?.split("@")[0] || "Customer"}
                </h2>
                <p className="font-body text-[14px] text-neutral-gray-500 text-center mb-6">
                  Customer Account
                </p>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-neutral-gray-500">
                    <FiMail className="w-5 h-5" />
                    <span className="font-body text-[14px]">{user?.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-gray-500">
                    <FiPhone className="w-5 h-5" />
                    <span className="font-body text-[14px]">{user?.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-gray-500">
                    <FiCalendar className="w-5 h-5" />
                    <span className="font-body text-[14px]">
                      Member since{" "}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Recently"}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/my-bookings")}
                    className="w-full flex items-center justify-center gap-2 bg-accent-orange hover:opacity-90 text-primary-white font-body font-medium text-[14px] py-2.5 rounded-lg transition-opacity"
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    My Bookings
                  </button>
                  <button
                    onClick={() => navigate("/favorites")}
                    className="w-full flex items-center justify-center gap-2 border border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-primary-white font-body font-medium text-[14px] py-2.5 rounded-lg transition-colors"
                  >
                    <FiHeart className="w-4 h-4" />
                    My Favorites
                  </button>
                  <button
                    onClick={() => navigate("/my-reviews")}
                    className="w-full flex items-center justify-center gap-2 border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-primary-white font-body font-medium text-[14px] py-2.5 rounded-lg transition-colors"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    My Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-white rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiShoppingBag className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="font-display font-bold text-[28px] text-neutral-black mb-1">
                  {stats.totalBookings}
                </p>
                <p className="font-body text-[13px] text-neutral-gray-500">
                  Total Bookings
                </p>
              </div>

              <div className="bg-primary-white rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="font-display font-bold text-[28px] text-neutral-black mb-1">
                  {stats.completedBookings}
                </p>
                <p className="font-body text-[13px] text-neutral-gray-500">
                  Completed
                </p>
              </div>

              <div className="bg-primary-white rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="font-display font-bold text-[28px] text-neutral-black mb-1">
                  {stats.upcomingBookings}
                </p>
                <p className="font-body text-[13px] text-neutral-gray-500">
                  Upcoming
                </p>
              </div>

              <div className="bg-primary-white rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="font-display font-bold text-[28px] text-neutral-black mb-1">
                  {stats.cancelledBookings}
                </p>
                <p className="font-body text-[13px] text-neutral-gray-500">
                  Cancelled
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-primary-white rounded-lg shadow-lg p-6">
              <h3 className="font-display font-bold text-[24px] text-neutral-black mb-6">
                Recent Bookings
              </h3>

              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="font-body text-[14px] text-neutral-gray-500">
                    Loading bookings...
                  </p>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-body text-[16px] text-neutral-gray-500 mb-4">
                    No bookings yet
                  </p>
                  <button
                    onClick={() => navigate("/salons")}
                    className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[14px] px-6 py-2 rounded-lg transition-opacity"
                  >
                    Browse Salons
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-body font-semibold text-[16px] text-neutral-black mb-1">
                          {booking.salon_name}
                        </h4>
                        <p className="font-body text-[13px] text-neutral-gray-500">
                          {new Date(booking.booking_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {booking.booking_time}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full font-body text-[12px] font-semibold ${
                          booking.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : booking.status === "confirmed"
                            ? "bg-blue-50 text-blue-700"
                            : booking.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  ))}

                  {myBookings.length > 5 && (
                    <button
                      onClick={() => navigate("/my-bookings")}
                      className="w-full text-center text-accent-orange hover:underline font-body font-medium text-[14px] py-2"
                    >
                      View All Bookings →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="bg-primary-white rounded-lg shadow-lg p-6">
              <h3 className="font-display font-bold text-[24px] text-neutral-black mb-6">
                Account Settings
              </h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow">
                  <span className="font-body font-medium text-[16px] text-neutral-black">
                    Edit Profile
                  </span>
                  <svg
                    className="w-5 h-5 text-neutral-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow">
                  <span className="font-body font-medium text-[16px] text-neutral-black">
                    Change Password
                  </span>
                  <svg
                    className="w-5 h-5 text-neutral-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow">
                  <span className="font-body font-medium text-[16px] text-neutral-black">
                    Notification Preferences
                  </span>
                  <svg
                    className="w-5 h-5 text-neutral-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
