import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import {
  useGetVendorBookingsQuery,
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
import { toast } from 'react-toastify';

const BookingsManagement = () => {
  // RTK Query hooks
  const { data: bookingsData, isLoading: bookingsLoading } = useGetVendorBookingsQuery();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  
  const bookings = bookingsData?.bookings || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus({ bookingId, status: newStatus }).unwrap();
      toast.success(`Booking ${newStatus} successfully!`);
      setIsDetailsModalOpen(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to update booking status');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    const matchesSearch =
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.staff_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    // Date filter
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

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

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
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
            <h1 className="text-3xl font-display font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 font-body mt-1">
              View and manage all salon bookings
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            <FiDownload />
            Export Bookings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <p className="text-sm text-gray-600 font-body mb-1">Cancelled</p>
              <p className="text-2xl font-display font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-body mb-1">Revenue</p>
              <p className="text-2xl font-display font-bold text-purple-600">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, service, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" />
                <span className="text-sm text-gray-600 font-body font-semibold">Status:</span>
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
                  variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('cancelled')}
                >
                  Cancelled
                </Button>
              </div>

              <div className="border-l pl-2 flex items-center gap-2">
                <span className="text-sm text-gray-600 font-body font-semibold">Date:</span>
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
        </Card>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
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
            <div className="overflow-x-auto">
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
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <FiUser className="text-purple-600 text-sm" />
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
                          {booking.service_name || 'N/A'}
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
                              {formatTime(booking.booking_time)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm font-body font-semibold text-purple-600">
                          <FiDollarSign className="mr-1" />
                          ₹{booking.total_amount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
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
                {selectedBooking.status?.charAt(0).toUpperCase() +
                  selectedBooking.status?.slice(1)}
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

            {/* Booking Details */}
            <div>
              <h3 className="text-sm font-body font-semibold text-gray-700 mb-3">
                Booking Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 font-body">Service:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {selectedBooking.service_name || 'N/A'}
                  </span>
                </div>
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
                  <span className="text-sm text-gray-600 font-body">Time:</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {formatTime(selectedBooking.booking_time)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600 font-body">Total Amount:</span>
                  <span className="text-lg font-display font-bold text-purple-600">
                    ₹{selectedBooking.total_amount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedBooking.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                >
                  Cancel Booking
                </Button>
              </div>
            )}

            {selectedBooking.status === 'confirmed' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                >
                  Cancel Booking
                </Button>
              </div>
            )}

            {(selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled') && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 font-body text-center">
                  This booking has been {selectedBooking.status}
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
