/**
 * Home Component
 * 
 * Purpose:
 * Landing page of the application serving as the main entry point for new visitors.
 * Features a hero carousel showcasing salon imagery, service categories, featured salons,
 * location search, testimonials, and multiple call-to-action sections.
 * 
 * Key Features:
 * - Auto-rotating hero carousel (6 images, 9-second intervals)
 * - Manual carousel navigation (prev/next arrows, dot indicators)
 * - Service categories section
 * - Featured salons showcase
 * - Popular locations
 * - Why choose us section
 * - Client testimonials
 * - Bottom CTA section
 * 
 * User Flow:
 * 1. User lands on home page with hero carousel
 * 2. Views service categories and featured salons
 * 3. Can search by location or browse salons
 * 4. Sign up or explore without account
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import SearchBox from "../../components/shared/SearchBox";
import ServicesSection from "../../components/shared/ServicesSection";
import FeaturedSaloons from "../../components/shared/FeaturedSaloons";
import PopularLocations from "../../components/shared/PopularLocations";
import WhyChooseUs from "../../components/shared/WhyChooseUs";
import ClientTestimonials from "../../components/shared/ClientTestimonials";
// Preload first 2 carousel images for immediate display
import bg1Mobile from "../../assets/images/optimized/bg_1_mobile.webp";
import bg1Tablet from "../../assets/images/optimized/bg_1_tablet.webp";
import bg1Desktop from "../../assets/images/optimized/bg_1_desktop.webp";
import bg2Mobile from "../../assets/images/optimized/bg_2_mobile.webp";
import bg2Tablet from "../../assets/images/optimized/bg_2_tablet.webp";
import bg2Desktop from "../../assets/images/optimized/bg_2_desktop.webp";

/**
 * ArrowCircleRight - Simple arrow icon for CTA buttons
 * SVG component for visual emphasis on action buttons
 */
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

/**
 * HeroSection - Main carousel section with rotating background images
 * Features:
 * - 6 background images rotating every 5 seconds (industry standard)
 * - Manual navigation via arrows and dot indicators
 * - Crossfade transition effect
 * - Responsive layout with overlay for text readability
 * - Optimized WebP images with lazy loading (first 2 preloaded, rest lazy loaded)
 */
