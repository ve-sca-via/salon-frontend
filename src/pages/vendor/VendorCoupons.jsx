/**
 * VendorCoupons — manage code-based coupons for this salon.
 *
 * Separate from "Run Promo" (VendorRunPromo), which is the codeless automatic
 * storewide sale. Coupons are codes customers type at checkout. A coupon and a
 * Run Promo sale don't stack — the bigger discount wins.
 *
 * Server forces scope=vendor, this salon, funded_by=vendor — so the form only
 * exposes VendorCouponCreate fields.
 */

import React, { useMemo, useState } from 'react';
import { FiArrowLeft, FiCopy, FiPlus, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VendorPageShell from '../../components/vendor/VendorPageShell';
import {
  useGetVendorCouponsQuery,
  useCreateVendorCouponMutation,
  useUpdateVendorCouponMutation,
  useDeactivateVendorCouponMutation,
} from '../../services/api/vendorApi';
import { showErrorToast, showSuccessToast } from '../../utils/toastConfig';

const fieldLabelClass =
  'mb-2 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]';
const fieldInputClass =
  'w-full rounded-xl border-0 bg-[#F3F3F3] px-4 py-2.5 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35';

const EMPTY_FORM = {
  code: '',
  title: '',
  applies_to: 'service',
  discount_type: 'percentage',
  discount_value: '',
  max_discount_cap: '',
  min_order_amount: '',
  first_time_scope: '',
  usage_limit_total: '',
  usage_limit_per_user: '1',
  valid_from: '',
  valid_until: '',
  is_active: true,
};

const dateToIso = (val) => (val ? new Date(`${val}T00:00:00`).toISOString() : null);
const isoToDate = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const numOrNull = (v) => (v === '' || v === null ? null : Number(v));

const formatDiscount = (c) => {
  const base = c.discount_type === 'percentage' ? `${Number(c.discount_value)}%` : `₹${Number(c.discount_value)}`;
  const parts = [base];
  if (c.max_discount_cap != null) parts.push(`max ₹${Number(c.max_discount_cap)}`);
  if (c.min_order_amount != null) parts.push(`min ₹${Number(c.min_order_amount)}`);
  return parts.join(' · ');
};

const VendorCoupons = () => {
  const navigate = useNavigate();
  const { data: coupons = [], isLoading } = useGetVendorCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateVendorCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateVendorCouponMutation();
  const [deactivateCoupon] = useDeactivateVendorCouponMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const isEdit = Boolean(editingId);
  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      code: c.code || '',
      title: c.title || '',
      applies_to: c.applies_to || 'service',
      discount_type: c.discount_type || 'percentage',
      discount_value: String(c.discount_value ?? ''),
      max_discount_cap: c.max_discount_cap != null ? String(c.max_discount_cap) : '',
      min_order_amount: c.min_order_amount != null ? String(c.min_order_amount) : '',
      first_time_scope: c.first_time_scope || '',
      usage_limit_total: c.usage_limit_total != null ? String(c.usage_limit_total) : '',
      usage_limit_per_user: c.usage_limit_per_user != null ? String(c.usage_limit_per_user) : '',
      valid_from: isoToDate(c.valid_from),
      valid_until: isoToDate(c.valid_until),
      is_active: c.is_active ?? true,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const validate = () => {
    const code = form.code.trim();
    if (!code || code.length < 3 || code.length > 40) {
      showErrorToast('Code is required (3–40 characters)');
      return false;
    }
    if (!form.title.trim()) {
      showErrorToast('Title is required');
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
    if (form.valid_from && form.valid_until && form.valid_until < form.valid_from) {
      showErrorToast('Valid until must be on or after valid from');
      return false;
    }
    return true;
  };

  const errorMessage = (error, fallback) => {
    if (error?.status === 409) return 'An active coupon with this code already exists.';
    const detail = error?.data?.detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join('; ');
    return detail || error?.message || fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        // CouponUpdate — code & scope immutable
        await updateCoupon({
          couponId: editingId,
          data: {
            title: form.title.trim(),
            discount_value: Number(form.discount_value),
            max_discount_cap: numOrNull(form.max_discount_cap),
            min_order_amount: numOrNull(form.min_order_amount),
            usage_limit_total: numOrNull(form.usage_limit_total),
            usage_limit_per_user: numOrNull(form.usage_limit_per_user),
            valid_until: dateToIso(form.valid_until),
            is_active: form.is_active,
          },
        }).unwrap();
        showSuccessToast('Coupon updated');
      } else {
        await createCoupon({
          code: form.code.trim().toUpperCase(),
          title: form.title.trim(),
          applies_to: form.applies_to,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          max_discount_cap: numOrNull(form.max_discount_cap),
          min_order_amount: numOrNull(form.min_order_amount),
          first_time_scope: form.first_time_scope || null,
          usage_limit_total: numOrNull(form.usage_limit_total),
          usage_limit_per_user: numOrNull(form.usage_limit_per_user),
          valid_from: dateToIso(form.valid_from),
          valid_until: dateToIso(form.valid_until),
        }).unwrap();
        showSuccessToast('Coupon created');
      }
      closeForm();
    } catch (error) {
      showErrorToast(errorMessage(error, 'Failed to save coupon'));
    }
  };

  const handleDeactivate = async (c) => {
    if (!window.confirm(`Deactivate "${c.code}"? The code stops working but redemption history is kept.`)) return;
    try {
      await deactivateCoupon(c.id).unwrap();
      showSuccessToast('Coupon deactivated');
    } catch (error) {
      showErrorToast(errorMessage(error, 'Failed to deactivate coupon'));
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    showSuccessToast(`Copied "${code}"`);
  };

  const sortedCoupons = useMemo(
    () => [...coupons].sort((a, b) => Number(b.is_active) - Number(a.is_active)),
    [coupons]
  );

  return (
    <DashboardLayout role="vendor">
      <VendorPageShell bgClass="bg-[#FFF8F4]">
        <div className="flex flex-col bg-[#FFF8F4] font-vendor w-full max-lg:min-h-[calc(100dvh-4rem)]">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#F0E0D1]/60 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => navigate('/vendor/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#241B14] hover:bg-[#FFF1E6]"
              aria-label="Go back"
            >
              <FiArrowLeft size={18} />
            </button>
            <h1 className="flex-1 font-vendor text-lg font-bold text-[#241B14]">Coupons</h1>
            {!showForm && (
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] px-3 py-2 font-vendor text-sm font-bold text-white shadow-sm"
              >
                <FiPlus size={16} /> New
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
            {/* Helper banner */}
            <div className="mb-5 rounded-2xl border border-[#F89E07]/30 bg-[#FFF1E6] px-4 py-3">
              <p className="font-vendor text-sm font-semibold text-[#865300]">
                Coupons are codes your customers type at checkout.
              </p>
              <p className="mt-1 font-vendor text-xs text-[#6B7280]">
                For an automatic storewide sale with no code, use <strong>Run Promo</strong> instead.
                A coupon and a Run Promo sale don&apos;t stack — the bigger discount wins.
              </p>
            </div>

            {/* Create / Edit form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)] space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E6]">
                    <FiTag className="text-[#F89E07]" size={16} />
                  </span>
                  <h2 className="font-vendor text-base font-bold text-[#111827]">
                    {isEdit ? `Edit ${form.code}` : 'New Coupon'}
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-code">Code</label>
                    <input
                      id="c-code"
                      type="text"
                      value={form.code}
                      onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                      placeholder="SAVE20"
                      maxLength={40}
                      disabled={isEdit}
                      className={`${fieldInputClass} ${isEdit ? 'opacity-60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-title">Title</label>
                    <input
                      id="c-title"
                      type="text"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="20% off services"
                      className={fieldInputClass}
                    />
                  </div>
                </div>

                <div>
                  <span className={fieldLabelClass}>Applies To</span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F3F3F3] p-1">
                    {[
                      { v: 'service', l: 'Service price' },
                      { v: 'convenience_fee', l: 'Convenience fee' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        disabled={isEdit}
                        onClick={() => updateField('applies_to', opt.v)}
                        className={`rounded-lg py-2.5 font-vendor text-sm font-semibold transition-colors ${
                          form.applies_to === opt.v ? 'bg-white text-[#865300] shadow-sm' : 'text-[#6B7280]'
                        } ${isEdit ? 'opacity-60' : ''}`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className={fieldLabelClass}>Discount Type</span>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F3F3F3] p-1">
                      {[
                        { v: 'flat_amount', l: 'Flat (₹)' },
                        { v: 'percentage', l: 'Percent (%)' },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          disabled={isEdit}
                          onClick={() => updateField('discount_type', opt.v)}
                          className={`rounded-lg py-2.5 font-vendor text-sm font-semibold transition-colors ${
                            form.discount_type === opt.v ? 'bg-white text-[#865300] shadow-sm' : 'text-[#6B7280]'
                          } ${isEdit ? 'opacity-60' : ''}`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-value">Discount Value</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-vendor text-base font-semibold text-[#534433]">
                        {form.discount_type === 'percentage' ? '%' : '₹'}
                      </span>
                      <input
                        id="c-value"
                        type="number"
                        min="0"
                        step={form.discount_type === 'percentage' ? '0.01' : '1'}
                        max={form.discount_type === 'percentage' ? '100' : undefined}
                        value={form.discount_value}
                        onChange={(e) => updateField('discount_value', e.target.value)}
                        placeholder={form.discount_type === 'percentage' ? '20' : '100'}
                        className={`${fieldInputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-cap">Max Discount Cap (₹)</label>
                    <input
                      id="c-cap"
                      type="number"
                      min="0"
                      value={form.max_discount_cap}
                      onChange={(e) => updateField('max_discount_cap', e.target.value)}
                      placeholder="e.g. 300"
                      className={fieldInputClass}
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-min">Min Order Amount (₹)</label>
                    <input
                      id="c-min"
                      type="number"
                      min="0"
                      value={form.min_order_amount}
                      onChange={(e) => updateField('min_order_amount', e.target.value)}
                      placeholder="e.g. 500"
                      className={fieldInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabelClass} htmlFor="c-first">First-time only</label>
                  <select
                    id="c-first"
                    value={form.first_time_scope}
                    onChange={(e) => updateField('first_time_scope', e.target.value)}
                    disabled={isEdit}
                    className={`${fieldInputClass} ${isEdit ? 'opacity-60' : ''}`}
                  >
                    <option value="">Anyone</option>
                    <option value="platform">First booking on platform</option>
                    <option value="vendor">First booking at my salon</option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-utotal">Usage Limit (total)</label>
                    <input
                      id="c-utotal"
                      type="number"
                      min="0"
                      value={form.usage_limit_total}
                      onChange={(e) => updateField('usage_limit_total', e.target.value)}
                      placeholder="Blank = unlimited"
                      className={fieldInputClass}
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-uuser">Per User</label>
                    <input
                      id="c-uuser"
                      type="number"
                      min="0"
                      value={form.usage_limit_per_user}
                      onChange={(e) => updateField('usage_limit_per_user', e.target.value)}
                      placeholder="Blank = unlimited"
                      className={fieldInputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-from">Valid From</label>
                    <input
                      id="c-from"
                      type="date"
                      value={form.valid_from}
                      onChange={(e) => updateField('valid_from', e.target.value)}
                      disabled={isEdit}
                      className={`${fieldInputClass} ${isEdit ? 'opacity-60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass} htmlFor="c-until">Valid Until</label>
                    <input
                      id="c-until"
                      type="date"
                      value={form.valid_until}
                      min={form.valid_from || undefined}
                      onChange={(e) => updateField('valid_until', e.target.value)}
                      className={fieldInputClass}
                    />
                  </div>
                </div>

                {isEdit && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => updateField('is_active', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#F89E07] focus:ring-[#F89E07]"
                    />
                    <span className="font-vendor text-sm font-medium text-[#534433]">Active</span>
                  </label>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl bg-[#F3F3F3] py-3 font-vendor text-sm font-bold text-[#534433]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] py-3 font-vendor text-sm font-bold text-white shadow-md disabled:opacity-50"
                  >
                    {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            )}

            {/* Coupon list */}
            {!showForm && (
              <section className="space-y-3">
                <h3 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                  My Coupons
                </h3>
                {isLoading ? (
                  <p className="font-vendor text-sm text-[#6B7280]">Loading…</p>
                ) : sortedCoupons.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 text-center shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
                    <p className="font-vendor text-sm text-[#6B7280]">
                      No coupons yet. Tap <strong>New</strong> to create one.
                    </p>
                  </div>
                ) : (
                  sortedCoupons.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-vendor text-base font-bold text-[#111827]">{c.code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.code)}
                              className="text-[#9CA3AF] hover:text-[#F89E07]"
                              aria-label="Copy code"
                            >
                              <FiCopy size={14} />
                            </button>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.is_active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'
                              }`}
                            >
                              {c.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="mt-0.5 font-vendor text-sm text-[#6B7280] truncate">{c.title}</p>
                          <p className="mt-1 font-vendor text-xs text-[#534433]">
                            {formatDiscount(c)}
                            {' · '}
                            {c.applies_to === 'service' ? 'Service' : 'Fee'}
                          </p>
                          <p className="mt-0.5 font-vendor text-[11px] text-[#9CA3AF]">
                            Used {c.used_count ?? 0}
                            {c.usage_limit_total != null ? ` / ${c.usage_limit_total}` : ''}
                            {c.valid_until ? ` · ends ${isoToDate(c.valid_until)}` : ' · no expiry'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-lg bg-[#F3F3F3] px-3 py-1.5 font-vendor text-xs font-bold text-[#534433]"
                        >
                          Edit
                        </button>
                        {c.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(c)}
                            className="rounded-lg bg-[#FEE2E2] px-3 py-1.5 font-vendor text-xs font-bold text-[#B91C1C]"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        </div>
      </VendorPageShell>
    </DashboardLayout>
  );
};

export default VendorCoupons;
