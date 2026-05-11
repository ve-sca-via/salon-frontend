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
      
      <div className="max-w-xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-white rounded-full transition-colors text-gray-600 shadow-sm border border-transparent hover:border-gray-100"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold font-display text-gray-900">My Product Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-600 text-center shadow-sm text-[11px]">
            Failed to load your orders. Please refresh the page.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiShoppingBag className="w-6 h-6 text-accent-orange" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Yet</h3>
            <p className="text-gray-500 mb-4 max-w-xs mx-auto text-[11px]">
              Looks like you haven't placed any product orders yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-accent-orange hover:bg-accent-orange/90 text-white font-bold px-5 py-2 rounded-lg transition-all shadow-md text-xs"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                {/* Order Header */}
                <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-0">Placed</p>
                    <p className="text-[11px] font-bold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-0">Amount</p>
                    <p className="text-[11px] font-bold text-gray-900">₹{order.total_amount}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-0">Order #</p>
                    <p className="text-[9px] font-mono text-gray-500 truncate">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3">
                  <div className="divide-y divide-gray-50">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex gap-3 items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-md border border-gray-100 overflow-hidden flex-shrink-0 p-0.5">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiPackage size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-[11px] mb-0 truncate">
                            {item.product_name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="text-gray-700 font-medium">Qty: {item.quantity}</span>
                            <span>₹{item.unit_price} / unit</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">₹{item.total_price}</p>
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
