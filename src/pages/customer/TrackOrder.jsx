import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiTool, FiArrowLeft } from 'react-icons/fi';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/shared/Button';

export default function TrackOrder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-secondary font-body flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 mt-16 sm:mt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          
          {/* Construction Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-brand-primary/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-brand-primary/20 rounded-full flex items-center justify-center">
              <FiTruck className="w-10 h-10 text-brand-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm border border-gray-100">
              <FiTool className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display">
            Live Tracking Coming Soon!
          </h2>
          
          <p className="text-gray-500 mb-8 text-sm sm:text-base">
            We're currently building an awesome real-time tracking experience for your orders. In the meantime, you can check your order status in your orders history.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/customer/my-orders')}
              fullWidth
            >
              View My Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <FiArrowLeft /> Back to Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
