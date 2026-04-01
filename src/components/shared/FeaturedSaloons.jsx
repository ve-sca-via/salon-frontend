import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSalonsQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";
import { SkeletonSalonCard } from "./Skeleton";
import svgPaths from "../../utils/svgPaths";

// Helper formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Scissors Icon for Header
function ScissorsIcon() {
  return (
    <div className="relative shrink-0 size-[16px] md:size-[24px]">
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
    <div className="flex flex-col gap-2 md:gap-4 items-center w-full mb-2 md:mb-10">
      <div className="flex flex-col gap-1 md:gap-2 items-center">
        {/* Title Row */}
        <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
          {/* Left */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-[1px] w-[20px] md:w-[40px] bg-neutral-black"></div>
            <ScissorsIcon />
          </div>

          {/* Title */}
          <h2 className="font-display font-bold text-[18px] md:text-[32px] leading-tight md:leading-[48px] text-neutral-black whitespace-nowrap">
            Featured Saloons
          </h2>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <ScissorsIcon />
            <div className="h-[1px] w-[20px] md:w-[40px] bg-neutral-black"></div>
          </div>
        </div>

        {/* Description */}
        <p className="hidden md:block font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Our Barbershop &amp; Tattoo Salon provides classic services combined with
          innovative techniques.
        </p>
      </div>
    </div>
  );
}

// ─── DESKTOP CARD (unchanged, shown on md+) ────────────────────────────────────
function SalonCard({ salon, userLocation }) {
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
            {(() => {
              const distance = salon.distance_km ?? (userLocation ? calculateDistance(userLocation.lat, userLocation.lon, salon.latitude, salon.longitude) : null);
              if (distance === null || distance === undefined) return null;

              const formattedDistance = distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(1)} km`;

              return (
                <p className="font-body text-[14px] leading-[20px] text-accent-orange font-semibold mt-1">
                  {formattedDistance} away
                </p>
              );
            })()}
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

// ─── MOBILE CARD (Stack layout with 3 lines of details + Offer strip) ────────
function MobileSalonCard({ salon, userLocation }) {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (!isClicked) {
      setIsClicked(true);
      // Redirect after a short delay to let the dark effect play
      setTimeout(() => {
        navigate(`/salons/${salon.id}`);
        // Reset state shortly after navigation so it's clean if user hits back button
        setTimeout(() => setIsClicked(false), 100);
      }, 350);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/salons/${salon.id}`);
  };

  const salonImage =
    salon.logo_url ||
    (salon.cover_images && salon.cover_images.length > 0 ? salon.cover_images[0] : null);

  let salonType = salon.business_type || salon.salon_type || salon.category || 'Unisex';
  if (typeof salonType === 'string') {
    salonType = salonType.replace(/_/g, ' ');
  }

  return (
    <div
      className="relative flex flex-col bg-gray-50 overflow-hidden cursor-pointer border border-gray-200 rounded-xl shadow-md"
      onClick={handleCardClick}
    >
      {/* Top Half: Image */}
      <div className="relative h-[200px] w-full bg-gray-200 overflow-hidden">
        {salonImage ? (
          <img
            src={salonImage}
            alt={salon.business_name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isClicked ? 'scale-105' : ''}`}
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

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          {/* Business type badge on Left */}
          <span className="bg-white/95 text-neutral-black text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm flex items-center h-[18px] pointer-events-auto">
            {salonType}
          </span>

          {/* Featured golden tag on Right */}
          <span className="bg-[#FFD700] text-neutral-black text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 h-[18px] pointer-events-auto">
            <FiStar size={8} className="fill-current" /> Featured
          </span>
        </div>

        {/* Offer strip at bottom of the image */}
        <div className="absolute bottom-0 left-0 bg-gradient-to-r from-orange-100 to-orange-50 text-accent-orange text-[10px] font-bold px-2.5 py-1 rounded-tr-lg z-10 shadow-sm border-t border-r border-orange-200/50">
          UPTO 20% OFF
        </div>

        {/* Dark overlay for interaction */}
        <div className={`absolute inset-0 bg-black/40 z-20 transition-opacity duration-300 ${isClicked ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'}`} />
      </div>

      {/* Bottom Half: Details */}
      <div className="flex flex-col p-3 bg-white border-t border-gray-100">

        {/* Line 1: Name & Rating */}
        <div className="flex items-start justify-between mb-1">
          <h3 className={`text-neutral-black font-bold text-[15px] leading-tight line-clamp-1 transition-colors ${isClicked ? 'text-accent-orange' : ''} pr-2`}>
            {salon.business_name}
          </h3>
          <span className="bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 shadow-sm">
            ★ {salon.average_rating || '4.5'}
          </span>
        </div>

        {/* Line 2: Location & Book Now */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-neutral-gray-500">
            <FiMapPin size={12} className="flex-shrink-0 text-accent-orange" />
            <p className="text-[12px] font-medium leading-tight line-clamp-1">
              {salon.address || `${salon.city || ''}, ${salon.state || ''}`}
              {(() => {
                const distance = salon.distance_km ?? (userLocation ? calculateDistance(userLocation.lat, userLocation.lon, salon.latitude, salon.longitude) : null);
                if (distance === null || distance === undefined) return '';

                const formattedDistance = distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`;

                return ` • ${formattedDistance}`;
              })()}
            </p>
          </div>
          <button
            className="bg-accent-orange text-white font-bold text-[11px] px-4 py-1.5 rounded-md shrink-0 shadow-md transition-transform active:scale-95 z-30 ml-2"
            onClick={handleBookNow}
          >
            BOOK NOW
          </button>
        </div>

        {/* Line 3: Offer Strip (Luzo Style) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center gap-2">
          <span className="text-[14px] leading-none">✨</span>
          <span className="text-[11px] text-gray-600 font-medium line-clamp-1">
            Extra 10% Off on Online Payments
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function FeaturedSaloons() {
  const { data, isLoading, error } = useGetSalonsQuery({ limit: 6 });
  const salons = data?.salons || [];
  const locationState = useSelector((state) => state.location);
  const userLocation = locationState?.userLocation || null;

  return (
    <section className="w-full py-1 md:py-16 bg-white">
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
                <SalonCard key={salon.id} salon={salon} userLocation={userLocation} />
              ))}
            </div>

            {/* Mobile: 1-column card grid */}
            <div className="grid grid-cols-1 gap-4 md:hidden px-2">
              {salons.map((salon) => (
                <MobileSalonCard key={salon.id} salon={salon} userLocation={userLocation} />
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

