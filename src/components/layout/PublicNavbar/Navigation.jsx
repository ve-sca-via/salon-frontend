import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMapPin, FiScissors } from "react-icons/fi";
import { Menu } from "./Menu";
import { Actions } from "./Actions";
import { HamburgerIcon } from "./Icons";
import { getUserLocation } from "../../../store/slices/locationSlice";
import { useGetCartQuery } from "../../../services/api/cartApi";

export function Navigation({ onMenuToggle, isMenuOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { locationName, userLocation } = useSelector((state) => state.location);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  return (
    <div className="content-stretch flex gap-[12px] md:gap-[60px] lg:gap-[120px] xl:gap-[237px] items-start justify-between relative w-full max-w-[1296px]">
      <Link
        to="/"
        className="relative shrink-0 pt-1"
      >
        <div className="flex flex-col items-start">
          <img src="/logo/lubist_logo_2.svg" alt="Lubist" className="h-[36px] sm:h-[42px] md:h-[48px] w-auto" />
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

      {/* Mobile: Login/Signup Button and Hamburger Menu */}
      <div className="lg:hidden flex items-center gap-1 sm:gap-2 self-start">
        {isAuthenticated && (
           <button
             onClick={() => navigate("/cart")}
             className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors mt-0.5"
             aria-label="View Cart"
           >
              <FiScissors className="w-5 h-5 text-neutral-black" />
             {cart?.item_count > 0 && (
               <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                 {cart?.item_count}
               </span>
             )}
           </button>
        )}
        {!isAuthenticated && (
          <button
            className="bg-neutral-black flex items-center justify-center px-3 py-2 rounded-md hover:opacity-90 transition-opacity"
            onClick={() => navigate("/login")}
            aria-label="Login or Sign up"
          >
            <span className="font-body font-medium text-[13px] text-white whitespace-nowrap">
              Login / Sign Up
            </span>
          </button>
        )}
        <button
          className="p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <HamburgerIcon isOpen={isMenuOpen} />
        </button>
      </div>
    </div>
  );
}
