import React from 'react';
import { FiSearch } from 'react-icons/fi';

/** Figma node 3:278 — Bookings Management */
export const BOOKINGS_PAGE_BG = 'bg-[#FFF8F4]';
export const BOOKINGS_CANVAS_BG = 'bg-[#FFFAF5]';

export const BookingsPageHeader = ({ title, subtitle, action }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-1">
      <h1 className="font-vendor text-[22px] font-bold leading-7 text-[#221A11]">{title}</h1>
      {subtitle && (
        <p className="font-vendor text-sm leading-6 text-[#534433]">{subtitle}</p>
      )}
    </div>
    {action}
  </header>
);

export const BookingsStatCard = ({ label, value, valueClassName = 'text-[#F89E07]' }) => (
  <div className="rounded-2xl border border-[#F0E0D1]/80 bg-white px-4 py-3 shadow-[0_2px_12px_rgba(34,26,17,0.06)] min-h-[85px] flex flex-col justify-between">
    <p className="font-vendor text-sm leading-5 text-[#534433]">{label}</p>
    <p className={`font-vendor text-2xl font-bold leading-8 ${valueClassName}`}>{value}</p>
  </div>
);

export const BookingsSearchInput = ({ value, onChange, placeholder = 'Search bookings...' }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search bookings"
      className="h-[49px] w-full rounded-2xl border-0 bg-white pl-4 pr-12 font-vendor text-base text-[#221A11] placeholder:text-[#655D52] shadow-[0_2px_12px_rgba(34,26,17,0.04)] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
    />
    <FiSearch
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#655D52]"
      size={18}
      aria-hidden
    />
  </div>
);

export const BookingsFilterPill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-xl px-4 py-2.5 font-vendor text-sm font-semibold transition-colors ${
      active
        ? 'bg-[#F89E07] text-white shadow-sm'
        : 'bg-[#EAE0D3] text-[#534433] hover:bg-[#E0D4C4]'
    }`}
  >
    {children}
  </button>
);

export const BookingsSecondaryFilter = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 font-vendor text-xs font-semibold transition-colors ${
      active
        ? 'border border-[#F89E07] bg-[#FFF1E6] text-[#865300]'
        : 'border border-transparent bg-white/80 text-[#534433] hover:bg-white'
    }`}
  >
    {children}
  </button>
);
