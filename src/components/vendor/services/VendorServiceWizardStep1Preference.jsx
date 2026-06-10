import React from 'react';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardSelectableCard,
} from './ServiceWizardUI';
import { GENDER_PREFERENCE_OPTIONS, WIZARD_STEPS } from './serviceWizardConstants';

/** Figma node 3:635 — Select Preference */
const VendorServiceWizardStep1Preference = ({
  salonName,
  formData,
  onSelectGender,
  onBack,
  onContinue,
}) => {
  const canContinue = Boolean(formData.gender_category);

  return (
    <ServiceWizardShell
      salonName={salonName}
      onBack={onBack}
      currentStep={WIZARD_STEPS.PREFERENCE}
      footer={
        <ServiceWizardPrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </ServiceWizardPrimaryButton>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Step 1 of 5
          </p>
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">Select Preference</h1>
          <p className="font-vendor text-sm text-[#6B7280]">
            Who is this service primarily for?
          </p>
        </div>

        <div className="space-y-3">
          {GENDER_PREFERENCE_OPTIONS.map((opt) => (
            <ServiceWizardSelectableCard
              key={opt.value}
              selected={formData.gender_category === opt.value}
              onClick={() => onSelectGender(opt.value)}
              title={opt.label}
              subtitle={opt.subtitle}
              iconFallback={opt.value === 'male' ? '♂' : opt.value === 'female' ? '♀' : '⚥'}
            />
          ))}
        </div>
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep1Preference;
