import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMyProductOrdersQuery } from '../../services/api/productOrderApi';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { FiPackage, FiShoppingBag, FiTruck, FiCheckCircle, FiArrowLeft, FiClock } from 'react-icons/fi';

export default function MyOrders() {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useGetMyProductOrdersQuery();

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiPackage className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-600 shadow-sm border border-transparent hover:border-gray-100"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold font-display text-gray-900">My Product Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 text-center shadow-sm">
            Failed to load your orders. Please refresh the page.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="w-12 h-12 text-accent-orange" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Looks like you haven't placed any product orders yet. Start exploring our premium products!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-accent-orange hover:bg-accent-orange/90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-accent-orange/20"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                {/* Order Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">Order Placed</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">Order Number</p>
                    <p className="text-xs font-mono text-gray-600 truncate">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="divide-y divide-gray-50">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-6 items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 p-1">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiPackage size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
                            {item.product_name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-medium">Qty: {item.quantity}</span>
                            <span>₹{item.unit_price} / unit</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-xl">₹{item.total_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
