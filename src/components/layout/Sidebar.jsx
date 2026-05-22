import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHome,
  FiCalendar,
  FiShoppingBag,
  FiMapPin,
  FiSettings,
  FiUsers,
  FiBarChart2,
  FiCheckCircle,
  FiPlusCircle,
  FiList,
  FiUser,
  FiSave,
  FiAward,
  FiPackage,
} from 'react-icons/fi';
import { useLogoutMutation } from '../../services/api/authApi';
import { useGetVendorSalonQuery } from '../../services/api/vendorApi';
import { clearUser } from '../../store/slices/authSlice';

/** Figma node 3:4 — Sidebar - Refined List Layout */
const VENDOR_SIDEBAR_ICONS = {
  dashboard: '/vendor/sidebar/dashboard.png',
  profile: '/vendor/sidebar/salon-profile.png',
  services: '/vendor/sidebar/services.png',
  bookings: '/vendor/sidebar/bookings.png',
  logout: '/vendor/sidebar/logout.png',
};

const VENDOR_NAV_ITEMS = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: VENDOR_SIDEBAR_ICONS.dashboard, w: 18, h: 18 },
  { path: '/vendor/profile', label: 'Salon Profile', icon: VENDOR_SIDEBAR_ICONS.profile, w: 20, h: 18 },
  { path: '/vendor/services', label: 'Services', icon: VENDOR_SIDEBAR_ICONS.services, w: 20, h: 20 },
  { path: '/vendor/bookings', label: 'Bookings', icon: VENDOR_SIDEBAR_ICONS.bookings, w: 18, h: 20 },
  { path: '/products', label: 'Product Catalog', icon: null, Icon: FiPackage, w: 20, h: 20 },
  {
    path: '/customer/my-orders',
    label: 'My Product Orders',
    icon: null,
    Icon: FiPackage,
    w: 20,
    h: 20,
  },
];

const REGULAR_BUYER_NAV_ITEMS = [
  { path: '/vendor/dashboard', label: 'Dashboard', icon: VENDOR_SIDEBAR_ICONS.dashboard, w: 18, h: 18 },
  { path: '/vendor/profile', label: 'My Profile', icon: VENDOR_SIDEBAR_ICONS.profile, w: 20, h: 18 },
  { path: '/products', label: 'Product Catalog', icon: null, Icon: FiPackage, w: 20, h: 20 },
  {
    path: '/customer/my-orders',
    label: 'My Product Orders',
    icon: null,
    Icon: FiPackage,
    w: 20,
    h: 20,
  },
];

const NavDivider = () => (
  <li className="py-2 px-4" aria-hidden>
    <div className="h-px w-full max-w-[240px] mx-auto bg-[#D9C3AD]" />
  </li>
);

const VendorNavIcon = ({ item, active }) => {
  if (item.icon) {
    return (
      <img
        src={item.icon}
        alt=""
        width={item.w}
        height={item.h}
        className={`shrink-0 object-contain ${active ? 'brightness-0 invert' : ''}`}
        draggable={false}
      />
    );
  }
  const Icon = item.Icon || FiPackage;
  return (
    <Icon
      size={item.w}
      className={`shrink-0 ${active ? 'text-white' : 'text-[#534433]'}`}
      strokeWidth={2}
    />
  );
};

const VendorRefinedSidebar = ({ role, isOpen, onClose, isCollapsed }) => {
  const { pathname, search } = useLocation();
  const currentPath = pathname + search;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const { data: salonData } = useGetVendorSalonQuery();
  const salonProfile = salonData?.salon || salonData;

  const navItems = role === 'regular_buyer' ? REGULAR_BUYER_NAV_ITEMS : VENDOR_NAV_ITEMS;
  const salonName = salonProfile?.business_name || 'Looks Salon';

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      /* continue logout */
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch(clearUser());
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#221A11]/20 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed top-16 left-0 z-40 flex h-[calc(100vh-4rem)] flex-col
          border-r border-[#D9C3AD]/40 bg-[#FFF1E6] shadow-[4px_0_24px_rgba(34,26,17,0.06)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-80'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {!isCollapsed && (
          <div className="shrink-0 px-8 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D9C3AD]/60 bg-[#FFF8F4] shadow-sm">
                <img
                  src={salonProfile?.logo_url || '/logo/lubist_logo_1.svg'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-vendor-display text-[20px] font-bold leading-7 text-[#865300] truncate">
                  {salonName}
                </p>
                <p className="font-vendor text-[16px] leading-6 text-[#534433]">Premium Partner</p>
                <p className="font-vendor text-[12px] leading-4 text-[#867461]">v2.1.0</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-8 py-2">
          <ul
            className={`rounded-xl bg-[#FFF8F4] py-2 ${
              isCollapsed ? 'px-1' : 'px-2'
            }`}
          >
            {navItems.map((item, index) => {
              const isActive = currentPath === item.path;
              return (
                <React.Fragment key={item.path}>
                  {index > 0 && !isCollapsed && <NavDivider />}
                  <li>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-vendor text-[16px] leading-6 transition-colors ${
                        isActive
                          ? 'bg-[#865300] text-white shadow-md'
                          : 'text-[#534433] hover:bg-[#FFF1E6]'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <VendorNavIcon item={item} active={isActive} />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        <div className={`shrink-0 px-8 pb-8 pt-2 ${isCollapsed ? 'px-2' : ''}`}>
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Log Out' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-vendor text-[16px] font-medium text-[#BA1A1A] transition-colors hover:bg-[#FEE2E2]/60 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={VENDOR_SIDEBAR_ICONS.logout}
              alt=""
              width={18}
              height={18}
              className="shrink-0"
              draggable={false}
            />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const Sidebar = ({ role, isOpen, onClose, isCollapsed }) => {
  const isVendorPortal = role === 'vendor' || role === 'regular_buyer';

  if (isVendorPortal) {
    return (
      <VendorRefinedSidebar
        role={role}
        isOpen={isOpen}
        onClose={onClose}
        isCollapsed={isCollapsed}
      />
    );
  }

  const getMenuItems = () => {
    switch (role) {
      case 'customer':
        return [
          { path: '/', icon: <FiHome />, label: 'Home' },
          { path: '/salons', icon: <FiMapPin />, label: 'Find Salons' },
          { path: '/my-bookings', icon: <FiCalendar />, label: 'My Bookings' },
          { path: '/cart', icon: <FiShoppingBag />, label: 'My Services' },
          { path: '/product-cart', icon: <FiShoppingBag />, label: 'My Products' },
          { path: '/customer/my-orders', icon: <FiPackage />, label: 'My Orders' },
        ];
      case 'hmr':
        return [
          { path: '/hmr/dashboard', icon: <FiHome />, label: 'Dashboard' },
          { path: '/hmr/add-salon', icon: <FiPlusCircle />, label: 'Add Salon' },
          { path: '/hmr/add-salon?type=regular_buyer', icon: <FiPlusCircle />, label: 'Add Regular Buyer' },
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
  const { pathname, search } = useLocation();
  const currentPath = pathname + search;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 z-40
          transform transition-all duration-300 ease-in-out overflow-y-auto shadow-sm
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className={`font-medium ${isCollapsed ? 'hidden' : ''}`}>
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
                <p className="text-xs text-orange-900 font-semibold">Need help?</p>
                <p className="text-xs text-orange-700 mt-1">Contact support</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
