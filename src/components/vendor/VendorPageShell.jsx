import React from 'react';

/** Mobile-only: matches Figma 390px frame (unchanged on phones) */
export const VENDOR_MOBILE_MAX = 'max-w-[390px]';

/**
 * Full-screen vendor overlays (wizard, configure, booking detail).
 * Mobile: edge-to-edge. Desktop: wide centered panel.
 */
export const VENDOR_FULLSCREEN_ROOT =
  'fixed inset-0 z-[130] flex flex-col bg-[#FFF8F4] font-vendor max-lg:inset-0 lg:inset-x-auto lg:left-1/2 lg:top-[4.5rem] lg:bottom-6 lg:w-[min(720px,calc(100%-3rem))] lg:-translate-x-1/2 lg:rounded-[24px] lg:border lg:border-[#F0E0D1]/80 lg:shadow-[0_24px_64px_rgba(34,26,17,0.18)] lg:overflow-hidden';

export const VendorFullscreenBackdrop = ({ onClick }) => (
  <button
    type="button"
    className="hidden lg:block fixed inset-0 z-[125] cursor-default bg-[#221A11]/35"
    onClick={onClick}
    aria-label="Close"
    tabIndex={-1}
  />
);

/**
 * Vendor page wrapper.
 * - Mobile: 390px centered column (same as Figma / bottom-nav layout).
 * - Desktop (lg+): full width of main content area with Lubist padding.
 */
const VendorPageShell = ({ children, bgClass = 'bg-vendor-canvas', className = '' }) => (
  <div
    className={`font-vendor min-h-[calc(100dvh-4rem)] w-full ${bgClass} ${className}`}
  >
    <div
      className={`mx-auto w-full ${VENDOR_MOBILE_MAX} lg:max-w-none lg:px-8 lg:py-8`}
    >
      {children}
    </div>
  </div>
);

export default VendorPageShell;
