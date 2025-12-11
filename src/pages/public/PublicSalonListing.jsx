import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import bgImage from "../../assets/images/bg_7.jpg";
import { useGetSalonsQuery, useSearchSalonsQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiClock, FiCalendar, FiNavigation, FiX } from "react-icons/fi";

// Arrow Icon Component
function ArrowCircleRight() {
  return (
    <svg
      className="block size-full"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 16 16"
    >
      <g>
        <path
          d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm2.5 8.5h-3v2l-3-2.5 3-2.5v2h3v1z"
          fill="#242B3A"
        />
      </g>
    </svg>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section
      className="relative w-full h-[600px] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      Content
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-2xl flex flex-col gap-6">
       

          {/* Main Heading */}
          <h1 className="font-display font-bold text-[52px] leading-[64px] text-white">
            Find the Awesome Saloon's Near you
          </h1>

          {/* Description */}
          <p className="font-body font-normal text-[16px] leading-[24px] text-white max-w-xl">
            Hair and SPA Salons fully integrated with theme tools that you can
            use for the promotion of your business.
          </p>

          {/* CTA Button */}
          <div className="mt-4">
            <button className="bg-white hover:bg-gray-100 transition-colors box-border flex gap-2 items-center justify-center px-6 py-3 rounded-md group">
              <span className="font-body font-medium text-[16px] leading-[24px] text-neutral-black">
                Get Started
              </span>
             <div className="size-4 group-hover:translate-x-1 transition-transform">
                  <ArrowCircleRight />
                </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const PublicSalonListing = () => {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  
  // Location-based search state
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(10); // Default 10km radius

  // RTK Query hooks - automatic caching and deduplication!
  const { data: salonsData, isLoading: salonsLoading, error: salonsError } = useGetSalonsQuery(
    {}, 
    { skip: isSearching } // Skip when searching
  );
  
  const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchSalonsQuery(
    searchParams,
    { skip: !isSearching || !searchParams } // Only run when actively searching
  );

  /**
   * getUserLocation - Request user's current location using Browser Geolocation API
   */
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserLocation(location);
        setLocationLoading(false);
        
        // Trigger search with location
        setIsSearching(true);
        setSearchParams({
          lat: location.lat,
          lon: location.lon,
          radius: radius,
          limit: 50,
          query: searchTerm || undefined,
        });
      },
      (error) => {
        let errorMsg = "Unable to get your location";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out.";
            break;
        }
        setLocationError(errorMsg);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  /**
   * clearLocation - Clear user location and return to showing all salons
   */
  const clearLocation = () => {
    setUserLocation(null);
    setLocationError(null);
    setIsSearching(false);
    setSearchParams(null);
  };

  /**
   * handleRadiusChange - Update search radius and re-search if location is active
   */
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userLocation) {
      setIsSearching(true);
      setSearchParams({
        lat: userLocation.lat,
        lon: userLocation.lon,
        radius: newRadius,
        limit: 50,
        query: searchTerm || undefined,
      });
    }
  };

  /**
   * handleSearch - Triggers search or resets to all salons
   */
  const handleSearch = () => {
    if (searchTerm.trim() || userLocation) {
      setIsSearching(true);
      setSearchParams({
        query: searchTerm || undefined,
        location: selectedCity !== "all" ? selectedCity : undefined,
        lat: userLocation?.lat,
        lon: userLocation?.lon,
        radius: userLocation ? radius : undefined,
      });
    } else {
      setIsSearching(false);
      setSearchParams(null);
    }
  };

  // Get display salons (search results or all salons)
  const salons = salonsData?.salons || [];
  const searchResults = searchData?.salons || [];
  const displaySalons = isSearching ? searchResults : salons;
  const loading = salonsLoading || searchLoading;
  const error = salonsError || searchError;

  // Extract cities from salons
  const cities = [
    "all",
    ...new Set(displaySalons.map((salon) => salon.city).filter(Boolean)),
  ];

  // Filter by city
  const filteredSalons = displaySalons.filter((salon) => {
    const matchesCity =
      selectedCity === "all" || salon.city === selectedCity;
    return matchesCity;
  });

  return (
    <div className="min-h-screen bg-white font-body">
      <PublicNavbar />

      <HeroSection />

   

      <section className="py-12 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          {/* Location Status Banner */}
          {userLocation && !locationError && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <FiMapPin className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    📍 Showing salons near your location
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Within {radius}km radius • {filteredSalons.length} salon{filteredSalons.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <button
                onClick={clearLocation}
                className="text-green-700 hover:text-green-900 hover:bg-green-100 p-2 rounded-lg transition-colors"
                aria-label="Clear location"
              >
                <FiX className="size-5" />
              </button>
            </div>
          )}

          {/* Location Error Banner */}
          {locationError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-2 mt-0.5">
                  <FiMapPin className="size-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Location Access Error
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {locationError}
                  </p>
                  <button
                    onClick={getUserLocation}
                    className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            {/* Row 1: Search input, City filter, Location button, Search button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search salons by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full h-[48px] px-4 py-3 font-body text-[16px] leading-[24px] text-neutral-black placeholder:text-neutral-gray-400 border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange transition-all outline-none"
                />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-[48px] px-4 py-3 font-body text-[16px] leading-[24px] text-neutral-black border border-neutral-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-accent-orange transition-all outline-none cursor-pointer bg-white"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "All Cities" : city}
                  </option>
                ))}
              </select>
              <button
                onClick={getUserLocation}
                disabled={locationLoading || userLocation}
                className={`h-[48px] px-6 py-3 rounded-lg transition-colors font-body font-semibold text-[16px] leading-[24px] flex items-center gap-2 whitespace-nowrap ${
                  userLocation
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-neutral-gray-400 text-primary-white hover:bg-neutral-black/80 active:bg-neutral-black'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Getting Location...
                  </>
                ) : userLocation ? (
                  <>
                    <FiMapPin className="size-5" />
                    Location Active
                  </>
                ) : (
                  <>
                    <FiNavigation className="size-5" />
                    Use My Location
                  </>
                )}
              </button>
              <button
                onClick={handleSearch}
                className="h-[48px] px-6 py-3 bg-accent-orange text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors font-body font-semibold text-[16px] leading-[24px]"
              >
                Search
              </button>
            </div>

            {/* Row 2: Radius selector (only show when location is active) */}
            {userLocation && (
              <div className="flex items-center gap-3 bg-white border border-neutral-gray-300 rounded-lg p-4">
                <FiMapPin className="size-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Search Radius:</span>
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map((km) => (
                    <button
                      key={km}
                      onClick={() => handleRadiusChange(km)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        radius === km
                          ? 'bg-accent-orange text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-body text-[18px] leading-[26px] text-neutral-gray-600">Loading salons...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredSalons.map((salon) => {
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
                  <Link
                    key={salon.id}
                    to={`/salons/${salon.id}`}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group block"
                  >
                    {/* Image Section - Show Logo or Cover Image */}
                    <div className="relative h-[300px] w-full overflow-hidden">
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
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white shadow-lg px-4 py-2 rounded-full flex items-center gap-2">
                        <FiStar className="text-yellow-500" fill="#FFC107" size={18} />
                        <span className="font-bold text-neutral-black text-lg">
                          {salon.average_rating || '4.5'}
                        </span>
                      </div>
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
                      <div className="flex items-center gap-3">
                        <FiClock className="text-accent-orange flex-shrink-0" size={18} />
                        <p className="font-body text-[15px] leading-[22px] text-neutral-gray-700">
                          {hoursDisplay}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && filteredSalons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl text-neutral-gray-400">
                No salons found matching your criteria
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicSalonListing;
