import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiXCircle } from 'react-icons/fi';

/**
 * Figma node 3:1929 — booking status banner + screen dim (Rectangle 3)
 * Green bar 3:2099 (64px) below header; overlay #494848 @ 40% below the bar.
 */
export const VENDOR_NAV_HEIGHT_PX = 64;
export const VENDOR_BOOKING_BANNER_HEIGHT_PX = 64;
export const VENDOR_BOOKING_OVERLAY_TOP_PX =
  VENDOR_NAV_HEIGHT_PX + VENDOR_BOOKING_BANNER_HEIGHT_PX;

const MESSAGES = {
  enabled: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#14532D]',
    lines: ['Bookings enabled: customers can now', 'book your services.'],
    icon: '/vendor/booking-status-icon.png',
  },
  disabled: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#991B1B]',
    lines: ['Bookings disabled: customers cannot', 'book your services temporarily.'],
    icon: null,
  },
};

const VendorBookingStatusOverlay = ({ open, enabled, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const variant = enabled ? MESSAGES.enabled : MESSAGES.disabled;

  return createPortal(
    <>
      {/* Dim layer — full screen below green banner (Figma Rectangle 3) */}
      <button
        type="button"
        className="fixed inset-x-0 bottom-0 z-[105] border-0 p-0 cursor-default bg-[#494848]/40"
        style={{ top: VENDOR_BOOKING_OVERLAY_TOP_PX }}
        onClick={onClose}
        aria-label="Dismiss notification"
      />

      {/* Green / red status bar — edge-to-edge row below navbar */}
      <div
        className={`fixed inset-x-0 z-[110] flex items-center gap-3 px-4 ${variant.bg} shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}
        style={{ top: VENDOR_NAV_HEIGHT_PX, height: VENDOR_BOOKING_BANNER_HEIGHT_PX }}
        role="status"
        aria-live="polite"
      >
        {variant.icon ? (
          <img
            src={variant.icon}
            alt=""
            width={20}
            height={20}
            className="shrink-0"
            draggable={false}
          />
        ) : (
          <FiXCircle className={`shrink-0 ${variant.text}`} size={20} strokeWidth={2.5} />
        )}
        <p className={`font-vendor text-[14px] font-normal leading-5 ${variant.text}`}>
          {variant.lines[0]}
          <br />
          {variant.lines[1]}
        </p>
      </div>
    </>,
    document.body
  );
};

export default VendorBookingStatusOverlay;
