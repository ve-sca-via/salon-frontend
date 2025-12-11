import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../../store/slices/authSlice";
import { useLogoutMutation } from "../../../services/api/authApi";
import { useClearCartMutation } from "../../../services/api/cartApi";
import { toast } from "react-toastify";
import { UserIcon } from "./Icons";

export function AuthButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // RTK Query mutations
  const [logoutApi] = useLogoutMutation();
  const [clearCart] = useClearCartMutation();

  const handleLogout = async () => {
    try {
      setShowDropdown(false);

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
    if (name.length <= 15) return name;
    return name.substring(0, 15) + "...";
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

  const getMenuItems = () => {
    const role = user?.role;
    
    // Common logout item for all roles
    const logoutItem = {
      label: 'Logout',
      onClick: handleLogout,
      hasBorder: true
    };

    switch (role) {
      case 'customer':
        return [
          {
            label: 'My Bookings',
            onClick: () => navigate("/my-bookings")
          },
          {
            label: 'My Cart',
            onClick: () => navigate("/cart")
          },
          logoutItem
        ];

      case 'vendor':
      case 'salon':
        return [
          {
            label: 'Dashboard',
            onClick: () => navigate(getRoleBasedDashboard()),
            isBold: true
          },
          logoutItem
        ];

      case 'relationship_manager':
      case 'admin':
        return [
          {
            label: 'Dashboard',
            onClick: () => navigate(getRoleBasedDashboard()),
            isBold: true
          },
          logoutItem
        ];

      default:
        return [logoutItem];
    }
  };

  if (isAuthenticated && user) {
    const menuItems = getMenuItems();

    return (
      <div className="relative">
        <button
          className="hidden lg:flex bg-neutral-black box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="true"
        >
          <UserIcon />
          <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
            {truncateName(user.full_name)}
          </p>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-neutral-gray-600">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setShowDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm text-neutral-black hover:bg-neutral-gray-600 font-body ${
                    item.isBold ? 'font-semibold' : ''
                  } ${item.hasBorder ? 'border-t border-neutral-gray-600' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      className="hidden lg:flex bg-neutral-black box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => navigate("/login")}
    >
      <UserIcon />
      <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
        Login / Sign Up
      </p>
    </button>
  );
}
