import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiCalendar, FiShoppingBag, FiClock, FiMapPin,
  FiSettings, FiUsers, FiBarChart2, FiCheckCircle, FiFileText,
  FiPlusCircle, FiList, FiUser, FiSave, FiAward
} from 'react-icons/fi';

const Sidebar = ({ role, isOpen, onClose }) => {
  const getMenuItems = () => {
    switch (role) {
      case 'customer':
        return [
          { path: '/customer/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/customer/salons', icon: <FiMapPin />, label: 'Find Salons' },
          { path: '/customer/bookings', icon: <FiCalendar />, label: 'My Bookings' },
          { path: '/customer/history', icon: <FiClock />, label: 'History' },
        ];
      case 'salon':
        return [
          { path: '/salon/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/salon/bookings', icon: <FiCalendar />, label: 'Bookings' },
          { path: '/salon/calendar', icon: <FiCalendar />, label: 'Calendar' },
          { path: '/salon/services', icon: <FiShoppingBag />, label: 'Services' },
          { path: '/salon/profile', icon: <FiSettings />, label: 'Profile' },
        ];
      case 'vendor':
        return [
          { path: '/vendor/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/vendor/profile', icon: <FiSettings />, label: 'Salon Profile' },
          { path: '/vendor/services', icon: <FiShoppingBag />, label: 'Services' },
          { path: '/vendor/staff', icon: <FiUsers />, label: 'Staff' },
          { path: '/vendor/bookings', icon: <FiCalendar />, label: 'Bookings' },
        ];
      case 'hmr':
        return [
          { path: '/hmr/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/hmr/add-salon', icon: <FiPlusCircle />, label: 'Add Salon' },
          { path: '/hmr/drafts', icon: <FiSave />, label: 'Drafts' },
          { path: '/hmr/submissions', icon: <FiList />, label: 'My Submissions' },
          { path: '/hmr/leaderboard', icon: <FiAward />, label: 'Leaderboard' },
          { path: '/hmr/profile', icon: <FiUser />, label: 'My Profile' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/admin/salons', icon: <FiCheckCircle />, label: 'Approve Salons' },
          { path: '/admin/bookings', icon: <FiCalendar />, label: 'All Bookings' },
          { path: '/admin/hmrs', icon: <FiUsers />, label: 'Manage HMRs' },
          { path: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40
          w-64 transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
         

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs text-orange-900 font-semibold">
                Need help?
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Contact support
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
