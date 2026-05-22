import React, { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardSelectableCard,
} from './ServiceWizardUI';
import { WIZARD_STEPS } from './serviceWizardConstants';
import {
  findOthersSubcategory,
  orderSubcategoriesForDisplay,
} from './serviceWizardUtils';

const fieldLabelClass =
  'mb-2 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]';

const fieldInputClass =
  'w-full rounded-xl border-0 bg-[#F3F3F3] px-4 py-2.5 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35';

/** Figma node 3:805 — Add services (catalog subcategory or custom name → Others) */
const VendorServiceWizardStep3Subcategory = ({
  salonName,
  formData,
  categories,
  onSelectCategory,
  onSelectSubcategory,
  onCustomNameChange,
  onBack,
  onContinue,
}) => {
  const [search, setSearch] = useState('');

  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const subcategories = orderSubcategoriesForDisplay(selectedCategory?.subcategories || []);
  const othersSubcategory = findOthersSubcategory(selectedCategory);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const catalogOnly = subcategories.filter(
      (s) => s.name?.trim().toLowerCase() !== 'others'
    );
    if (!q) return catalogOnly;
    return catalogOnly.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [subcategories, search]);

  const canContinue =
    Boolean(formData.category_id) &&
    Boolean(formData.subcategory_id) &&
    (formData.is_custom_subcategory
      ? Boolean(formData.custom_subcategory_name?.trim())
      : true);

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
          {selectedCategory ? (
            <p className="font-vendor text-sm text-[#6B7280]">{selectedCategory.name}</p>
          ) : (
            <p className="font-vendor text-sm text-[#6B7280]">
              Select a category below to continue
            </p>
          )}
        </div>

        {!formData.category_id && (
          <div className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <label className={fieldLabelClass} htmlFor="wizard-step3-category">
              Service category
            </label>
            <select
              id="wizard-step3-category"
              value={formData.category_id}
              onChange={(e) => onSelectCategory(categories.find((c) => c.id === e.target.value))}
              className={fieldInputClass}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border-2 border-dashed border-[#F0E0D1] bg-white p-4 shadow-[0_2px_12px_rgba(34,26,17,0.04)]">
          <label className={fieldLabelClass} htmlFor="custom-service-name">
            Add custom service
          </label>
          <input
            id="custom-service-name"
            type="text"
            value={formData.custom_subcategory_name || ''}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder="e.g. Premium Keratin Treatment"
            className={fieldInputClass}
            disabled={!formData.category_id}
          />
          <p className="mt-2 font-vendor text-xs text-[#6B7280]">
            {formData.category_id
              ? othersSubcategory
                ? 'Saved under subcategory “Others”. You can refine details on the next step.'
                : 'Loading catalog…'
              : 'Choose a category first, then enter your custom service name.'}
          </p>
          {formData.is_custom_subcategory && formData.custom_subcategory_name?.trim() && (
            <p className="mt-1 font-vendor text-xs font-semibold text-[#865300]">
              Subcategory: Others
            </p>
          )}
        </div>

        {formData.category_id && (
          <>
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
              <p className="py-4 text-center font-vendor text-sm text-[#6B7280]">
                {search
                  ? 'No catalog services match your search — use the custom field above'
                  : 'No catalog services in this category — use the custom field above'}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((sub) => (
                  <ServiceWizardSelectableCard
                    key={sub.id}
                    selected={
                      formData.subcategory_id === sub.id && !formData.is_custom_subcategory
                    }
                    onClick={() => onSelectSubcategory(sub)}
                    title={sub.name}
                    subtitle={sub.description || ''}
                    iconUrl={sub.icon_url}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep3Subcategory;
