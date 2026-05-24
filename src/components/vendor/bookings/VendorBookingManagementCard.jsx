import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

const STATUS_STYLES = {
  in_progress: {
    label: 'In Progress',
    badge: 'bg-[#FFF1E6] text-[#F89E07]',
    time: 'text-[#865300]',
  },
  pending: {
    label: 'Waiting',
    badge: 'bg-[#FEF9C3] text-[#854D0E]',
    time: 'text-[#865300]',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-[#E8F2FC] text-[#4A90E2]',
    time: 'text-[#221A11]',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-[#DCFCE7] text-[#22C55E]',
    time: 'text-[#655D52]',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-[#FEE2E2] text-[#BA1A1A]',
    time: 'text-[#534433]',
  },
  no_show: {
    label: 'No Show',
    badge: 'bg-[#FFEDD5] text-[#C2410C]',
    time: 'text-[#534433]',
  },
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const parseTimeParts = (timeString) => {
  if (!timeString) return { hour: '--', period: '' };
  const raw = String(timeString).trim();
  const match12 = raw.match(/(\d{1,2}:\d{2})\s*(AM|PM)/i);
  if (match12) return { hour: match12[1], period: match12[2].toUpperCase() };
  const hhmm = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!hhmm) return { hour: raw.slice(0, 5), period: '' };
  let h = parseInt(hhmm[1], 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { hour: `${h}:${hhmm[2]}`, period };
};

/**
 * Figma booking list card — node 3:340+ (350×129, time rail + content)
 */
const VendorBookingManagementCard = ({
  customerName,
  serviceLine,
  statusKey,
  timeDisplay,
  onOpen,
}) => {
  const cfg = STATUS_STYLES[statusKey] || STATUS_STYLES.pending;
  const { hour, period } = parseTimeParts(timeDisplay);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full overflow-hidden rounded-2xl bg-[#FFFDFC] text-left shadow-[0_2px_16px_rgba(34,26,17,0.06)] transition-shadow hover:shadow-[0_4px_20px_rgba(34,26,17,0.1)] focus:outline-none focus:ring-2 focus:ring-[#F89E07]/40"
    >
      <div className="flex w-[96px] shrink-0 flex-col items-center justify-center border-r border-[#F0E0D1] bg-[#F0E0D1]/60 py-4">
        <span className={`font-vendor text-[22px] font-bold leading-7 ${cfg.time}`}>{hour}</span>
        {period && (
          <span className="font-vendor text-sm leading-5 text-[#534433]">{period}</span>
        )}
      </div>

      <div className="relative min-w-0 flex-1 p-4">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FFAC00]/10 blur-2xl"
          aria-hidden
        />

        <div className="relative flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE1D2] font-vendor text-sm font-bold text-[#6B6357]">
            {getInitials(customerName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-vendor text-base font-bold leading-5 text-[#221A11]">
              {customerName || 'Guest'}
            </p>
            <p className="mt-1 line-clamp-2 font-vendor text-sm leading-5 text-[#534433]">
              {serviceLine}
            </p>
          </div>
        </div>

        <div className="relative mt-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-vendor text-xs font-semibold ${cfg.badge}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            {cfg.label}
          </span>
          <span className="flex h-8 w-8 items-center justify-center text-[#655D52]">
            <FiChevronRight size={18} aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
};

export default VendorBookingManagementCard;
