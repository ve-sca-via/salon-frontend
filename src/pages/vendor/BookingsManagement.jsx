/**
 * BookingsManagement Component
 * 
 * Purpose:
 * Comprehensive booking management interface for salon vendors. Allows vendors to view,
 * filter, search, and manage all customer bookings with status updates and detailed views.
 * 
 * Data Management:
 * - Bookings from RTK Query (useGetVendorBookingsQuery)
 * - Status updates via RTK Query mutation (useUpdateBookingStatusMutation)
 * - Local state for filters, search, and modal
 * 
 * Key Features:
 * - Real-time booking statistics (total, pending, confirmed, completed, cancelled, revenue)
 * - Multi-dimensional filtering (status, date range, search)
 * - Booking status management (confirm, complete, cancel)
 * - Detailed booking view modal
 * - Responsive table layout
 * - Search by customer, service, or staff name
 * 
 * User Flow:
 * 1. Vendor views all bookings with stats
 * 2. Can filter by status (pending, confirmed, etc.) or date (today, upcoming, past)
 * 3. Can search for specific bookings
 * 4. Clicks "View Details" to see booking modal
 * 5. Can update status (confirm, complete, cancel) from modal
 * 6. Receives real-time updates when new bookings arrive
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastConfig';
import {
  useGetVendorBookingsQuery,
  useGetVendorSalonQuery,
  useUpdateBookingStatusMutation,
} from '../../services/api/vendorApi';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiDollarSign,
  FiFilter,
  FiDownload,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const BookingsManagement = () => {
  // RTK Query hooks
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useGetVendorBookingsQuery();
  const { data: salonData } = useGetVendorSalonQuery();
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  
  // Backend returns array directly, not wrapped in object
  const bookings = bookingsData || [];
  const salonProfile = salonData?.salon || salonData;

  // Local state for filters, sorting, and modal
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'customer', 'status', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  /**
   * TODO: Real-time booking notifications
   * Consider implementing via WebSocket connection to FastAPI backend
   * or polling mechanism for new bookings
   */

  /**
   * handleStatusUpdate - Updates booking status (confirm, complete, cancel)
   * Shows success/error toast and closes modal on success
   */
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus({ bookingId, status: newStatus }).unwrap();
      showSuccessToast(`Booking ${newStatus} successfully!`);
      setIsDetailsModalOpen(false);
      refetchBookings(); // Refresh the bookings list
    } catch (error) {
      showErrorToast(error?.data?.detail || error?.message || 'Failed to update booking status');
    }
  };

  /**
   * handleViewDetails - Opens modal with booking details
   */
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  /**
   * Handle column sorting
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  /**
   * Filter and sort bookings based on search term, status, date, and sort preferences
   * Memoized to avoid recalculating on every render
   */
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter((booking) => {
      // Search filter: matches customer, booking number, or phone
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.booking_number?.toLowerCase().includes(searchLower) ||
        booking.customer_phone?.includes(searchTerm) ||
        booking.customer_email?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      // Date filter: today, upcoming, past, or all
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          matchesDate = bookingDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'upcoming') {
          matchesDate = bookingDate >= today;
        } else if (dateFilter === 'past') {
          matchesDate = bookingDate < today;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.booking_date + ' ' + (a.booking_time || '00:00'));
          const dateB = new Date(b.booking_date + ' ' + (b.booking_time || '00:00'));
          compareValue = dateA - dateB;
          break;
        case 'customer':
          compareValue = (a.customer_name || '').localeCompare(b.customer_name || '');
          break;
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '');
          break;
        case 'amount':
          compareValue = (a.service_price || 0) - (b.service_price || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  /**
   * Calculate booking statistics
   * Counts by status and total revenue from completed bookings
   */
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    no_show: bookings.filter((b) => b.status === 'no_show').length,
    totalRevenue: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  }), [bookings]);

  /**
   * Format status label for display
   */
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    if (status === 'no_show') return 'No Show';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  /**
   * getStatusColor - Returns Tailwind classes for status badges
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /**
   * Parse services from booking - handles string, array, or object formats
   */
  const parseServices = (booking) => {
    try {
      let services = [];
      
      // Handle services field (JSONB array)
      if (booking.services) {
        if (typeof booking.services === 'string') {
          services = JSON.parse(booking.services);
        } else if (Array.isArray(booking.services)) {
          services = booking.services;
        }
      }
      
      return services;
    } catch (error) {
      return [];
    }
  };

  /**
   * Format services for display - shows first service + count if multiple
   */
  const formatServicesDisplay = (booking) => {
    const services = parseServices(booking);
    
    if (services.length === 0) {
      return booking.service_name || 'N/A';
    }
    
    // Get first service name from various possible fields
    const firstName = services[0].service_name || 
                     services[0].name || 
                     (services[0].service_id ? `Service #${services[0].service_id.substring(0, 8)}` : 'Service');
    
    if (services.length === 1) {
      return firstName;
    }
    
    return `${firstName} +${services.length - 1} more`;
  };

  /**
   * Parse time slots from booking
   */
  const parseTimeSlots = (booking) => {
    try {
      if (booking.time_slots) {
        if (typeof booking.time_slots === 'string') {
          return JSON.parse(booking.time_slots);
        } else if (Array.isArray(booking.time_slots)) {
          return booking.time_slots;
        }
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  /**
   * Format time slots for display
   */
  const formatTimeDisplay = (booking) => {
    const timeSlots = parseTimeSlots(booking);
    
    if (timeSlots.length > 0) {
      return timeSlots.join(', ');
    }
    
    return booking.booking_time || 'N/A';
  };

  /**
   * getStatusIcon - Returns appropriate icon for booking status
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiAlertCircle />;
      case 'confirmed':
        return <FiCheckCircle />;
      case 'completed':
        return <FiCheckCircle />;
      case 'cancelled':
        return <FiXCircle />;
      default:
        return <FiAlertCircle />;
    }
  };

  /**
   * formatDate - Formats date string to readable format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * formatTime - Formats time string to HH:MM format
   */
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // HH:MM format
  };

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 font-body mt-1">
              View and manage all salon bookings
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => showInfoToast('Export feature coming soon!')}
          >
            <FiDownload />
            Export Bookings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Total</p>
              <p className="text-2xl font-display font-bold text-gray-900">{stats.total}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Pending</p>
              <p className="text-2xl font-display font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Confirmed</p>
              <p className="text-2xl font-display font-bold text-blue-600">{stats.confirmed}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Completed</p>
              <p className="text-2xl font-display font-bold text-green-600">{stats.completed}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">No Show</p>
              <p className="text-2xl font-display font-bold text-orange-600">{stats.no_show}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Cancelled</p>
              <p className="text-2xl font-display font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Revenue</p>
              <p className="text-2xl font-display font-bold text-accent-orange">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters Card */}
        <Card>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, service, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent font-body"
                aria-label="Search bookings"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4">
              {/* Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-body font-semibold">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'confirmed' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('confirmed')}
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={statusFilter === 'no_show' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('no_show')}
                  >
                    No Show
                  </Button>
                  <Button
                    variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('cancelled')}
                  >
                    Cancelled
                  </Button>
                </div>
              </div>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:border-l lg:pl-2">
                <span className="text-sm text-gray-600 font-body font-semibold">Date:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateFilter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('all')}
                  >
                    All Time
                  </Button>
                  <Button
                    variant={dateFilter === 'today' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant={dateFilter === 'upcoming' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={dateFilter === 'past' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('past')}
                  >
                    Past
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiCalendar className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'No bookings found'
                  : 'No bookings yet'}
              </h3>
              <p className="text-gray-600 font-body">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Bookings will appear here when customers book your services'}
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Staff
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-body text-gray-900 font-mono">
                          #{booking.id?.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <FiUser className="text-accent-orange text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-body font-semibold text-gray-900">
                              {booking.customer_name || 'N/A'}
                            </p>
                            {booking.customer_phone && (
                              <p className="text-xs text-gray-500 font-body">
                                {booking.customer_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-body text-gray-900">
                          {formatServicesDisplay(booking)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-body text-gray-900">
                          {booking.staff_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm font-body text-gray-900">
                          <FiCalendar className="mr-2 text-gray-400" />
                          <div>
                            <p>{formatDate(booking.booking_date)}</p>
                            <p className="text-xs text-gray-500">
                              <FiClock className="inline mr-1" />
                              {formatTimeDisplay(booking)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center text-sm font-body font-semibold text-green-600">
                            <FiDollarSign className="mr-1" />
                            ₹{booking.service_price?.toLocaleString() || 0}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">To collect</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-mono mb-1">#{booking.id?.substring(0, 8)}</p>
                      <p className="font-semibold text-gray-900">{booking.customer_name || 'N/A'}</p>
                      {booking.customer_phone && (
                        <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {formatStatus(booking.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium text-gray-900">{formatServicesDisplay(booking)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Staff:</span>
                      <span className="font-medium text-gray-900">{booking.staff_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">{formatTimeDisplay(booking)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600">₹{booking.service_price?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Booking ID & Status */}
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600 font-body mb-1">Booking ID</p>
                <p className="text-lg font-display font-bold text-gray-900 font-mono">
                  #{selectedBooking.id?.substring(0, 8)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-semibold border ${getStatusColor(
                  selectedBooking.status
                )}`}
              >
                {getStatusIcon(selectedBooking.status)}
                {formatStatus(selectedBooking.status)}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-body font-semibold text-gray-700 mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FiUser className="mr-3 text-gray-400" />
                  <span className="text-sm font-body text-gray-900">
                    {selectedBooking.customer_name || 'N/A'}
                  </span>
                </div>
                {selectedBooking.customer_phone && (
                  <div className="flex items-center">
                    <FiUser className="mr-3 text-gray-400" />
                    <span className="text-sm font-body text-gray-900">
                      {selectedBooking.customer_phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Services List */}
            <div>
              <h3 className="text-sm font-body font-semibold text-gray-700 mb-3">
                Services Requested
              </h3>
              <div className="space-y-2 mb-4">
                {parseServices(selectedBooking).length > 0 ? (
                  parseServices(selectedBooking).map((service, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-body font-semibold text-gray-900">
                          {service.service_name || service.name || (service.service_id ? `Service #${service.service_id.substring(0, 8)}` : 'Service')}
                        </p>
                        {service.quantity > 1 && (
                          <p className="text-xs text-gray-500">Qty: {service.quantity}</p>
                        )}
                        {service.service_id && !service.service_name && (
                          <p className="text-xs text-gray-400 font-mono">ID: {service.service_id.substring(0, 8)}</p>
                        )}
                      </div>
                      <span className="text-sm font-body font-semibold text-gray-900">
                        ₹{(service.unit_price * (service.quantity || 1))?.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 font-body italic py-2 px-3 bg-gray-50 rounded-lg\">{selectedBooking.service_name || 'No services listed'}</p>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-sm font-body font-semibold text-gray-700 mb-3">
                Appointment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Staff:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {selectedBooking.staff_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Date:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {formatDate(selectedBooking.booking_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Time Slots:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {formatTimeDisplay(selectedBooking)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-sm font-body font-semibold text-gray-700 mb-3">
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Services Total:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    ₹{selectedBooking.service_price?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Booking Fee (Paid Online):</span>
                  <span className="text-sm font-body text-gray-500 line-through">
                    ₹{selectedBooking.convenience_fee?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-orange-200">
                  <span className="text-sm font-body font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    ₹{selectedBooking.total_amount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t-2 border-green-500">
                  <span className="text-base font-display font-bold text-green-700">To Collect at Salon:</span>
                  <span className="text-lg font-display font-bold text-green-600">
                    ₹{selectedBooking.service_price?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 font-body mt-3 p-2 bg-white/60 rounded">
                💡 Customer already paid ₹{selectedBooking.convenience_fee?.toLocaleString() || 0} booking fee online. 
                Collect ₹{selectedBooking.service_price?.toLocaleString() || 0} after completing the service.
              </p>
            </div>

            {/* Status Update Actions */}
            {selectedBooking.status === 'pending' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 font-body mb-3">Update booking status:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    disabled={isUpdating}
                  >
                    <FiCheckCircle className="mr-2" />
                    {isUpdating ? 'Processing...' : 'Confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    disabled={isUpdating}
                  >
                    <FiXCircle className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {selectedBooking.status === 'confirmed' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 font-body mb-3">Update booking status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="primary"
                    className="w-full bg-green-600 hover:bg-green-700 text-xs"
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                    disabled={isUpdating}
                  >
                    <FiCheckCircle className="mr-1" />
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-orange-600 hover:bg-orange-50 border-orange-200 text-xs"
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'no_show')}
                    disabled={isUpdating}
                  >
                    <FiAlertCircle className="mr-1" />
                    No Show
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 border-red-200 text-xs"
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    disabled={isUpdating}
                  >
                    <FiXCircle className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Show message for completed/cancelled/no_show bookings */}
            {(selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled' || selectedBooking.status === 'no_show') && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 font-body text-center">
                  This booking has been marked as <span className="font-semibold">{selectedBooking.status.replace('_', ' ')}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default BookingsManagement;
