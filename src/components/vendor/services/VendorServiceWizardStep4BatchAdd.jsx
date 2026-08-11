import React, { useMemo, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi';
import {
  ServiceWizardShell,
  ServiceWizardPrimaryButton,
  ServiceWizardStepLabel,
} from './ServiceWizardUI';
import {
  DURATION_OPTIONS,
  GENDER_OPTIONS,
  WIZARD_STEPS,
} from './serviceWizardConstants';

const DESCRIPTION_MAX = 250;

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

const fieldClass =
  'w-full rounded-xl border-0 bg-[#F3F3F3] px-4 py-2.5 font-vendor text-base text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35 disabled:opacity-60';

const compactSelectClass =
  'appearance-none rounded-full border border-[#F0E0D1] bg-white py-1.5 pl-3 pr-8 font-vendor text-sm font-semibold text-[#534433] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/35';

/** One added service — saved, saving, or failed. Name + price are editable inline. */
const BatchServiceRow = ({ row, onRetry, onDelete, onSaveEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: row.name, price: row.price });
  const [isBusy, setIsBusy] = useState(false);

  const startEdit = () => {
    setDraft({ name: row.name, price: row.price });
    setIsEditing(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    const ok = await onSaveEdit(row.localId, draft);
    setIsBusy(false);
    if (ok) setIsEditing(false);
  };

  const remove = async () => {
    setIsBusy(true);
    const ok = await onDelete(row.localId);
    // The row is unmounted on success; only restore the buttons if it survived.
    if (!ok) setIsBusy(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={submitEdit}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-[#F89E07]/40 bg-[#FFFAF5] p-3"
      >
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          aria-label={`Edit name for ${row.name}`}
          maxLength={255}
          className={`${fieldClass} min-w-[8rem] flex-1 bg-white py-2`}
          disabled={isBusy}
        />
        <input
          type="number"
          value={draft.price}
          onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
          aria-label={`Edit price for ${row.name}`}
          min="0"
          step="0.01"
          className={`${fieldClass} w-24 bg-white py-2`}
          disabled={isBusy}
        />
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-lg bg-[#F89E07] px-3 py-2 font-vendor text-sm font-bold text-white disabled:opacity-50"
        >
          {isBusy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={isBusy}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 font-vendor text-sm font-semibold text-[#534433] disabled:opacity-50"
        >
          Cancel
        </button>
      </form>
    );
  }

  const isSaving = row.status === 'saving';
  const isFailed = row.status === 'error';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isFailed ? 'border-[#F87171] bg-[#FEF2F2]' : 'border-[#F0E0D1] bg-white'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isFailed
            ? 'bg-[#FEE2E2] text-[#B91C1C]'
            : isSaving
              ? 'bg-[#F3F4F6] text-[#9CA3AF]'
              : 'bg-[#DCFCE7] text-[#15803D]'
        }`}
        aria-hidden
      >
        {isFailed ? (
          <FiAlertCircle size={15} />
        ) : isSaving ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#9CA3AF] border-t-transparent" />
        ) : (
          <FiCheck size={15} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-vendor text-sm font-bold text-[#111827]">{row.name}</p>
        <p className="font-vendor text-xs text-[#6B7280]">
          {formatPrice(row.price, row.discount_percentage)} · {formatDuration(row.duration)}
          {isSaving && ' · Saving…'}
        </p>
        {isFailed && (
          <p className="mt-0.5 font-vendor text-xs font-medium text-[#B91C1C]">{row.error}</p>
        )}
      </div>

      {isFailed && (
        <button
          type="button"
          onClick={() => onRetry(row.localId)}
          className="flex items-center gap-1 rounded-lg border border-[#B91C1C] px-2.5 py-1.5 font-vendor text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2]"
        >
          <FiRefreshCw size={13} /> Retry
        </button>
      )}

      <button
        type="button"
        onClick={startEdit}
        disabled={isSaving || isBusy}
        aria-label={`Edit ${row.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#534433] hover:bg-[#FFF1E6] disabled:opacity-40"
      >
        <FiEdit2 size={15} />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={isSaving || isBusy}
        aria-label={`Remove ${row.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#B91C1C] hover:bg-[#FEE2E2] disabled:opacity-40"
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  );
};

/**
 * Step 4 — rapid entry of many services under one category › subcategory.
 *
 * The taxonomy stays pinned while the vendor types name + price and hits Add;
 * each row is saved immediately and lands in the list below, so the list doubles
 * as the review. "Change subcategory" walks back to step 3 without losing the
 * rows already added.
 */
const VendorServiceWizardStep4BatchAdd = ({
  salonName,
  contextLabel,
  genderCategory,
  onChangeGender,
  defaults,
  onChangeDefault,
  rows,
  currentContextId,
  onAddRow,
  onRetryRow,
  onDeleteRow,
  onSaveRowEdit,
  onChangeSubcategory,
  onBack,
  onDone,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showMore, setShowMore] = useState(false);
  const nameRef = useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!onAddRow({ name, price })) return;
    setName('');
    setPrice('');
    nameRef.current?.focus();
  };

  // Newest first, and the group currently being added to stays at the top so the
  // vendor never has to scroll while working through a subcategory.
  const groups = useMemo(() => {
    const byContext = new Map();
    rows.forEach((row) => {
      if (!byContext.has(row.contextId)) {
        byContext.set(row.contextId, {
          contextId: row.contextId,
          label: row.contextLabel,
          rows: [],
        });
      }
      byContext.get(row.contextId).rows.unshift(row);
    });
    const all = [...byContext.values()];
    return [
      ...all.filter((g) => g.contextId === currentContextId),
      ...all.filter((g) => g.contextId !== currentContextId),
    ];
  }, [rows, currentContextId]);

  const savedCount = rows.filter((r) => r.status === 'saved').length;
  const failedCount = rows.filter((r) => r.status === 'error').length;

  return (
    <ServiceWizardShell
      salonName={salonName}
      onBack={onBack}
      currentStep={WIZARD_STEPS.BATCH}
      footer={
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onChangeSubcategory}
            className="shrink-0 rounded-xl border border-[#F89E07] px-4 py-3 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6]"
          >
            Change subcategory
          </button>
          <div className="flex-1">
            <ServiceWizardPrimaryButton onClick={onDone}>
              {savedCount > 0 ? `Done — ${savedCount} added` : 'Done'}
            </ServiceWizardPrimaryButton>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <ServiceWizardStepLabel step={WIZARD_STEPS.BATCH} />
          <h1 className="font-vendor text-2xl font-bold text-[#111827]">Add services</h1>
          <p className="font-vendor text-sm font-semibold text-[#865300]">{contextLabel}</p>
        </div>

        {/* Shared settings — set once, applied to every service added below. */}
        <div className="space-y-3 rounded-2xl bg-[#FFF8F1] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={defaults.duration}
                onChange={(e) => onChangeDefault('duration', e.target.value)}
                aria-label="Duration for new services"
                className={compactSelectClass}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#534433]"
                size={14}
              />
            </div>

            <div className="relative">
              <select
                value={genderCategory}
                onChange={(e) => onChangeGender(e.target.value)}
                aria-label="Gender for new services"
                className={compactSelectClass}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#534433]"
                size={14}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="rounded-full border border-[#F0E0D1] bg-white px-3 py-1.5 font-vendor text-sm font-semibold text-[#534433] hover:border-[#F89E07]/50"
            >
              {showMore ? 'Fewer options' : 'More options'}
            </button>
          </div>

          {showMore && (
            <div className="space-y-3 border-t border-[#F0E0D1] pt-3">
              <div>
                <label
                  className="mb-1.5 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]"
                  htmlFor="batch-description"
                >
                  Description
                </label>
                <textarea
                  id="batch-description"
                  value={defaults.description}
                  onChange={(e) => onChangeDefault('description', e.target.value)}
                  maxLength={DESCRIPTION_MAX}
                  rows={2}
                  placeholder="Shared description for these services (optional)"
                  className={`${fieldClass} resize-y bg-white`}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block font-vendor text-xs font-bold uppercase tracking-wide text-[#534433]"
                  htmlFor="batch-discount"
                >
                  Discount (%)
                </label>
                <input
                  id="batch-discount"
                  type="number"
                  value={defaults.discount_percentage}
                  onChange={(e) => onChangeDefault('discount_percentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Optional — e.g. 10"
                  className={`${fieldClass} bg-white`}
                />
              </div>
            </div>
          )}

          <p className="font-vendor text-xs text-[#6B7280]">
            Applied to every service you add below. Images and per-service tweaks can be
            added later from the services list.
          </p>
        </div>

        {/* Entry form — name, price, Add. Focus returns to the name field after each add. */}
        <form
          onSubmit={handleAdd}
          className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(34,26,17,0.06)]"
        >
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Service name"
            maxLength={255}
            placeholder="Service name — e.g. Men's Haircut"
            className={fieldClass}
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-vendor text-base font-semibold text-[#534433]">
                ₹
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-label="Price"
                min="0"
                step="0.01"
                placeholder="0 for FREE"
                className={`${fieldClass} pl-8`}
              />
            </div>
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F89E07] to-[#FDBA4D] px-5 font-vendor text-base font-bold text-white shadow-md hover:from-[#E08F06]"
            >
              <FiPlus size={18} /> Add
            </button>
          </div>
        </form>

        {failedCount > 0 && (
          <p className="rounded-xl bg-[#FEF2F2] px-4 py-2.5 font-vendor text-sm font-semibold text-[#B91C1C]">
            {failedCount} service{failedCount > 1 ? 's' : ''} failed to save. Retry or remove
            them below.
          </p>
        )}

        {rows.length === 0 ? (
          <p className="py-6 text-center font-vendor text-sm text-[#6B7280]">
            Nothing added yet. Type a name and price above to add your first service.
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.contextId} className="space-y-2">
                <h2 className="font-vendor text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                  {group.label} · {group.rows.length} added
                </h2>
                <div className="space-y-2">
                  {group.rows.map((row) => (
                    <BatchServiceRow
                      key={row.localId}
                      row={row}
                      onRetry={onRetryRow}
                      onDelete={onDeleteRow}
                      onSaveEdit={onSaveRowEdit}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </ServiceWizardShell>
  );
};

export default VendorServiceWizardStep4BatchAdd;
