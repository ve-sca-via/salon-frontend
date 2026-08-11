import React, { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardSelectableCard,
  ServiceWizardStepLabel,
} from './ServiceWizardUI';
import { WIZARD_STEPS } from './serviceWizardConstants';

/** Figma node 3:805 — Pick a catalog subcategory or add a new one under the chosen category */
const VendorServiceWizardStep3Subcategory = ({
  salonName,
  formData,
  categories,
  onSelectSubcategory,
  onChangeCustomSubcategory,
  onSelectSubSubcategory,
  onChangeCustomSubSubcategory,
  onBack,
  onContinue,
}) => {
  const [search, setSearch] = useState('');

  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  // Level-3 options live under the chosen subcategory. Sub-subcategory is optional.
  const selectedSubcategory = subcategories.find(
    (s) => s.id === formData.subcategory_id
  );
  const subSubcategories = selectedSubcategory?.subcategories || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [subcategories, search]);

  const hasCustomSubcategory = Boolean(formData.custom_subcategory_name?.trim());
  const canContinue = Boolean(formData.subcategory_id) || hasCustomSubcategory;

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
          <ServiceWizardStepLabel step={WIZARD_STEPS.SUBCATEGORY} />
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">
            Choose a subcategory
          </h1>
          {selectedCategory && (
            <p className="font-vendor text-sm text-[#6B7280]">{selectedCategory.name}</p>
          )}
        </div>

        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategories..."
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
              ? 'No subcategories match your search'
              : 'No subcategories here yet. Add a new one below.'}
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

        {/* Add a new subcategory under the chosen category. Typing one creates it
            in the catalog, so it appears as a selectable card next time. */}
        <div className="space-y-2 rounded-2xl border border-dashed border-[#F0E0D1] bg-white p-4">
          <div className="space-y-0.5">
            <p className="font-vendor text-sm font-bold text-[#111827]">
              Add a new subcategory
            </p>
            <p className="font-vendor text-xs text-[#6B7280]">
              Not in the list above? Type it here, e.g. “Kids Haircut”.
            </p>
          </div>
          <input
            type="text"
            value={formData.custom_subcategory_name || ''}
            onChange={(e) => onChangeCustomSubcategory(e.target.value)}
            maxLength={255}
            placeholder="New subcategory name…"
            className="h-11 w-full rounded-xl border-0 bg-[#F3F3F3] px-4 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
          />
        </div>

        {/* Optional 3rd level — after a subcategory is chosen or newly typed. */}
        {(formData.subcategory_id || hasCustomSubcategory) && (
          <div className="space-y-3 rounded-2xl border border-[#F0E0D1] bg-[#FFFAF5] p-4">
            <div className="space-y-0.5">
              <p className="font-vendor text-sm font-bold text-[#111827]">
                Sub-type <span className="font-normal text-[#9CA3AF]">(optional)</span>
              </p>
              <p className="font-vendor text-xs text-[#6B7280]">
                Narrow it down further, e.g. “Spanish Haircut” under “Haircut”. Skip if not needed.
              </p>
            </div>

            {subSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subSubcategories.map((ss) => {
                  const active = formData.sub_subcategory_id === ss.id;
                  return (
                    <button
                      key={ss.id}
                      type="button"
                      onClick={() => onSelectSubSubcategory(active ? null : ss)}
                      className={`rounded-full border-2 px-3 py-1.5 font-vendor text-sm font-semibold transition-colors ${
                        active
                          ? 'border-[#F89E07] bg-[#FFF1E6] text-[#865300]'
                          : 'border-[#F0E0D1] bg-white text-[#534433] hover:border-[#F89E07]/40'
                      }`}
                    >
                      {ss.name}
                    </button>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              value={formData.custom_sub_subcategory_name || ''}
              onChange={(e) => onChangeCustomSubSubcategory(e.target.value)}
              maxLength={255}
              placeholder="Or add a new sub-type…"
              className="h-11 w-full rounded-xl border-0 bg-white px-4 font-vendor text-base text-[#111827] shadow-[0_2px_12px_rgba(34,26,17,0.06)] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35"
            />
          </div>
        )}
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep3Subcategory;
