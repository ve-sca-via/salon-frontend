import React from 'react';

/**
 * Figma: Metric cards 144×112, #FFFFFF, radius 16px, padding 16px
 */
const VendorMetricCard = ({ label, value, badge, badgeVariant = 'success', icon }) => {
  const badgeStyles = {
    success: 'bg-vendor-success-bg text-vendor-success',
    neutral: 'bg-vendor-neutral-bg text-vendor-neutral',
    muted: 'bg-vendor-neutral-bg text-vendor-neutral',
  };

  return (
    <div className="bg-vendor-surface rounded-[16px] p-4 min-h-[112px] flex flex-col shadow-vendor-card">
      <div className="flex items-start justify-between gap-2">
        <div className="w-7 h-7 rounded-full bg-vendor-icon-bg flex items-center justify-center shrink-0">
          {icon}
        </div>
        {badge && (
          <span
            className={`font-vendor text-[10px] font-bold leading-[15px] px-2 py-1 rounded-full whitespace-nowrap ${
              badgeStyles[badgeVariant] || badgeStyles.success
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-auto pt-2">
        <p className="font-vendor text-[24px] font-bold leading-8 text-vendor-text-primary">{value}</p>
        <p className="font-vendor text-[14px] font-normal leading-5 text-vendor-text-secondary mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
};

export default VendorMetricCard;
