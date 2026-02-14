import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../services/api/authApi';
import { useGetVendorSalonQuery, useUpdateVendorSalonMutation } from '../../services/api/vendorApi';
import { FiMenu, FiUser, FiLogOut, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import { showSuccessToast } from '../../utils/toastConfig';
import { getUserLocation } from '../../store/slices/locationSlice';

const Navbar = ({ onMenuClick, onSidebarToggle, role }) => {
  const { user } = useSelector((state) => state.auth);
  const { locationName, userLocation } = useSelector((state) => state.location);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  // RTK Query logout mutation
  const [logoutApi] = useLogoutMutation();
  
  // Vendor-specific: Get salon data and update mutation
  const isVendor = role === 'vendor' || user?.role === 'vendor' || user?.role === 'salon';
  const { data: salonData } = useGetVendorSalonQuery(undefined, { skip: !isVendor });
  const [updateSalon, { isLoading: isUpdating }] = useUpdateVendorSalonMutation();
  const salonProfile = salonData?.salon || salonData;
  
  // Toggle accepting bookings
  const handleToggleAcceptingBookings = async () => {
    try {
      const newStatus = !salonProfile.accepting_bookings;
      await updateSalon({ accepting_bookings: newStatus }).unwrap();
      showSuccessToast(
        newStatus 
          ? '✅ Bookings enabled! Customers can now book your services.' 
          : '🔒 Bookings disabled temporarily.',
        { position: 'top-center' }
      );
    } catch (error) {
      // Toggle failed
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API to invalidate token
      await logoutApi().unwrap();
    } catch (error) {
      // Continue with logout even if backend call fails
    }
    
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear Redux auth state
    dispatch(clearUser());
    
    navigate('/login');
  };

  const getRoleBasedHome = () => {
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

  const getRoleBasedProfile = () => {
    switch (user?.role) {
      case 'customer':
        return '/customer/profile';
      case 'vendor':
      case 'salon':
        return '/vendor/profile';
      case 'relationship_manager':
        return '/hmr/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/profile';
    }
  };

  return (
    <nav className={`${
      isVendor && salonProfile
        ? salonProfile.accepting_bookings
          ? 'bg-gradient-to-r from-green-50 via-white to-green-50 border-b-2 border-green-200'
          : 'bg-gradient-to-r from-red-50 via-white to-red-50 border-b-2 border-red-200'
        : 'bg-white border-b border-gray-100'
    } fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg"
            >
              <FiMenu size={24} />
            </button>
            
            <button
              onClick={onSidebarToggle}
              className="hidden lg:block text-gray-600 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg"
              title="Toggle sidebar"
            >
              <FiMenu size={24} />
            </button>
            
            <Link to={getRoleBasedHome()} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">
                  L
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900 block">
                  {user?.role === 'relationship_manager' ? 'Lubist - Beauty. Booking. Simplified.' : 'Salon Manager'}
                </span>
                {/* Location Display */}
                {locationName && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(getUserLocation());
                    }}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600 transition-colors mt-0.5 group"
                    title="Click to refresh location"
                  >
                    <FiMapPin className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span className="truncate max-w-[200px]">{locationName}</span>
                  </button>
                )}
                {userLocation && !locationName && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <FiMapPin className="w-3 h-3" />
                    <span>Getting location...</span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Vendor: Accepting Bookings Toggle */}
            {isVendor && salonProfile && (
              <div className="flex items-center gap-2 mr-1 sm:mr-2">
                <button
                  onClick={handleToggleAcceptingBookings}
                  disabled={isUpdating}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    salonProfile.accepting_bookings
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={salonProfile.accepting_bookings ? 'Click to disable bookings' : 'Click to enable bookings'}
                >
                  {salonProfile.accepting_bookings ? (
                    <>
                      <FiCheckCircle size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Accepting Bookings</span>
                    </>
                  ) : (
                    <>
                      <FiXCircle size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Bookings Disabled</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                  alt={user?.full_name || user?.name}
                  className="h-8 w-8 rounded-full ring-2 ring-orange-100"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'guest'}</p>
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                    <Link
                      to={getRoleBasedProfile()}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <FiLogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
