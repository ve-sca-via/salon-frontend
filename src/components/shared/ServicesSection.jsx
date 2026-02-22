import { useState, useEffect } from "react";
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

// Header with Scissors Icon and Lines
function Header() {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Our Services
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          A featured services marketplace typically offers a platform where
          various service providers
        </p>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }) {
  return (
    <div className="w-full">
      <div className="relative w-full aspect-square lg:aspect-auto lg:h-[380px] lg:max-w-[280px] rounded-[10px] overflow-hidden group cursor-pointer">
        {/* Service Image */}
        <img
          src={service.image}
          alt={service.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Service Info - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex absolute bottom-0 left-0 right-0 flex-col items-center gap-2 p-6">
          {/* Icon */}
          <div className="mb-2">{service.icon}</div>

          {/* Service Name */}
          <h3 className="font-body font-semibold text-[20px] leading-[32px] text-white">
            {service.name}
          </h3>

          {/* COMMENTED OUT - Salon count not yet implemented
          <p className="font-body font-normal text-[16px] leading-[24px] text-white">
            {service.count}
          </p>
          */}
        </div>
      </div>
      
      {/* Service Name Below Card - Mobile Only */}
      <h3 className="lg:hidden font-body font-medium text-[16px] leading-[24px] text-neutral-black text-center mt-2">
        {service.name}
      </h3>
    </div>
  );
}

// Navigation Arrow Icons
function ArrowIcon({ direction, isActive }) {
  const fillColor = isActive ? "#F89C02" : "#242B3A";

  return (
    <div className="relative size-[24px]">
      <svg className="block size-full" fill="none" viewBox="0 0 24 24">
        <path
          d="M9 18l6-6-6-6"
          stroke={fillColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={direction === "left" ? "rotate(180 12 12)" : ""}
        />
      </svg>
    </div>
  );
}

// Navigation Button
function NavigationButton({ direction, onClick, isActive }) {
  const lineColor = isActive ? "bg-accent-orange" : "bg-neutral-black";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
    >
      {direction === "left" && (
        <>
          <div className={`h-[2px] w-[36px] ${lineColor}`}></div>
          <ArrowIcon direction="left" isActive={isActive} />
        </>
      )}
      {direction === "right" && (
        <>
          <ArrowIcon direction="right" isActive={isActive} />
          <div className={`h-[2px] w-[36px] ${lineColor}`}></div>
        </>
      )}
    </button>
  );
}

export default function ServicesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const services = [
    {
      name: "Bridal",
      count: "25 Saloons",
      image: "/home/our_services/Bridal.png",
      icon: (
        <div className="flex items-center justify-center relative w-[45px] h-[45px]">
          <svg
            className="block size-full"
            fill="none"
            viewBox="0 0 45 45"
          >
            <g>
              {/* Bridal/Crown icon */}
              <path d="M22.5 8L25 15L30 13L27 20L33 22L27 24L30 31L25 29L22.5 36L20 29L15 31L18 24L12 22L18 20L15 13L20 15L22.5 8Z" fill="white" />
              <circle cx="22.5" cy="22.5" r="2" fill="white" />
            </g>
          </svg>
        </div>
      ),
    },
    {
      name: "Parlour",
      count: "25 Saloons",
      image: "/home/our_services/Girls_Parlour.png",
      icon: (
        <div className="flex items-center justify-center relative w-[32px] h-[49px]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 32 49"
          >
            <g>
              {/* Hair/Beauty icon */}
              <path d={svgPaths.p1eae4c80} fill="white" />
              <path d={svgPaths.p8ed75c0} fill="white" />
              <path d={svgPaths.p34fbc400} fill="white" />
            </g>
          </svg>
        </div>
      ),
    },
    {
      name: "Mens",
      count: "25 Saloons",
      image: "/home/our_services/Mens.png",
      icon: (
        <div className="flex items-center justify-center relative size-[45px]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 45 45"
          >
            <g>
              {/* Razor/Shaving icon */}
              <path d={svgPaths.p30bcd800} fill="white" />
              <path d={svgPaths.p3b24f500} fill="white" />
              <path d={svgPaths.p2f100240} fill="white" />
              <path d={svgPaths.p76e1c00} fill="white" />
            </g>
          </svg>
        </div>
      ),
    },
    {
      name: "Spa",
      count: "25 Saloons",
      image: "/home/our_services/Spa.png",
      icon: (
        <div className="flex items-center justify-center relative w-[45px] h-[45px]">
          <svg
            className="block size-full"
            fill="none"
            viewBox="0 0 45 45"
          >
            <g>
              {/* Spa lotus/flower icon */}
              <circle cx="22.5" cy="22.5" r="4" fill="white" />
              <ellipse cx="22.5" cy="15" rx="5" ry="7" fill="white" opacity="0.8" />
              <ellipse cx="22.5" cy="30" rx="5" ry="7" fill="white" opacity="0.8" />
              <ellipse cx="15" cy="22.5" rx="7" ry="5" fill="white" opacity="0.8" />
              <ellipse cx="30" cy="22.5" rx="7" ry="5" fill="white" opacity="0.8" />
              <ellipse cx="17" cy="17" rx="4" ry="6" fill="white" opacity="0.6" transform="rotate(-45 17 17)" />
              <ellipse cx="28" cy="17" rx="4" ry="6" fill="white" opacity="0.6" transform="rotate(45 28 17)" />
              <ellipse cx="17" cy="28" rx="4" ry="6" fill="white" opacity="0.6" transform="rotate(45 17 28)" />
              <ellipse cx="28" cy="28" rx="4" ry="6" fill="white" opacity="0.6" transform="rotate(-45 28 28)" />
            </g>
          </svg>
        </div>
      ),
    },
  ];

  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(4); // Desktop: show all 4
      } else if (window.innerWidth >= 640) {
        setItemsPerPage(4); // Tablet: show all 4
      } else {
        setItemsPerPage(4); // Mobile: show all 4 in 2x2 grid
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const visibleServices = services.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="w-full py-8 md:py-16 bg-bg-secondary">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col gap-6 md:gap-10 items-center">
          <Header />

          {/* Services Carousel/Grid */}
          <div 
            className="w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full px-4 sm:px-0 place-items-center justify-center">
              {visibleServices.map((service, index) => (
                <ServiceCard key={index} service={service} />
              ))}
            </div>
          </div>

          {/* Navigation Controls - Show only when carousel is active */}
          {totalPages > 1 && (
            <div className="flex gap-4 items-center">
              <NavigationButton
                direction="left"
                onClick={handlePrevious}
                isActive={false}
              />
              <NavigationButton
                direction="right"
                onClick={handleNext}
                isActive={true}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
