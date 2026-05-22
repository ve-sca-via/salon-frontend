import React from 'react';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardSelectableCard,
  ServiceWizardCustomCard,
} from './ServiceWizardUI';
import { WIZARD_STEPS } from './serviceWizardConstants';

/** Figma node 3:720 — Select service category */
const VendorServiceWizardStep2Category = ({
  salonName,
  formData,
  categories,
  categoriesLoading,
  onSelectCategory,
  onCustomService,
  onBack,
  onContinue,
}) => {
  const canContinue = Boolean(formData.category_id);

  return (
    <ServiceWizardShell
      salonName={salonName}
      onBack={onBack}
      currentStep={WIZARD_STEPS.CATEGORY}
      footer={
        <ServiceWizardPrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </ServiceWizardPrimaryButton>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Step 2 of 5
          </p>
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">
            Select service category
          </h1>
        </div>

        <ServiceWizardCustomCard
          onClick={onCustomService}
          compact={Boolean(formData.category_id)}
        />
        <p className="text-center font-vendor text-xs text-[#9CA3AF]">
          Or create a custom service and enter category, subcategory, and name yourself
        </p>

        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F89E07] border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center font-vendor text-sm text-[#6B7280]">
            No categories available. Use custom service instead.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <ServiceWizardSelectableCard
                key={cat.id}
                selected={formData.category_id === cat.id}
                onClick={() => onSelectCategory(cat)}
                title={cat.name}
                subtitle={cat.description || ''}
                iconUrl={cat.icon_url}
              />
            ))}
          </div>
        )}
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep2Category;
