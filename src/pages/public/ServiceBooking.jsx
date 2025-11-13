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

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetSalonByIdQuery, useGetSalonServicesQuery } from "../../services/api/salonApi";
import { useGetCartQuery, useAddToCartMutation, useRemoveFromCartMutation } from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast, showInfoToast, showTopCenterToast } from "../../utils/toastConfig";

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
        className={`relative w-[100px] h-[100px] rounded-full overflow-hidden mb-3 border-4 transition-all ${
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
        className={`font-body font-medium text-[14px] leading-tight max-w-[100px] ${
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
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [groupedServices, setGroupedServices] = useState({});

  /**
   * Group services by category when data loads
   * Extracts unique categories with counts
   * Uses icon_url from service_categories or fallback to getCategoryImage
   */
  useEffect(() => {
    if (services.length > 0) {
      // Group services by category
      const grouped = groupServicesByCategory(services);
      setGroupedServices(grouped);
      
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

      const categories = Array.from(categoriesMap.values()).map((cat, index) => ({
        id: index + 1,
        name: cat.name,
        image: cat.icon_url || getCategoryImage(cat.name), // Use icon_url if available, fallback to getCategoryImage
        count: cat.count,
      }));
      setServiceCategories(categories);
      
      // Set first category as selected
      if (categories.length > 0) {
        setSelectedCategory(categories[0].name);
      }
    }
  }, [services]);

  /**
   * groupServicesByCategory - Groups services array by category name
   * Returns object with category names as keys and service arrays as values
   */
  const groupServicesByCategory = (servicesList) => {
    const grouped = {};
    
    servicesList.forEach((service) => {
      const categoryName = service.service_categories?.name || 'Other Services';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(service);
    });
    
    return grouped;
  };

  /**
   * handleAddToCart - Adds service to cart with validation
   * 
   * VALIDATION:
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
    // Check if trying to add from different salon
    if (cart?.salon_id && cart.salon_id !== id) {
      showTopCenterToast(
        `Your cart contains items from ${cart.salon_name}. Please clear your cart to add items from a different salon.`,
        'error',
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
      showSuccessToast(`${service.name} added to cart!`);
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
        showInfoToast(`${service.name} removed from cart!`);
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

  // Error state - shows error message and back button
  if (error || !salon) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            {error || "Salon Not Found"}
          </h2>
          <button
            onClick={() => navigate("/salons")}
            className="bg-accent-orange text-primary-white px-6 py-3 rounded-lg font-body font-medium hover:opacity-90"
          >
            Back to Salons
          </button>
        </div>
      </div>
    );
  }

  // Filter services for currently selected category
  const currentServices = selectedCategory ? (groupedServices[selectedCategory] || []) : [];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/salons/${id}`)}
            className="flex items-center gap-2 text-neutral-gray-500 hover:text-accent-orange transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-body font-medium">Back to Salon</span>
          </button>
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Select Services
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            Choose from our wide range of services at {salon.name}
          </p>
        </div>

        {/* Service Categories with Navigation Arrows */}
        <div className="bg-primary-white rounded-[10px] p-6 shadow-lg mb-6">
          <div className="relative">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-bg-secondary rounded-full hover:bg-neutral-gray-600 transition-colors">
                <svg
                  className="w-5 h-5 text-neutral-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                {serviceCategories.map((category) => (
                  <ServiceCategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.name}
                    onClick={() => setSelectedCategory(category.name)}
                  />
                ))}
              </div>

              <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-bg-secondary rounded-full hover:bg-neutral-gray-600 transition-colors">
                <svg
                  className="w-5 h-5 text-neutral-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Category Services */}
        <div className="bg-primary-white rounded-[10px] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-[24px] text-neutral-black">
              {selectedCategory}
            </h2>
            <span className="font-body text-[14px] text-neutral-gray-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-neutral-gray-600 rounded-lg p-4 hover:shadow-lg hover:border-accent-orange transition-all"
                >
                  {/* Service Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-[18px] text-neutral-black mb-1">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-accent-orange"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-body text-[14px] text-neutral-black">
                            {service.duration_minutes} min
                          </span>
                        </div>
                        <div className="font-display font-bold text-[18px] text-accent-orange">
                          ₹{service.price}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  {isServiceInCart(service) ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-neutral-gray-600 text-neutral-black rounded-lg font-body font-semibold text-[14px] cursor-not-allowed"
                    >
                      Added to Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(service)}
                      className="w-full py-2.5 bg-accent-orange text-primary-white rounded-lg font-body font-semibold text-[14px] hover:bg-orange-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart?.item_count > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => navigate(`/cart`)}
            className="bg-accent-orange hover:opacity-90 text-primary-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-3 transition-opacity"
          >
            <div className="relative">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-neutral-black text-primary-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart?.item_count || 0}
              </span>
            </div>
            <div className="text-left">
              <span className="font-body font-semibold text-[16px] block">
                View Cart
              </span>
              <span className="font-body text-[12px] opacity-90">
                ₹{cart?.total_amount || 0}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
