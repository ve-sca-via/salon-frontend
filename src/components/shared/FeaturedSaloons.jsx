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
    <div className="flex flex-col gap-4 items-center w-full mb-10">
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
          Our Barbershop & Tattoo Salon provides classic services combined with
          innovative techniques.
        </p>
      </div>
    </div>
  );
}



// Salon Card Component - Matches /salons page design
function SalonCard({ salon }) {
  const navigate = useNavigate();

  const handleViewSalon = () => {
    navigate(`/salons/${salon.id}`);
  };

  // Use logo_url from database for list view
  let logoImage = salon.logo_url;
  // First cover image as fallback
  let coverImage = salon.cover_images && salon.cover_images.length > 0 ? salon.cover_images[0] : null;
  
  // Get today's hours - handle both business_hours JSONB and legacy fields
  let hoursDisplay = '9:00 AM - 9:00 PM'; // Default
  
  if (salon.business_hours && typeof salon.business_hours === 'object') {
    // New format: business_hours JSONB
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = salon.business_hours[today] || salon.business_hours.monday || {};
    hoursDisplay = todayHours.closed 
      ? 'Closed' 
      : todayHours.open && todayHours.close
      ? `${todayHours.open} - ${todayHours.close}`
      : '9:00 AM - 9:00 PM';
  } else if (salon.opening_time && salon.closing_time) {
    // Legacy format: opening_time and closing_time
    hoursDisplay = `${salon.opening_time} - ${salon.closing_time}`;
  }

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer w-full max-w-[416px]"
      onClick={handleViewSalon}
    >
      {/* Image Section - Show Logo or Cover Image */}
      <div className="relative h-[250px] w-full overflow-hidden">
        {logoImage || coverImage ? (
          <img
            src={logoImage || coverImage}
            alt={salon.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"></div>
        )}
        
        {/* Subtle Gradient Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* COMMENTED OUT - Rating badge not yet implemented
        <div className="absolute top-4 right-4 bg-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2">
          <FiStar className="text-yellow-500" fill="#FFC107" size={18} />
          <span className="font-bold text-neutral-black text-lg">
            {salon.average_rating || '4.5'}
          </span>
        </div>
        */}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Salon Name */}
        <h3 className="text-2xl font-bold text-neutral-black mb-4 group-hover:text-accent-orange transition-colors">
          {salon.business_name}
        </h3>

        {/* Location */}
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

        {/* Business Hours */}
        <div className="flex items-center gap-3 mb-4">
          <FiClock className="text-accent-orange flex-shrink-0" size={18} />
          <p className="font-body text-[15px] leading-[22px] text-neutral-gray-700">
            {hoursDisplay}
          </p>
        </div>

        {/* Book Appointment Button */}
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

export default function FeaturedSaloons() {
  // Fetch featured salons from API with limit of 6
  const { data, isLoading, error } = useGetSalonsQuery({ 
    limit: 6 
  });

  const salons = data?.salons || [];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <Header />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonSalonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">
              Failed to load featured salons. Please try again later.
            </p>
          </div>
        )}

        {/* Salons Grid */}
        {!isLoading && !error && salons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}

        {/* No Salons State */}
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
