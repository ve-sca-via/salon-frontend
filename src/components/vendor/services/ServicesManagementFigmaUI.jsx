import React from 'react';
import { FiChevronDown, FiPlus, FiSearch } from 'react-icons/fi';

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
    className="flex h-[45px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] px-6 font-vendor text-base font-semibold text-white shadow-[0_4px_14px_rgba(248,158,7,0.35)] hover:from-[#E08F06] hover:to-[#F5A832] lg:w-auto"
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
      className="h-10 w-full rounded-xl border-0 bg-white pl-4 pr-11 font-vendor text-sm text-[#111827] placeholder:text-[#6B7280] shadow-[0_2px_12px_rgba(34,26,17,0.04)] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
    />
    <FiSearch
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
      size={16}
      aria-hidden
    />
  </div>
);

/**
 * Segmented control — one track per filter dimension (gender, status).
 * Replaces the loose chip rows: each dimension reads as a single object with
 * exactly one value selected, in ~half the vertical space.
 */
export const ServicesSegmentedControl = ({ label, options, value, onChange }) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex shrink-0 items-center gap-0.5 rounded-xl bg-[#EAE0D3]/70 p-0.5"
  >
    {options.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={active}
          className={`whitespace-nowrap rounded-[10px] px-3 py-1.5 font-vendor text-xs font-semibold transition-colors ${
            active
              ? 'bg-white text-[#865300] shadow-[0_1px_3px_rgba(34,26,17,0.12)]'
              : 'text-[#6B5844] hover:text-[#111827]'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const ServicesCategoryHeading = ({ children }) => (
  <h2 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#524533]">
    {children}
  </h2>
);

/**
 * Taxonomy filter chip — used for both the category row and the dependent
 * subcategory row. Carries a count so vendors can see where their services sit
 * without opening each section.
 */
export const ServicesTaxonomyChip = ({ active, onClick, children, count, subtle = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 font-vendor text-xs font-semibold transition-colors ${
      active
        ? 'border-[#F89E07] bg-[#FFF1E6] text-[#865300]'
        : subtle
          ? 'border-[#F0E0D1] bg-white text-[#534433] hover:border-[#F89E07]/40'
          : 'border-transparent bg-[#EAE0D3]/70 text-[#534433] hover:bg-[#E0D4C4]'
    }`}
  >
    <span className="max-w-[11rem] truncate">{children}</span>
    {count !== undefined && (
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
          active ? 'bg-[#F89E07] text-white' : 'bg-white/80 text-[#6B5844]'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

/**
 * Collapsible category section header: "HAIR SERVICES · 12 services".
 */
export const ServicesCategorySectionHeader = ({ name, count, collapsed, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={!collapsed}
    className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-white/60"
  >
    <FiChevronDown
      size={16}
      className={`shrink-0 text-[#867461] transition-transform ${collapsed ? '-rotate-90' : ''}`}
      aria-hidden
    />
    <ServicesCategoryHeading>{name}</ServicesCategoryHeading>
    <span className="font-vendor text-xs font-semibold text-[#867461]">
      {count} {count === 1 ? 'service' : 'services'}
    </span>
  </button>
);

/**
 * Subcategory band inside a category section, e.g. "Textures & Smoothening (4)".
 */
export const ServicesSubcategoryHeading = ({ name, count }) => (
  <div className="flex items-center gap-2">
    <h3 className="font-vendor text-sm font-bold text-[#111827]">{name}</h3>
    <span className="rounded-full bg-[#EAE0D3] px-2 py-0.5 font-vendor text-[11px] font-bold text-[#6B5844]">
      {count}
    </span>
    <span className="h-px flex-1 bg-[#F0E0D1]" aria-hidden />
  </div>
);
