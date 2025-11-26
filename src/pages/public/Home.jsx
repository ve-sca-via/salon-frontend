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

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import SearchBox from "../../components/shared/SearchBox";
import ServicesSection from "../../components/shared/ServicesSection";
import FeaturedSaloons from "../../components/shared/FeaturedSaloons";
import PopularLocations from "../../components/shared/PopularLocations";
import WhyChooseUs from "../../components/shared/WhyChooseUs";
import ClientTestimonials from "../../components/shared/ClientTestimonials";
import bg1 from "../../assets/images/bg_1.jpg";
import bg2 from "../../assets/images/bg_2.jpg";
import bg3 from "../../assets/images/bg_3.jpg";
import bg4 from "../../assets/images/bg_4.jpg";
import bg5 from "../../assets/images/bg_5.jpg";
import bg6 from "../../assets/images/bg_6.jpg";

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
 * - 6 background images rotating every 9 seconds
 * - Manual navigation via arrows and dot indicators
 * - Crossfade transition effect
 * - Responsive layout with overlay for text readability
 */
function HeroSection() {
  const backgroundImages = [bg1, bg2, bg3, bg4, bg5, bg6];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * Auto-rotate carousel images every 9 seconds
   * Cleanup interval on component unmount
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 9000);

    return () => clearInterval(interval);
  }, []); // Empty dependency - backgroundImages is constant

  /**
   * goToSlide - Jump to specific slide via dot indicator
   */
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  /**
   * goToPrevious - Navigate to previous slide (wraps to last)
   */
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
  };

  /**
   * goToNext - Navigate to next slide (wraps to first)
   */
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % backgroundImages.length
    );
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Background Images with Crossfade Transition */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex
              ? "opacity-100 z-10"
              : "opacity-0 z-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={`Salon background ${index + 1}`}
        />
      ))}

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
