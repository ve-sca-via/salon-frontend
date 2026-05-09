import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useGetProductsQuery } from '../../services/api/productApi';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';

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
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton style={{ width: "200px", height: "32px" }} />
            <Skeleton style={{ width: "100px", height: "24px" }} />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[130px] md:min-w-[170px] lg:min-w-[200px] h-[180px] sm:h-[220px]">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Do not show section if no featured products
  }

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-primary/5 blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-orange-300/10 blur-3xl opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Top-rated essentials handpicked for you
            </p>
          </div>
          <Link
            to="/products?featured=true"
            className="text-brand-primary font-semibold text-sm hover:text-brand-dark transition-colors flex items-center gap-1 group"
          >
            View all 
            <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative mt-8 group/carousel overflow-hidden w-full">
          {/* Continuous Marquee Container */}
          <div className="flex w-full">
            {/* First Set */}
            <div className="flex animate-marquee shrink-0 gap-3 sm:gap-4 md:gap-6 pr-3 sm:pr-4 md:pr-6 py-2">
              {baseProducts.map((product, index) => (
                <div 
                  key={`first-${product.id}-${index}`} 
                  className="w-[130px] sm:w-[150px] md:w-[170px] lg:w-[200px] flex-shrink-0"
                >
                  <ProductCard product={product} compact={true} />
                </div>
              ))}
            </div>

            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex animate-marquee shrink-0 gap-3 sm:gap-4 md:gap-6 pr-3 sm:pr-4 md:pr-6 py-2" aria-hidden="true">
              {baseProducts.map((product, index) => (
                <div 
                  key={`second-${product.id}-${index}`} 
                  className="w-[130px] sm:w-[150px] md:w-[170px] lg:w-[200px] flex-shrink-0"
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
          animation: marquee 30s linear infinite;
        }
        .group\\/carousel:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default FeaturedProducts;
