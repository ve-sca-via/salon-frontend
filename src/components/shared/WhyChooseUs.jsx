import React, { useEffect, useMemo, useRef, useState } from "react";
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
    <div className="flex flex-col gap-3 items-center w-full mb-8 md:mb-10">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] text-neutral-black">
          Why Choose Lubist?
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[44px] bg-neutral-black/80"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[44px] bg-neutral-black/80"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[14px] leading-[22px] md:text-[16px] md:leading-[24px] text-neutral-gray-700 text-center max-w-[560px] mt-1">
          Making beauty and wellness accessible, reliable, and delightful for everyone
        </p>
      </div>
    </div>
  );
}

// Feature Icons
function SearchIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <circle cx="26" cy="26" r="18" stroke="#F89C02" strokeWidth="4" />
      <line
        x1="40"
        y1="40"
        x2="54"
        y2="54"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <rect
        x="10"
        y="14"
        width="44"
        height="40"
        rx="4"
        stroke="#F89C02"
        strokeWidth="4"
      />
      <line x1="10" y1="24" x2="54" y2="24" stroke="#F89C02" strokeWidth="4" />
      <line
        x1="20"
        y1="10"
        x2="20"
        y2="18"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="44"
        y1="10"
        x2="44"
        y2="18"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <polyline
        points="24,36 28,40 40,30"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 8L37.6 24.8H55.2L41.6 35.2L47.2 52L32 41.6L16.8 52L22.4 35.2L8.8 24.8H26.4L32 8Z"
        stroke="#F89C02"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 10C22 10 14 18 14 28C14 42 32 54 32 54C32 54 50 42 50 28C50 18 42 10 32 10Z"
        stroke="#F89C02"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="28"
        r="6"
        stroke="#F89C02"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradientClassName }) {
  return (
    <div
      className={`relative p-6 md:p-8 rounded-[18px] bg-white shadow-[0_18px_45px_rgba(24,39,75,0.08)] ring-1 ring-black/5 text-center overflow-hidden group ${gradientClassName}`}
    >
      {/* Corner glows */}
      <div
        className="absolute inset-0 pointer-events-none opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(260px 190px at 0% 0%, rgba(248,156,2,0.52) 0%, rgba(248,156,2,0.0) 70%), radial-gradient(260px 190px at 100% 0%, rgba(255,199,44,0.52) 0%, rgba(255,199,44,0.0) 70%)",
        }}
      />

      {/* Dotted gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.85]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(248,156,2,0.34) 0%, rgba(248,156,2,0) 62%), radial-gradient(circle at 100% 0%, rgba(255,199,44,0.34) 0%, rgba(255,199,44,0) 62%), radial-gradient(circle, rgba(248,156,2,0.34) 1.05px, rgba(255,255,255,0) 1.8px)",
          backgroundSize: "auto, auto, 14px 14px",
          backgroundPosition: "top left, top right, top left",
        }}
      />

      {/* subtle inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/40 pointer-events-none opacity-60" />
      <div className="relative mb-4 transform group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="relative font-body font-semibold text-[18px] leading-[26px] md:text-[22px] md:leading-[30px] text-neutral-black mb-2">
        {title}
      </h3>
      <p className="relative font-body font-normal text-[14px] leading-[22px] md:text-[16px] md:leading-[24px] text-neutral-gray-700">
        {description}
      </p>
    </div>
  );
}

export default function WhyChooseUs() {
  const features = useMemo(
    () => [
      {
        icon: <SearchIcon />,
        title: "Discover Verified Salons",
        description:
          "Find trusted, verified salons near you with authentic reviews and real-time availability",
        gradientClassName: "",
      },
      {
        icon: <CalendarCheckIcon />,
        title: "Book in Seconds",
        description:
          "No calls, no confusion. Book appointments instantly and manage them easily online",
        gradientClassName: "",
      },
      {
        icon: <StarIcon />,
        title: "Compare & Choose",
        description:
          "Compare services, prices, and reviews to make the best decision for your needs",
        gradientClassName: "",
      },
      {
        icon: <MapPinIcon />,
        title: "Stress-Free Experience",
        description:
          "Remove waiting lines and uncertainty with our simple, fast booking platform",
        gradientClassName: "",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % features.length);
        setIsVisible(true);
      }, 450);
    }, 3800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [features.length]);

  return (
    <section className="w-full py-10 md:py-14 bg-bg-secondary">
      <div className="max-w-[1320px] mx-auto px-4">
        <Header />

        {/* Single-card carousel */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-5xl">
            <div
              className={`transition-opacity duration-500 ease-in-out ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[0, 1].map((offset) => {
                  const idx = (activeIndex + offset) % features.length;
                  const f = features[idx];
                  return (
                    <FeatureCard
                      key={idx}
                      icon={f.icon}
                      title={f.title}
                      description={f.description}
                      gradientClassName={f.gradientClassName}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Circular indicators */}
          <div className="mt-5 flex items-center gap-2">
            {features.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-accent-orange scale-110"
                    : "bg-neutral-gray-300"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
