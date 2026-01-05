/**
 * Favorites.jsx - User's Favorite Salons Page
 * 
 * PURPOSE:
 * - Display all salons marked as favorites by the user
 * - Allow removing salons from favorites
 * - Navigate to salon details or booking page
 * - Show empty state when no favorites exist
 * 
 * DATA MANAGEMENT:
 * - Fetches favorites via useGetFavoritesQuery
 * - Removes favorites via useRemoveFavoriteMutation
 * - RTK Query handles caching and automatic refetch
 * 
 * KEY FEATURES:
 * - Salon cards with image, rating, location
 * - Heart icon to remove from favorites
 * - "View Details" and "Book Now" buttons
 * - Empty state with CTA
 * - Loading and error states
 * - Responsive grid layout
 * 
 * USER FLOW:
 * 1. View all favorite salons
 * 2. Click heart to remove from favorites
 * 3. View details or book appointment
 * 4. Browse salons if no favorites
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from "../../services/api/favoriteApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import { FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import { SkeletonSalonCard } from "../../components/shared/Skeleton";

/**
 * FavoriteSalonCard - Individual favorite salon display card
 * Shows salon info with remove and action buttons
 */
function FavoriteSalonCard({ salon, onRemove, onViewDetails, onBook }) {
  const [removing, setRemoving] = React.useState(false);

  /**
   * handleRemove - Removes salon from favorites with loading state
   */
  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(salon.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-primary-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      {/* Salon Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={salon.cover_image_url || salon.images?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop"}
          alt={salon.business_name || salon.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Favorite Badge */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleRemove}
            disabled={removing}
            className="bg-primary-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-primary-white transition-colors disabled:opacity-50"
            title="Remove from favorites"
          >
            <FiHeart className="w-5 h-5 fill-current text-red-500 hover:text-primary-white" />
          </button>
        </div>
      </div>

      {/* Salon Info */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
            {salon.business_name || salon.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-body font-semibold text-[14px] text-neutral-black">
                {salon.average_rating || salon.rating || "4.5"}
              </span>
            </div>
            <span className="text-neutral-gray-500 text-[12px]">
              ({salon.review_count || 0} reviews)
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-neutral-gray-500">
            <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-body text-[13px] line-clamp-2">
              {salon.address || `${salon.address_line1 || ''}, ${salon.city}, ${salon.state}`}
            </span>
          </div>
        </div>

        {/* Description */}
        {salon.description && (
          <p className="font-body text-[13px] text-neutral-gray-500 line-clamp-2 mb-4">
            {salon.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails(salon.id)}
            className="flex-1 bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[14px] py-2 rounded-lg transition-opacity"
          >
            View Details
          </button>
          <button
            onClick={() => onBook(salon.id)}
            className="px-4 border border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-primary-white font-body font-medium text-[14px] py-2 rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * EmptyFavorites - Empty state when user has no favorites
 */
function EmptyFavorites({ onBrowse }) {
  return (
    <div className="bg-primary-white rounded-lg p-12 text-center shadow-md">
      <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <FiHeart className="w-12 h-12 text-neutral-gray-500" />
      </div>
      <h3 className="font-display font-bold text-[24px] text-neutral-black mb-2">
        No Favorites Yet
      </h3>
      <p className="font-body text-[16px] text-neutral-gray-500 mb-6">
        Start adding salons to your favorites to see them here
      </p>
      <button
        onClick={onBrowse}
        className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] px-8 py-3 rounded-lg transition-opacity"
      >
        Browse Salons
      </button>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: favoritesData, isLoading, error } = useGetFavoritesQuery();
  const [removeFavorite] = useRemoveFavoriteMutation();
  
  const favorites = favoritesData?.favorites || [];

  /**
   * handleRemoveFavorite - Removes salon from favorites list
   */
  const handleRemoveFavorite = async (salonId) => {
    try {
      await removeFavorite(salonId).unwrap();
      showSuccessToast("Removed from favorites");
    } catch (error) {
      showErrorToast(error?.message || "Failed to remove from favorites");
    }
  };

  /**
   * handleViewDetails - Navigate to salon detail page
   */
  const handleViewDetails = (salonId) => {
    navigate(`/salons/${salonId}`);
  };

  /**
   * handleBook - Navigate to salon booking page
   */
  const handleBook = (salonId) => {
    navigate(`/salons/${salonId}/book`);
  };

  /**
   * handleBrowse - Navigate to all salons page
   */
  const handleBrowse = () => {
    navigate("/salons");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-5 w-80 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonSalonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            {error?.message || "Failed to load favorites"}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-orange text-primary-white px-6 py-3 rounded-lg font-body font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-[36px] text-neutral-black mb-2">
            My Favorites
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            {favorites.length > 0
              ? `You have ${favorites.length} favorite salon${favorites.length > 1 ? "s" : ""}`
              : "No favorite salons yet"}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <EmptyFavorites onBrowse={handleBrowse} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((salon) => (
              <FavoriteSalonCard
                key={salon.id}
                salon={salon}
                onRemove={handleRemoveFavorite}
                onViewDetails={handleViewDetails}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
