import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft, FiGrid } from 'react-icons/fi';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '../../services/api/productApi';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';

const ProductCatalog = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetProductCategoriesQuery();
  const categories = categoriesData?.categories || [];

  // Create tabs: "All" + actual categories
  const tabs = ['All', ...categories];

  // Fetch products based on selected category
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    category: activeCategory === 'All' ? undefined : activeCategory,
    limit: 12, // Show up to 12 products in the grid
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

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (categoriesLoading || (productsLoading && products.length === 0)) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton style={{ width: "250px", height: "36px" }} />
          </div>
          <div className="flex gap-3 mb-8 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} style={{ width: "100px", height: "40px", borderRadius: "9999px" }} />
            ))}
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[90px] md:min-w-[220px] lg:min-w-[240px] h-[200px] md:h-[320px]">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no products at all, hide section
  if (tabs.length === 1 && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <FiGrid className="w-5 h-5" />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Our Products Catalog
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-2xl">
              Explore our premium collection of beauty and personal care products. Handpicked by experts for your daily routine.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-brand-primary text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            View All Products
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Tabs */}
        {tabs.length > 1 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6">
            {tabs.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all capitalize border ${activeCategory === category
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md transform scale-105'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products Carousel */}
        <div className="relative group/carousel min-h-[300px]">
          {productsLoading ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : null}

          {products.length > 0 ? (
            <>
              {/* Scroll Buttons */}
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-brand-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 ${!canScrollLeft ? 'hidden' : ''}`}
                aria-label="Scroll left"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-brand-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 ${!canScrollRight ? 'hidden' : ''}`}
                aria-label="Scroll right"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[88px] max-w-[88px] sm:min-w-[120px] sm:max-w-[120px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[220px] lg:max-w-[220px] flex-shrink-0 snap-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <FiGrid className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Products Found</h3>
              <p className="text-gray-500 text-sm">
                We couldn't find any products in the "{activeCategory}" category.
              </p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 text-brand-primary font-medium hover:underline text-sm"
              >
                View all products
              </button>
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 sm:hidden">
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm shadow-sm hover:bg-brand-primary transition-colors"
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
      `}} />
    </section>
  );
};

export default ProductCatalog;
