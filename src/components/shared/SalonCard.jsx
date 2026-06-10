import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiMapPin, FiChevronDown, FiChevronUp, FiHeart } from "react-icons/fi";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function SalonCard({
  salon,
  userLocation,
  isFavorited = false,
  onToggleFavorite,
  favoriteLoading = false,
  showFavoriteAction = false,
}) {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);

  const handleCardClick = (e) => {
    e.preventDefault();
    if (!isClicked) {
      setIsClicked(true);
      setTimeout(() => {
        navigate(`/salons/${salon.id}`);
        setTimeout(() => setIsClicked(false), 100);
      }, 350);
    }
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/salons/${salon.id}`);
  };

  const salonImage =
    salon.logo_url ||
    (salon.cover_images && salon.cover_images.length > 0 ? salon.cover_images[0] : null);

  let salonType = salon.business_type || salon.salon_type || salon.category || "Unisex";
  if (typeof salonType === "string") {
    salonType = salonType.replace(/_/g, " ");
  }

  return (
    <div
      className="relative flex flex-col bg-gray-50 overflow-hidden cursor-pointer border border-gray-200 rounded-xl shadow-md"
      onClick={handleCardClick}
    >
      <div className="relative h-[200px] w-full bg-gray-200 overflow-hidden">
        {salonImage ? (
          <img
            src={salonImage}
            alt={salon.business_name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isClicked ? "scale-105" : ""}`}
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.parentElement) {
                e.target.parentElement.style.background =
                  "linear-gradient(135deg, #f97316, #c2410c)";
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-700" />
        )}

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          <span className="bg-white/95 text-neutral-black text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm flex items-center h-[18px] pointer-events-auto">
            {salonType}
          </span>
          <div className="flex items-center gap-2 pointer-events-auto">
            {showFavoriteAction && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(salon.id);
                }}
                disabled={favoriteLoading}
                className={`rounded-full p-1.5 shadow-sm transition-colors ${
                  isFavorited
                    ? "bg-red-500 text-white"
                    : "bg-white/95 text-neutral-black"
                } disabled:opacity-60`}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <FiHeart size={12} className={isFavorited ? "fill-current" : ""} />
              </button>
            )}
            <span className="bg-[#FFD700] text-neutral-black text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 h-[18px]">
              <FiStar size={8} className="fill-current" /> Featured
            </span>
          </div>
        </div>

        {salon.has_discounted_services && (
          <div className="absolute top-8 left-2 z-10 pointer-events-none">
            <span className="bg-green-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm h-[18px] inline-flex items-center">
              Discount Available
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 bg-gradient-to-r from-orange-100 to-orange-50 text-accent-orange text-[10px] font-bold px-2.5 py-1 rounded-tr-lg z-10 shadow-sm border-t border-r border-orange-200/50">
          UPTO 20% OFF
        </div>

        <div
          className={`absolute inset-0 bg-black/40 z-20 transition-opacity duration-300 ${
            isClicked ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>

      <div className="flex flex-col p-3 bg-white border-t border-gray-100">
        <div className="flex items-start justify-between mb-1">
          <h3
            className={`text-neutral-black font-bold text-[15px] leading-tight line-clamp-1 transition-colors ${
              isClicked ? "text-accent-orange" : ""
            } pr-2`}
          >
            {salon.business_name}
          </h3>
          <span className="bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 shadow-sm">
            ★ {salon.average_rating || "4.5"}
          </span>
        </div>

        <div className="mb-3">
          {addressExpanded && (
            <div className="mb-1.5 px-1 py-1.5 bg-orange-50 border border-orange-100 rounded-lg">
              <p className="text-[11px] text-neutral-black leading-snug">
                {(salon.address || salon.address_line1 || [salon.city, salon.state].filter(Boolean).join(", ")).trim()}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-1 text-neutral-gray-500 min-w-0 flex-1 text-left"
              onClick={(e) => {
                e.stopPropagation();
                setAddressExpanded((v) => !v);
              }}
            >
              <FiMapPin size={12} className="flex-shrink-0 text-accent-orange" />
              <span className="text-[12px] font-medium leading-tight line-clamp-1 flex-1 min-w-0">
                {(() => {
                  const addr = (salon.address || salon.address_line1 || "").trim();
                  const cityState = [salon.city, salon.state].filter(Boolean).join(", ");
                  const display = addr || cityState;
                  const distance =
                    salon.distance_km ??
                    (userLocation
                      ? calculateDistance(
                          userLocation.lat,
                          userLocation.lon,
                          salon.latitude,
                          salon.longitude
                        )
                      : null);
                  const formattedDistance =
                    distance == null
                      ? ""
                      : distance < 1
                        ? ` • ${Math.round(distance * 1000)} m`
                        : ` • ${distance.toFixed(1)} km`;
                  return display + formattedDistance;
                })()}
              </span>
              {addressExpanded ? (
                <FiChevronUp size={12} className="flex-shrink-0 text-accent-orange ml-0.5" />
              ) : (
                <FiChevronDown size={12} className="flex-shrink-0 text-neutral-gray-400 ml-0.5" />
              )}
            </button>
            <button
              className="bg-accent-orange text-white font-bold text-[11px] px-4 py-1.5 rounded-md shrink-0 shadow-md transition-transform active:scale-95 z-30 ml-2"
              onClick={handleBookNow}
            >
              BOOK NOW
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center gap-2">
          <span className="text-[14px] leading-none">✨</span>
          <span className="text-[11px] text-gray-600 font-medium line-clamp-1">
            Extra 10% Off on Online Payments
          </span>
        </div>
      </div>
    </div>
  );
}

export const MobileSalonCard = SalonCard;
