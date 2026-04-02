import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSalonsQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiClock, FiCalendar } from "react-icons/fi";
import { SkeletonSalonCard } from "./Skeleton";
import { SalonCard, MobileSalonCard } from "./SalonCard";
import svgPaths from "../../utils/svgPaths";


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

