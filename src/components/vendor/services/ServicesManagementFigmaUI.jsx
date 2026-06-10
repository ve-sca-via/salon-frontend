import React from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';

/** Figma node 3:1406 — Services Management */
export const SERVICES_PAGE_BG = 'bg-[#FFFAF5]';

export const ServicesPageHeader = ({ title, subtitle }) => (
  <header className="space-y-1">
    <h1 className="font-vendor text-[26px] font-bold leading-10 text-[#111827]">{title}</h1>
    {subtitle && (
      <p className="font-vendor text-sm leading-6 text-[#4B5563]">{subtitle}</p>
    )}
  </header>
);

export const ServicesAddButton = ({ onClick, label = 'Add Service' }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[45px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] font-vendor text-base font-semibold text-white shadow-[0_4px_14px_rgba(248,158,7,0.35)] hover:from-[#E08F06] hover:to-[#F5A832]"
  >
    <FiPlus size={20} strokeWidth={2.5} />
    {label}
  </button>
);

export const ServicesSearchInput = ({ value, onChange, placeholder = 'Search services...' }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search services"
      className="h-[45px] w-full rounded-xl border-0 bg-white pl-4 pr-12 font-vendor text-base text-[#111827] placeholder:text-[#6B7280] shadow-[0_2px_12px_rgba(34,26,17,0.04)] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
    />
    <FiSearch
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
      size={18}
      aria-hidden
    />
  </div>
);

export const ServicesGenderChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 font-vendor text-sm font-semibold transition-colors ${
      active
        ? 'bg-[#F89E07] text-white shadow-sm'
        : 'bg-[#EAE0D3] text-[#534433] hover:bg-[#E0D4C4]'
    }`}
  >
    {children}
  </button>
);

export const ServicesStatusChip = ({ active, onClick, children }) => (
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

export const ServicesCategoryHeading = ({ children }) => (
  <h2 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#524533]">
    {children}
  </h2>
);
