import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Figma node 3:1746 — Hero Section (350×220 @1x, export @2x)
 * Pixel-perfect export; text left, golden visual right, Shop Now CTA.
 * https://www.figma.com/design/tdkk9FHNGGtFS92PWnYAMJ/Untitled?node-id=3-1732
 */
export const VENDOR_HERO_BANNER_SRC = '/vendor/vendor-hero-banner.png';

const VendorHeroBanner = () => (
  <section className="relative w-full aspect-[350/220] max-h-none rounded-[32px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <img
      src={VENDOR_HERO_BANNER_SRC}
      alt="Salon Products, Delivered — luxury haircare and salon favorites"
      className="absolute inset-0 h-full w-full object-cover object-center"
      width={350}
      height={220}
      loading="eager"
      decoding="async"
    />
    {/* Figma Button 3:1755 — 121×36, aligned under copy on the left */}
    <Link
      to="/products"
      className="absolute left-[6.9%] bottom-[15.5%] z-10 h-9 w-[34.6%] max-w-[121px] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C28B2C] focus-visible:ring-offset-2"
      aria-label="Shop Now"
    />
  </section>
);

export default VendorHeroBanner;
