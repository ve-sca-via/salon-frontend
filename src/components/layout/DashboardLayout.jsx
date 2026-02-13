import React, { useState } from 'react';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';

const DashboardLayout = ({ children, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        role={role} 
      />
      
      <div className="flex pt-16">
        <Sidebar 
          role={role} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
        />
        
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
