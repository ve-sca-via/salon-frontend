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

// Hero Section Component with Carousel
function HeroSection() {
  const backgroundImages = [bg1, bg2, bg3, bg4, bg5, bg6];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 9000); // Change image every 9 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
  };

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
        />
      ))}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-20"></div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all group"
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

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all group"
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

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentImageIndex
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center z-30">
        <div className="max-w-2xl flex flex-col gap-6">
          
          

          {/* Main Heading */}
          <h1 className="font-display font-bold text-[52px] leading-[64px] text-white">
            Your Beauty, Our Priority
          </h1>

          {/* Description */}
          <p className="font-body font-normal text-[16px] leading-[24px] text-white max-w-xl">
            Book appointments with top-rated salons in your area. Hair and SPA
            Salons fully integrated with easy booking system.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-4">
            <Link to="/signup">
              <button className="bg-white hover:bg-gray-100 transition-colors box-border flex gap-2 items-center justify-center px-6 py-3 rounded-md group">
                <span className="font-body font-medium text-[16px] leading-[24px] text-neutral-black">
                  Get Started
                </span>
                <div className="size-4 group-hover:translate-x-1 transition-transform">
                  <ArrowCircleRight />
                </div>
              </button>
            </Link>
            <Link to="/salons">
              <button className="bg-transparent border-2 border-white hover:bg-white/10 transition-colors box-border flex gap-2 items-center justify-center px-6 py-3 rounded-md">
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

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-body">
      <PublicNavbar />

      <HeroSection />

      <SearchBox />

      <ServicesSection />

      <FeaturedSaloons />

      <PopularLocations />

      <WhyChooseUs />

      <ClientTestimonials />

      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Transform Your Look?
          </h2>
          <p className="text-xl mb-8 text-neutral-gray-500">
            Join thousands of happy customers who trust SalonHub
          </p>
          <Link
            to="/signup"
            className="bg-gradient-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition shadow-xl inline-block"
          >
            Sign Up Now - It's Free!
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
