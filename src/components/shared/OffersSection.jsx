import React, { useState, useEffect, useMemo } from 'react';

/**
 * "Offers available for you" carousel on the salon detail page.
 *
 * Driven purely by real coupons: `coupons` is the salon's vendor coupons plus
 * platform-wide coupons (public projection with `code` / `summary` / `subtitle`).
 * Renders nothing when the salon has no active coupons — no placeholder offers.
 */
export default function OffersSection({ coupons }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(
    () =>
      (coupons || []).map((c) => ({
        title: c.summary || c.title,
        desc: c.subtitle || c.title || 'Apply this code at checkout',
        code: c.code,
      })),
    [coupons],
  );

  // Keep the active slide index in range if the slide count changes.
  useEffect(() => {
    setCurrentSlide((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
      <h3 className="font-body font-semibold text-[17px] sm:text-[18px] text-neutral-black mb-3 px-1">
        Offers available for you
      </h3>
      <div className="border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm bg-white overflow-hidden relative">
        <div className="flex items-center gap-3 sm:gap-4 w-full h-[54px] sm:h-[60px]">
          {/* Logo icon representation */}
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-orange-50 rounded-full">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-accent-orange fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
            </svg>
          </div>

          <div className="flex-1 relative h-full flex flex-col justify-center">
            {slides.map((offer, index) => (
              <div
                key={offer.code ? `${offer.code}-${index}` : index}
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0 z-10'
                    : 'opacity-0 translate-y-4 z-0'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="font-body font-bold text-[14px] sm:text-[15px] text-neutral-black leading-snug line-clamp-1">
                    {offer.title}
                  </div>
                  {offer.code && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-accent-orange bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 flex-shrink-0">
                      {offer.code}
                    </span>
                  )}
                </div>
                <div className="font-body text-[12px] sm:text-[13px] text-gray-600 font-medium mt-0.5 line-clamp-1">
                  {offer.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[#3ea6ff] font-medium text-[13px] sm:text-[14px] font-body px-1 self-start sm:self-center mt-1 sm:mt-0 flex-shrink-0">
            {currentSlide + 1}/{slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}
