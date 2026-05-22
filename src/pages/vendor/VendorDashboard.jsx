/**
 * VendorDashboard — Pixel match to Figma node 79:2 ("Looks Salon" vendor dashboard)
 * Specs from Figma API: 390px frame, #F3EEE7 canvas, #F89E07 primary, Inter typography
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/shared/Button';
import {
  useGetVendorAnalyticsQuery,
  useGetVendorBookingsQuery,
  useGetVendorSalonQuery,
} from '../../services/api/vendorApi';
import {
  FiAlertCircle,
  FiCalendar,
  FiCreditCard,
  FiLock,
  FiStar,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import VendorHeroBanner from '../../components/vendor/dashboard/VendorHeroBanner';
import VendorQuickActions from '../../components/vendor/dashboard/VendorQuickActions';
import VendorMetricCard from '../../components/vendor/dashboard/VendorMetricCard';
import VendorBookingCard from '../../components/vendor/dashboard/VendorBookingCard';

const mapBookingStatus = (status) => {
  if (status === 'confirmed') return 'in_progress';
  return status || 'pending';
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: salonData, isLoading: salonLoading, error: salonError } = useGetVendorSalonQuery();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useGetVendorAnalyticsQuery();
  const { data: bookingsData, isLoading: bookingsLoading } = useGetVendorBookingsQuery({ limit: 10 });

  const salonProfile = salonData?.salon || salonData;
  const analytics = analyticsData?.data || analyticsData;
  const recentBookings = useMemo(() => {
    const list = Array.isArray(bookingsData)
      ? bookingsData
      : bookingsData?.bookings || [];
    return [...list]
      .sort((a, b) => new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date))
      .slice(0, 5);
  }, [bookingsData]);

  const isPaymentPending =
    salonProfile && (!salonProfile.is_active || !salonProfile.registration_fee_paid);

  const handleMakePayment = () => navigate('/vendor/payment');

  const getServiceNames = (booking) => {
    try {
      const services = booking.services;
      if (!services || !Array.isArray(services) || services.length === 0) return 'Service';
      const firstName = services[0].service_name || services[0].name || 'Service';
      return services.length === 1 ? firstName : `${firstName} +${services.length - 1} more`;
    } catch {
      return 'Service';
    }
  };

  const formatServiceLine = (booking) => {
    const service = getServiceNames(booking);
    const time =
      booking.time_slots?.[0] ||
      booking.booking_time ||
      (booking.booking_date
        ? new Date(booking.booking_date).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '');
    return time ? `${service} • ${time}` : service;
  };

  const userRole = user?.role || user?.user_role || 'vendor';
  const isRegularBuyer = userRole === 'regular_buyer';
  const pageShell =
    'font-vendor min-h-[calc(100dvh-4rem)] bg-[#F3EEE7] max-lg:mx-0 lg:-mx-8 lg:pb-8';

  const metrics = useMemo(() => {
    if (isRegularBuyer) {
      return [
        {
          label: 'Spending',
          value: `₹${(analytics?.total_product_spending || 0).toLocaleString('en-IN')}`,
          badge: analytics?.pending_product_orders ? `+${analytics.pending_product_orders} New` : null,
          icon: <FiTrendingUp className="text-vendor-orange" size={16} />,
        },
        {
          label: 'Orders',
          value: String(analytics?.total_product_orders ?? 0),
          icon: <FiCalendar className="text-vendor-orange" size={16} />,
        },
      ];
    }
    const activeServices = analytics?.active_services ?? 0;
    return [
      {
        label: 'Revenue',
        value: `₹${(analytics?.total_revenue || 0).toLocaleString('en-IN')}`,
        icon: <FiTrendingUp className="text-vendor-orange" size={16} />,
      },
      {
        label: 'Bookings',
        value: String(analytics?.total_bookings ?? 0),
        badge:
          (analytics?.pending_bookings ?? 0) > 0
            ? `+${analytics.pending_bookings} New`
            : null,
        icon: <FiCalendar className="text-vendor-orange" size={16} />,
      },
      {
        label: 'Staff Active',
        value: `${Math.min(activeServices, 10)}/10`,
        badge: activeServices >= 8 ? 'Optimal' : null,
        badgeVariant: 'neutral',
        icon: <FiUsers className="text-vendor-orange" size={16} />,
      },
      {
        label: 'Avg Rating',
        value: (analytics?.average_rating ?? 0).toFixed(1),
        badge: (analytics?.average_rating ?? 0) >= 4 ? 'New' : null,
        icon: <FiStar className="text-vendor-orange" size={16} />,
      },
    ];
  }, [analytics, isRegularBuyer]);

  if ((analyticsLoading && !analytics) || (salonLoading && !salonProfile)) {
    return (
      <DashboardLayout role={userRole}>
        <div className={pageShell}>
          <div className="animate-pulse w-full max-w-[390px] mx-auto lg:max-w-[1200px] px-5 pt-5 space-y-8">
            <div className="w-full aspect-[350/220] rounded-[32px] bg-vendor-border" />
            <div className="space-y-8">
              <div className="h-4 w-32 bg-vendor-border rounded" />
              <div className="grid grid-cols-3 gap-2 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-[118px] bg-vendor-surface rounded-[24px]" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[112px] bg-vendor-surface rounded-[16px]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (salonError || analyticsError) {
    return (
      <DashboardLayout role={userRole}>
        <div className={`${pageShell} flex items-center justify-center min-h-[60vh] px-5`}>
          <div className="bg-vendor-surface rounded-[16px] shadow-vendor-card p-6 max-w-md text-center w-full">
            <FiAlertCircle className="text-vendor-danger text-5xl mx-auto mb-4" />
            <h2 className="font-vendor text-[20px] font-bold text-vendor-text-primary mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="font-vendor text-[14px] text-vendor-text-secondary mb-4">
              {salonError?.data?.detail ||
                analyticsError?.data?.detail ||
                'Unable to fetch dashboard data'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full h-12 bg-vendor-orange text-white font-vendor text-[14px] font-semibold rounded-[16px]"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const featuredIdx = (() => {
    const idx = recentBookings.findIndex((b) => ['pending', 'confirmed'].includes(b.status));
    return idx >= 0 ? idx : 0;
  })();

  return (
    <DashboardLayout role={userRole}>
      {!isPaymentPending && (
        <div className={pageShell}>
          <div className="w-full max-w-[390px] mx-auto lg:max-w-[1200px]">
            {/* Figma: 390px frame, 20px horizontal padding, 32px section gap */}
            <main className="px-5 pt-5 pb-6 flex flex-col gap-8 w-full">
              <VendorHeroBanner />
              <VendorQuickActions isRegularBuyer={isRegularBuyer} />

              <section>
                <h2 className="font-vendor text-[14px] font-bold leading-5 text-vendor-text-primary uppercase tracking-wide mb-4">
                  Overall Performance
                </h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {metrics.map((m) => (
                    <VendorMetricCard key={m.label} {...m} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-vendor text-[14px] font-bold leading-5 text-vendor-text-primary uppercase tracking-wide">
                    Recent Bookings
                  </h2>
                  <Link
                    to={isRegularBuyer ? '/customer/my-orders' : '/vendor/bookings'}
                    className="font-vendor text-[14px] font-semibold text-vendor-link"
                  >
                    View All
                  </Link>
                </div>

                {bookingsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-2 border-vendor-orange border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recentBookings.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recentBookings.map((booking, index) => (
                      <VendorBookingCard
                        key={booking.id}
                        name={booking.customer_name || 'Guest'}
                        serviceLine={formatServiceLine(booking)}
                        status={mapBookingStatus(booking.status)}
                        featured={index === featuredIdx}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-vendor-surface-warm rounded-[16px]">
                    <FiCalendar className="text-vendor-text-secondary text-4xl mx-auto mb-2" />
                    <p className="font-vendor text-[14px] text-vendor-text-secondary">No bookings yet</p>
                  </div>
                )}
              </section>
            </main>
          </div>

        </div>
      )}

      {isPaymentPending && (
        <div className={`${pageShell} flex items-center justify-center min-h-[calc(100vh-200px)] px-5`}>
          <div className="bg-vendor-surface rounded-[16px] shadow-vendor-card-lg p-6 max-w-lg w-full text-center border border-vendor-border">
            <div className="w-20 h-20 bg-gradient-vendor rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLock className="text-white" size={36} />
            </div>
            <h2 className="font-vendor text-[24px] font-bold text-vendor-text-primary mb-2">
              Dashboard Locked
            </h2>
            <p className="font-vendor text-[14px] text-vendor-text-secondary mb-6 leading-relaxed">
              Complete your registration payment to unlock the full dashboard.
            </p>
            <div className="bg-vendor-icon-bg rounded-[16px] p-4 mb-6 text-left border border-vendor-orange/20">
              <div className="flex justify-between items-center pb-3 mb-3 border-b border-vendor-orange/20">
                <span className="font-vendor text-[14px] font-bold text-vendor-text-primary">
                  Admin Verified
                </span>
                <span className="font-vendor text-[10px] font-bold text-vendor-success bg-vendor-success-bg px-2 py-1 rounded-full">
                  Approved
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-vendor text-[14px] font-semibold text-vendor-text-primary flex items-center gap-2">
                  <FiCreditCard className="text-vendor-orange" />
                  Registration Fee
                </span>
                <span className="font-vendor text-[24px] font-bold text-vendor-orange">
                  ₹{salonProfile?.registration_fee_amount?.toLocaleString('en-IN') ?? 'N/A'}
                </span>
              </div>
            </div>
            <Button
              onClick={handleMakePayment}
              className="w-full h-12 bg-vendor-orange hover:bg-vendor-orange-dark text-white font-vendor font-semibold rounded-[16px] border-0"
            >
              <FiCreditCard className="inline mr-2" />
              Complete Payment Now
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VendorDashboard;
