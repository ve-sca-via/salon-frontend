import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { useGetProductsQuery, useGetProductCategoriesQuery } from "../../services/api/productApi";
import ProductCard from "../../components/shared/ProductCard";
import Skeleton from "../../components/shared/Skeleton";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

const PublicProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL
  const featuredParam = searchParams.get('featured') === 'true';
  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('query') || '';

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(featuredParam);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetProductCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const tabs = ['All', ...categories];

  // Prepare API params based on current state
  const apiParams = useMemo(() => {
    const params = { limit: 50 };
    if (activeCategory !== 'All') params.category = activeCategory;
    if (isFeaturedOnly) params.is_featured = true;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    return params;
  }, [activeCategory, isFeaturedOnly, searchTerm]);

  // Fetch products
  const { data: productsData, isLoading, error } = useGetProductsQuery(apiParams);
  const products = productsData?.products || [];

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (isFeaturedOnly) params.set('featured', 'true');
    if (searchTerm.trim()) params.set('query', searchTerm.trim());
    setSearchParams(params, { replace: true });
  }, [activeCategory, isFeaturedOnly, searchTerm, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useMemo for apiParams and useEffect for URL will handle the rest
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setIsFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-bg-secondary font-body flex flex-col">
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 w-full">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            {isFeaturedOnly ? "Featured Products" : "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Discover our premium collection of beauty and personal care products. Handpicked by experts for your daily routine.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Filter Toggles */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button
                onClick={() => setIsFeaturedOnly(!isFeaturedOnly)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  isFeaturedOnly 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Featured Only
              </button>
              
              {(isFeaturedOnly || activeCategory !== 'All' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiX /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Categories Tabs */}
          {!categoriesLoading && tabs.length > 1 && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                <FiFilter className="text-gray-400 mr-2 flex-shrink-0" />
                {tabs.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all capitalize border-2 ${
                      activeCategory === category
                        ? 'bg-accent-orange border-accent-orange text-white shadow-md transform scale-105'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-accent-orange hover:text-accent-orange'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-red-500 font-medium">Failed to load products. Please try again later.</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              We couldn't find any products matching your current filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default PublicProductListing;
