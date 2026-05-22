import React from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  parseServices,
  getInitials,
  formatLongDate,
  formatCurrency,
  formatTimeRange,
  formatStatusLabel,
  STATUS_BADGE_STYLES,
} from './bookingDetailsUtils';

const SectionTitle = ({ children, className = 'text-[#534433]' }) => (
  <h2 className={`font-vendor text-xs font-bold uppercase tracking-wide ${className}`}>
    {children}
  </h2>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <>
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[#867461]">
        <Icon size={18} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-vendor text-sm text-[#534433]">{label}</p>
        <p className="font-vendor text-base font-semibold leading-6 text-[#221A11]">{value}</p>
      </div>
    </div>
    <div className="h-px bg-[#F0E0D1]" />
  </>
);

/**
 * Figma node 3:2133 — Booking Details - Modern Tactile
 * https://www.figma.com/design/tdkk9FHNGGtFS92PWnYAMJ/Untitled?node-id=3-2133
 */
const VendorBookingDetails = ({
  booking,
  onClose,
  onStatusUpdate,
  isUpdating = false,
}) => {
  if (!booking) return null;

  const services = parseServices(booking);
  const status = booking.status || 'pending';
  const badgeClass = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.pending;
  const subtotal = booking.service_price ?? 0;
  const convenienceFee = booking.convenience_fee ?? 0;
  const totalDue = booking.total_amount ?? subtotal + convenienceFee;
  const staffLabel =
    booking.staff_name ||
    booking.assigned_staff ||
    booking.stylist_name ||
    null;

  return (
    <div className="fixed inset-0 z-[130] flex flex-col bg-[#FFF8F4] font-vendor">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#F0E0D1]/60 bg-white px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#241B14] hover:bg-[#FFF1E6]"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="flex-1 font-vendor text-xl font-bold text-[#241B14]">Booking Details</h1>
        <div className="w-10" aria-hidden />
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pb-36 pt-5">
        {/* Booking ID + status */}
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-[#FFF1E6] px-4 py-4">
          <div>
            <p className="font-vendor text-sm text-[#534433]">Booking ID</p>
            <p className="font-vendor text-lg font-bold text-[#221A11]">
              {booking.booking_number || `#${booking.id?.substring(0, 8)}`}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-vendor text-sm font-semibold ${badgeClass}`}
          >
            {formatStatusLabel(status)}
          </span>
        </div>

        {/* Customer */}
        <section className="mb-6 space-y-3">
          <SectionTitle>Customer Information</SectionTitle>
          <div className="flex items-center justify-between rounded-2xl border border-[#F0E0D1]/80 bg-white px-4 py-4 shadow-[0_2px_12px_rgba(34,26,17,0.05)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6E5D7] font-vendor text-sm font-bold text-[#221A11]">
                {getInitials(booking.customer_name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-vendor text-base font-bold text-[#221A11]">
                  {booking.customer_name || 'Guest'}
                </p>
                {booking.customer_email && (
                  <p className="truncate font-vendor text-xs text-[#534433]">
                    {booking.customer_email}
                  </p>
                )}
              </div>
            </div>
            {booking.customer_phone && (
              <a
                href={`tel:${booking.customer_phone}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1DB954] px-4 py-2 font-vendor text-sm font-semibold text-white hover:bg-[#17A348]"
              >
                <FiPhone size={14} />
                Call Customer
              </a>
            )}
          </div>
        </section>

        {/* Appointment */}
        <section className="mb-6 space-y-3">
          <SectionTitle>Appointment Details</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-[#F0E0D1]/80 bg-white shadow-[0_2px_12px_rgba(34,26,17,0.05)]">
            <div className="px-4">
              <DetailRow
                icon={FiCalendar}
                label="Date"
                value={formatLongDate(booking.booking_date)}
              />
              <DetailRow
                icon={FiClock}
                label="Time"
                value={formatTimeRange(booking)}
              />
              <div className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[#867461]">
                  <FiUser size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-vendor text-sm text-[#534433]">Staff Assigned</p>
                  <p className="font-vendor text-base font-semibold leading-6 text-[#221A11]">
                    {staffLabel || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mb-6 space-y-3">
          <SectionTitle>Services Requested</SectionTitle>
          <div className="space-y-3 rounded-2xl border border-[#F0E0D1]/80 bg-white p-4 shadow-[0_2px_12px_rgba(34,26,17,0.05)]">
            {services.length > 0 ? (
              services.map((service, index) => {
                const name =
                  service.service_name ||
                  service.name ||
                  (service.service_id ? `Service #${service.service_id.substring(0, 8)}` : 'Service');
                const mins = service.duration_minutes;
                const qty = service.quantity || 1;
                const lineTotal =
                  (service.unit_price ?? service.price ?? 0) * qty;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-[#F0E0D1]/50 bg-[#FFF8F4] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-vendor text-base font-semibold text-[#221A11]">{name}</p>
                      {mins > 0 && (
                        <p className="font-vendor text-sm text-[#534433]">{mins} mins</p>
                      )}
                      {qty > 1 && (
                        <p className="font-vendor text-xs text-[#534433]">Qty: {qty}</p>
                      )}
                    </div>
                    <p className="shrink-0 font-vendor text-base font-semibold text-[#221A11]">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-[#FFF8F4] px-4 py-3 font-vendor text-sm text-[#534433]">
                {booking.service_name || 'No services listed'}
              </p>
            )}
          </div>
        </section>

        {/* Payment summary */}
        <section className="mb-6 space-y-3">
          <SectionTitle className="text-[#623C00]">Payment Summary</SectionTitle>
          <div className="rounded-2xl bg-[#FFDDB9] px-5 py-4">
            <div className="flex justify-between py-1">
              <span className="font-vendor text-base text-[#534433]">Subtotal</span>
              <span className="font-vendor text-base font-semibold text-[#221A11]">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-vendor text-base text-[#534433]">
                {convenienceFee > 0 ? 'Convenience Fee' : 'Tax / Fees'}
              </span>
              <span className="font-vendor text-base font-semibold text-[#221A11]">
                {formatCurrency(convenienceFee)}
              </span>
            </div>
            <div className="my-3 h-px bg-[#F89E07]" />
            <div className="flex justify-between">
              <span className="font-vendor text-lg font-bold text-[#623C00]">Total Due</span>
              <span className="font-vendor text-lg font-bold text-[#F89E07]">
                {formatCurrency(totalDue)}
              </span>
            </div>
          </div>
        </section>

        {/* Collection at salon */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(34,26,17,0.05)]">
          <div className="h-1 bg-[#1DB954]" />
          <div className="px-5 py-5">
            <SectionTitle className="text-[#221A11]">Collection Details</SectionTitle>
            <div className="mt-4 flex items-center justify-between border-b border-[#F0E0D1] pb-4">
              <span className="font-vendor text-base font-semibold text-[#221A11]">
                To Collect at Salon:
              </span>
              <span className="font-vendor text-xl font-bold text-[#1DB954]">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="mt-4 flex gap-3 rounded-xl bg-[#FFF1E6] px-4 py-3">
              <FiAlertCircle className="mt-0.5 shrink-0 text-[#865300]" size={17} />
              <p className="font-vendor text-sm leading-5 text-[#534433]">
                Collect this amount from the customer after completing the service.
              </p>
            </div>
          </div>
        </section>

        {booking.notes && (
          <section className="mt-6 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_12px_rgba(34,26,17,0.05)]">
            <SectionTitle>Notes</SectionTitle>
            <p className="mt-2 font-vendor text-sm leading-5 text-[#534433]">{booking.notes}</p>
          </section>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#FFF8F4] via-[#FFF8F4]/95 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8">
        <div className="pointer-events-auto mx-auto max-w-lg space-y-2">
          {status === 'pending' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusUpdate(booking.id, 'confirmed')}
                className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[#4A90E2] font-vendor text-base font-bold text-white shadow-lg hover:bg-[#3A7BC8] disabled:opacity-50"
              >
                <FiCheckCircle size={20} />
                Confirm Booking
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#BA1A1A] font-vendor text-sm font-semibold text-[#BA1A1A] hover:bg-[#FEE2E2] disabled:opacity-50"
              >
                <FiXCircle size={18} />
                Cancel Booking
              </button>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusUpdate(booking.id, 'completed')}
                className="relative flex h-[58px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#F6A400] font-vendor text-base font-bold text-white shadow-[0_4px_16px_rgba(246,164,0,0.45)] hover:bg-[#E08F06] disabled:opacity-50"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-white/20 blur-sm" />
                <FiCheckCircle size={20} className="relative" />
                <span className="relative">
                  {isUpdating ? 'Updating...' : 'Mark as Completed'}
                </span>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#BA1A1A]/40 font-vendor text-sm font-semibold text-[#BA1A1A] hover:bg-[#FEE2E2] disabled:opacity-50"
              >
                <FiXCircle size={18} />
                Cancel Booking
              </button>
            </>
          )}

          {(status === 'completed' || status === 'cancelled' || status === 'no_show') && (
            <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-md">
              <p className="font-vendor text-sm text-[#534433]">
                This booking is marked as{' '}
                <span className="font-bold text-[#221A11]">{formatStatusLabel(status)}</span>
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 font-vendor text-sm font-semibold text-[#F89E07]"
              >
                Back to bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorBookingDetails;
