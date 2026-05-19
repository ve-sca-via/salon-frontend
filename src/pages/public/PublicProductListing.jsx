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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetProductCategoriesQuery();
  const categories = categoriesData?.categories || [];
  const tabs = ['All', ...categories];

  // Prepare API params
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

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (isFeaturedOnly) params.set('featured', 'true');
    if (searchTerm.trim()) params.set('query', searchTerm.trim());
    setSearchParams(params, { replace: true });
  }, [activeCategory, isFeaturedOnly, searchTerm, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
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
      <main className="flex-grow max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2 pb-6 w-full">
        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {isFeaturedOnly ? "Featured Products" : "All Products"}
          </h1>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
            Discover our premium beauty collection. Handpicked for your daily routine.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-4">
          <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
            {/* Left Side: Search and Category Dropdown */}
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center flex-grow">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent text-xs"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              </form>

              {/* Category Dropdown */}
              {!categoriesLoading && tabs.length > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-md text-[11px] font-bold text-gray-700 hover:border-accent-orange transition-all min-w-[120px] justify-between shadow-sm"
                  >
                    <span className="capitalize">{activeCategory}</span>
                    <FiFilter className={`w-3 h-3 text-gray-400 transition-colors ${isDropdownOpen ? 'text-accent-orange' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                      <div className="py-1">
                        {tabs.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setActiveCategory(category);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[11px] transition-colors capitalize ${
                              activeCategory === category 
                                ? 'bg-accent-orange text-white' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Featured Toggle and Clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFeaturedOnly(!isFeaturedOnly)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                  isFeaturedOnly 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                }`}
              >
                Featured Only
              </button>
              
              {(isFeaturedOnly || activeCategory !== 'All' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiX className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid - Increased density (3 cols on mobile, 4 on sm, 6 on lg) */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full">
                <Skeleton style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
            <p className="text-red-500 text-sm font-medium">Failed to load products.</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
              <FiSearch className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Products Found</h3>
            <p className="text-[11px] text-gray-500 mb-4 max-w-xs mx-auto">
              Try adjusting your search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-1.5 bg-accent-orange text-white rounded-md text-[11px] font-bold hover:opacity-90 transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default PublicProductListing;