function HeroSection() {
  // Lazy load remaining images (3-6) to improve initial page load
  const backgroundImages = [
    { mobile: bg1Mobile, tablet: bg1Tablet, desktop: bg1Desktop },
    { mobile: bg2Mobile, tablet: bg2Tablet, desktop: bg2Desktop },
    { 
      mobile: () => import("../../assets/images/optimized/bg_3_mobile.webp"),
      tablet: () => import("../../assets/images/optimized/bg_3_tablet.webp"),
      desktop: () => import("../../assets/images/optimized/bg_3_desktop.webp")
    },
    { 
      mobile: () => import("../../assets/images/optimized/bg_4_mobile.webp"),
      tablet: () => import("../../assets/images/optimized/bg_4_tablet.webp"),
      desktop: () => import("../../assets/images/optimized/bg_4_desktop.webp")
    },
    { 
      mobile: () => import("../../assets/images/optimized/bg_5_mobile.webp"),
      tablet: () => import("../../assets/images/optimized/bg_5_tablet.webp"),
      desktop: () => import("../../assets/images/optimized/bg_5_desktop.webp")
    },
    { 
      mobile: () => import("../../assets/images/optimized/bg_6_mobile.webp"),
      tablet: () => import("../../assets/images/optimized/bg_6_tablet.webp"),
      desktop: () => import("../../assets/images/optimized/bg_6_desktop.webp")
    },
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const [loadedImages, setLoadedImages] = useState({});
  const intervalRef = useRef(null);

  /**
   * Get responsive background image based on screen width
   */
  const getResponsiveImage = async (images) => {
    const width = window.innerWidth;
    let imageKey, imageImport;
    
    if (width < 768) {
      imageKey = 'mobile';
      imageImport = images.mobile;
    } else if (width < 1024) {
      imageKey = 'tablet';
      imageImport = images.tablet;
    } else {
      imageKey = 'desktop';
      imageImport = images.desktop;
    }
    
    // If it's a lazy-loaded image (function), load it
    if (typeof imageImport === 'function') {
      const module = await imageImport();
      return module.default;
    }
    
    // Already loaded image (string)
    return imageImport;
  };

  /**
   * Preload next image for smooth transitions
   */
  const preloadNextImage = async (index) => {
    const nextIndex = (index + 1) % backgroundImages.length;
    const imageSet = backgroundImages[nextIndex];
    const imageUrl = await getResponsiveImage(imageSet);
    
    if (!loadedImages[nextIndex]) {
      setLoadedImages(prev => ({ ...prev, [nextIndex]: imageUrl }));
    }
  };

  /**
   * Update background image when screen resizes or image changes
   * Also preload the next image for smooth transitions
   */
  useEffect(() => {
    const updateImage = async () => {
      const imageUrl = await getResponsiveImage(backgroundImages[currentImageIndex]);
      setCurrentBgImage(imageUrl);
      
      // Preload next image in background
      preloadNextImage(currentImageIndex);
    };
    
    updateImage();
    window.addEventListener('resize', updateImage);
    return () => window.removeEventListener('resize', updateImage);
  }, [currentImageIndex]);

  const [_, __] = useState(0); // Placeholder for removed state

  /**
   * Auto-rotate carousel images every 5 seconds (industry standard)
   * Uses useRef to prevent interval from recreating on each render
   * Cleanup interval on component unmount
   */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Changed from 9000ms to 5000ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency - backgroundImages is constant

  /**
   * goToSlide - Jump to specific slide via dot indicator
   * Clears and restarts the auto-rotation interval
   */
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
    // Reset interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
      }, 5000);
    }
  };

  /**
   * goToPrevious - Navigate to previous slide (wraps to last)
   * Resets auto-rotation interval
   */
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
    // Reset interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
      }, 5000);
    }
  };

  /**
   * goToNext - Navigate to next slide (wraps to first)
   * Resets auto-rotation interval
   */
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % backgroundImages.length
    );
    // Reset interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
      }, 5000);
    }
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Background Images with Crossfade Transition - Lazy loaded after first 2 */}
      {currentBgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out opacity-100 z-10"
          style={{ backgroundImage: `url(${currentBgImage})` }}
          role="img"
          aria-label={`Salon background ${currentImageIndex + 1}`}
        />
      )}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-20"></div>

      {/* Previous Slide Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous image"
      >
        <svg
          className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Next Slide Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next image"
      >
        <svg
          className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Carousel Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
              index === currentImageIndex
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentImageIndex ? "true" : "false"}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center z-30">
        <div className="max-w-2xl flex flex-col gap-6">
          {/* Main Heading */}
          <h1 className="font-display font-bold text-[52px] leading-[64px] text-white">
            Beauty. Booking. Simplified.
          </h1>

          {/* Description */}
          <p className="font-body font-normal text-[16px] leading-[24px] text-white max-w-xl">
            Discover verified salons, check real-time availability, and book appointments 
            within seconds. No calls, no confusion — just a delightful booking experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-4">
            <Link to="/signup">
              <button className="bg-white hover:bg-gray-100 transition-colors box-border flex gap-2 items-center justify-center px-6 py-3 rounded-md group focus:outline-none focus:ring-2 focus:ring-white/50">
                <span className="font-body font-medium text-[16px] leading-[24px] text-neutral-black">
                  Get Started
                </span>
                <div className="size-4 group-hover:translate-x-1 transition-transform">
                  <ArrowCircleRight />
                </div>
              </button>
            </Link>
            <Link to="/salons">
              <button className="bg-transparent border-2 border-white hover:bg-white/10 transition-colors box-border flex gap-2 items-center justify-center px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50">
                <span className="font-body font-medium text-[16px] leading-[24px] text-white">
                  Browse Salons
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Home - Main landing page component
 * Composes multiple sections into a cohesive landing experience
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-white font-body">
      <PublicNavbar />

      {/* Hero carousel with CTA */}
      <HeroSection />

      {/* Location-based search */}
      <SearchBox />

      {/* Service categories */}
      <ServicesSection />

      {/* Top-rated salons */}
      <FeaturedSaloons />

      {/* Popular service locations */}
      <PopularLocations />

      {/* Benefits section */}
      <WhyChooseUs />

      {/* Customer reviews */}
      <ClientTestimonials />

      {/* Bottom CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Experience Beauty, Simplified?
          </h2>
          <p className="text-xl mb-8 text-neutral-gray-500">
            Join thousands who trust Lubist for stress-free salon bookings
          </p>
          <Link
            to="/salons"
            className="bg-accent-orange hover:opacity-90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-xl inline-block focus:outline-none focus:ring-2 focus:ring-accent-orange/50"
          >
            Explore Salons Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
