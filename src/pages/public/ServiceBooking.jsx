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

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { useGetSalonByIdQuery, useGetSalonServicesQuery } from "../../services/api/salonApi";
import { useGetCartQuery, useAddToCartMutation } from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import { hasAccessToken } from "../../utils/helpers";
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
 * groupBySubcat - Groups a flat service list by its subcategory node.
 * Returns { groups: [{ id, name, services }], noSub: [...] } where `noSub`
 * holds services that aren't attached to any subcategory. This is what makes
 * the 3-level taxonomy (category > subcategory > service) render correctly.
 */
const groupBySubcat = (list) => {
  const groups = {};
  const noSub = [];
  list.forEach((s) => {
    if (s.subcategory_id) {
      const id = s.subcategory_id;
      if (!groups[id]) {
        groups[id] = { id, name: s.service_subcategories?.name || 'Other', services: [] };
      }
      groups[id].services.push(s);
    } else {
      noSub.push(s);
    }
  });
  return { groups: Object.values(groups), noSub };
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

  const salon = salonData?.salon || salonData;
  const services = servicesData?.services || servicesData || [];
  const loading = salonLoading;
  const error = salonError;
  
  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedCategory || null);
  const [filterGender, setFilterGender] = useState('all');
  // Mobile accordion: id of the currently open subcategory (null = default first open, '' = all closed)
  const [openSubcatId, setOpenSubcatId] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');

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
   * ✅ OPTIMIZED: Removed auto-selection of first category so we start on View 1
   */
  useEffect(() => {
    // Intentionally blank to prevent auto-selection
  }, []);

  // Reset the mobile accordion + search whenever the selected category changes
  useEffect(() => {
    setOpenSubcatId(null);
    setServiceSearch('');
  }, [selectedCategory]);

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
    if (!isAuthenticated || !hasAccessToken()) {
      // Pass the full location object so Login can return here (it reads
      // `location.state.from.pathname`); a bare string wouldn't resolve.
      navigate("/login", {
        replace: true,
        state: { from: location }
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
      category: service.service_subcategories?.name 
        ? `${service.service_categories?.name || 'Category'} > ${service.service_subcategories.name}`
        : (service.service_categories?.name || service.category_name || 'Other'),
      subcategory_id: service.subcategory_id || null,
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
   * isServiceInCart - Checks if service already exists in cart
   * Returns boolean for conditional rendering of "Add" vs "Added" button
   */
  const isServiceInCart = (service) => {
    return cart?.items?.some((item) => item.service_id === service.id) || false;
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

  // Filter services for currently selected category, gender, and search query
  const searchQuery = serviceSearch.trim().toLowerCase();
  const currentServices = (selectedCategory ? (groupedServices[selectedCategory] || []) : [])
    .filter(service => {
      if (filterGender === 'all') return true;
      const cat = service.gender_category || 'both';
      if (filterGender === 'male') return cat === 'male' || cat === 'both';
      if (filterGender === 'female') return cat === 'female' || cat === 'both';
      return true;
    })
    .filter(service => {
      if (!searchQuery) return true;
      return (service.name || '').toLowerCase().includes(searchQuery);
    });

  // Group a flat service list by subcategory (level 3 nesting: category > subcategory > service)
  const { groups: subcatGroups, noSub: noSubcatServices } = groupBySubcat(currentServices);

  // Mobile accordion groups = subcategory groups (+ a bucket for services with no subcategory)
  const mobileAccordion = [...subcatGroups];
  if (noSubcatServices.length > 0) {
    mobileAccordion.push({
      id: '__more__',
      name: subcatGroups.length > 0 ? 'More Services' : (selectedCategory || 'Services'),
      services: noSubcatServices,
    });
  }

  // Desktop service card (existing compact layout)
  const renderServiceItem = (service) => (
    <div
      key={service.id}
      className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-all flex items-center justify-between"
    >
      {/* Left: Name and Duration */}
      <div className="flex flex-col pr-3">
        <h3 className="font-display font-bold text-[14px] text-neutral-black leading-tight line-clamp-2 mb-1" title={service.name}>
          {service.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-neutral-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-body text-[12px] whitespace-nowrap">
              {service.duration_minutes}m
            </span>
          </div>
          {service.gender_category && service.gender_category !== 'both' && (
            <span className={`px-1.5 py-0.5 text-[9px] rounded-sm uppercase tracking-wider font-semibold ${
              service.gender_category === 'male' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-pink-50 text-pink-600 border border-pink-200'
            }`}>
              {service.gender_category}
            </span>
          )}
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
  );

  // Mobile accordion service row (small icon · name · description · price · ADD pill)
  const renderAccordionService = (service) => {
    const inCart = isServiceInCart(service);
    const hasDiscount = service.discounted_price !== null && service.discounted_price !== undefined;
    return (
      <div key={service.id} className="flex items-start justify-between gap-3 py-4 first:pt-1">
        {/* Left: icon + details */}
        <div className="flex-1 min-w-0">
          <FiScissors className="w-3 h-3 text-accent-orange/70 mb-1" />
          <h3 className="font-body font-medium text-[15px] text-neutral-black leading-snug">
            {service.name}
          </h3>
          {service.description && (
            <p className="font-body text-[13px] text-neutral-gray-500 mt-0.5 line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            {hasDiscount ? (
              <>
                <span className="font-body font-semibold text-[14px] text-neutral-black">₹{service.discounted_price}</span>
                <span className="font-body text-[12px] text-neutral-gray-400 line-through">₹{service.price}</span>
                {service.discount_percentage !== null && service.discount_percentage !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-body font-semibold text-[9px] uppercase tracking-wide">
                    {service.discount_percentage}% off
                  </span>
                )}
              </>
            ) : (
              <span className="font-body font-semibold text-[14px] text-neutral-black">₹{service.price}</span>
            )}
            {service.duration_minutes ? (
              <span className="font-body text-[12px] text-neutral-gray-400">· {service.duration_minutes}m</span>
            ) : null}
            {service.gender_category && service.gender_category !== 'both' && (
              <span className={`px-1.5 py-0.5 text-[9px] rounded-sm uppercase tracking-wider font-semibold ${
                service.gender_category === 'male' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-pink-50 text-pink-600 border border-pink-200'
              }`}>
                {service.gender_category}
              </span>
            )}
          </div>
        </div>

        {/* Right: ADD pill */}
        {inCart ? (
          <button
            disabled
            className="shrink-0 px-5 py-2 rounded-[20px] border border-gray-200 bg-gray-50 text-gray-400 font-body font-semibold text-[13px] uppercase tracking-wide cursor-not-allowed"
          >
            Added
          </button>
        ) : (
          <button
            onClick={() => handleAddToCart(service)}
            className="shrink-0 px-5 py-2 rounded-[20px] border border-accent-orange/30 bg-white text-accent-orange font-body font-semibold text-[13px] uppercase tracking-wide shadow-sm hover:bg-accent-orange hover:text-white transition-colors"
          >
            Add
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div
        className={`max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 ${
          cart?.item_count > 0 ? "lg:pr-[340px]" : ""
        }`}
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 relative">
          <div className="flex justify-start items-center mb-4">
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

          {/* Desktop: checkout CTA pinned top-right without shifting layout */}
          {cart?.item_count > 0 && (
            <div className="hidden lg:block fixed right-6 top-24 z-40 w-[320px]">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-[12px] text-neutral-black/60">Cart</p>
                    <p className="font-body font-semibold text-[16px] text-neutral-black leading-tight">
                      {cart?.item_count} {cart?.item_count === 1 ? 'service' : 'services'}
                    </p>
                  </div>
                  <p className="font-body font-bold text-[16px] text-neutral-black">
                    ₹{cart?.total_amount || 0}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-3 w-full bg-accent-orange hover:opacity-90 active:opacity-80 text-white font-body font-semibold text-[15px] py-3 rounded-xl transition-opacity shadow-sm flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {!selectedCategory ? (
            <>
              <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-neutral-black mb-1">
                Select Services
              </h1>
              <p className="font-body text-[13px] sm:text-[15px] text-neutral-gray-500 mb-4">
                Choose from our wide range of services at {salon.name}
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Single functional breadcrumb (no duplicates) */}
              <nav className="flex flex-wrap items-center gap-2 text-sm font-body text-gray-500">
                <button
                  onClick={() => navigate(`/salons/${id}`)}
                  className="hover:text-accent-orange font-medium transition-colors"
                >
                  Salon
                </button>
                <span className="text-gray-400 text-xs">▶</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-accent-orange font-medium transition-colors"
                >
                  Categories
                </button>
                <span className="text-gray-400 text-xs">▶</span>
                <span className="text-neutral-black font-semibold">
                  {selectedCategory} Services
                </span>
              </nav>
              
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-neutral-black">
                  {selectedCategory} Services
                </h1>
                <span className="font-body text-[12px] sm:text-[14px] text-neutral-gray-500">
                  {currentServices.length} services available
                </span>
              </div>

              {/* Gender Filter Tabs */}
              <div className="flex bg-neutral-gray-100 p-1 rounded-lg w-full max-w-[400px]">
                {['all', 'male', 'female'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setFilterGender(gender)}
                    className={`flex-1 py-1.5 sm:py-2 px-3 rounded-md font-body text-[13px] sm:text-[14px] font-medium capitalize transition-all ${
                      filterGender === gender 
                        ? 'bg-white text-neutral-black shadow-sm' 
                        : 'text-neutral-gray-500 hover:text-neutral-black'
                    }`}
                  >
                    {gender === 'all' ? 'All Genders' : gender}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!selectedCategory ? (
          /* View 1: Category Grid */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 justify-items-center mb-12">
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[120px]"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-accent-orange group-hover:shadow-xl transition-all">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-body font-semibold text-[13px] sm:text-[15px] text-neutral-black group-hover:text-accent-orange transition-colors">
                  {category.name}
                </h4>
                <span className="font-body text-[11px] text-neutral-gray-500 mt-1">
                  {category.count} {category.count === 1 ? 'Service' : 'Services'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* View 2: Subcategories and Services */
          <div className="py-3 sm:p-6 animate-fade-in">
          {servicesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
            </div>
          ) : (
            <>
              {/* ---------- MOBILE: category strip + search + collapsible subcategories ---------- */}
              <div className="lg:hidden">
                {/* Category selector (horizontal scroll) */}
                <div className="-mx-3 px-3 mb-4 flex gap-5 overflow-x-auto scrollbar-hide">
                  {serviceCategories.map((cat) => {
                    const active = cat.name === selectedCategory;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16"
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${active ? "border-accent-orange shadow-md" : "border-transparent"}`}>
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={`font-body text-[12px] leading-tight text-center ${active ? "text-neutral-black font-semibold" : "text-neutral-gray-500"}`}>
                          {cat.name}
                        </span>
                        <span className={`h-0.5 w-8 rounded-full ${active ? "bg-accent-orange" : "bg-transparent"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <svg className="w-5 h-5 text-neutral-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search for service..."
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 bg-gray-50 font-body text-[14px] text-neutral-black placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange/30 focus:border-accent-orange"
                  />
                </div>

                {/* Collapsible subcategory accordion */}
                {currentServices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-body text-neutral-gray-500">
                      {searchQuery ? "No services match your search" : "No services available in this category"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mobileAccordion.map((group, idx) => {
                      const isOpen = openSubcatId === null ? idx === 0 : openSubcatId === group.id;
                      return (
                        <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <button
                            onClick={() =>
                              setOpenSubcatId((prev) => {
                                const currentlyOpen = prev === null ? idx === 0 : prev === group.id;
                                return currentlyOpen ? "" : group.id;
                              })
                            }
                            className="w-full flex items-center justify-between px-5 py-4 text-left"
                          >
                            <span className="font-display font-semibold text-[16px] text-neutral-black">
                              {group.name} ({group.services.length})
                            </span>
                            <svg
                              className={`w-5 h-5 text-neutral-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 divide-y divide-gray-100">
                              {group.services.map(renderAccordionService)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ---------- DESKTOP: grouped grid ---------- */}
              <div className="hidden lg:block">
                {currentServices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="font-body text-neutral-gray-500">
                      No services available in this category
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 px-2">
                    {subcatGroups.map((group) => (
                      <div key={group.id} className="mb-6">
                        <div className="flex items-center mb-3">
                          <h3 className="font-body font-semibold text-[18px] text-gray-800 pl-3 border-l-4 border-accent-orange">
                            {group.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {group.services.map(renderServiceItem)}
                        </div>
                      </div>
                    ))}

                    {noSubcatServices.length > 0 && (
                      <div className="mb-6">
                        {subcatGroups.length > 0 && (
                          <h3 className="font-body font-semibold text-[16px] text-gray-800 mb-3 pl-3 border-l-4 border-accent-orange">
                            More Services
                          </h3>
                        )}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {noSubcatServices.map(renderServiceItem)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </div>

      {cart?.item_count > 0 && (
        <>
          {/* Mobile: keep fixed bottom checkout bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0px_-2px_16px_rgba(0,0,0,0.12)] z-40">
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
        </>
      )}

      <Footer />
    </div>
  );
}
