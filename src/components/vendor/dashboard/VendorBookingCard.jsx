import React from 'react';

const STATUS_CONFIG = {
  pending: { label: 'Waiting', text: 'text-vendor-neutral', bg: 'bg-vendor-neutral-bg' },
  confirmed: { label: 'Confirmed', text: 'text-vendor-confirmed', bg: 'bg-vendor-confirmed-bg' },
  completed: { label: 'Completed', text: 'text-vendor-success', bg: 'bg-vendor-success-bg' },
  cancelled: { label: 'Cancelled', text: 'text-vendor-danger', bg: 'bg-vendor-danger-bg' },
  in_progress: { label: 'In Progress', text: 'text-vendor-progress-text', bg: 'bg-vendor-progress-bg' },
};

/**
 * Figma booking cards:
 * - Featured: 350×82, #F89E07, radius 24px
 * - Standard: 350×72, #FFFDFC, radius 16px
 */
const VendorBookingCard = ({ name, serviceLine, status, featured = false, couponCode = null }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const badgeClass = featured
    ? 'bg-vendor-progress-featured-bg text-vendor-progress-featured-text'
    : `${cfg.bg} ${cfg.text}`;

  if (featured) {
    return (
      <div className="flex items-center gap-[21px] p-4 min-h-[82px] rounded-[24px] bg-vendor-orange shadow-vendor-card relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'url(/placeholder-image.svg)',
            backgroundSize: 'cover',
          }}
          aria-hidden="true"
        />
        <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden shrink-0 relative z-[1]">
          <img src="/placeholder-image.svg" alt="" className="w-full h-full object-cover" width={48} height={48} />
        </div>
        <div className="flex-1 min-w-0 relative z-[1]">
          <p className="font-vendor-accent text-[16px] font-bold leading-6 text-white truncate">{name}</p>
          <p className="font-vendor-accent text-[12px] font-medium leading-4 text-white/90 truncate mt-0.5">
            {serviceLine}
            {couponCode && (
              <span className="ml-1.5 font-bold">· 🎟 {couponCode}</span>
            )}
          </p>
        </div>
        <span
          className={`font-vendor-accent text-[10px] font-bold leading-[15px] px-2.5 py-1 rounded-full shrink-0 relative z-[1] ${badgeClass}`}
        >
          {cfg.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 min-h-[72px] rounded-[16px] bg-vendor-surface-warm shadow-vendor-card">
      <div className="w-12 h-12 rounded-full bg-vendor-neutral-bg overflow-hidden shrink-0">
        <img src="/placeholder-image.svg" alt="" className="w-full h-full object-cover" width={48} height={48} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-vendor text-[16px] font-bold leading-6 text-vendor-text-primary truncate">{name}</p>
        <p className="font-vendor text-[12px] font-normal leading-4 text-vendor-text-secondary truncate mt-0.5">
          {serviceLine}
          {couponCode && (
            <span className="ml-1.5 font-semibold text-vendor-success">· 🎟 {couponCode}</span>
          )}
        </p>
      </div>
      <span
        className={`font-vendor text-[10px] font-bold leading-[15px] px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}
      >
        {cfg.label}
      </span>
    </div>
  );
};

export default VendorBookingCard;
