import React, { useMemo } from 'react';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardOutlineButton,
  ServiceWizardGhostButton,
} from './ServiceWizardUI';
import { WIZARD_STEPS } from './serviceWizardConstants';

const formatDuration = (minutes) => {
  const m = parseInt(minutes, 10);
  if (!m || Number.isNaN(m)) return '—';
  if (m < 60) return `${m} mins`;
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${rem} mins`;
};

const formatPrice = (price, discountPct) => {
  const p = parseFloat(price) || 0;
  const d = parseFloat(discountPct) || 0;
  const final = d > 0 && p > 0 ? p * (1 - d / 100) : p;
  return `₹${final.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const genderLabel = (value) => {
  if (value === 'male') return 'Men';
  if (value === 'female') return 'Women';
  if (value === 'both') return 'Unisex';
  return '—';
};

/** Figma node 3:1295 — Review & Publish (no staff section) */
const VendorServiceWizardStep5Review = ({
  salonName,
  formData,
  categories,
  isCustomServiceFlow = false,
  onBack,
  onPublish,
  onSaveDraft,
  onCancel,
  isSaving,
}) => {
  const { categoryName, subcategoryName, subSubcategoryName } = useMemo(() => {
    const typedSubSub = formData.custom_sub_subcategory_name?.trim() || '';
    if (isCustomServiceFlow) {
      return {
        categoryName: formData.custom_category_name?.trim() || '—',
        subcategoryName: formData.custom_subcategory_name?.trim() || '',
        subSubcategoryName: typedSubSub,
      };
    }
    const cat = categories.find((c) => c.id === formData.category_id);
    const sub = cat?.subcategories?.find((s) => s.id === formData.subcategory_id);
    const subSub = sub?.subcategories?.find((s) => s.id === formData.sub_subcategory_id);
    return {
      categoryName: cat?.name || '—',
      subcategoryName: sub?.name || '',
      subSubcategoryName: subSub?.name || typedSubSub,
    };
  }, [
    categories,
    formData.category_id,
    formData.subcategory_id,
    formData.sub_subcategory_id,
    formData.custom_category_name,
    formData.custom_subcategory_name,
    formData.custom_sub_subcategory_name,
    isCustomServiceFlow,
  ]);

  return (
    <ServiceWizardShell salonName={salonName} onBack={onBack} currentStep={WIZARD_STEPS.REVIEW}>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Step 5 of 5
          </p>
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">Review service</h1>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <h2 className="mb-3 font-vendor text-sm font-bold uppercase tracking-wide text-[#534433]">
              Service Summary
            </h2>
            <dl className="space-y-3">
              <ReviewRow label="Service name" value={formData.name || '—'} />
              <ReviewRow label="Category" value={categoryName} />
              <ReviewRow label="Subcategory" value={subcategoryName || '—'} />
              {subSubcategoryName && (
                <ReviewRow label="Sub-type" value={subSubcategoryName} />
              )}
              <ReviewRow label="Preference" value={genderLabel(formData.gender_category)} />
              <ReviewRow
                label="Description"
                value={formData.description?.trim() || '—'}
                multiline
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <h2 className="mb-3 font-vendor text-sm font-bold uppercase tracking-wide text-[#534433]">
              Pricing
            </h2>
            <dl className="space-y-3">
              <ReviewRow
                label="Base price"
                value={formatPrice(formData.price, 0)}
              />
              {formData.discount_percentage !== '' &&
                parseFloat(formData.discount_percentage) > 0 && (
                  <>
                    <ReviewRow
                      label="Discount"
                      value={`${formData.discount_percentage}%`}
                    />
                    <ReviewRow
                      label="Final price"
                      value={formatPrice(formData.price, formData.discount_percentage)}
                      highlight
                    />
                  </>
                )}
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <h2 className="mb-3 font-vendor text-sm font-bold uppercase tracking-wide text-[#534433]">
              Duration
            </h2>
            <ReviewRow label="Total time" value={formatDuration(formData.duration)} />
          </section>

          {formData.image_url && (
            <section className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
              <h2 className="mb-3 font-vendor text-sm font-bold uppercase tracking-wide text-[#534433]">
                Image
              </h2>
              <img
                src={formData.image_url}
                alt={formData.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            </section>
          )}
        </div>

        <div className="space-y-3 pb-4">
          <ServiceWizardPrimaryButton onClick={onPublish} disabled={isSaving}>
            {isSaving ? 'Publishing...' : 'Publish Service'}
          </ServiceWizardPrimaryButton>
          <ServiceWizardOutlineButton onClick={onSaveDraft} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </ServiceWizardOutlineButton>
          <ServiceWizardGhostButton onClick={onCancel}>Cancel</ServiceWizardGhostButton>
        </div>
      </div>
    </ServiceWizardShell>
  );
};

const ReviewRow = ({ label, value, multiline, highlight }) => (
  <div>
    <dt className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
      {label}
    </dt>
    <dd
      className={`mt-0.5 font-vendor text-base ${
        highlight ? 'font-bold text-[#F89E07]' : 'text-[#111827]'
      } ${multiline ? 'whitespace-pre-wrap' : ''}`}
    >
      {value}
    </dd>
  </div>
);

export default VendorServiceWizardStep5Review;
