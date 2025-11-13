import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../services/api/authApi';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  // RTK Query logout mutation
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Call backend logout API to invalidate token
      await logoutApi().unwrap();
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error('Logout API error:', error);
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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
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
            
            <Link to={getRoleBasedHome()} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  {user?.role === 'relationship_manager' ? 'Agent Dashboard' : 'Salon Manager'}
                </span>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
              <FiBell size={22} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
            </button>

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
                      to={`/${user?.role}/profile`}
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
