import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetMyBookingsQuery } from "../../services/api/bookingApi";
import { useUpdateProfileMutation } from "../../services/api/authApi";
import { setUser } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiPhone, FiCalendar, FiHeart, FiMessageSquare, FiShoppingBag, FiEdit2, FiCheck, FiX } from "react-icons/fi";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // RTK Query for bookings
  const { data: bookingsResponse, isLoading: bookingsLoading } = useGetMyBookingsQuery(undefined, {
    skip: !isAuthenticated
  });
  
  const myBookings = bookingsResponse?.data || [];

  // Local state for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    age: "",
    gender: ""
  });

  // API mutation
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load user data into form when user details are available/change
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.full_name || "",
        phone: user?.phone || "",
        age: user?.age || "",
        gender: user?.gender || ""
      });
    }
  }, [user]);

  /**
   * Handle Edit Submit
   */
  const handleSaveProfile = async () => {
    if (!formData.full_name || !formData.gender || !formData.age) {
      toast.error("Name, age, and gender are required.");
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender
      };
      
      const res = await updateProfile(payload).unwrap();
      
      // Update Redux state with new user details
      dispatch(setUser({ ...user, ...res.user }));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.data?.detail || "Failed to update profile.");
    }
  };

  /**
   * Calculate booking statistics from booking data
   */
  const stats = {
    totalBookings: myBookings.length,
    completedBookings: myBookings.filter((b) => b.status === "completed").length,
    upcomingBookings: myBookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    ).length,
    cancelledBookings: myBookings.filter((b) => b.status === "cancelled").length,
  };

  /**
   * Placeholder handlers for account settings
   */
  const handleChangePassword = () => {
    navigate("/forgot-password");
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
              <div className="bg-gradient-to-r from-accent-orange to-yellow-500 h-24 relative">
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 border border-white/50 text-white rounded-md p-2 transition-colors z-10"
                    title="Edit Profile"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-primary-white overflow-hidden bg-gray-100">
                    <FiUser className="w-12 h-12 text-accent-orange" />
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full border border-neutral-gray-300 rounded px-3 py-2 text-sm focus:ring-accent-orange focus:border-accent-orange"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full border border-neutral-gray-300 rounded px-3 py-2 text-sm focus:ring-accent-orange focus:border-accent-orange"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-gray-500 uppercase tracking-wider mb-1">Age</label>
                        <input 
                          type="number" 
                          min="13" max="120"
                          value={formData.age} 
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          className="w-full border border-neutral-gray-300 rounded px-3 py-2 text-sm focus:ring-accent-orange focus:border-accent-orange"
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-gray-500 uppercase tracking-wider mb-1">Gender</label>
                        <select 
                          value={formData.gender} 
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full border border-neutral-gray-300 rounded px-3 py-2 text-sm focus:ring-accent-orange focus:border-accent-orange"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-neutral-gray-200 mt-4">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            full_name: user?.full_name || "",
                            phone: user?.phone || "",
                            age: user?.age || "",
                            gender: user?.gender || ""
                          });
                        }}
                        className="flex-1 flex justify-center items-center gap-1 bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-black py-2 rounded transition-colors text-sm font-medium"
                      >
                        <FiX /> Cancel
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isUpdating}
                        className="flex-1 flex justify-center items-center gap-1 bg-accent-orange hover:bg-orange-600 text-white py-2 rounded transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {isUpdating ? "Saving..." : <><FiCheck /> Save</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-[24px] text-neutral-black text-center mb-1">
                      {user?.full_name || user?.email?.split("@")[0] || "Customer"}
                    </h2>
                    <p className="font-body text-[14px] text-neutral-gray-500 text-center mb-2">
                      Customer Account
                    </p>
                    {(user?.age || user?.gender) && (
                      <p className="font-body text-[14px] text-neutral-gray-800 text-center mb-6 capitalize font-medium bg-neutral-gray-100 rounded-full py-1 px-4 inline-block mx-auto w-max flex items-center justify-center">
                        {user?.gender || "Unknown"} {user?.age ? `• ${user.age} yrs` : ""}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-neutral-gray-500">
                        <FiMail className="w-5 h-5 flex-shrink-0" />
                        <span className="font-body text-[14px]">{user?.email || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-neutral-gray-500">
                        <FiPhone className="w-5 h-5 flex-shrink-0" />
                        <span className="font-body text-[14px]">{user?.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-neutral-gray-500">
                        <FiCalendar className="w-5 h-5 flex-shrink-0" />
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
                  </>
                )}

                {/* Quick Actions */}
                {!isEditing && (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/favorites")}
                      className="w-full flex items-center justify-center gap-2 bg-neutral-black hover:opacity-90 text-primary-white font-body font-medium text-[14px] py-2.5 rounded-lg transition-opacity"
                    >
                      <FiHeart className="w-4 h-4" />
                      My Favorites
                    </button>
                    <button
                      onClick={() => navigate("/my-bookings")}
                      className="w-full flex items-center justify-center gap-2 bg-accent-orange hover:opacity-90 text-primary-white font-body font-medium text-[14px] py-2.5 rounded-lg transition-opacity"
                    >
                      <FiShoppingBag className="w-4 h-4" />
                      My Bookings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary-white rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiShoppingBag className="w-5 h-5 text-accent-orange" />
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
                  <div className="animate-spin h-8 w-8 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4" />
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
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' }) || setIsEditing(true)}
                  className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow"
                >
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

                <button 
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:shadow-md transition-shadow"
                >
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
