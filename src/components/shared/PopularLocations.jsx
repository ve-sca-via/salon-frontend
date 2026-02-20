import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPopularCitiesQuery } from "../../services/api/salonApi";
import svgPaths from "../../utils/svgPaths";

// City images - moved outside component to prevent recreation on every render
const CITY_IMAGES = {
  'mumbai': 'https://images.unsplash.com/photo-1649510550074-16195a0c6473?w=400&q=80',
  'delhi': 'https://images.unsplash.com/photo-1702818797775-d9656b65e8e8?w=400&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1687158266948-bf538937c74a?w=400&q=80',
  'hyderabad': 'https://images.unsplash.com/photo-1750834115223-f3a3c2e50c79?w=400&q=80',
  'chennai': 'https://images.unsplash.com/photo-1707047023890-570fbf2989af?w=400&q=80',
  'kolkata': 'https://images.unsplash.com/photo-1591914227599-30b05407ed7b?w=400&q=80',
  'pune': 'https://images.unsplash.com/photo-1614716194506-ef3694ae131a?w=400&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1642993317556-801ffed6ad01?w=400&q=80',
  'ahmedabad': 'https://images.unsplash.com/photo-1585555441163-501c9e0df906?w=400&q=80',
  'surat': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80'
};

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
    <div className="flex flex-col gap-4 items-center w-full mb-12">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Popular Locations
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Here's a list of popular locations across India, showcasing diverse
          cities that are sought after for various reasons.
        </p>
      </div>
    </div>
  );
}

// Location Card Component
function LocationCard({ cityName, salonCount, imageUrl, onClick }) {
  return (
    <div 
      className="bg-primary-white rounded-[10px] shadow-lg overflow-hidden w-full max-w-[306px] flex flex-col cursor-pointer hover:shadow-xl transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="h-[197px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={cityName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback to gradient if image fails
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600"></div>';
          }}
        />
      </div>

      {/* Info Container */}
      <div className="flex flex-col items-center justify-center p-5 text-center">
        <h3 className="font-body font-semibold text-[20px] leading-[32px] text-neutral-black group-hover:text-accent-orange transition-colors">
          {cityName}
        </h3>
        <p className="font-body font-normal text-[14px] leading-[24px] text-neutral-gray-500">
          {salonCount} {salonCount === 1 ? 'Salon' : 'Salons'}
        </p>
      </div>
    </div>
  );
}

export default function PopularLocations() {
  const navigate = useNavigate();
  
  // Fetch aggregated city data from backend (efficient, scalable)
  const { data, isLoading, error } = useGetPopularCitiesQuery({ limit: 8 });

  const cities = data?.cities || [];

  // Enhance cities with display images (memoized)
  const cityStats = useMemo(() => {
    return cities.map(city => ({
      cityName: city.city.charAt(0).toUpperCase() + city.city.slice(1), // Capitalize first letter for display
      salonCount: city.salon_count,
      imageUrl: CITY_IMAGES[city.city] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80'
    }));
  }, [cities]);

  // Calculate total salons (sum of all city counts)
  const totalSalons = useMemo(() => {
    return cities.reduce((sum, city) => sum + city.salon_count, 0);
  }, [cities]);

  // Navigate to salons page with city filter - uses React Router (no page reload)
  const handleCityClick = (cityName) => {
    navigate(`/salons?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <section className="w-full py-20 bg-neutral-gray-600">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col gap-12 items-center">
          <Header />

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full place-items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-[10px] shadow-lg w-full max-w-[306px] h-[280px] animate-pulse">
                  <div className="h-[197px] bg-gray-300"></div>
                  <div className="p-5 space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-xl text-red-500">
                Failed to load popular locations. Please try again later.
              </p>
            </div>
          )}

          {/* Locations Grid */}
          {!isLoading && !error && cityStats.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full place-items-center">
                {cityStats.map((location) => (
                  <LocationCard
                    key={location.cityName}
                    cityName={location.cityName}
                    salonCount={location.salonCount}
                    imageUrl={location.imageUrl}
                    onClick={() => handleCityClick(location.cityName)}
                  />
                ))}
              </div>

              {/* View All Button - Shows actual total */}
              {totalSalons > 0 && (
                <a href="/salons">
                  <button className="bg-accent-orange hover:bg-accent-orange/90 transition-colors px-6 py-3 rounded-[5px] mt-8">
                    <span className="font-body font-medium text-[14px] leading-[24px] text-primary-white">
                      VIEW ALL {totalSalons} SALONS
                    </span>
                  </button>
                </a>
              )}
            </>
          )}

          {/* No Data State */}
          {!isLoading && !error && cityStats.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-neutral-gray-500">
                No locations available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
