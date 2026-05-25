import React, { useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiChevronDown,
  FiImage,
  FiX,
} from 'react-icons/fi';
import { uploadSalonImage } from '../../../services/api/uploadApi';
import { showErrorToast, showInfoToast } from '../../../utils/toastConfig';
import { ServiceWizardProgress } from './ServiceWizardUI';
import { TOTAL_WIZARD_STEPS } from './serviceWizardConstants';
import {
  VENDOR_FULLSCREEN_ROOT,
  VendorFullscreenBackdrop,
} from '../VendorPageShell';

const DESCRIPTION_MAX = 250;

const DURATION_OPTIONS = [
  { value: 15, label: '15 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 45, label: '45 Minutes' },
  { value: 60, label: '60 Minutes' },
  { value: 75, label: '75 Minutes' },
  { value: 90, label: '90 Minutes' },
  { value: 120, label: '120 Minutes' },
  { value: 150, label: '150 Minutes' },
  { value: 180, label: '180 Minutes' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'both', label: 'Unisex' },
];

const fieldLabelClass =
  'mb-2 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]';

const fieldInputClass =
  'w-full rounded-xl border-0 bg-[#F3F3F3] px-4 py-2.5 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35 disabled:opacity-60';

/**
 * Figma node 3:1114 — Configure Service (no Staff / Add-ons)
 */
const VendorConfigureService = ({
  isOpen,
  onClose,
  editingService,
  formData,
  handleChange,
  setFormData,
  onSubmit,
  categories = [],
  categoriesLoading = false,
  isSaving = false,
  wizardMode = false,
  wizardStep = 4,
  hideGenderField = false,
  hideCategoryField = false,
  hideSubcategoryField = false,
  useTextCategoryFields = false,
  submitLabel,
}) => {
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!isOpen) return null;

  const title = wizardMode
    ? 'Configure service'
    : editingService
      ? 'Configure service'
      : 'Add new service';
  const primaryActionLabel =
    submitLabel || (editingService ? 'Update Service' : 'Save Service');
  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  const handleGenderSelect = (value) => {
    setFormData((prev) => ({ ...prev, gender_category: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadSalonImage(file, 'gallery');
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      showErrorToast(err?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount_percentage) || 0;
    const final =
      discount > 0 && price > 0 ? price * (1 - discount / 100) : price;
    const durationLabel =
      DURATION_OPTIONS.find((d) => String(d.value) === String(formData.duration))?.label ||
      `${formData.duration} min`;

    showInfoToast(
      [
        formData.name || 'Service',
        `${durationLabel} · ₹${final.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        formData.is_active ? 'Active' : 'Inactive',
      ].join(' · ')
    );
  };

  return (
    <>
      <VendorFullscreenBackdrop onClick={onClose} />
      <div className={VENDOR_FULLSCREEN_ROOT}>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#F0E0D1]/60 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#241B14] hover:bg-[#FFF1E6]"
          aria-label="Go back"
        >
          <FiArrowLeft size={18} />
        </button>
        <h1 className="flex-1 font-vendor text-lg font-bold text-[#241B14]">{title}</h1>
      </header>

      <form
        onSubmit={onSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
          {wizardMode && (
            <div className="mb-5 space-y-3">
              <ServiceWizardProgress currentStep={wizardStep} />
              <p className="font-vendor text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Step {wizardStep} of {TOTAL_WIZARD_STEPS}
              </p>
            </div>
          )}
          <h2 className="mb-5 font-vendor text-2xl font-bold capitalize text-[#111827]">
            {title}
          </h2>

          <div className="space-y-5 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <div>
              <label className={fieldLabelClass} htmlFor="service-name">
                Service name
              </label>
              <input
                id="service-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Signature Haircut"
                className={fieldInputClass}
                disabled={isSaving}
              />
            </div>

            {useTextCategoryFields && (
              <>
                <div>
                  <label className={fieldLabelClass} htmlFor="custom_category_name">
                    Category
                  </label>
                  <input
                    id="custom_category_name"
                    type="text"
                    name="custom_category_name"
                    value={formData.custom_category_name || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Hair"
                    className={fieldInputClass}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="custom_subcategory_name">
                    Subcategory
                  </label>
                  <input
                    id="custom_subcategory_name"
                    type="text"
                    name="custom_subcategory_name"
                    value={formData.custom_subcategory_name || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Haircut & Styling"
                    className={fieldInputClass}
                    disabled={isSaving}
                  />
                </div>
              </>
            )}

            {!useTextCategoryFields && !hideCategoryField && (
              <div>
                <label className={fieldLabelClass} htmlFor="category_id">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={`${fieldInputClass} appearance-none pr-10`}
                    disabled={categoriesLoading || isSaving}
                    required={wizardMode}
                  >
                    <option value="">Select category</option>
                    {categoriesLoading ? (
                      <option>Loading...</option>
                    ) : categories.length === 0 ? (
                      <option value="">No categories</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#534433]"
                    size={16}
                  />
                </div>
              </div>
            )}

            {!useTextCategoryFields && !hideSubcategoryField && (
              <div>
                <label className={fieldLabelClass} htmlFor="subcategory_id">
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    id="subcategory_id"
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    className={`${fieldInputClass} appearance-none pr-10 disabled:bg-[#E8E8E8]`}
                    disabled={!formData.category_id || isSaving}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#534433]"
                    size={16}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={fieldLabelClass} htmlFor="duration">
                Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className={`${fieldInputClass} appearance-none pr-10`}
                  disabled={isSaving}
                >
                  <option value="">Select duration</option>
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {formData.duration &&
                    !DURATION_OPTIONS.some(
                      (o) => String(o.value) === String(formData.duration)
                    ) && (
                      <option value={formData.duration}>
                        {formData.duration} Minutes
                      </option>
                    )}
                </select>
                <FiChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#534433]"
                  size={16}
                />
              </div>
            </div>

            {!hideGenderField && (
              <div>
                <span className={fieldLabelClass}>Gender</span>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((opt) => {
                    const active = formData.gender_category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleGenderSelect(opt.value)}
                        disabled={isSaving}
                        className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border-2 px-2 py-3 font-vendor text-sm font-semibold transition-colors ${
                          active
                            ? 'border-[#F89E07] bg-[#FFF1E6] text-[#865300]'
                            : 'border-[#F0E0D1] bg-[#FAFAFA] text-[#534433] hover:border-[#F89E07]/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className={fieldLabelClass} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={DESCRIPTION_MAX}
                rows={3}
                placeholder="Provide a detailed description of the service..."
                className={`${fieldInputClass} min-h-[64px] resize-y py-3`}
                disabled={isSaving}
              />
              <p className="mt-1 text-right font-vendor text-xs text-[#9CA3AF]">
                {(formData.description || '').length} / {DESCRIPTION_MAX} characters
              </p>
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="price">
                Base price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-vendor text-base font-semibold text-[#534433]">
                  ₹
                </span>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0 for FREE"
                  className={`${fieldInputClass} pl-8`}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="discount_percentage">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  id="discount_percentage"
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Optional — e.g. 10"
                  className={fieldInputClass}
                  disabled={isSaving}
                />
              </div>
              <p className="mt-1 font-vendor text-xs text-[#9CA3AF]">
                Percentage off the base price (0–100). Leave empty for no discount.
              </p>
            </div>

            {!wizardMode && (
              <div className="flex items-center justify-between rounded-xl bg-[#FFF8F4] px-4 py-3">
                <div>
                  <p className="font-vendor text-sm font-semibold text-[#111827]">
                    Service active
                  </p>
                  <p className="font-vendor text-xs text-[#6B7280]">
                    Available for customers to book
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.is_active}
                  name="is_active"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
                  }
                  disabled={isSaving}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${
                    formData.is_active ? 'bg-[#F89E07]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Images — Figma section; no staff / add-ons */}
          <div className="mt-5 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
            <div className="mb-3 flex items-center gap-2">
              <FiImage className="text-[#F89E07]" size={18} />
              <h3 className="font-vendor text-lg font-bold text-[#111827]">Images</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isSaving || uploadingImage}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || uploadingImage}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#F0E0D1] bg-[#FFFAF5] py-8 hover:border-[#F89E07]/50 disabled:opacity-50"
            >
              <FiImage className="mb-2 text-[#867461]" size={28} />
              <span className="font-vendor text-sm font-medium text-[#534433]">
                {uploadingImage ? 'Uploading...' : 'Click to upload'}
              </span>
            </button>

            {formData.image_url && (
              <div className="relative mt-3 inline-block">
                <img
                  src={formData.image_url}
                  alt="Service preview"
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-white"
                  aria-label="Remove image"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-[#F0E0D1]/80 bg-white/95 px-5 py-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[#534433] hover:bg-[#F9FAFB] disabled:opacity-50"
              aria-label="Cancel"
            >
              <FiX size={18} />
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={isSaving}
              className="rounded-xl border border-[#F89E07] px-4 py-2 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6] disabled:opacity-50"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] py-3 font-vendor text-base font-bold text-white shadow-md hover:from-[#E08F06] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : primaryActionLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
    </>
  );
};

export default VendorConfigureService;
