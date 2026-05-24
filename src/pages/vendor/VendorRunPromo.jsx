/**
 * VendorRunPromo — Figma node 3:1550 (Flat Discount Management)
 * Applies a salon-wide discount to all services. No per-service targeting.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiCalendar, FiPercent, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  useApplyVendorPromotionMutation,
  useGetActiveVendorPromotionQuery,
} from '../../services/api/vendorApi';
import { showErrorToast, showSuccessToast } from '../../utils/toastConfig';

const fieldLabelClass =
  'mb-2 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]';

const fieldInputClass =
  'w-full rounded-xl border-0 bg-[#F3F3F3] px-4 py-2.5 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35';

const todayIso = () => new Date().toISOString().slice(0, 10);

const VendorRunPromo = () => {
  const navigate = useNavigate();
  const { data: activePromo, isLoading: promoLoading } = useGetActiveVendorPromotionQuery();
  const [applyPromotion, { isLoading: isApplying }] = useApplyVendorPromotionMutation();

  const [form, setForm] = useState({
    title: '',
    discount_type: 'percentage',
    discount_value: '',
    min_booking_amount: '',
    max_discount_limit: '',
    start_date: todayIso(),
    end_date: '',
  });

  useEffect(() => {
    if (activePromo) {
      setForm({
        title: activePromo.title || '',
        discount_type: activePromo.discount_type || 'percentage',
        discount_value: String(activePromo.discount_value ?? ''),
        min_booking_amount:
          activePromo.min_booking_amount != null
            ? String(activePromo.min_booking_amount)
            : '',
        max_discount_limit:
          activePromo.max_discount_limit != null
            ? String(activePromo.max_discount_limit)
            : '',
        start_date: activePromo.start_date || todayIso(),
        end_date: activePromo.end_date || '',
      });
    }
  }, [activePromo]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const heroCopy = useMemo(() => {
    if (form.discount_type === 'flat_amount') {
      return 'Apply a fixed price reduction across all your services. Ideal for flash sales and client promotions.';
    }
    return 'Apply a percentage discount across all your services. Ideal for seasonal offers and salon-wide promotions.';
  }, [form.discount_type]);

  const validate = () => {
    if (!form.title.trim()) {
      showErrorToast('Offer title is required');
      return false;
    }
    const value = parseFloat(form.discount_value);
    if (Number.isNaN(value) || value <= 0) {
      showErrorToast('Discount value must be greater than 0');
      return false;
    }
    if (form.discount_type === 'percentage' && value > 100) {
      showErrorToast('Percentage discount cannot exceed 100');
      return false;
    }
    if (!form.start_date) {
      showErrorToast('Start date is required');
      return false;
    }
    if (form.end_date && form.end_date < form.start_date) {
      showErrorToast('End date must be on or after start date');
      return false;
    }
    if (form.end_date && form.end_date < todayIso()) {
      showErrorToast('End date cannot be in the past');
      return false;
    }
    const minBooking = form.min_booking_amount === '' ? null : parseFloat(form.min_booking_amount);
    const maxLimit = form.max_discount_limit === '' ? null : parseFloat(form.max_discount_limit);
    if (minBooking != null && (Number.isNaN(minBooking) || minBooking < 0)) {
      showErrorToast('Minimum booking must be 0 or greater');
      return false;
    }
    if (maxLimit != null && (Number.isNaN(maxLimit) || maxLimit < 0)) {
      showErrorToast('Max limit must be 0 or greater');
      return false;
    }
    if (minBooking != null && maxLimit != null && maxLimit < minBooking) {
      showErrorToast('Max limit should be at least the minimum booking amount');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await applyPromotion({
        title: form.title.trim(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_booking_amount:
          form.min_booking_amount === '' ? null : parseFloat(form.min_booking_amount),
        max_discount_limit:
          form.max_discount_limit === '' ? null : parseFloat(form.max_discount_limit),
        start_date: form.start_date,
        end_date: form.end_date || null,
      }).unwrap();

      if (result.status === 'scheduled') {
        showSuccessToast(
          `Promo saved. Discounts apply automatically from ${result.start_date}.`
        );
      } else if (result.services_updated > 0) {
        showSuccessToast(
          `Discount applied to ${result.services_updated} service${result.services_updated === 1 ? '' : 's'}!`
        );
      } else {
        showSuccessToast('Promotion saved successfully!');
      }
      navigate('/vendor/dashboard');
    } catch (error) {
      showErrorToast(
        error?.data?.detail || error?.message || 'Failed to apply promotion'
      );
    }
  };

  return (
    <DashboardLayout role="vendor">
      <div className="fixed inset-0 z-[120] flex flex-col bg-[#FFF8F4] font-vendor lg:static lg:z-auto lg:min-h-[calc(100dvh-4rem)]">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#F0E0D1]/60 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/vendor/dashboard')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#241B14] hover:bg-[#FFF1E6]"
            aria-label="Go back"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="flex-1 font-vendor text-lg font-bold text-[#241B14]">
            Flat Discount
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
            {activePromo && !promoLoading && (
              <div className="mb-5 rounded-2xl border border-[#F89E07]/30 bg-[#FFF1E6] px-4 py-3">
                <p className="font-vendor text-sm font-semibold text-[#865300]">
                  Current promo: {activePromo.title} ({activePromo.status})
                </p>
                <p className="mt-1 font-vendor text-xs text-[#6B7280]">
                  {activePromo.start_date}
                  {activePromo.end_date ? ` → ${activePromo.end_date}` : ' → No end date'}
                  {' · '}
                  Applies to all services
                </p>
              </div>
            )}

            <section className="mb-6 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1E6]">
                  <FiTag className="text-[#F89E07]" size={18} />
                </span>
                <div>
                  <h2 className="font-vendor text-lg font-bold text-[#111827]">
                    Flat Discount Offer
                  </h2>
                  <p className="mt-1 font-vendor text-sm leading-relaxed text-[#6B7280]">
                    {heroCopy}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6 space-y-4">
              <h3 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                Offer Details
              </h3>
              <div className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)] space-y-4">
                <div>
                  <label className={fieldLabelClass} htmlFor="promo-title">
                    Offer Title (Visible to Clients)
                  </label>
                  <input
                    id="promo-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Summer Glow Special"
                    className={fieldInputClass}
                    required
                    disabled={isApplying}
                  />
                </div>

                <div>
                  <span className={fieldLabelClass}>Discount Type</span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F3F3F3] p-1">
                    <button
                      type="button"
                      onClick={() => updateField('discount_type', 'flat_amount')}
                      className={`rounded-lg py-2.5 font-vendor text-sm font-semibold transition-colors ${
                        form.discount_type === 'flat_amount'
                          ? 'bg-white text-[#865300] shadow-sm'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      Flat Amount (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('discount_type', 'percentage')}
                      className={`rounded-lg py-2.5 font-vendor text-sm font-semibold transition-colors ${
                        form.discount_type === 'percentage'
                          ? 'bg-white text-[#865300] shadow-sm'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className={fieldLabelClass} htmlFor="discount-value">
                    Discount Value
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-vendor text-base font-semibold text-[#534433]">
                      {form.discount_type === 'percentage' ? '%' : '₹'}
                    </span>
                    <input
                      id="discount-value"
                      type="number"
                      min="0"
                      step={form.discount_type === 'percentage' ? '0.01' : '1'}
                      max={form.discount_type === 'percentage' ? '100' : undefined}
                      value={form.discount_value}
                      onChange={(e) => updateField('discount_value', e.target.value)}
                      placeholder={form.discount_type === 'percentage' ? '20' : '100'}
                      className={`${fieldInputClass} pl-9`}
                      required
                      disabled={isApplying}
                    />
                  </div>
                  <p className="mt-1 font-vendor text-xs text-[#9CA3AF]">
                    Applied to every service on your menu
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6 space-y-4">
              <h3 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                Value &amp; Limits
              </h3>
              <div className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass} htmlFor="min-booking">
                      Min. Booking
                    </label>
                    <div className="relative">
                      <input
                        id="min-booking"
                        type="number"
                        min="0"
                        step="1"
                        value={form.min_booking_amount}
                        onChange={(e) => updateField('min_booking_amount', e.target.value)}
                        placeholder="500"
                        className={`${fieldInputClass} pr-9`}
                        disabled={isApplying}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-vendor text-sm font-semibold text-[#534433]">
                        ₹
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="max-limit">
                      Max. Limit
                    </label>
                    <div className="relative">
                      <input
                        id="max-limit"
                        type="number"
                        min="0"
                        step="1"
                        value={form.max_discount_limit}
                        onChange={(e) => updateField('max_discount_limit', e.target.value)}
                        placeholder="1000"
                        className={`${fieldInputClass} pr-9`}
                        disabled={isApplying}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-vendor text-sm font-semibold text-[#534433]">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 font-vendor text-xs text-[#9CA3AF]">
                  Optional booking rules stored with this offer for checkout validation
                </p>
              </div>
            </section>

            <section className="mb-6 space-y-4">
              <h3 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                Validity Period
              </h3>
              <div className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)] space-y-4">
                <div>
                  <label className={fieldLabelClass} htmlFor="start-date">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      id="start-date"
                      type="date"
                      value={form.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                      className={fieldInputClass}
                      required
                      disabled={isApplying}
                    />
                    <FiCalendar
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="end-date">
                    End Date (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="end-date"
                      type="date"
                      value={form.end_date}
                      min={form.start_date || todayIso()}
                      onChange={(e) => updateField('end_date', e.target.value)}
                      className={fieldInputClass}
                      disabled={isApplying}
                    />
                    <FiCalendar
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 z-20 border-t border-[#F0E0D1]/80 bg-white/95 px-5 py-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              disabled={isApplying}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] py-3.5 font-vendor text-base font-bold text-white shadow-md hover:from-[#E08F06] disabled:opacity-50"
            >
              <FiPercent size={18} />
              {isApplying ? 'Applying...' : 'Apply Discount'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default VendorRunPromo;
