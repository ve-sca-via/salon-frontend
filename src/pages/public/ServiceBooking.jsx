/**
 * ServiceBooking.jsx - Salon Service Booking Interface
 * 
 * PURPOSE:
 * - Display all services offered by a specific salon
 * - Allow browsing services by category
 * - Add/remove services to/from cart
 * - Navigate to cart for checkout
 * 
 * DATA MANAGEMENT:
 * - Fetches salon details via useGetSalonByIdQuery
 * - Fetches services via useGetSalonServicesQuery
 * - Cart operations via RTK Query mutations
 * - Groups services by category on frontend
 * 
 * KEY FEATURES:
 * - Category navigation with images (DB icon_url or fallback)
 * - Service cards with pricing and duration
 * - Cart validation (single salon restriction)
 * - Floating cart button with item count
 * - Real-time cart state updates
 * 
 * USER FLOW:
 * 1. View salon's services grouped by category
 * 2. Select category to filter services
 * 3. Add services to cart (validates same salon)
 * 4. View cart via floating button
 * 5. Navigate to /cart for checkout
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { useGetSalonByIdQuery, useGetSalonServicesQuery } from "../../services/api/salonApi";
import { useGetCartQuery, useAddToCartMutation, useRemoveFromCartMutation } from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import { NotFound, NetworkError } from "../../components/shared/ErrorFallback";
import { FiScissors } from "react-icons/fi";

/**
 * getCategoryImage - Returns category image URL
 * Uses icon_url from database if available, otherwise returns Unsplash fallback
 */
const getCategoryImage = (categoryName) => {
  const category = categoryName?.toLowerCase() || '';
  
  const categoryImages = {
    'hair': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=300&fit=crop',
    'haircut': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=300&fit=crop',
    'hair care': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=300&fit=crop',
    'hair color': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=300&h=300&fit=crop',
    'hair colour': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=300&h=300&fit=crop',
    'spa': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=300&fit=crop',
    'massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=300&fit=crop',
    'nails': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
    'nail': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
    'manicure': 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=300&h=300&fit=crop',
    'pedicure': 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=300&h=300&fit=crop',
    'facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop',
    'face': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop',
    'makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=300&fit=crop',
    'bridal': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=300&fit=crop',
    'waxing': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop',
    'threading': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop',
    'treatment': 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=300&h=300&fit=crop',
    'men': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop',
    'grooming': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop',
  };

  // Check category name
  for (const [key, image] of Object.entries(categoryImages)) {
    if (category.includes(key)) {
      return image;
    }
  }

  // Default image
  return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=300&fit=crop';
};

/**
 * ServiceCategoryCard - Category selector component
 * Displays category image and name
 * Highlights selected category with border and scale animation
 */
