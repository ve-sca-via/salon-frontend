/**
 * SalonDetail.jsx - Individual Salon Details and Preview
 * 
 * PURPOSE:
 * - Display complete salon information (location, hours, contact)
 * - Show featured services grouped by category
 * - Display customer reviews with ratings
 * - Provide CTA to book services
 * 
 * DATA MANAGEMENT:
 * - Fetches salon details via useGetSalonByIdQuery
 * - Fetches salon services via useGetSalonServicesQuery
 * - Groups services by category for navigation
 * - Uses icon_url from DB or fallback images
 * 
 * KEY FEATURES:
 * - Hero section with salon images and info
 * - Breadcrumb navigation
 * - Category-based service browsing
 * - Service cards with hover effects
 * - Reviews section with star ratings
 * - Map integration for location
 * - "Book Services" CTA button
 * 
 * USER FLOW:
 * 1. View salon overview (images, rating, location)
 * 2. Browse services by category
 * 3. Read customer reviews
 * 4. Click "Book Services" → navigate to /salons/:id/book
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetSalonByIdQuery, useGetSalonServicesQuery } from "../../services/api/salonApi";
import { FiStar, FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { SkeletonServiceCard, SkeletonText } from "../../components/shared/Skeleton";

/**
 * getCategoryImage - Returns category-specific image URL
 * Uses service image_url if available, otherwise matches category/service name to predefined Unsplash images
 */
const getCategoryImage = (categoryName, serviceName) => {
  const category = categoryName?.toLowerCase() || serviceName?.toLowerCase() || '';
  
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

  // Check category name first
  for (const [key, image] of Object.entries(categoryImages)) {
    if (category.includes(key)) {
      return image;
    }
  }

  // Default image
  return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=300&fit=crop';
};

/**
 * StarRating - Displays 5-star rating component
 * Fills stars based on rating prop (1-5)
 * Supports small and large sizes
 */
