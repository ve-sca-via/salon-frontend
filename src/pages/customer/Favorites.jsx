import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from "../../services/api/favoriteApi";
import { FiHeart, FiMapPin, FiStar, FiTrash2 } from "react-icons/fi";

// Favorite Salon Card Component
function FavoriteSalonCard({ salon, onRemove, onViewDetails }) {
  const [removing, setRemoving] = React.useState(false);

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
          src={salon.images?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop"}
          alt={salon.name}
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
            {salon.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-body font-semibold text-[14px] text-neutral-black">
                {salon.rating || "4.5"}
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
              {salon.address_line1}, {salon.city}, {salon.state}
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
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-primary-white font-body font-semibold text-[14px] py-2 rounded-lg transition-opacity"
          >
            View Details
          </button>
          <button
            onClick={() => onViewDetails(salon.id)}
            className="px-4 border border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-primary-white font-body font-medium text-[14px] py-2 rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
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

  const handleRemoveFavorite = async (salonId) => {
    try {
      await removeFavorite(salonId).unwrap();
      toast.success("Removed from favorites", {
        position: "bottom-right",
        autoClose: 2000,
        style: {
          backgroundColor: "#000000",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    } catch (error) {
      console.error("Remove favorite error:", error);
      toast.error(error?.message || "Failed to remove from favorites");
    }
  };

  const handleViewDetails = (salonId) => {
    navigate(`/salons/${salonId}`);
  };

  const handleBrowse = () => {
    navigate("/salons");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full" />
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            Loading your favorites...
          </h2>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
