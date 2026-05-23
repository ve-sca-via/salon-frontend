import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { TOTAL_WIZARD_STEPS } from './serviceWizardConstants';

/** Figma progress indicator — 5 steps */
export const ServiceWizardProgress = ({ currentStep }) => (
  <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep} of ${TOTAL_WIZARD_STEPS}`}>
    {Array.from({ length: TOTAL_WIZARD_STEPS }, (_, i) => {
      const stepNum = i + 1;
      const active = stepNum <= currentStep;
      return (
        <span
          key={stepNum}
          className={`h-1 flex-1 rounded-full transition-colors ${
            active ? 'bg-[#F89E07]' : 'bg-[#E5E7EB]'
          }`}
        />
      );
    })}
  </div>
);

export const ServiceWizardStepLabel = ({ step }) => (
  <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
    Step {step} of {TOTAL_WIZARD_STEPS}
  </p>
);

export const ServiceWizardHeading = ({ title, subtitle }) => (
  <div className="space-y-1">
    <ServiceWizardStepLabel step={title.step} />
    <h1 className="font-vendor text-2xl font-bold text-[#111827]">{title.text}</h1>
    {subtitle && (
      <p className="font-vendor text-sm text-[#6B7280]">{subtitle}</p>
    )}
  </div>
);

export const ServiceWizardShell = ({
  salonName,
  onBack,
  currentStep,
  children,
  footer,
}) => (
  <div className="fixed inset-0 z-[130] flex flex-col bg-[#FFF8F4] font-vendor">
    <header className="sticky top-0 z-10 border-b border-[#F0E0D1]/60 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#241B14] hover:bg-[#FFF1E6]"
          aria-label="Go back"
        >
          <FiArrowLeft size={18} />
        </button>
        <p className="flex-1 truncate font-vendor text-base font-semibold text-[#241B14]">
          {salonName || 'Your salon'}
        </p>
      </div>
    </header>

    <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
      <div className="mb-5">
        <ServiceWizardProgress currentStep={currentStep} />
      </div>
      {children}
    </div>

    {footer && (
      <div className="sticky bottom-0 z-20 border-t border-[#F0E0D1]/80 bg-white/95 px-5 py-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {footer}
      </div>
    )}
  </div>
);

export const ServiceWizardPrimaryButton = ({ children, onClick, disabled, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] py-3.5 font-vendor text-base font-bold text-white shadow-md hover:from-[#E08F06] disabled:opacity-50"
  >
    {children}
  </button>
);

export const ServiceWizardOutlineButton = ({ children, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center justify-center rounded-xl border border-[#F89E07] py-3 font-vendor text-base font-semibold text-[#F89E07] hover:bg-[#FFF1E6] disabled:opacity-50"
  >
    {children}
  </button>
);

export const ServiceWizardGhostButton = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-2 font-vendor text-sm font-medium text-[#6B7280] hover:text-[#111827]"
  >
    {children}
  </button>
);

/** Figma “Create Custom Service” card */
export const ServiceWizardCustomCard = ({ onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-[#F0E0D1] bg-white p-4 text-left transition-colors hover:border-[#F89E07]/50 hover:bg-[#FFFAF5] ${
      compact ? '' : 'shadow-[0_2px_12px_rgba(34,26,17,0.04)]'
    }`}
  >
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E6] text-2xl text-[#F89E07]">
      +
    </span>
    <span>
      <span className="block font-vendor text-base font-bold text-[#111827]">
        Create Custom Service
      </span>
      <span className="mt-0.5 block font-vendor text-sm text-[#6B7280]">
        Add a service not listed in our catalog
      </span>
    </span>
  </button>
);

export const ServiceWizardSelectableCard = ({
  selected,
  onClick,
  title,
  subtitle,
  badge,
  iconUrl,
  iconFallback,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
      selected
        ? 'border-[#F89E07] bg-[#FFF1E6] shadow-[0_4px_16px_rgba(248,158,7,0.15)]'
        : 'border-[#F0E0D1] bg-white shadow-[0_2px_12px_rgba(34,26,17,0.04)] hover:border-[#F89E07]/40'
    }`}
  >
    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3F3F3] text-2xl">
      {iconUrl ? (
        <img src={iconUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        iconFallback || '✦'
      )}
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <span className="font-vendor text-base font-bold text-[#111827]">{title}</span>
        {badge && (
          <span className="rounded-md bg-[#FFF1E6] px-2 py-0.5 font-vendor text-xs font-semibold text-[#865300]">
            {badge}
          </span>
        )}
      </span>
      {subtitle && (
        <span className="mt-1 line-clamp-2 block font-vendor text-sm text-[#6B7280]">
          {subtitle}
        </span>
      )}
    </span>
  </button>
);
