import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '../../services/api/productApi';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';

import svgPaths from "../../utils/svgPaths";

// Scissors Icon for Header
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

const ProductCatalog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetProductCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const tabs = ['All', ...categories];

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    category: activeCategory === 'All' ? undefined : activeCategory,
    limit: 12,
  });

  const products = productsData?.products || [];
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [products, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (categoriesLoading || (productsLoading && products.length === 0)) {
    return (
      <section className="py-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[90px] md:min-w-[130px] lg:min-w-[150px] h-[160px]">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tabs.length === 1 && products.length === 0) return null;

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - Matching FeaturedProducts Style Perfectly */}
        <div className="flex flex-col gap-2 md:gap-4 items-center w-full mb-4 md:mb-8">
          <div className="flex flex-col gap-1 md:gap-2 items-center text-center">
            <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
              {/* Left Decoration */}
              <div className="flex items-center gap-1.5 md:gap-3">
                <div className="h-[1px] w-[15px] md:w-[40px] bg-neutral-black"></div>
                <ScissorsIcon />
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-[18px] md:text-[32px] leading-tight md:leading-[48px] text-neutral-black whitespace-nowrap">
                Our Products Catalog
              </h2>

              {/* Right Decoration */}
              <div className="flex items-center gap-1.5 md:gap-3">
                <ScissorsIcon />
                <div className="h-[1px] w-[15px] md:w-[40px] bg-neutral-black"></div>
              </div>
            </div>

            {/* Filter and View All Action Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 md:mt-4 w-full">
              {/* Category Dropdown - More Elegant/Minimalist */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="group flex items-center gap-2 px-4 py-1.5 bg-white border-b-2 border-transparent hover:border-accent-orange transition-all duration-300 text-[13px] md:text-sm font-medium text-gray-700"
                >
                  <span className="text-gray-400 font-normal">Category:</span>
                  <span className="capitalize text-gray-900">{activeCategory}</span>
                  <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-accent-orange' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden animate-fadeIn backdrop-blur-sm bg-white/95">
                    <div className="py-1.5">
                      {tabs.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] transition-all capitalize flex items-center justify-between group/item ${
                            activeCategory === category 
                              ? 'text-accent-orange font-semibold bg-accent-orange/5' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {category}
                          {activeCategory === category && (
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-orange"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/products"
                className="text-gray-400 hover:text-accent-orange transition-colors text-[13px] font-medium flex items-center gap-1 group"
              >
                View all products
                <FiChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative group/carousel">
          {products.length > 0 ? (
            <>
              {/* Scroll Buttons */}
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-accent-orange transition-all opacity-0 group-hover/carousel:opacity-100 ${!canScrollLeft ? 'hidden' : ''}`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-accent-orange transition-all opacity-0 group-hover/carousel:opacity-100 ${!canScrollRight ? 'hidden' : ''}`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 pt-1 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[85px] sm:w-[105px] md:w-[125px] lg:w-[145px] flex-shrink-0 snap-start"
                  >
                    <ProductCard product={product} compact={true} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-1">No Products Found</h3>
              <button
                onClick={() => setActiveCategory('All')}
                className="text-accent-orange font-medium hover:underline text-xs"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-4 sm:hidden pb-4">
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-[13px] shadow-sm active:bg-black transition-colors"
          >
            View All Products
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}} />
    </section>
  );
};

export default ProductCatalog;
