import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSalonsQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";
import { SkeletonSalonCard } from "./Skeleton";
import svgPaths from "../../utils/svgPaths";

// Scissors Icon for Header
function ScissorsIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g>
          <path
            clipRule="evenodd"
            d={svgPaths.p25acb880}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p278c7db0}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.pd7a6390}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p33bb100}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p153dbd00}
            fill="#242B3A"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <div className="flex flex-col gap-4 items-center w-full mb-6 md:mb-10">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Featured Saloons
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Our Barbershop &amp; Tattoo Salon provides classic services combined with
          innovative techniques.
        </p>
      </div>
    </div>
  );
}

// ─── DESKTOP CARD (unchanged, shown on md+) ────────────────────────────────────
function SalonCard({ salon }) {
  const navigate = useNavigate();

  const handleViewSalon = () => {
    navigate(`/salons/${salon.id}`);
  };

  let logoImage = salon.logo_url;
  let coverImage = salon.cover_images && salon.cover_images.length > 0 ? salon.cover_images[0] : null;

  let hoursDisplay = '9:00 AM - 9:00 PM';
  if (salon.business_hours && typeof salon.business_hours === 'object') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = salon.business_hours[today] || salon.business_hours.monday || {};
    hoursDisplay = todayHours.closed
      ? 'Closed'
      : todayHours.open && todayHours.close
      ? `${todayHours.open} - ${todayHours.close}`
      : '9:00 AM - 9:00 PM';
  } else if (salon.opening_time && salon.closing_time) {
    hoursDisplay = `${salon.opening_time} - ${salon.closing_time}`;
  }

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer w-full max-w-[380px]"
      onClick={handleViewSalon}
    >
      {/* Image */}
      <div className="relative h-[220px] w-full overflow-hidden">
        {logoImage || coverImage ? (
          <img
            src={logoImage || coverImage}
            alt={salon.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML =
                '<div class="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-neutral-black mb-4 group-hover:text-accent-orange transition-colors">
          {salon.business_name}
        </h3>

        <div className="flex items-start gap-3 mb-3">
          <FiMapPin className="text-accent-orange mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="font-body text-[15px] leading-[22px] text-neutral-gray-700">
              {salon.address || `${salon.city}, ${salon.state}`}
            </p>
            {salon.distance_km && (
              <p className="font-body text-[14px] leading-[20px] text-accent-orange font-semibold mt-1">
                {salon.distance_km.toFixed(1)} km away
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <FiClock className="text-accent-orange flex-shrink-0" size={18} />
          <p className="font-body text-[15px] leading-[22px] text-neutral-gray-700">
            {hoursDisplay}
          </p>
        </div>

        <button
          className="w-full bg-neutral-black text-primary-white rounded-[5px] py-[9px] px-[16px] flex items-center justify-center gap-2 hover:bg-neutral-gray-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleViewSalon();
          }}
        >
          <FiCalendar size={16} />
          <span className="font-body font-medium text-[14px] leading-[24px]">
            Book Appointment
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── MOBILE CARD (2-col grid, tap-to-reveal overlay + hover, type badge) ────────
function MobileSalonCard({ salon }) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  const handleViewSalon = () => navigate(`/salons/${salon.id}`);

  // First tap → reveal overlay; second tap on card (not Book Now) → navigate
  const handleCardClick = () => {
    if (revealed) {
      handleViewSalon();
    } else {
      setRevealed(true);
    }
  };

  // Dismiss overlay when tapping outside (via blur / touch elsewhere)
  const handleMouseLeave = () => setRevealed(false);

  const salonImage =
    salon.logo_url ||
    (salon.cover_images && salon.cover_images.length > 0 ? salon.cover_images[0] : null);

  const salonType = salon.salon_type || salon.category || 'Unisex';

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md border border-gray-100 group"
      style={{ aspectRatio: '3/4' }}
      onClick={handleCardClick}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {salonImage ? (
          <img
            src={salonImage}
            alt={salon.business_name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              revealed ? 'scale-110' : 'group-hover:scale-110'
            }`}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.parentElement) {
                e.target.parentElement.style.background =
                  'linear-gradient(135deg, #f97316, #c2410c)';
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-700" />
        )}
      </div>

      {/* Always-visible gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

      {/* Salon type badge — top left */}
      <div className="absolute top-2 left-2 z-20">
        <span className="bg-white/90 backdrop-blur-sm text-neutral-black text-[9px] font-bold uppercase tracking-wide px-2 py-[3px] rounded-full shadow-sm">
          {salonType}
        </span>
      </div>

      {/* Featured badge — top right */}
      <div className="absolute top-2 right-2 z-20">
        <span className="bg-amber-400 text-black text-[8px] font-black uppercase tracking-wider px-2 py-[3px] rounded-full shadow-md">
          ★ Featured
        </span>
      </div>

      {/* Always-visible bottom strip: name + location */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 px-2.5 pb-2.5 pt-1 transition-all duration-300 ${
          revealed
            ? 'translate-y-2 opacity-0'
            : 'translate-y-0 opacity-100 group-hover:translate-y-2 group-hover:opacity-0'
        }`}
      >
        <h3 className="text-white font-bold text-[12px] leading-[15px] line-clamp-1 drop-shadow-md">
          {salon.business_name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <FiMapPin size={8} className="text-orange-300 flex-shrink-0" />
          <p className="text-gray-300 text-[9px] leading-[12px] line-clamp-1">
            {salon.city || salon.address || ''}
          </p>
        </div>
      </div>

      {/* Detail overlay — shown on hover (desktop) OR tap (mobile) */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-end p-3 bg-black/70 transition-opacity duration-300 ${
          revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <h3 className="text-white font-bold text-[13px] leading-[17px] mb-1 line-clamp-2">
          {salon.business_name}
        </h3>
        <p className="text-gray-300 text-[10px] leading-[13px] line-clamp-2 mb-2">
          {salon.address || `${salon.city || ''}, ${salon.state || ''}`}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] text-orange-300 font-semibold uppercase tracking-wider">
            {salonType}
          </span>
          <button
            className="bg-accent-orange text-white text-[9px] font-bold px-2.5 py-1 rounded-full active:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              handleViewSalon();
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function FeaturedSaloons() {
  const { data, isLoading, error } = useGetSalonsQuery({ limit: 6 });
  const salons = data?.salons || [];

  return (
    <section className="w-full py-8 md:py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <Header />

        {/* ── Loading ── */}
        {isLoading && (
          <>
            {/* Desktop skeletons */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonSalonCard key={i} />
              ))}
            </div>
            {/* Mobile skeletons — 2-column */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-200 animate-pulse border border-gray-100"
                  style={{ aspectRatio: '3/4' }}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">
              Failed to load featured salons. Please try again later.
            </p>
          </div>
        )}

        {/* ── Data ── */}
        {!isLoading && !error && salons.length > 0 && (
          <>
            {/* Desktop: original 3-col grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>

            {/* Mobile: 2-column card grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {salons.map((salon) => (
                <MobileSalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          </>
        )}

        {/* ── Empty ── */}
        {!isLoading && !error && salons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-neutral-gray-400">
              No featured salons available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

