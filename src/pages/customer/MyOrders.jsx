import React from 'react';
import { useGetMyProductOrdersQuery } from '../../../services/api/productOrderApi';
import { FiPackage, FiShoppingBag, FiTruck, FiCheckCircle } from 'react-icons/fi';

export default function MyOrders() {
  const { data: orders, isLoading, error } = useGetMyProductOrdersQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load your orders.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShoppingBag className="w-8 h-8 text-accent-orange" />
        </div>
        <h3 className="text-xl font-bold text-neutral-black mb-2">No Orders Yet</h3>
        <p className="text-neutral-gray-500">Looks like you haven't placed any product orders.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-700 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiPackage className="w-4 h-4" />;
      default: return <FiCheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display text-neutral-black">My Product Orders</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-gray-500 mb-1">Order Placed</p>
                <p className="font-semibold text-neutral-black">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray-500 mb-1">Total Amount</p>
                <p className="font-semibold text-neutral-black">₹{order.total_amount}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray-500 mb-1">Order Number</p>
                <p className="font-mono text-sm text-neutral-black">{order.order_number}</p>
              </div>
              <div className="sm:text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-6">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiPackage />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-black text-lg truncate">
                        {item.product_name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-neutral-gray-500 mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{item.unit_price} / unit</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-black">₹{item.total_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
