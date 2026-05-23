/** Shared helpers for vendor booking details (Figma node 3:2133) */

export const parseServices = (booking) => {
  try {
    if (!booking?.services) return [];
    if (typeof booking.services === 'string') return JSON.parse(booking.services);
    if (Array.isArray(booking.services)) return booking.services;
    return [];
  } catch {
    return [];
  }
};

export const parseTimeSlots = (booking) => {
  try {
    if (!booking?.time_slots) return [];
    if (typeof booking.time_slots === 'string') return JSON.parse(booking.time_slots);
    if (Array.isArray(booking.time_slots)) return booking.time_slots;
    return [];
  } catch {
    return [];
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
};

export const formatLongDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDurationLabel = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const formatTimeRange = (booking) => {
  const slots = parseTimeSlots(booking);
  const duration = booking?.duration_minutes;
  const durationSuffix = duration ? ` (${formatDurationLabel(duration)})` : '';

  if (slots.length >= 2) {
    return `${slots[0]} - ${slots[slots.length - 1]}${durationSuffix}`;
  }
  if (slots.length === 1) {
    return `${slots[0]}${durationSuffix}`;
  }
  if (booking?.booking_time) {
    return `${booking.booking_time}${durationSuffix}`;
  }
  return duration ? formatDurationLabel(duration) : '—';
};

export const formatStatusLabel = (status) => {
  if (!status) return 'Unknown';
  if (status === 'no_show') return 'No Show';
  if (status === 'pending') return 'Waiting';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const STATUS_BADGE_STYLES = {
  pending: 'bg-[#FEF9C3] text-[#854D0E]',
  confirmed: 'bg-[#FFDBCF] text-[#2F140A]',
  in_progress: 'bg-[#FFF1E6] text-[#F89E07]',
  completed: 'bg-[#DCFCE7] text-[#166534]',
  cancelled: 'bg-[#FEE2E2] text-[#BA1A1A]',
  no_show: 'bg-[#FFEDD5] text-[#C2410C]',
};
