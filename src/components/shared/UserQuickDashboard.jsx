import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useGetCartQuery } from '../../services/api/cartApi';
import { useGetMyBookingsQuery } from '../../services/api/bookingApi';

const UserQuickDashboard = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Skip queries if not authenticated to prevent unnecessary API calls
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: bookingsResponse, isLoading: bookingsLoading } = useGetMyBookingsQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) return null;
  if (cartLoading || bookingsLoading) {
    return (
      <div className="w-full max-w-[1235px] mx-auto px-4 mt-2 mb-4 lg:-mt-16 lg:mb-0 relative z-40">
        <div className="bg-primary-white rounded-[5px] shadow-[0px_8px_44px_0px_rgba(65,65,65,0.19)] p-6 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Cart parsing
  const cartItemsCount = cartData?.items?.length || 0;
  const hasCart = cartItemsCount > 0;

  // Bookings parsing
  const allBookings = bookingsResponse?.data || [];
  const upcomingBookings = allBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));

  const hasUpcomingBookings = upcomingBookings.length > 0;

  // If neither exist, show empty state instead of null to maintain layout
  if (!hasCart && !hasUpcomingBookings) {
    return (
      <div className="w-full max-w-[1235px] mx-auto px-4 mt-2 mb-4 lg:-mt-16 lg:mb-0 relative z-40">
        <div className="bg-primary-white rounded-[5px] shadow-[0px_8px_44px_0px_rgba(65,65,65,0.19)] p-6 flex flex-row gap-4 justify-center items-center">
          <p className="font-body text-[16px] text-neutral-gray-500 m-0">No active carts or upcoming bookings.</p>
          <button onClick={() => navigate('/salons')} className="text-accent-orange font-semibold hover:underline">
            Browse Salons
          </button>
        </div>
      </div>
    );
  }

  // ── Mobile two-row layout (< md) ──────────────────────────────────────────
  const MobileRow = ({ icon, iconBg, iconColor, title, subtitle, to, btnLabel, btnClass }) => (
    <Link to={to} className="flex items-center justify-between gap-2.5 w-full group">
      {/* Left: icon + label */}
      <div className="flex items-center gap-2.5">
        <div className={`w-10 h-10 ${iconBg} rounded-[10px] flex items-center justify-center shrink-0 shadow-sm`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="text-left leading-tight">
          <p className="font-body font-bold text-[13px] text-neutral-black">{title}</p>
          {subtitle && <p className="font-body text-[11px] text-neutral-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* Right: action button */}
      <span className={`shrink-0 flex items-center justify-center text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors ${btnClass}`}>
        {btnLabel}
      </span>
    </Link>
  );

  return (
    <div className="w-full max-w-[1235px] mx-auto px-4 mt-2 mb-1 lg:-mt-16 lg:mb-0 relative z-40">
      <div className="bg-primary-white rounded-[5px] shadow-[0px_8px_44px_0px_rgba(65,65,65,0.19)] p-2 lg:p-5">
        <h2 className="sr-only">Your Activity</h2>

        {/* ── Mobile layout (< lg) ── two rows stacked */}
        <div className="flex flex-col gap-1.5 lg:hidden">
          {/* Service Search Box */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <div className="flex-1 flex items-center px-2">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Services or location..." className="w-full bg-transparent border-none outline-none text-[13px] font-body text-neutral-black placeholder-gray-400" />
            </div>
            <button onClick={() => navigate('/salons')} className="bg-accent-orange text-white px-3 py-1.5 rounded-md text-[12px] font-semibold shadow-sm">
              Search
            </button>
          </div>

          {hasUpcomingBookings && (
            <div className="border-t border-gray-100 my-0.5"></div>
          )}

          {hasUpcomingBookings && (
            <MobileRow
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              title="My Bookings"
              subtitle={`${upcomingBookings.length} upcoming`}
              to="/my-bookings"
              btnLabel="Manage →"
              btnClass="bg-neutral-900 text-white hover:bg-neutral-700"
            />
          )}
        </div>

        {/* ── Desktop layout (≥ lg) ── original side-by-side */}
        <div className="hidden lg:flex flex-row gap-6 items-center w-full">

          {hasCart && (
            <div className={`flex-1 flex flex-row gap-4 items-center justify-between ${hasUpcomingBookings ? 'border-r border-neutral-gray-600 pr-6' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-body font-semibold text-[16px] text-neutral-black">Selected Services</h3>
                    <span className="text-neutral-gray-500 font-body text-[13px]">({cartItemsCount} item{cartItemsCount > 1 ? 's' : ''})</span>
                  </div>
                  <p className="font-body text-[14px] text-neutral-black font-semibold">Total: ₹{cartData.total_amount}</p>
                </div>
              </div>
              <Link to="/cart" className="bg-[#F97316] hover:bg-[#EA580C] text-primary-white font-body font-medium text-[14px] py-2 px-6 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center">
                Checkout
              </Link>
            </div>
          )}

          {hasUpcomingBookings && (
            <div className={`flex-1 flex flex-row gap-4 items-center justify-between ${hasCart ? 'pl-2' : ''}`}>
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-body font-semibold text-[16px] text-neutral-black truncate max-w-[150px]">{upcomingBookings[0].salon_name}</h3>
                    {upcomingBookings.length > 1 && (
                      <span className="text-neutral-gray-500 font-body text-[13px] whitespace-nowrap">(+{upcomingBookings.length - 1} more)</span>
                    )}
                  </div>
                  <p className="font-body text-[13px] text-neutral-gray-500 truncate">
                    {new Date(upcomingBookings[0].booking_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {upcomingBookings[0].time_slots?.length > 0 ? upcomingBookings[0].time_slots[0] : (upcomingBookings[0].all_booking_times || upcomingBookings[0].booking_time || 'N/A')}
                  </p>
                </div>
              </div>
              <Link to="/my-bookings" className="bg-neutral-black hover:bg-neutral-gray-600 text-primary-white font-body font-medium text-[14px] py-2 px-6 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center">
                Manage
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserQuickDashboard;
