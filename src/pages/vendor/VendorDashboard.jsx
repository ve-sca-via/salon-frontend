/**
 * VendorDashboard Component
 * 
 * Purpose:
 * Main dashboard for salon vendors displaying comprehensive overview of their salon operations.
 * Shows analytics, bookings, payment status, and quick actions for managing salon.
 * 
 * Data Management:
 * - Salon profile from RTK Query (useGetVendorSalonQuery)
 * - Analytics data from RTK Query (useGetVendorAnalyticsQuery)
 * - Recent bookings from RTK Query (useGetVendorBookingsQuery)
 * - Auth state from Redux (user display name)
 * - Real-time booking updates via Supabase subscription
 * 
 * Key Features:
 * - Payment status check for new vendors (registration fee)
 * - Analytics cards (bookings, revenue, services, staff, rating, pending)
 * - Quick action links (add service, add staff, view bookings)
 * - Recent bookings table (last 5 bookings)
 * - Real-time notifications for new bookings
 * - Responsive grid layouts
 * 
 * User Flow:
 * 1. Vendor logs in and lands on dashboard
 * 2. If payment pending: sees payment CTA and limited access
 * 3. If payment complete: sees full analytics and bookings
 * 4. Can navigate to manage services, staff, or bookings
 * 5. Receives real-time notifications when customers book
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { 
  useGetVendorAnalyticsQuery, 
  useGetVendorBookingsQuery, 
  useGetVendorSalonQuery,
  useUpdateVendorSalonMutation
} from '../../services/api/vendorApi';
import { 
  FiCalendar, FiDollarSign, FiShoppingBag, FiUsers, 
  FiStar, FiClock, FiPlus, FiArrowRight, FiCreditCard, FiCheckCircle, FiAlertCircle, FiLock
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { supabase } from '../../config/supabase';

const VendorDashboard = () => {
  const navigate = useNavigate();
  
  // Get user from auth state for display name
  const { user } = useSelector((state) => state.auth);
  
  // RTK Query hooks for fetching salon data
  const { data: salonData, isLoading: salonLoading, error: salonError } = useGetVendorSalonQuery();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useGetVendorAnalyticsQuery();
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useGetVendorBookingsQuery({ limit: 5 });
  
  // Mutation for updating salon
  const [updateSalon, { isLoading: isUpdating }] = useUpdateVendorSalonMutation();
  
  // Handle different response formats from API
  const salonProfile = salonData?.salon || salonData;
  // TODO: Standardize analytics response structure in API (sometimes {data: {...}}, sometimes direct)
  const analytics = analyticsData?.data || analyticsData;
  // Backend returns array directly for bookings
  const recentBookings = Array.isArray(bookingsData) 
    ? bookingsData.slice(0, 5).sort((a, b) => new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date))
    : (bookingsData?.bookings || []).slice(0, 5);

  /**
   * Real-time subscription for new bookings
   * Listens to INSERT events on bookings table and refetches data
   */
  useEffect(() => {
    if (!salonProfile?.id) return;

    // Subscribe to new bookings for this salon
    const bookingSubscription = supabase
      .channel(`bookings:salon_id=eq.${salonProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `salon_id=eq.${salonProfile.id}`
        },
        (payload) => {
          // Show toast notification
          toast.success(
            `🔔 New booking from ${payload.new.customer_name || 'a customer'}!`,
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          
          // Refetch bookings and analytics to update dashboard
          refetchBookings();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(bookingSubscription);
    };
  }, [salonProfile?.id, refetchBookings]);

  /**
   * Toggle accepting_bookings status
   */
  const handleToggleAcceptingBookings = async () => {
    try {
      const newStatus = !salonProfile.accepting_bookings;
      await updateSalon({ accepting_bookings: newStatus }).unwrap();
      toast.success(
        newStatus 
          ? 'Bookings enabled! Customers can now book your services.' 
          : 'Bookings disabled. Customers cannot book until you enable it again.',
        { position: 'top-center' }
      );
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update booking status', {
        position: 'top-center'
      });
    }
  };



  /**
   * Check if vendor needs to complete payment
   * Payment is pending if salon is inactive OR registration fee not paid
   */
  const isPaymentPending = salonProfile && (!salonProfile.is_active || !salonProfile.registration_fee_paid);


  /**
   * handleMakePayment - Navigate to vendor payment page
   */
  const handleMakePayment = () => {
    navigate('/vendor/payment');
  };

  /**
   * getServiceNames - Parse services JSONB array and return formatted names
   */
  const getServiceNames = (booking) => {
    try {
      // Services can be a JSONB array
      const services = booking.services;
      
      if (!services || !Array.isArray(services) || services.length === 0) {
        return 'N/A';
      }
      
      // Get first service name and show count if multiple
      const firstName = services[0].service_name || services[0].name || 'Service';
      
      if (services.length === 1) {
        return firstName;
      } else {
        return `${firstName} +${services.length - 1} more`;
      }
    } catch (error) {
      return 'N/A';
    }
  };

  /**
   * Loading state - show spinner while fetching initial data
   */
  if ((analyticsLoading && !analytics) || (salonLoading && !salonProfile)) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /**
   * Error state - show error message if queries fail
   */
  if (salonError || analyticsError) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center">
            <FiAlertCircle className="text-red-600 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-gray-600 font-body mb-4">
              {salonError?.message || analyticsError?.message || "Unable to fetch dashboard data"}
            </p>
            <Button onClick={() => window.location.reload()} className="bg-accent-orange text-white">
              Retry
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  /**
   * Analytics stats cards configuration
   * Note: Change percentages are currently static - consider implementing
   * real comparison with previous period from analytics API
   */
  const stats = [
    {
      title: 'Total Bookings',
      value: analytics?.total_bookings || 0,
      icon: <FiCalendar className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-100',
      // TODO: Replace with real comparison data from API
      change: analytics?.bookings_change || null,
      changeType: 'increase',
    },
    {
      title: 'Revenue',
      value: `₹${analytics?.total_revenue || 0}`,
      icon: <FiDollarSign className="text-green-600" size={24} />,
      bgColor: 'bg-green-100',
      change: analytics?.revenue_change || null,
      changeType: 'increase',
    },
    {
      title: 'Active Services',
      value: analytics?.active_services || 0,
      icon: <FiShoppingBag className="text-accent-orange" size={24} />,
      bgColor: 'bg-orange-100',
      change: analytics?.services_change || null,
      changeType: 'neutral',
    },
    {
      title: 'Total Staff',
      value: analytics?.total_staff || 0,
      icon: <FiUsers className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-100',
      change: analytics?.staff_change || null,
      changeType: 'neutral',
    },
    {
      title: 'Average Rating',
      value: (analytics?.average_rating || 0).toFixed(1),
      icon: <FiStar className="text-yellow-600" size={24} />,
      bgColor: 'bg-yellow-100',
      change: analytics?.rating_change || null,
      changeType: 'increase',
    },
    {
      title: 'Pending Bookings',
      value: analytics?.pending_bookings || 0,
      icon: <FiClock className="text-red-600" size={24} />,
      bgColor: 'bg-red-100',
      change: analytics?.pending_change || null,
      changeType: 'decrease',
    },
  ];

  /**
   * Status badge colors for booking statuses
   */
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout role="vendor">

      {/* Main Dashboard Content - Only visible after payment */}
      {!isPaymentPending && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                Welcome back, {user?.full_name || 'Vendor'}! 👋
              </h1>
              <p className="text-gray-600 font-body mt-1">
                {salonProfile?.business_name ? `Managing ${salonProfile.business_name}` : "Here's what's happening with your salon today"}
              </p>
            </div>
          </div>

          {/* Analytics Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-body mb-1">{stat.title}</p>
                      <p className="text-3xl font-display font-bold text-gray-900">{stat.value}</p>
                      {stat.change && (
                        <p
                          className={`text-sm font-body mt-2 ${
                            stat.changeType === 'increase'
                              ? 'text-green-600'
                              : stat.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {stat.change} from last month
                        </p>
                      )}
                    </div>
                    <div className={`w-14 h-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

        {/* Quick Actions Section */}
        <Card>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/vendor/services"
              className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent-orange rounded-lg flex items-center justify-center mr-3">
                  <FiPlus className="text-white" size={20} />
                </div>
                <span className="font-body font-semibold text-gray-900">Add Service</span>
              </div>
              <FiArrowRight className="text-accent-orange" />
            </Link>

            <Link
              to="/vendor/staff"
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <FiPlus className="text-white" size={20} />
                </div>
                <span className="font-body font-semibold text-gray-900">Add Staff</span>
              </div>
              <FiArrowRight className="text-blue-600" />
            </Link>

            <Link
              to="/vendor/bookings"
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <FiCalendar className="text-white" size={20} />
                </div>
                <span className="font-body font-semibold text-gray-900">View Bookings</span>
              </div>
              <FiArrowRight className="text-green-600" />
            </Link>
          </div>
        </Card>

        {/* Recent Bookings Table */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold text-gray-900">Recent Bookings</h2>
            <Link
              to="/vendor/bookings"
              className="text-accent-orange hover:text-orange-600 font-body font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-accent-orange border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : recentBookings && recentBookings.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-gray-900">
                          {booking.customer_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-body text-gray-900">
                          {getServiceNames(booking)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-gray-600">
                          {booking.booking_date
                            ? new Date(booking.booking_date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) + ` at ${booking.booking_time || ''}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                              statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-body font-semibold text-gray-900">
                          ₹{booking.total_amount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.customer_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 mt-1">{getServiceNames(booking)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {booking.booking_date
                          ? new Date(booking.booking_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) + ` at ${booking.booking_time || ''}`
                          : 'N/A'}
                      </span>
                      <span className="font-semibold text-gray-900">₹{booking.total_amount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="text-gray-400 text-4xl mx-auto mb-2" />
              <p className="text-gray-600 font-body">No bookings yet</p>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* Payment Pending Content - Shows locked state message */}
      {isPaymentPending && (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-2xl mx-auto text-center py-16 px-8">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FiLock className="text-white text-5xl" />
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                Dashboard Locked
              </h2>
              <p className="text-gray-600 font-body text-lg mb-8">
                Your salon has been verified by admin! Complete your registration payment to unlock full dashboard access and start managing your salon.
              </p>
              
              {/* Payment Details */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8 border border-orange-200 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-200">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600 text-xl" />
                    <span className="font-body font-bold text-gray-900">Admin Verified</span>
                  </div>
                  <span className="text-xs text-gray-600 font-body bg-white px-3 py-1 rounded-full">Approved ✓</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-orange-600 text-xl" />
                    <span className="font-body font-semibold text-gray-900">Registration Fee</span>
                  </div>
                  <span className="text-2xl font-display font-bold text-orange-600">₹{salonProfile?.registration_fee_amount || 5000}</span>
                </div>
                <p className="text-xs text-gray-600 font-body mt-2">One-time payment • Includes GST</p>
              </div>

              {/* Locked Features */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-body font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
                  <FiLock className="text-orange-600" />
                  Features Locked Until Payment
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 font-body text-left">
                  <li className="flex items-center gap-2">
                    <FiShoppingBag className="text-gray-400" />
                    Manage Services & Pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <FiUsers className="text-gray-400" />
                    Add & Manage Staff
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    Accept Customer Bookings
                  </li>
                  <li className="flex items-center gap-2">
                    <FiStar className="text-gray-400" />
                    Update Salon Profile
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Action Button - Centered */}
            <div className="flex justify-center">
              <Button
                onClick={handleMakePayment}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-heading font-bold py-3 px-8 shadow-lg text-lg"
              >
                <FiCreditCard className="inline mr-2" />
                Complete Payment Now
              </Button>
            </div>
            
            {/* Security Note */}
            <p className="text-center text-xs text-gray-500 font-body mt-6">
              🔒 Secure payment powered by Razorpay
            </p>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VendorDashboard;


