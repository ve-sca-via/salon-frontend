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
 * - Search by customer, service
 * 
 * User Flow:
 * 1. Vendor views all bookings with stats
 * 2. Can filter by status (pending, confirmed, etc.) or date (today, upcoming, past)
 * 3. Can search for specific bookings
 * 4. Clicks "View Details" to see booking modal
 * 5. Can update status (confirm, complete, cancel) from modal
 * 6. Receives real-time updates when new bookings arrive
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/shared/Button';
import VendorBookingManagementCard from '../../components/vendor/bookings/VendorBookingManagementCard';
import VendorBookingDetails from '../../components/vendor/bookings/VendorBookingDetails';
import {
  BOOKINGS_PAGE_BG,
  BOOKINGS_CANVAS_BG,
  BookingsPageHeader,
  BookingsStatCard,
  BookingsSearchInput,
  BookingsFilterPill,
  BookingsSecondaryFilter,
} from '../../components/vendor/bookings/BookingsManagementFigmaUI';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastConfig';
import {
  useGetVendorBookingsQuery,
  useUpdateBookingStatusMutation,
} from '../../services/api/vendorApi';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const BookingsManagement = () => {
  // RTK Query hooks
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useGetVendorBookingsQuery();
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  
  // Backend returns array directly, not wrapped in object
  const bookings = bookingsData || [];

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

  const formatServiceLineWithDuration = (booking) => {
    const services = parseServices(booking);
    const firstName =
      services[0]?.service_name ||
      services[0]?.name ||
      booking.service_name ||
      'Service';
    const serviceLabel =
      services.length > 1 ? `${firstName} +${services.length - 1} more` : firstName;
    const duration = booking.duration_minutes;
    return duration ? `${serviceLabel} • ${duration} min` : serviceLabel;
  };

  const getDisplayStatusKey = (booking) => {
    if (booking.status === 'confirmed') {
      const bookingDate = new Date(booking.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate.toDateString() === today.toDateString()) {
        return 'in_progress';
      }
    }
    return booking.status || 'pending';
  };

  const activeQuickFilter = useMemo(() => {
    if (statusFilter === 'completed' && dateFilter === 'all') return 'completed';
    if (statusFilter === 'cancelled' && dateFilter === 'all') return 'cancelled';
    if (statusFilter === 'all' && dateFilter === 'upcoming') return 'upcoming';
    if (statusFilter === 'all' && dateFilter === 'all') return 'all';
    return null;
  }, [statusFilter, dateFilter]);

  const handleQuickFilter = (key) => {
    switch (key) {
      case 'all':
        setStatusFilter('all');
        setDateFilter('all');
        break;
      case 'upcoming':
        setStatusFilter('all');
        setDateFilter('upcoming');
        break;
      case 'completed':
        setStatusFilter('completed');
        setDateFilter('all');
        break;
      case 'cancelled':
        setStatusFilter('cancelled');
        setDateFilter('all');
        break;
      default:
        break;
    }
  };

  const exportButton = (
    <button
      type="button"
      onClick={() => showInfoToast('Export feature coming soon!')}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#F89E07] px-4 py-2.5 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6] sm:w-auto"
    >
      <FiDownload size={16} />
      Export Bookings
    </button>
  );

  return (
    <DashboardLayout role="vendor">
      <div className={`${BOOKINGS_PAGE_BG} px-4 py-6 lg:px-0 max-w-4xl mx-auto space-y-6`}>
        <BookingsPageHeader
          title="Bookings Management"
          subtitle="View and manage all salon bookings"
          action={exportButton}
        />

        <div className={`${BOOKINGS_CANVAS_BG} rounded-3xl p-4 sm:p-5 space-y-5 -mx-1 sm:mx-0`}>
          <div className="grid grid-cols-2 gap-3">
            <BookingsStatCard label="Total" value={stats.total} valueClassName="text-[#F89E07]" />
            <BookingsStatCard
              label="Confirmed"
              value={stats.confirmed}
              valueClassName="text-[#4A90E2]"
            />
            <BookingsStatCard
              label="Completed"
              value={stats.completed}
              valueClassName="text-[#22C55E]"
            />
            <BookingsStatCard
              label="Cancelled"
              value={stats.cancelled}
              valueClassName="text-[#CB5353]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <BookingsStatCard
              label="Pending"
              value={stats.pending}
              valueClassName="text-[#865300]"
            />
            <BookingsStatCard
              label="No Show"
              value={stats.no_show}
              valueClassName="text-[#C2410C]"
            />
            <BookingsStatCard
              label="Revenue"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              valueClassName="text-[#F89E07] text-lg sm:text-2xl"
            />
          </div>

          <BookingsSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings..."
          />

          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <BookingsFilterPill
              active={activeQuickFilter === 'all'}
              onClick={() => handleQuickFilter('all')}
            >
              All
            </BookingsFilterPill>
            <BookingsFilterPill
              active={activeQuickFilter === 'upcoming'}
              onClick={() => handleQuickFilter('upcoming')}
            >
              Upcoming
            </BookingsFilterPill>
            <BookingsFilterPill
              active={activeQuickFilter === 'completed'}
              onClick={() => handleQuickFilter('completed')}
            >
              Completed
            </BookingsFilterPill>
            <BookingsFilterPill
              active={activeQuickFilter === 'cancelled'}
              onClick={() => handleQuickFilter('cancelled')}
            >
              Cancelled
            </BookingsFilterPill>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FiFilter className="text-[#655D52]" size={14} aria-hidden />
            <BookingsSecondaryFilter
              active={statusFilter === 'pending'}
              onClick={() => {
                setStatusFilter('pending');
                setDateFilter('all');
              }}
            >
              Pending
            </BookingsSecondaryFilter>
            <BookingsSecondaryFilter
              active={statusFilter === 'confirmed'}
              onClick={() => {
                setStatusFilter('confirmed');
                setDateFilter('all');
              }}
            >
              Confirmed
            </BookingsSecondaryFilter>
            <BookingsSecondaryFilter
              active={dateFilter === 'today'}
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('today');
              }}
            >
              Today
            </BookingsSecondaryFilter>
            <BookingsSecondaryFilter
              active={dateFilter === 'past'}
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('past');
              }}
            >
              Past
            </BookingsSecondaryFilter>
          </div>
        </div>

        {bookingsLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F89E07] border-t-transparent" />
              <p className="font-vendor text-[#534433]">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-[0_4px_24px_rgba(34,26,17,0.06)]">
            <FiCalendar className="mx-auto mb-4 text-6xl text-[#EAE0D3]" />
            <h3 className="mb-2 font-vendor text-xl font-bold text-[#221A11]">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No bookings found'
                : 'No bookings yet'}
            </h3>
            <p className="font-vendor text-sm text-[#534433]">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Bookings will appear here when customers book your services'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 xl:hidden">
              {filteredBookings.map((booking) => (
                <VendorBookingManagementCard
                  key={booking.id}
                  customerName={booking.customer_name}
                  serviceLine={formatServiceLineWithDuration(booking)}
                  statusKey={getDisplayStatusKey(booking)}
                  timeDisplay={formatTimeDisplay(booking)}
                  onOpen={() => handleViewDetails(booking)}
                />
              ))}
            </div>

            <div className="hidden xl:block overflow-x-auto rounded-3xl bg-white shadow-[0_4px_24px_rgba(34,26,17,0.06)]">
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
                          {booking.booking_number || `#${booking.id?.substring(0, 8)}`}
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
                          <div className="text-sm font-body font-semibold text-green-600">
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
          </>
        )}
      </div>

      {isDetailsModalOpen && selectedBooking && (
        <VendorBookingDetails
          booking={selectedBooking}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={isUpdating}
        />
      )}
    </DashboardLayout>
  );
};

export default BookingsManagement;
