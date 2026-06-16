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

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBannersQuery } from "../../services/api/bannerApi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import SearchBox from "../../components/shared/SearchBox";
import ServicesSection from "../../components/shared/ServicesSection";
import FeaturedSaloons from "../../components/shared/FeaturedSaloons";
import PopularLocations from "../../components/shared/PopularLocations";
import WhyChooseUs from "../../components/shared/WhyChooseUs";
import ClientTestimonials from "../../components/shared/ClientTestimonials";
import InstagramFeed from "../../components/shared/InstagramFeed";
import UserQuickDashboard from "../../components/shared/UserQuickDashboard";
import FeaturedProducts from "../../components/shared/FeaturedProducts";
import ProductCatalog from "../../components/shared/ProductCatalog";
// Carousel items
import carouselImg1 from "../../assets/images/website pic 1.png";
import carouselImg2 from "../../assets/images/website pic 2.png";
import carouselVideo3 from "../../assets/images/website pic 3.mp4";

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
 * SlideMedia - Renders a single carousel item (image or video), wrapping it in a
 * link when the item carries one. Admin-managed banners may include a `link_url`:
 * http(s) links open in a new tab, anything else is treated as an in-app route.
 */
function SlideMedia({ item, index }) {
  const media =
    item.type === 'video' ? (
      <video
        src={item.src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    ) : (
      <img
        src={item.src}
        alt={item.title || `Salon background ${index + 1}`}
        className="w-full h-full object-cover"
      />
    );

  if (!item.link) return media;

  const isExternal = /^https?:\/\//i.test(item.link);
  return isExternal ? (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full h-full"
    >
      {media}
    </a>
  ) : (
    <Link to={item.link} className="block w-full h-full">
      {media}
    </Link>
  );
}

/**
 * HeroSection - Main carousel section with rotating items
 * Features:
 * - Renders admin-managed banners (GET /api/v1/banners) when available, falling
 *   back to the bundled images/video while loading or when no banners are set
 * - Banners with a `link_url` are clickable (external or in-app route)
 * - Auto-rotates every 5 seconds; manual nav via arrows and dot indicators
 * - Crossfade transition effect
 */
function HeroSection() {
  const { data: bannerData } = useGetBannersQuery();

  // Bundled fallback shown while loading or when no banners are configured.
  const fallbackItems = useMemo(
    () => [
      { type: 'image', src: carouselImg1 },
      { type: 'image', src: carouselImg2 },
      { type: 'video', src: carouselVideo3 },
    ],
    []
  );

  // Server returns active, in-window banners ordered by sort_order.
  const carouselItems = useMemo(() => {
    const banners = bannerData?.banners;
    if (banners && banners.length > 0) {
      return banners.map((b) => ({
        type: 'image',
        src: b.image_url,
        link: b.link_url,
        title: b.title,
      }));
    }
    return fallbackItems;
  }, [bannerData, fallbackItems]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);
  const itemCount = carouselItems.length;

  // Keep the active index in range if the item set changes (banners load in).
  useEffect(() => {
    setCurrentImageIndex((prev) => (prev >= itemCount ? 0 : prev));
  }, [itemCount]);

  /**
   * Auto-rotate carousel images every 5 seconds
   * Uses useRef to prevent interval from recreating on each render
   * Cleanup interval on component unmount
   */
  useEffect(() => {
    if (itemCount <= 1) return undefined;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % itemCount);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [itemCount]); // Re-arm when the item set changes (banners load in)

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
          (prevIndex + 1) % carouselItems.length
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
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
    // Reset interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carouselItems.length
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
      (prevIndex + 1) % carouselItems.length
    );
    // Reset interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carouselItems.length
        );
      }, 5000);
    }
  };

  return (
    <section className="relative w-full h-[220px] md:h-[600px] overflow-hidden">
      {/* Carousel Items with Crossfade Transition */}
      {carouselItems.map((item, index) => (
        <div
          key={item.src || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <SlideMedia item={item} index={index} />
        </div>
      ))}

      {/* Previous Slide Button */}
      <button
        onClick={goToPrevious}
        className="flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 md:p-3 rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous image"
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform"
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
        className="flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 md:p-3 rounded-full transition-all group focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next image"
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform"
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
      <div className="flex absolute bottom-4 md:bottom-24 left-1/2 -translate-x-1/2 z-30 gap-1.5 md:gap-2">
        {carouselItems.map((_, index) => (
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

      {/* Hero Content — buttons only, text removed since it's in the images */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-end pb-10 md:pb-24 z-30 pointer-events-none">
        <div className="max-w-2xl flex flex-col gap-3 md:gap-6">
          {/* CTA Buttons — hidden on mobile */}
          <div className="hidden md:flex gap-4 mt-4 pointer-events-auto">
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

          {/* Mobile CTA — smaller buttons for mobile */}
          <div className="flex md:hidden gap-2 pointer-events-auto">
            <Link to="/signup">
              <button className="bg-white hover:bg-gray-100 transition-colors flex gap-1 items-center justify-center px-3 py-1.5 rounded-md group focus:outline-none focus:ring-2 focus:ring-white/50">
                <span className="font-body font-medium text-[11px] leading-[16px] text-neutral-black">
                  Get Started
                </span>
                <div className="size-2.5 group-hover:translate-x-0.5 transition-transform">
                  <ArrowCircleRight />
                </div>
              </button>
            </Link>
            <Link to="/salons">
              <button className="bg-transparent border border-white hover:bg-white/10 transition-colors flex items-center justify-center px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50">
                <span className="font-body font-medium text-[11px] leading-[16px] text-white">
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
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-white font-body">
      <PublicNavbar />

      {/* Hero carousel with CTA */}
      <HeroSection />

      {/* Dynamic Section: Search Box (Unauthenticated) or Dashboard (Authenticated) */}
      {isAuthenticated ? <UserQuickDashboard /> : <SearchBox />}

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Service categories */}
      <ServicesSection />

      {/* Products Catalog */}
      <ProductCatalog />

      {/* Top-rated salons */}
      <FeaturedSaloons />

      {/* Popular service locations */}
      <PopularLocations />

      {/* Benefits section */}
      <WhyChooseUs />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Customer reviews */}
      <ClientTestimonials />

      {/* Bottom CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Experience Beauty, Simplified?
          </h2>
          <p className="text-xl mb-8 text-neutral-gray-200">
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
