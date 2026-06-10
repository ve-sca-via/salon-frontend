import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

/**
 * Figma node 3:1746 — Hero Section (350×220 @1x)
 * Mobile: full composite banner. Desktop: HTML copy + gold visual only (no duplicate text).
 */
export const VENDOR_HERO_BANNER_SRC = '/vendor/vendor-hero-banner.png';
/** Right-side gold gradient only — no baked-in typography */
export const VENDOR_HERO_VISUAL_SRC = '/vendor/hero-visual.png';

const VendorHeroBanner = () => (
  <>
    {/* Mobile — full Figma banner (unchanged) */}
    <section className="relative aspect-[350/220] w-full overflow-hidden rounded-[32px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:hidden">
      <img
        src={VENDOR_HERO_BANNER_SRC}
        alt="Salon Products, Delivered — luxury haircare and salon favorites"
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={350}
        height={220}
        loading="eager"
        decoding="async"
      />
      <Link
        to="/products"
        className="absolute left-[6.9%] bottom-[15.5%] z-10 h-9 w-[34.6%] max-w-[121px] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C28B2C] focus-visible:ring-offset-2"
        aria-label="Shop Now"
      />
    </section>

    {/* Desktop — text once on the left; dedicated gradient asset on the right */}
    <section className="relative hidden min-h-[220px] w-full overflow-hidden rounded-[32px] bg-[#FFFBF7] shadow-[0_2px_16px_rgba(34,26,17,0.06)] lg:flex">
      <div className="relative z-10 flex w-full max-w-[48%] shrink-0 flex-col justify-center gap-4 bg-[#FFFBF7] px-10 py-10">
        <h2 className="font-vendor text-[32px] font-bold leading-tight text-[#3D2E1F]">
          Salon Products,
          <br />
          Delivered.
        </h2>
        <p className="max-w-md font-vendor text-base leading-relaxed text-[#6B5B4D]">
          Luxury haircare, skincare &amp; salon favorites curated by Looks Salon.
        </p>
        <Link
          to="/products"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#C28B2C] px-6 py-3 font-vendor text-base font-semibold text-white shadow-md transition-colors hover:bg-[#A87625] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C28B2C] focus-visible:ring-offset-2"
        >
          Shop Now
          <FiArrowRight size={18} aria-hidden />
        </Link>
      </div>

      <div className="relative min-h-[220px] min-w-0 flex-1 overflow-hidden" aria-hidden>
        <img
          src={VENDOR_HERO_VISUAL_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          decoding="async"
        />
        {/* Soft blend where cream meets gold */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-24 bg-gradient-to-r from-[#FFFBF7] via-[#FFFBF7]/80 to-transparent" />
      </div>
    </section>
  </>
);

export default VendorHeroBanner;
