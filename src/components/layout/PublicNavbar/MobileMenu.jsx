import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../../store/slices/authSlice";
import { useLogoutMutation } from "../../../services/api/authApi";
import { useClearCartMutation } from "../../../services/api/cartApi";
import { toast } from "react-toastify";
import { MobileMenuItem } from "./MenuItem";
import { MobileDropdown } from "./Dropdown";
import { SERVICES_ITEMS, PAGES_ITEMS } from "./Menu";

export function MobileMenu({ isOpen, onClose }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // RTK Query mutations
  const [logoutApi] = useLogoutMutation();
  const [clearCart] = useClearCartMutation();

  const handleLogout = async () => {
    try {
      onClose();

      // Call logout API (invalidates token on backend)
      try {
        await logoutApi().unwrap();
      } catch (apiError) {
        // Backend logout failed, continuing with local cleanup
      }

      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear user from Redux
      dispatch(clearUser());
      
      // Clear cart from database (only if authenticated)
      if (isAuthenticated) {
        await clearCart().unwrap().catch(err => {
          // Cart clear failed
        });
      }

      toast.success("Logged out successfully", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "#000000",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });

      navigate("/");
    } catch (error) {
      toast.error("Error logging out", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "#EF4444",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    }
  };

  const truncateName = (name) => {
    if (!name) return "User";
    if (name.length <= 20) return name;
    return name.substring(0, 20) + "...";
  };

  const getRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'customer':
        return '/customer/dashboard';
      case 'vendor':
      case 'salon':
        return '/vendor/dashboard';
      case 'relationship_manager':
        return '/hmr/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden bg-white border-t border-neutral-gray-600 shadow-lg">
      <div className="flex flex-col">
        <MobileMenuItem to="/" onClick={onClose}>
          Home
        </MobileMenuItem>
        <MobileMenuItem to="/salons" onClick={onClose}>
          Browse Salons
        </MobileMenuItem>

        <MobileDropdown
          items={SERVICES_ITEMS}
          isOpen={servicesOpen}
          onToggle={() => {
            setServicesOpen(!servicesOpen);
            setPagesOpen(false);
          }}
          onItemClick={onClose}
        >
          Services
        </MobileDropdown>

        <MobileDropdown
          items={PAGES_ITEMS}
          isOpen={pagesOpen}
          onToggle={() => {
            setPagesOpen(!pagesOpen);
            setServicesOpen(false);
          }}
          onItemClick={onClose}
        >
          More
        </MobileDropdown>

        {/* CTA Button */}
        <div className="border-t border-neutral-gray-600 mt-2 pt-4 px-4">
          <button
            className="w-full bg-gradient-orange flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
            onClick={() => {
              navigate("/salons");
              onClose();
            }}
          >
            <span className="font-body font-medium text-[14px] text-white">
              Book Appointment
            </span>
          </button>
        </div>

        {/* User Menu Section */}
        {isAuthenticated && user ? (
          <div className="border-t border-neutral-gray-600 mt-4">
            {/* User Welcome Header */}
            <div className="px-4 py-3 bg-gray-50">
              <p className="font-body text-[12px] text-neutral-gray-500 uppercase tracking-wide">
                Account
              </p>
              <p className="font-body text-[14px] text-neutral-black font-medium mt-1">
                {truncateName(user.full_name)}
              </p>
            </div>
            
            {/* Customer Menu Items */}
            {user.role === 'customer' && (
              <>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-neutral-black hover:bg-gray-50 transition-colors border-b border-neutral-gray-600"
                  onClick={() => {
                    navigate("/my-bookings");
                    onClose();
                  }}
                >
                  <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-body font-medium text-[15px]">My Bookings</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-neutral-black hover:bg-gray-50 transition-colors border-b border-neutral-gray-600"
                  onClick={() => {
                    navigate("/cart");
                    onClose();
                  }}
                >
                  <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-body font-medium text-[15px]">My Cart</span>
                </button>
              </>
            )}
            
            {/* Non-customer: Dashboard Link */}
            {user.role !== 'customer' && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-black hover:bg-gray-50 transition-colors border-b border-neutral-gray-600"
                onClick={() => {
                  navigate(getRoleBasedDashboard());
                  onClose();
                }}
              >
                <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-body font-medium text-[15px]">Dashboard</span>
              </button>
            )}
            
            {/* Logout */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-body font-medium text-[15px]">Logout</span>
            </button>
          </div>
        ) : (
          <div className="border-t border-neutral-gray-600 mt-4 px-4 py-4">
            <button
              className="w-full bg-neutral-black flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
              onClick={() => {
                navigate("/login");
                onClose();
              }}
            >
              <span className="font-body font-medium text-[14px] text-white">
                Login / Sign Up
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