function ServiceCategoryCard({ category, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center text-center cursor-pointer transition-all ${
        isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
      }`}
    >
      <div
        className={`relative w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden mb-2 sm:mb-3 border-2 sm:border-4 transition-all ${
          isSelected
            ? "border-accent-orange shadow-lg scale-105"
            : "border-transparent"
        }`}
      >
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-accent-orange/10"></div>
        )}
      </div>
      <h4
        className={`font-body font-medium text-[12px] sm:text-[14px] leading-tight max-w-[72px] sm:max-w-[100px] ${
          isSelected ? "text-neutral-black" : "text-neutral-gray-500"
        }`}
      >
        {category.name}
      </h4>
    </div>
  );
}

export default function ServiceBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // RTK Query hooks
  const { data: salonData, isLoading: salonLoading, error: salonError } = useGetSalonByIdQuery(id);
  const { data: servicesData, isLoading: servicesLoading } = useGetSalonServicesQuery(id);
  const { data: cart } = useGetCartQuery();
  const [addToCart] = useAddToCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  
  const salon = salonData?.salon || salonData;
  const services = servicesData?.services || servicesData || [];
  const loading = salonLoading;
  const error = salonError;
  
  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedCategory || null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const categoryScrollRef = useRef(null);

  /**
   * ✅ OPTIMIZED: groupServicesByCategory - Memoized with useCallback
   * Groups services array by category name
   * Returns object with category names as keys and service arrays as values
   * Only recreated if needed (stable reference)
   */
  const groupServicesByCategory = useCallback((servicesList) => {
    const grouped = {};
    
    servicesList.forEach((service) => {
      const categoryName = service.service_categories?.name || 'Other Services';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });
    
    return grouped;
  }, []);

  /**
   * ✅ OPTIMIZED: Memoized grouped services - Only recalculates when services change
   * Replaces useEffect + useState pattern with useMemo for derived data
   */
  const groupedServices = useMemo(() => {
    if (services.length === 0) return {};
    return groupServicesByCategory(services);
  }, [services, groupServicesByCategory]);

  /**
   * ✅ OPTIMIZED: Memoized service categories - Only recalculates when services change
   * Extracts unique categories with counts
   * Uses icon_url from service_categories or fallback to getCategoryImage
   */
  const serviceCategories = useMemo(() => {
    if (services.length === 0) return [];
    
    // Extract unique categories for top navigation with icon_url
    const categoriesMap = new Map();
    services.forEach(service => {
      const catName = service.service_categories?.name || 'Other Services';
      if (!categoriesMap.has(catName)) {
        categoriesMap.set(catName, {
          name: catName,
          icon_url: service.service_categories?.icon_url || null,
          count: 0
        });
      }
      categoriesMap.get(catName).count++;
    });

    return Array.from(categoriesMap.values()).map((cat, index) => ({
      id: index + 1,
      name: cat.name,
      image: cat.icon_url || getCategoryImage(cat.name), // Use icon_url if available, fallback to getCategoryImage
      count: cat.count,
    }));
  }, [services]);

  /**
   * ✅ OPTIMIZED: Set default selected category only when categories change
   * Replaces setting state inside data processing useEffect
   */
  useEffect(() => {
    if (serviceCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(serviceCategories[0].name);
    }
  }, [serviceCategories, selectedCategory]);

  /**
   * handleAddToCart - Adds service to cart with validation
   * 
   * VALIDATION:
   * - Checks if user is authenticated, redirects to login if not
   * - Checks if cart contains items from different salon
   * - Shows error toast if attempting to mix salons
   * 
   * CART ITEM STRUCTURE:
   * - salon_id, salon_name (for display)
   * - service_id, service_name
   * - plan_name, category, duration
   * - price, description, quantity (defaults to 1)
   */
  const handleAddToCart = async (service) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: `/salons/${id}/book` }
      });
      return;
    }

    // Check if trying to add from different salon
    if (cart?.salon_id && cart.salon_id !== id) {
      showErrorToast(
        `Your selected services contain items from ${cart.salon_name}. Please clear your selection to add items from a different salon.`,
        { autoClose: 4000 }
      );
      return;
    }

    const cartItem = {
      salon_id: id, // Keep as UUID string
      salon_name: salon.business_name || salon.name,
      service_id: service.id,
      service_name: service.name,
      plan_name: service.plan_name || 'Standard',
      category: service.category_name || 'Other',
      duration: service.duration_minutes || 0,
      price: parseFloat(service.price) || 0,
      description: service.description || `${service.duration_minutes} minutes`,
      quantity: 1,
    };

    try {
      await addToCart(cartItem).unwrap();
      showSuccessToast(`${service.name} added to services!`);
    } catch (error) {
      const errorMessage = error?.data?.detail || 'Failed to add to cart';
      showErrorToast(errorMessage);
    }
  };

  /**
   * handleRemoveFromCart - Removes service from cart
   * Finds cart item by service_id and removes using cart item id
   */
  const handleRemoveFromCart = async (service) => {
    const cartItem = cart?.items?.find((item) => item.service_id === service.id);

    if (cartItem) {
      try {
        await removeFromCart(cartItem.id).unwrap();
        showInfoToast(`${service.name} removed from services!`);
      } catch (error) {
        showErrorToast('Failed to remove from cart');
      }
    }
  };

  /**
   * isServiceInCart - Checks if service already exists in cart
   * Returns boolean for conditional rendering of "Add" vs "Added" button
   */
  const isServiceInCart = (service) => {
    return cart?.items?.some((item) => item.service_id === service.id) || false;
  };

  /**
   * handleCategoryNavigation - Changes selection and scrolls to category
   * Moves from one category to another based on direction
   */
  const handleCategoryNavigation = (direction) => {
    if (serviceCategories.length === 0) return;
    
    const currentIndex = serviceCategories.findIndex(cat => cat.name === selectedCategory);
    let nextIndex;
    
    if (direction === "left") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : serviceCategories.length - 1;
    } else {
      nextIndex = currentIndex < serviceCategories.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextCategory = serviceCategories[nextIndex];
    setSelectedCategory(nextCategory.name);

    // Smoothly scroll the container to center the new category
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const activeItem = container.children[nextIndex];
      
      if (activeItem) {
        const containerWidth = container.offsetWidth;
        const itemLeft = activeItem.offsetLeft;
        const itemWidth = activeItem.offsetWidth;
        
        // Calculate scroll position to center the item
        const scrollPos = itemLeft - (containerWidth / 2) + (itemWidth / 2);
        
        container.scrollTo({
          left: scrollPos,
          behavior: "smooth"
        });
      }
    }
  };

  // Loading state - shows spinner while fetching data
  if (loading || servicesLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full" />
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            Loading salon services...
          </h2>
        </div>
      </div>
    );
  }

  // Error state - handle API errors properly
  if (error) {
    const is404 = error.status === 404;
    const isNetworkError = error.status === 'FETCH_ERROR' || !error.status;
    
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {is404 ? (
            <NotFound message="The salon you're looking for doesn't exist or has been removed." />
          ) : isNetworkError ? (
            <NetworkError onRetry={() => window.location.reload()} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <svg className="w-20 h-20 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Unable to Load Salon
                </h2>
                <p className="text-gray-600 mb-6">
                  There was a problem loading this salon's information. Please try again.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-accent-orange hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/salons')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
                  >
                    Back to Salons
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // Safety check for missing salon data
  if (!salon) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <NotFound message="The salon you're looking for doesn't exist." />
        </div>
        <Footer />
      </div>
    );
  }

  // Filter services for currently selected category
  const currentServices = selectedCategory ? (groupedServices[selectedCategory] || []) : [];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(`/salons/${id}`)}
              className="flex items-center gap-1.5 text-neutral-gray-500 hover:text-accent-orange transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-body font-medium text-[15px] sm:text-[16px]">Back to Salon</span>
            </button>
            
            {/* View Cart Button at top */}
            {cart?.item_count > 0 && (
              <button
                onClick={() => navigate(`/cart`)}
                className="bg-accent-orange hover:bg-orange-600 text-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm transition-colors"
              >
                <FiScissors className="w-4 h-4" />
                <span className="font-body font-semibold text-[13px]">
                  {cart?.item_count} {cart?.item_count === 1 ? 'Service' : 'Services'} • ₹{cart?.total_amount || 0}
                </span>
              </button>
            )}
          </div>
          <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-neutral-black mb-1">
            Select Services
          </h1>
          <p className="font-body text-[13px] sm:text-[15px] text-neutral-gray-500">
            Choose from our wide range of services at {salon.name}
          </p>
        </div>

        {/* Service Categories with Navigation Arrows */}
        <div className="py-3 mb-4 sm:mb-6">
          <div className="relative">
            <div className="flex items-center justify-between gap-1 sm:gap-4">
              <button
                type="button"
                onClick={() => handleCategoryNavigation("left")}
                className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-white border border-neutral-gray-600 rounded-full shadow-sm hover:bg-neutral-gray-600 transition-all active:scale-95 disabled:opacity-30"
                aria-label="Previous category"
              >
                <svg
                  className="w-5 h-5 text-neutral-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div
                ref={categoryScrollRef}
                className="flex flex-1 gap-4 sm:gap-8 overflow-x-auto py-2 px-2 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {serviceCategories.map((category) => (
                  <ServiceCategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.name}
                    onClick={() => setSelectedCategory(category.name)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleCategoryNavigation("right")}
                className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-white border border-neutral-gray-600 rounded-full shadow-sm hover:bg-neutral-gray-600 transition-all active:scale-95 disabled:opacity-30"
                aria-label="Next category"
              >
                <svg
                  className="w-5 h-5 text-neutral-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Category Services */}
        <div className="py-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display font-bold text-[20px] sm:text-[24px] text-neutral-black">
              {selectedCategory}
            </h2>
            <span className="font-body text-[12px] sm:text-[14px] text-neutral-gray-500">
              {currentServices.length} services available
            </span>
          </div>

          {/* Services Grid */}
          {servicesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
            </div>
          ) : currentServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-neutral-gray-500">
                No services available in this category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2">
              {currentServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-all flex items-center justify-between"
                >
                  {/* Left: Name and Duration */}
                  <div className="flex flex-col pr-3">
                    <h3 className="font-display font-bold text-[14px] text-neutral-black leading-tight line-clamp-2 mb-1" title={service.name}>
                      {service.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-neutral-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-body text-[12px] whitespace-nowrap">
                        {service.duration_minutes}m
                      </span>
                    </div>
                  </div>

                  {/* Right: Price and Add Button */}
                  <div className="flex flex-col items-end shrink-0 ml-2 gap-1.5">
                    {service.discounted_price !== null && service.discounted_price !== undefined ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="font-display font-extrabold text-[14px] text-accent-orange">
                          ₹{service.discounted_price}
                        </span>
                        <span className="font-body text-[11px] text-neutral-gray-500 line-through">
                          ₹{service.price}
                        </span>
                        {service.discount_percentage !== null && service.discount_percentage !== undefined && (
                          <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-body font-semibold text-[9px] uppercase tracking-wide mt-0.5">
                            {service.discount_percentage}% off
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-display font-extrabold text-[14px] text-accent-orange">
                        ₹{service.price}
                      </span>
                    )}
                      {isServiceInCart(service) ? (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-[5px] font-body font-bold text-[10px] cursor-not-allowed uppercase tracking-wide"
                        >
                          Added
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(service)}
                          className="px-3 py-1.5 bg-accent-orange/10 text-accent-orange border border-accent-orange/20 rounded-[5px] font-body font-bold text-[10px] hover:bg-accent-orange hover:text-white transition-colors uppercase tracking-wide"
                        >
                          + Add
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Checkout Bar — appears when cart has items */}
      {cart?.item_count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0px_-2px_16px_rgba(0,0,0,0.12)] z-40">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-accent-orange hover:opacity-90 active:opacity-80 text-white font-body font-semibold text-[16px] py-3.5 rounded-lg transition-opacity shadow-md flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
