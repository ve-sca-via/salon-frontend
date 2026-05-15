import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useGetProductsQuery } from '../../services/api/productApi';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import svgPaths from "../../utils/svgPaths";

// Scissors Icon for Header - matching ServicesSection
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
          <path clipRule="evenodd" d={svgPaths.p25acb880} fill="#242B3A" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p278c7db0} fill="#242B3A" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.pd7a6390} fill="#242B3A" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p33bb100} fill="#242B3A" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p153dbd00} fill="#242B3A" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

const FeaturedProducts = () => {
  const { data, isLoading, error } = useGetProductsQuery({ is_featured: true, limit: 10 });
  const products = data?.products || [];

  // Repeat products if there are too few, to ensure the marquee fills large screens
  let baseProducts = [...products];
  if (baseProducts.length > 0) {
    while (baseProducts.length < 10) {
      baseProducts = [...baseProducts, ...products];
    }
  }

  if (isLoading) {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[90px] md:min-w-[130px] lg:min-w-[150px] h-[150px] sm:h-[180px]">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - Matching ServicesSection Style Perfectly */}
        <div className="flex flex-col gap-0 items-center w-full mb-2 md:mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
              {/* Left Decoration */}
              <div className="flex items-center gap-1.5 md:gap-3">
                <div className="h-[1px] w-[15px] md:w-[40px] bg-neutral-black"></div>
                <ScissorsIcon />
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-[18px] md:text-[32px] leading-tight md:leading-[48px] text-neutral-black whitespace-nowrap">
                Featured Products
              </h2>

              {/* Right Decoration */}
              <div className="flex items-center gap-1.5 md:gap-3">
                <ScissorsIcon />
                <div className="h-[1px] w-[15px] md:w-[40px] bg-neutral-black"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group/carousel overflow-hidden w-full">
          {/* Continuous Marquee Container */}
          <div className="flex w-full">
            {/* First Set */}
            <div className="flex animate-marquee shrink-0 gap-2 sm:gap-3 md:gap-4 pr-2 sm:pr-3 md:pr-4 py-1">
              {baseProducts.map((product, index) => (
                <div 
                  key={`first-${product.id}-${index}`} 
                  className="w-[85px] sm:w-[100px] md:w-[120px] lg:w-[140px] flex-shrink-0"
                >
                  <ProductCard product={product} compact={true} />
                </div>
              ))}
            </div>

            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex animate-marquee shrink-0 gap-2 sm:gap-3 md:gap-4 pr-2 sm:pr-3 md:pr-4 py-1" aria-hidden="true">
              {baseProducts.map((product, index) => (
                <div 
                  key={`second-${product.id}-${index}`} 
                  className="w-[85px] sm:w-[100px] md:w-[120px] lg:w-[140px] flex-shrink-0"
                >
                  <ProductCard product={product} compact={true} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .group\\/carousel:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default FeaturedProducts;
