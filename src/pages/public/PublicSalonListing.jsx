import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import bgImage from "../../assets/images/bg_7.jpg";
import { useGetSalonsQuery, useSearchSalonsQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  // RTK Query hooks - automatic caching and deduplication!
  const { data: salonsData, isLoading: salonsLoading, error: salonsError } = useGetSalonsQuery(
    {}, 
    { skip: isSearching } // Skip when searching
  );
  
  const { data: searchData, isLoading: searchLoading, error: searchError } = useSearchSalonsQuery(
    searchParams,
    { skip: !isSearching || !searchParams } // Only run when actively searching
  );

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      setSearchParams({
        query: searchTerm,
        location: selectedCity !== "all" ? selectedCity : undefined,
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
          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
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
              onClick={handleSearch}
              className="h-[48px] px-6 py-3 bg-accent-orange text-white rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors font-body font-semibold text-[16px] leading-[24px]"
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-body text-[18px] leading-[26px] text-neutral-gray-600">Loading salons...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredSalons.map((salon) => {
                // Parse images from JSONB if available
                let coverImage = salon.cover_image_url;
                let businessHours = {};
                
                // Parse business hours if available
                if (salon.business_hours && typeof salon.business_hours === 'object') {
                  businessHours = salon.business_hours;
                }
                
                // Get today's hours (example: Monday)
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const todayHours = businessHours[today] || businessHours.monday || {};
                const hoursDisplay = todayHours.closed 
                  ? 'Closed' 
                  : todayHours.open && todayHours.close
                  ? `${todayHours.open} - ${todayHours.close}`
                  : '9:00 AM - 9:00 PM';

                return (
                  <Link
                    key={salon.id}
                    to={`/salons/${salon.id}`}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group block"
                  >
                    {/* Image Section */}
                    <div className="relative h-[300px] w-full overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={salon.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                        <p className="font-body text-[15px] leading-[22px] text-neutral-gray-700">
                          {salon.address || `${salon.city}, ${salon.state}`}
                        </p>
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
