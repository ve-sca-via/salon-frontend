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
      console.log("Mobile logout button clicked");
      onClose();

      // Call logout API (invalidates token on backend)
      try {
        await logoutApi().unwrap();
        console.log("Backend logout successful");
      } catch (apiError) {
        console.warn("Backend logout failed, continuing with local cleanup:", apiError);
      }

      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log("Tokens cleared from localStorage");

      // Clear user from Redux
      dispatch(clearUser());
      
      // Clear cart from database (only if authenticated)
      if (isAuthenticated) {
        await clearCart().unwrap().catch(err => {
          console.warn("Cart clear failed on mobile logout:", err);
        });
      }
      console.log("Redux state cleared");

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
      console.log("Navigated to home");
    } catch (error) {
      console.error("Mobile logout error:", error);
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

        <div className="border-t border-neutral-gray-600 mt-2 pt-2 px-4 pb-4 space-y-2">
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

          {isAuthenticated && user ? (
            <>
              <div className="text-center py-2">
                <p className="font-body text-sm text-neutral-black">
                  Welcome,{" "}
                  <span className="font-medium">{truncateName(user.full_name)}</span>
                </p>
              </div>
              <button
                className="w-full bg-primary-600 flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
                onClick={() => {
                  navigate(getRoleBasedDashboard());
                  onClose();
                }}
              >
                <span className="font-body font-medium text-[14px] text-white">
                  Go to Dashboard
                </span>
              </button>
              <button
                className="w-full bg-neutral-black flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
                onClick={handleLogout}
              >
                <span className="font-body font-medium text-[14px] text-white">
                  Logout
                </span>
              </button>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
