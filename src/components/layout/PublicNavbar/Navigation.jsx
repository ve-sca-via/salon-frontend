import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMapPin } from "react-icons/fi";
import { Menu } from "./Menu";
import { Actions } from "./Actions";
import { HamburgerIcon } from "./Icons";
import { getUserLocation } from "../../../store/slices/locationSlice";

export function Navigation({ onMenuToggle, isMenuOpen }) {
  const dispatch = useDispatch();
  const { locationName, userLocation } = useSelector((state) => state.location);

  return (
    <div className="content-stretch flex gap-[20px] md:gap-[60px] lg:gap-[120px] xl:gap-[237px] items-start justify-between relative w-full max-w-[1296px]">
      <Link
        to="/"
        className="relative shrink-0 pt-1"
      >
        <div className="flex flex-col items-start">
          <span className="font-display font-bold text-[20px] leading-[24px] text-black whitespace-nowrap">Lubist</span>
          {/* Location Display */}
          {locationName && (
            <button
              onClick={(e) => {
                e.preventDefault();
                dispatch(getUserLocation());
              }}
              className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-orange-600 transition-colors mt-1 group font-body font-normal leading-tight"
              title="Click to refresh location"
            >
              <FiMapPin className="w-3 h-3 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{locationName}</span>
            </button>
          )}
          {userLocation && !locationName && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1 font-body font-normal leading-tight">
              <FiMapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-[11px]">Getting location...</span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-center pt-1">
        <Menu />
      </div>
      <div className="flex items-center pt-1">
        <Actions />
      </div>

      {/* Mobile Hamburger Menu */}
      <button
        className="lg:hidden p-2 hover:bg-neutral-gray-600 rounded-md transition-colors self-start"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <HamburgerIcon isOpen={isMenuOpen} />
      </button>
    </div>
  );
}