function StarRating({ rating = 5, size = "small" }) {
  const starSize = size === "small" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={starSize}
          fill={index < rating ? "#FFC107" : "#E0E0E0"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Breadcrumb - Navigation breadcrumbs
 * Shows: Home / Salons / City / Salon Name
 */
function Breadcrumb({ city, salonName }) {
  return (
    <nav className="flex items-center gap-2 text-sm font-body mb-6 bg-white px-4 py-3 rounded-lg shadow-sm">
      <Link to="/" className="text-gray-700 hover:text-accent-orange font-medium transition-colors">
        Home
      </Link>
      <span className="text-gray-400">/</span>
      <Link
        to="/salons"
        className="text-gray-700 hover:text-accent-orange font-medium transition-colors"
      >
        Salons
      </Link>
      <span className="text-gray-400">/</span>
      <span className="text-gray-700 font-medium">{city}</span>
      <span className="text-gray-400">/</span>
      <span className="text-neutral-black font-semibold">{salonName}</span>
    </nav>
  );
}

/**
 * ServiceCard - Individual service preview card
 * Displays service image, name, price, duration
 * Clickable to navigate to booking page
 * Hover effects: shadow lift, image scale
 */
function ServiceCard({ service, onBook }) {
  const categoryImage = service.image_url || getCategoryImage(service.category_name, service.name);
  
  return (
    <div 
      className="flex flex-col items-center text-center group cursor-pointer"
      onClick={() => onBook(service)}
    >
      <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all">
        <img
          src={categoryImage}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 bg-accent-orange text-white px-2 py-1 rounded-full text-xs font-bold">
          ₹{service.price}
        </div>
      </div>
      <h4 className="font-body font-semibold text-[15px] text-neutral-black leading-tight max-w-[140px] mb-1 group-hover:text-accent-orange transition-colors">
        {service.name}
      </h4>
      {service.duration_minutes && (
        <p className="font-body text-[12px] text-neutral-gray-600">
          {service.duration_minutes} min
        </p>
      )}
    </div>
  );
}

/**
 * CategoryCard - Service category navigation card
 * Shows category icon and name
 * Clicking scrolls to category section
 */
function CategoryCard({ category, onClick }) {
  return (
    <div 
      className="flex flex-col items-center text-center group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-accent-orange group-hover:shadow-xl transition-all">
        <img
          src={category.icon_url || getCategoryImage(category.name)}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = getCategoryImage(category.name);
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/30 to-transparent"></div>
        
        {/* Category Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="font-display font-bold text-[18px] text-primary-white mb-1 leading-tight">
            {category.name}
          </h4>
          <p className="font-body text-[13px] text-primary-white/90">
            {category.serviceCount} {category.serviceCount === 1 ? 'service' : 'services'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ReviewCard - Customer review display card
 * Shows customer avatar, name, rating, date, and comment
 */
function ReviewCard({ review }) {
  return (
    <div className="bg-white border border-neutral-gray-300 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h4 className="font-body font-semibold text-[16px] text-neutral-black">
            {review.name}
          </h4>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="font-body text-[12px] text-neutral-gray-600">
              {review.date}
            </span>
          </div>
        </div>
      </div>
      <p className="font-body text-[15px] text-neutral-gray-700 leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
}

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // RTK Query hooks - automatic caching!
  const { data: salonData, isLoading: loading, error } = useGetSalonByIdQuery(id);
  const { data: servicesData, isLoading: servicesLoading } = useGetSalonServicesQuery(id);
  
  // Extract data from responses
  const salon = salonData?.salon || salonData;
  const services = servicesData?.services || [];
  
  // Local UI state
  const [activeTab, setActiveTab] = useState("services");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);

  // Extract categories from services when they load
  useEffect(() => {
    if (services && services.length > 0) {
      // Extract unique categories from services
      const categoriesMap = new Map();
      services.forEach(service => {
        const categoryId = service.category_id;
        const categoryName = service.service_categories?.name;
        const iconUrl = service.service_categories?.icon_url;
        
        if (categoryId && categoryName) {
          if (!categoriesMap.has(categoryId)) {
            categoriesMap.set(categoryId, {
              id: categoryId,
              name: categoryName,
              icon_url: iconUrl,
              serviceCount: 1
            });
          } else {
            const cat = categoriesMap.get(categoryId);
            cat.serviceCount += 1;
          }
        }
      });
      
      const categoriesArray = Array.from(categoriesMap.values());
      setServiceCategories(categoriesArray);
    }
  }, [services]); // Re-run when services change

  const handleBookService = (service) => {
    navigate(`/salons/${id}/book`, { state: { selectedService: service } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-96 w-full bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-10 w-64 bg-gray-200 rounded mb-3"></div>
            <div className="h-5 w-96 bg-gray-200 rounded"></div>
          </div>
          
          {/* Services Skeleton */}
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonServiceCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Parse salon images from database - use cover_images array
  let salonImages = [];
  
  // Add logo first if available
  if (salon.logo_url) {
    salonImages.push(salon.logo_url);
  }
  
  // Add cover images from database
  if (salon.cover_images && Array.isArray(salon.cover_images)) {
    salonImages = [...salonImages, ...salon.cover_images];
  }
  
  // Fallback image if no images available
  if (salonImages.length === 0) {
    salonImages = ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop"];
  }

  // Parse business hours - handle both formats
  const getBusinessHours = () => {
    // Helper to format time from 24-hour to 12-hour
    const formatTime = (time24) => {
      if (!time24) return '';
      const [hours24, minutes] = time24.split(':').map(Number);
      const period = hours24 >= 12 ? 'PM' : 'AM';
      const hours12 = hours24 % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Check if new business_hours JSONB field exists
    if (salon.business_hours && typeof salon.business_hours === 'object') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return days.map(day => {
        const dayData = salon.business_hours[day] || {};
        const hours = dayData.closed 
          ? "Closed" 
          : dayData.open && dayData.close
          ? `${dayData.open} - ${dayData.close}`
          : "9:00 AM - 8:00 PM";
        return [day.charAt(0).toUpperCase() + day.slice(1), hours];
      });
    }
    
    // Use database fields: opening_time, closing_time, working_days
    if (salon.opening_time && salon.closing_time) {
      const openTime = formatTime(salon.opening_time);
      const closeTime = formatTime(salon.closing_time);
      const hours = `${openTime} - ${closeTime}`;
      
      // Get working days (normalize to lowercase for comparison)
      const workingDays = (salon.working_days || []).map(d => d.toLowerCase());
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      return days.map(day => {
        const isWorking = workingDays.includes(day);
        return [
          day.charAt(0).toUpperCase() + day.slice(1),
          isWorking ? hours : "Closed"
        ];
      });
    }
    
    // Default hours if no data available
    return [
      ["Monday", "9:00 AM - 8:00 PM"],
      ["Tuesday", "9:00 AM - 8:00 PM"],
      ["Wednesday", "9:00 AM - 8:00 PM"],
      ["Thursday", "9:00 AM - 8:00 PM"],
      ["Friday", "9:00 AM - 8:00 PM"],
      ["Saturday", "10:00 AM - 6:00 PM"],
      ["Sunday", "10:00 AM - 6:00 PM"],
    ];
  };

  // Sample reviews (will be replaced with real reviews from API later)
  const displayReviews = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent service! The staff was very professional and friendly. Loved my new haircut!",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      rating: 4,
      date: "1 week ago",
      comment: "Great experience overall. The salon is clean and well-maintained. Will visit again.",
    },
    {
      id: 3,
      name: "Anjali Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
      rating: 5,
      date: "2 weeks ago",
      comment: "Best salon in the area! Amazing hair spa treatment. Highly recommended!",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb
          city={salon.city || "City"}
          salonName={salon.business_name || salon.name}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div 
                className="relative h-[500px] bg-gray-100 cursor-pointer group"
                onClick={() => setIsImagePreviewOpen(true)}
              >
                <img
                  src={salonImages[selectedImage]}
                  alt={salon.business_name || salon.name}
                  className="w-full h-full object-contain"
                />
                {/* Preview Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg font-body font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Click to preview
                    </div>
                  </div>
                </div>
                {/* Image counter badge */}
                {salonImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-body">
                    {selectedImage + 1} / {salonImages.length}
                  </div>
                )}
              </div>
              {salonImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
                  {salonImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === index
                          ? "border-accent-orange shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${salon.business_name || salon.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Preview Modal */}
            {isImagePreviewOpen && (
              <div 
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={() => setIsImagePreviewOpen(false)}
              >
                <button
                  onClick={() => setIsImagePreviewOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                  aria-label="Close preview"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Navigation arrows */}
                {salonImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((prev) => (prev > 0 ? prev - 1 : salonImages.length - 1));
                      }}
                      className="absolute left-4 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((prev) => (prev < salonImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-4 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                <img
                  src={salonImages[selectedImage]}
                  alt={salon.business_name || salon.name}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-body">
                  {selectedImage + 1} of {salonImages.length}
                </div>
              </div>
            )}


            {/* Salon Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                    {salon.business_name || salon.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating
                      rating={Math.floor(salon.average_rating || 4.5)}
                      size="large"
                    />
                    <span className="font-body font-semibold text-[16px] text-neutral-black">
                      {salon.average_rating || '4.5'}
                    </span>
                    <span className="font-body text-[14px] text-neutral-gray-600">
                      ({salon.review_count || '45'} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-gray-700">
                    <FiMapPin className="w-5 h-5 text-accent-orange" />
                    <span className="font-body text-[15px]">
                      {salon.address || `${salon.city}, ${salon.state}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {salon.phone && (
                    <a
                      href={`tel:${salon.phone}`}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-accent-orange text-accent-orange rounded-lg hover:bg-accent-orange hover:text-white transition-colors"
                      aria-label={`Call ${salon.business_name || salon.name}`}
                    >
                      <FiPhone className="w-5 h-5" />
                      <span className="font-body font-medium">Call</span>
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 border-2 border-accent-orange text-accent-orange rounded-lg hover:bg-accent-orange hover:text-white transition-colors">
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="font-body font-medium">Share</span>
                  </button>
                </div>
              </div>

              {salon.description && (
                <div className="border-t border-neutral-gray-300 pt-4">
                  <p className="font-body text-[15px] text-neutral-gray-700 leading-relaxed">
                    {salon.description}
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-neutral-gray-300">
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex-1 px-6 py-4 font-body font-semibold text-[16px] transition-colors ${
                    activeTab === "services"
                      ? "text-accent-orange border-b-2 border-accent-orange"
                      : "text-neutral-gray-600 hover:text-neutral-black"
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 px-6 py-4 font-body font-semibold text-[16px] transition-colors ${
                    activeTab === "reviews"
                      ? "text-accent-orange border-b-2 border-accent-orange"
                      : "text-neutral-gray-600 hover:text-neutral-black"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className={`flex-1 px-6 py-4 font-body font-semibold text-[16px] transition-colors ${
                    activeTab === "about"
                      ? "text-accent-orange border-b-2 border-accent-orange"
                      : "text-neutral-gray-600 hover:text-neutral-black"
                  }`}
                >
                  About
                </button>
              </div>

              <div className="p-6">
                {activeTab === "services" && (
                  <div>
                    <h3 className="font-display font-bold text-[24px] text-neutral-black mb-6">
                      Service Categories
                    </h3>
                    
                    {servicesLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-neutral-gray-600">Loading categories...</p>
                      </div>
                    ) : serviceCategories.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {serviceCategories.map((category) => (
                          <CategoryCard 
                            key={category.id} 
                            category={category}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-neutral-gray-100 rounded-xl">
                        <p className="text-neutral-gray-600 font-body text-[15px]">
                          No service categories available at the moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-[24px] text-neutral-black mb-6">
                      Customer Reviews
                    </h3>
                    {displayReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}

                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-body font-semibold text-[20px] text-neutral-black mb-3">
                        About the Salon
                      </h3>
                      <p className="font-body text-[15px] text-neutral-gray-700 leading-relaxed">
                        {salon.description || "Welcome to our salon! We provide premium beauty and grooming services with experienced professionals."}
                      </p>
                    </div>

                    {salon.categories && salon.categories.length > 0 && (
                      <div>
                        <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-3">
                          Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {salon.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-orange-50 text-accent-orange font-body text-[14px] rounded-full border border-accent-orange"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
              {/* Salon Name */}
              <h3 className="font-display font-bold text-[24px] text-neutral-black mb-4">
                {salon.business_name || salon.name}
              </h3>

              <div className="space-y-4 mb-6">
                {/* Email */}
                {salon.email && (
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-accent-orange" />
                    <span className="font-body text-[15px] text-neutral-black font-medium">
                      {salon.email}
                    </span>
                  </div>
                )}

                {/* Working Hours Dropdown */}
                <div className="border border-neutral-gray-300 rounded-lg">
                  <button
                    onClick={() =>
                      document
                        .getElementById("working-hours")
                        .classList.toggle("hidden")
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-gray-100 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FiClock className="w-5 h-5 text-accent-orange" />
                      <span className="font-body text-[15px] text-neutral-black font-medium">
                        View Hours
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div id="working-hours" className="hidden px-4 pb-3">
                    <div className="space-y-2 pt-2 border-t border-neutral-gray-300">
                      {getBusinessHours().map(([day, hours]) => (
                        <div
                          key={day}
                          className="flex justify-between items-center"
                        >
                          <span className="font-body text-[14px] text-neutral-gray-700">
                            {day}
                          </span>
                          <span className="font-body text-[14px] text-neutral-black font-medium">
                            {hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-accent-orange mt-0.5" />
                  <span className="font-body text-[14px] text-neutral-gray-700 leading-relaxed">
                    {salon.address || `${salon.city}, ${salon.state}`}
                  </span>
                </div>
              </div>

              {/* Book Services Button */}
              <button
                onClick={() => navigate(`/salons/${salon.id}/book`)}
                disabled={!salon.is_active || !salon.accepting_bookings}
                className="w-full bg-accent-orange hover:opacity-90 text-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!salon.is_active || !salon.accepting_bookings ? 'Bookings Not Available' : 'Book Services'}
              </button>
              {(!salon.is_active || !salon.accepting_bookings) && (
                <p className="text-center text-[12px] text-neutral-gray-500 mt-2">
                  This salon is not accepting bookings at the moment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
