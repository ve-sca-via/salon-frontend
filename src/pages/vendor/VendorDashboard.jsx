import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { 
  useGetVendorAnalyticsQuery, 
  useGetVendorBookingsQuery, 
  useGetVendorSalonQuery 
} from '../../services/api/vendorApi';
import { 
  FiCalendar, FiDollarSign, FiShoppingBag, FiUsers, 
  FiStar, FiClock, FiPlus, FiArrowRight, FiCreditCard, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

const VendorDashboard = () => {
  const navigate = useNavigate();
  
  // Get user from auth state (still needed for display name)
  const { user } = useSelector((state) => state.auth);
  
  // RTK Query hooks
  const { data: salonData, isLoading: salonLoading } = useGetVendorSalonQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetVendorAnalyticsQuery();
  const { data: bookingsData, isLoading: bookingsLoading } = useGetVendorBookingsQuery({ limit: 5 });
  
  const salonProfile = salonData?.salon;
  const analytics = analyticsData?.data || analyticsData; // Handle both {data: {...}} and direct response
  const bookings = bookingsData?.bookings || [];

  // Check if payment is pending (salon inactive or payment not complete)
  // Only check after data is loaded to avoid false positives
  const isPaymentPending = salonProfile && (!salonProfile.is_active || !salonProfile.registration_fee_paid);

  const handleMakePayment = () => {
    // Navigate to payment page or open payment modal
    navigate('/vendor/payment');
  };

  if ((analyticsLoading && !analytics) || (salonLoading && !salonProfile)) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: 'Total Bookings',
      value: analytics?.total_bookings || 0,
      icon: <FiCalendar className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Revenue',
      value: `₹${analytics?.total_revenue || 0}`,
      icon: <FiDollarSign className="text-green-600" size={24} />,
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Active Services',
      value: analytics?.active_services || 0,
      icon: <FiShoppingBag className="text-purple-600" size={24} />,
      bgColor: 'bg-purple-100',
      change: '+2',
      changeType: 'neutral',
    },
    {
      title: 'Total Staff',
      value: analytics?.total_staff || 0,
      icon: <FiUsers className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-100',
      change: '0',
      changeType: 'neutral',
    },
    {
      title: 'Average Rating',
      value: (analytics?.average_rating || 0).toFixed(1),
      icon: <FiStar className="text-yellow-600" size={24} />,
      bgColor: 'bg-yellow-100',
      change: '+0.3',
      changeType: 'increase',
    },
    {
      title: 'Pending Bookings',
      value: analytics?.pending_bookings || 0,
      icon: <FiClock className="text-red-600" size={24} />,
      bgColor: 'bg-red-100',
      change: '-3',
      changeType: 'decrease',
    },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Welcome back, {user?.full_name || 'Vendor'}! 👋
            </h1>
            <p className="text-gray-600 font-body mt-1">
              {salonProfile?.business_name ? `Managing ${salonProfile.business_name}` : "Here's what's happening with your salon today"}
            </p>
          </div>
        </div>

        {/* Payment Required Notice */}
        {isPaymentPending && (
          <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F89C02] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiCreditCard className="text-white text-3xl" />
                </div>
              </div>
              <div className="ml-6 flex-1">
                <div className="flex items-center mb-2">
                  <FiAlertCircle className="text-orange-600 mr-2" size={24} />
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Complete Your Registration
                  </h2>
                </div>
                <p className="text-gray-700 font-body mb-4 leading-relaxed">
                  Your salon has been approved! To activate your account and start receiving bookings, 
                  please complete the payment process. Once payment is confirmed, you'll have full access 
                  to all dashboard features including analytics, bookings, and customer management.
                </p>
                
                {/* Payment Details */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start">
                      <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-body font-semibold text-gray-900">Salon Approved</p>
                        <p className="text-sm text-gray-600">Admin verified your salon</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiAlertCircle className="text-orange-600 mt-1 mr-2 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-body font-semibold text-gray-900">Payment Pending</p>
                        <p className="text-sm text-gray-600">Complete to activate</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiDollarSign className="text-blue-600 mt-1 mr-2 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-body font-semibold text-gray-900">Registration Fee</p>
                        <p className="text-sm text-gray-600">₹5,000 (One-time)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleMakePayment}
                    className="bg-gradient-to-r from-[#F89C02] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-heading font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FiCreditCard className="mr-2" size={20} />
                    Make Payment Now
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-body font-semibold px-6 py-3"
                    onClick={() => window.open('https://wa.me/your-support-number', '_blank')}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Show limited dashboard content when payment is pending */}
        {!isPaymentPending && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-body mb-1">{stat.title}</p>
                      <p className="text-3xl font-display font-bold text-gray-900">{stat.value}</p>
                      {stat.change !== '0' && (
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

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/vendor/services"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <FiPlus className="text-white" size={20} />
                </div>
                <span className="font-body font-semibold text-gray-900">Add Service</span>
              </div>
              <FiArrowRight className="text-purple-600" />
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

        {/* Recent Bookings */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold text-gray-900">Recent Bookings</h2>
            <Link
              to="/vendor/bookings"
              className="text-purple-600 hover:text-purple-700 font-body font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
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
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-gray-900">
                        {booking.customer_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-gray-900">
                        {booking.service_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-gray-600">
                        {booking.booking_date
                          ? new Date(booking.booking_date).toLocaleString()
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
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="text-gray-400 text-4xl mx-auto mb-2" />
              <p className="text-gray-600 font-body">No bookings yet</p>
            </div>
          )}
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
