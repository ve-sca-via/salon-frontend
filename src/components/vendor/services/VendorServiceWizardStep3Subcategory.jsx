import React, { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardSelectableCard,
  ServiceWizardCustomCard,
} from './ServiceWizardUI';
import { WIZARD_STEPS } from './serviceWizardConstants';

/** Figma node 3:805 — Pick catalog subcategory or create fully custom service */
const VendorServiceWizardStep3Subcategory = ({
  salonName,
  formData,
  categories,
  onSelectSubcategory,
  onCustomService,
  onBack,
  onContinue,
}) => {
  const [search, setSearch] = useState('');

  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [subcategories, search]);

  const canContinue = Boolean(formData.subcategory_id);

  return (
    <ServiceWizardShell
      salonName={salonName}
      onBack={onBack}
      currentStep={WIZARD_STEPS.SUBCATEGORY}
      footer={
        <ServiceWizardPrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </ServiceWizardPrimaryButton>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Step 3 of 5
          </p>
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">Add services</h1>
          {selectedCategory && (
            <p className="font-vendor text-sm text-[#6B7280]">{selectedCategory.name}</p>
          )}
        </div>

        <ServiceWizardCustomCard onClick={onCustomService} compact />

        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search available services..."
            className="h-12 w-full rounded-xl border-0 bg-white pl-4 pr-11 font-vendor text-base text-[#111827] shadow-[0_2px_12px_rgba(34,26,17,0.06)] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
          />
          <FiSearch
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            size={18}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center font-vendor text-sm text-[#6B7280]">
            {search
              ? 'No services match your search'
              : 'No catalog services in this category. Use Create Custom Service above.'}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((sub) => (
              <ServiceWizardSelectableCard
                key={sub.id}
                selected={formData.subcategory_id === sub.id}
                onClick={() => onSelectSubcategory(sub)}
                title={sub.name}
                subtitle={sub.description || ''}
                iconUrl={sub.icon_url}
              />
            ))}
          </div>
        )}
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep3Subcategory;
