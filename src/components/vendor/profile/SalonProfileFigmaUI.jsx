import React from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

/** Figma node 3:54 — Salon profile page tokens */
export const FIGMA_PROFILE_BG = 'bg-[#FFF8F4]';

export const fieldLabelClass =
  'block font-vendor text-base font-semibold leading-6 text-[#2C2C2C] mb-2';

export const fieldControlClass =
  'w-full rounded-lg border-0 bg-[#F3F3F3] font-vendor text-base leading-6 text-[#1A1C1C] placeholder:text-[#1A1C1C]/40 focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35 disabled:cursor-not-allowed';

export const inputClass = `${fieldControlClass} h-10 px-4`;
export const selectClass = `${fieldControlClass} h-10 px-4`;
export const textareaClass = `${fieldControlClass} min-h-[64px] px-4 py-3 resize-y`;

export const SalonProfilePageHeader = ({ title, subtitle }) => (
  <header className="space-y-1">
    <h1 className="font-vendor text-[28px] font-bold leading-9 text-[#2C2C2C]">{title}</h1>
    {subtitle && (
      <p className="font-vendor text-sm leading-5 text-[#7A7A7A]">{subtitle}</p>
    )}
  </header>
);

export const SalonProfileStatusCard = ({ isActive, activeTitle, activeMessage, inactiveTitle, inactiveMessage }) => {
  const active = isActive;
  return (
    <div
      className={`rounded-2xl px-4 py-4 ${
        active ? 'bg-[#DCFCE7]' : 'bg-[#FEF9C3] border border-[#FDE047]'
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            active ? 'bg-[#22C55E]' : 'bg-[#EAB308]'
          }`}
        >
          {active ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          )}
        </div>
        <div>
          <h3 className={`font-vendor text-base font-bold leading-6 ${active ? 'text-[#22C55E]' : 'text-[#854D0E]'}`}>
            {active ? activeTitle : inactiveTitle}
          </h3>
          <p className={`font-vendor text-sm leading-5 ${active ? 'text-[#22C55E]' : 'text-[#854D0E]'}`}>
            {active ? activeMessage : inactiveMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export const SalonProfileSection = ({ title, children, className = '' }) => (
  <section className={`rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(34,26,17,0.06)] ${className}`}>
    {title && (
      <h2 className="font-vendor text-xl font-bold leading-7 text-[#2C2C2C] mb-6">{title}</h2>
    )}
    {children}
  </section>
);

export const SalonProfileSectionHeader = ({
  title,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isUpdating,
}) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="font-vendor text-xl font-bold leading-7 text-[#2C2C2C]">{title}</h2>
    {!isEditing ? (
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 font-vendor text-sm font-semibold text-[#F89E07] hover:text-[#E08F06]"
      >
        <FiEdit2 size={14} />
        Edit
      </button>
    ) : (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isUpdating}
          className="inline-flex items-center gap-1 font-vendor text-sm font-medium text-[#7A7A7A] hover:text-[#2C2C2C]"
        >
          <FiX size={14} />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isUpdating}
          className="inline-flex items-center gap-1 font-vendor text-sm font-semibold text-[#F89E07]"
        >
          <FiSave size={14} />
          {isUpdating ? 'Saving...' : 'Save'}
        </button>
      </div>
    )}
  </div>
);

export const SalonProfileField = ({ label, children, className = '' }) => (
  <div className={`space-y-0 ${className}`}>
    {label && <label className={fieldLabelClass}>{label}</label>}
    {children}
  </div>
);

export const SalonProfileSaveButton = ({ onClick, disabled, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#F89E07] font-vendor text-base font-semibold text-white shadow-md hover:bg-[#E08F06] disabled:opacity-50"
  >
    {loading ? 'Saving...' : 'Save Changes'}
  </button>
);

export const SalonProfileStatRow = ({ label, value, valueClassName = 'text-[#2C2C2C]' }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#F3F3F3] last:border-0">
    <span className="font-vendor text-sm text-[#7A7A7A]">{label}</span>
    <span className={`font-vendor text-sm font-semibold ${valueClassName}`}>{value}</span>
  </div>
);
