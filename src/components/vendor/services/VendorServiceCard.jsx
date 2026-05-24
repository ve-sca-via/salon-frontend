import React from 'react';
import { FiEdit2, FiClock, FiTrash2 } from 'react-icons/fi';

const GENDER_LABELS = {
  male: { text: 'For men', className: 'text-[#0655FF]' },
  female: { text: 'For women', className: 'text-[#CC4E95]' },
  both: { text: 'Unisex', className: 'text-[#534433]' },
};

const formatPrice = (amount) => {
  const value = Number(amount) || 0;
  if (value === 0) return 'FREE';
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/**
 * Figma Service Card — node 3:1496+ (350×134, #FFFDFC)
 */
const VendorServiceCard = ({
  service,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
  isDeleting = false,
}) => {
  const gender = service.gender_category || 'both';
  const genderCfg = GENDER_LABELS[gender] || GENDER_LABELS.both;
  const duration = service.duration_minutes || service.duration;
  const hasDiscount =
    service.discounted_price != null &&
    service.discounted_price !== undefined &&
    service.discount_percentage != null &&
    service.discount_percentage > 0;

  const displayPrice = hasDiscount ? service.discounted_price : service.price;
  const originalPrice = service.price;

  return (
    <article className="rounded-2xl bg-[#FFFDFC] p-5 shadow-[0_2px_16px_rgba(34,26,17,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="truncate font-vendor text-lg font-bold leading-7 text-[#111827]">
            {service.name}
          </h3>
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="shrink-0 rounded-lg p-1 text-[#636363] hover:bg-[#F3F4F6] hover:text-[#F89E07]"
            aria-label={`Edit ${service.name}`}
          >
            <FiEdit2 size={16} />
          </button>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={service.is_active}
          aria-label={`${service.is_active ? 'Deactivate' : 'Activate'} ${service.name}`}
          disabled={isToggling}
          onClick={() => onToggleActive(service)}
          className={`relative h-6 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            service.is_active ? 'bg-[#F89E07]' : 'bg-[#D1D5DB]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
              service.is_active ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {service.is_active && (
              <svg width="10" height="8" viewBox="0 0 13 10" fill="none" aria-hidden>
                <path
                  d="M1 5L4.5 8.5L12 1"
                  stroke="#F89E07"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </button>
      </div>

      <p className="mt-2 line-clamp-2 font-vendor text-sm leading-5 text-[#4B5563]">
        {service.description || 'No description'}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <span className="font-vendor text-2xl font-bold text-[#F89E07]">
          {formatPrice(displayPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="font-vendor text-base text-[#9CA3AF] line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 font-vendor text-xs font-bold text-[#15803D]">
              {Math.round(service.discount_percentage)}% OFF
            </span>
          </>
        )}
        {duration > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 font-vendor text-sm text-[#4B5563]">
            <FiClock size={16} className="text-[#867461]" />
            {duration} min
          </span>
        )}
      </div>

      <p className={`mt-3 font-vendor text-sm font-medium ${genderCfg.className}`}>
        {genderCfg.text}
      </p>

      <div className="mt-4 flex gap-2 border-t border-[#F0E0D1]/80 pt-3">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#F89E07] py-2 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6]"
        >
          <FiEdit2 size={14} />
          Edit
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(service.id)}
            disabled={isDeleting}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
            aria-label={`Delete ${service.name}`}
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
};

export default VendorServiceCard;
