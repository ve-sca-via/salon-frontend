import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import VendorBottomNav from '../vendor/dashboard/VendorBottomNav';

const VENDOR_MOBILE_NAV_ROLES = ['vendor', 'regular_buyer'];
/** Figma frame 79:2 canvas fill */
export const VENDOR_CANVAS = '#F3EEE7';

const DashboardLayout = ({ children, role }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const normalizedRole = role || 'vendor';
  const isVendorPortal =
    location.pathname.startsWith('/vendor') ||
    VENDOR_MOBILE_NAV_ROLES.includes(normalizedRole);
  const pageBg = isVendorPortal ? 'bg-vendor-canvas' : 'bg-gray-50';
  const canvasStyle = isVendorPortal ? { backgroundColor: VENDOR_CANVAS } : undefined;

  useEffect(() => {
    if (!isVendorPortal) return undefined;
    document.documentElement.classList.add('vendor-portal');
    document.body.style.backgroundColor = VENDOR_CANVAS;
    return () => {
      document.documentElement.classList.remove('vendor-portal');
      document.body.style.backgroundColor = '';
    };
  }, [isVendorPortal]);

  return (
    <div className={`min-h-screen min-h-[100dvh] ${pageBg}`} style={canvasStyle}>
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        role={normalizedRole} 
      />
      
      <div className={`flex pt-16 ${pageBg}`} style={canvasStyle}>
        <Sidebar 
          role={normalizedRole} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
        />
        
        <main
          className={`flex-1 w-full transition-all duration-300 ${pageBg} ${
            isVendorPortal
              ? 'max-lg:!p-0 max-lg:!pb-[132px] lg:p-8'
              : 'p-4 sm:p-6 lg:p-8'
          } ${
            sidebarCollapsed
              ? 'lg:ml-20'
              : isVendorPortal
                ? 'lg:ml-80'
                : 'lg:ml-64'
          }`}
          style={canvasStyle}
        >
          {children}
        </main>
      </div>

      {isVendorPortal && <VendorBottomNav />}
    </div>
  );
};

export default DashboardLayout;
