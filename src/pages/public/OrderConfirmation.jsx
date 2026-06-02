import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/shared/Button';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber;

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate('/customer/my-orders', { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [orderNumber, navigate]);

  if (!orderNumber) return null;

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      <PublicNavbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <FiCheckCircle className="h-12 w-12 text-green-500" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-neutral-black mb-2">
            Order Confirmed!
          </h2>
          
          <p className="text-neutral-gray-600 mb-6">
            Thank you for your purchase. We've received your order and are getting it ready for shipment.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
            <p className="text-sm text-neutral-gray-500 mb-1">Order Number</p>
            <p className="font-mono font-bold text-lg text-neutral-black tracking-wider">
              {orderNumber}
            </p>
          </div>

          <p className="text-sm text-neutral-gray-500 mb-8">
            Redirecting to your orders...
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/customer/my-orders', { replace: true })}
              fullWidth
            >
              View My Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              fullWidth
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
