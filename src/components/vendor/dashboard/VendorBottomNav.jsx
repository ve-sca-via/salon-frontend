import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Figma node 107:144 — BottomNavigation (358×94)
 * https://www.figma.com/design/BayCbCmplzrogTrevT6UZZ/Untitled?node-id=107-144
 */
export const VENDOR_NAV_ICONS = {
  dashboard: '/vendor/nav/dashboard.png',
  salonProfile: '/vendor/nav/salon-profile.png',
  services: '/vendor/sidebar/services.png',
  bookings: '/vendor/nav/bookings.png',
};

const NAV_ITEMS = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: VENDOR_NAV_ICONS.dashboard, w: 18, h: 18, slot: 63 },
  { path: '/vendor/profile', label: 'Salon Profile', icon: VENDOR_NAV_ICONS.salonProfile, w: 20, h: 18, slot: 72 },
  {
    path: '/vendor/services',
    label: 'Services',
    icon: VENDOR_NAV_ICONS.services,
    w: 20,
    h: 20,
    slot: 51,
    elevatedWhenActive: true,
  },
  { path: '/vendor/bookings', label: 'Bookings', icon: VENDOR_NAV_ICONS.bookings, w: 18, h: 20, slot: 53 },
];

/** Dock + 94px pill + services bump + safe area */
export const VENDOR_BOTTOM_NAV_SPACE = 132;

const ORANGE_CIRCLE_SHADOW =
  '0 4px 6px -4px rgba(254, 215, 170, 1), 0 10px 15px -3px rgba(254, 215, 170, 0.6)';

const labelClass = (active) =>
  `font-vendor text-[12px] leading-[18px] whitespace-nowrap ${
    active ? 'font-semibold text-[#F89E07]' : 'font-medium text-[#534433]'
  }`;

const TabIcon = ({ src, width, height }) => (
  <img
    src={src}
    alt=""
    width={width}
    height={height}
    className="block shrink-0 object-contain"
    style={{ width, height }}
    draggable={false}
  />
);

const isNavItemActive = (pathname, item) => {
  if (pathname === item.path) return true;
  if (item.path === '/vendor/services' && pathname.startsWith('/vendor/promo')) {
    return true;
  }
  return false;
};

const VendorBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-[100] bg-vendor-canvas px-4 pt-4 pb-[max(12px,env(safe-area-inset-bottom,12px))]"
      aria-hidden={false}
    >
      <nav
        className="relative mx-auto flex h-[94px] w-full max-w-[358px] items-end justify-between rounded-[40px] bg-[#FCEBDC] px-4 pb-3 shadow-[0_4px_4px_rgba(0,0,0,0.25),0_10px_15px_rgba(0,0,0,0.1)]"
        aria-label="Vendor navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item);
          const showElevatedBump = active && item.elevatedWhenActive;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-end gap-1"
              style={{ width: item.slot, minHeight: 62, paddingBottom: 1 }}
            >
              <div
                className={showElevatedBump ? 'mb-1 flex items-center justify-center' : 'flex items-center justify-center'}
                style={showElevatedBump ? { marginTop: -4 } : undefined}
              >
                <div
                  className={`flex items-center justify-center ${
                    active
                      ? 'h-12 w-12 rounded-full bg-[#F89E07]'
                      : 'h-10 w-10'
                  }`}
                  style={active ? { boxShadow: ORANGE_CIRCLE_SHADOW } : undefined}
                >
                  <TabIcon src={item.icon} width={item.w} height={item.h} />
                </div>
              </div>
              <span className={labelClass(active)}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default VendorBottomNav;
