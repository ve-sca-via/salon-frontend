/**
 * Cart.jsx - Shopping Cart Management Component
 * 
 * PURPOSE:
 * - Display cart items with service details
 * - Allow quantity adjustments (increment/decrement)
 * - Remove individual items or clear entire cart
 * - Show pricing summary
 * - Navigate to checkout for appointment scheduling
 * 
 * DATA MANAGEMENT:
 * - Uses RTK Query for all cart operations
 * - Cart data stored in database with real-time sync
 * - Optimistic updates for better UX
 * 
 * KEY FEATURES:
 * - View all cart items from single salon
 * - Update quantities with database sync
 * - Remove items with confirmation
 * - Clear cart with confirmation modal
 * - Empty cart state with browse CTA
 * - Loading and error states
 * - Continue shopping or proceed to checkout
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { 
  useGetCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation, 
  useClearCartMutation 
} from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";

/**
 * CartItem - Individual cart item display
 * Shows service details, quantity controls, and remove button
 */
function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="bg-primary-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Service Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-bg-secondary rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-accent-orange"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
            />
          </svg>
        </div>

        {/* Service Details */}
        <div className="flex-1">
          <h4 className="font-body font-semibold text-[16px] text-neutral-black mb-1">
            {item.service_details?.name || item.service_name || 'Service'}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            {item.service_details?.duration_minutes && (
              <>
                <span className="px-2 py-1 bg-bg-secondary text-neutral-black font-body text-[12px] rounded">
                  {item.service_details.duration_minutes} mins
                </span>
                <span className="text-neutral-gray-500 font-body text-[12px]">•</span>
              </>
            )}
            <span className="text-neutral-gray-500 font-body text-[12px]">
              {item.salon_details?.business_name || 'Salon'}
            </span>
          </div>
          {item.salon_details?.city && (
            <p className="font-body text-[13px] text-neutral-gray-500 mb-2">
              {item.salon_details.city}, {item.salon_details.state}
            </p>
          )}
          <p className="font-body text-[14px] text-accent-orange font-semibold">
            ₹{item.unit_price || item.price || 0}
            {item.quantity > 1 && (
              <span className="text-neutral-gray-500 text-[12px]">
                {" "}x {item.quantity}
              </span>
            )}
          </p>
        </div>

        {/* Quantity Controls and Remove */}
        <div className="flex flex-col items-end gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 border border-neutral-gray-600 rounded-lg">
            <button
              onClick={() => onDecrement(item.id)}
              className="px-3 py-1 hover:bg-bg-secondary transition-colors"
            >
              <svg
                className="w-4 h-4 text-neutral-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="font-body font-semibold text-[14px] text-neutral-black min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onIncrement(item.id)}
              className="px-3 py-1 hover:bg-secondary transition-colors"
            >
              <svg
                className="w-4 h-4 text-neutral-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Subtotal */}
          <p className="font-body font-bold text-[16px] text-neutral-black">
            ₹{(item.unit_price || item.price || 0) * item.quantity}
          </p>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * EmptyCart - Display when cart is empty
 * Shows empty state with CTA to browse salons
 */
function EmptyCart({ onBrowse }) {
  return (
    <div className="bg-primary-white rounded-lg p-12 text-center shadow-md">
      <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-12 h-12 text-neutral-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="font-display font-bold text-[24px] text-neutral-black mb-2">
        Your Cart is Empty
      </h3>
      <p className="font-body text-[16px] text-neutral-gray-500 mb-6">
        Add services to your cart to proceed with booking
      </p>
      <button
        onClick={onBrowse}
        className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] px-8 py-3 rounded-lg transition-opacity"
      >
        Browse Services
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: cart, isLoading, error } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();
  
  // UI state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  /**
   * Increment item quantity
   */
  const handleIncrement = async (itemId) => {
    try {
      const item = cart?.items?.find(i => i.id === itemId);
      if (item) {
        await updateCartItem({ itemId, quantity: item.quantity + 1 }).unwrap();
        showSuccessToast("Quantity updated", { autoClose: 1000 });
      }
    } catch (error) {
      showErrorToast("Failed to update quantity");
    }
  };

  /**
   * Decrement item quantity
   * Auto-removes item when quantity reaches 0
   */
  const handleDecrement = async (itemId) => {
    try {
      const item = cart?.items?.find(i => i.id === itemId);
      if (item && item.quantity > 1) {
        await updateCartItem({ itemId, quantity: item.quantity - 1 }).unwrap();
        showInfoToast("Quantity updated", { autoClose: 1000 });
      } else if (item && item.quantity === 1) {
        await removeFromCart(itemId).unwrap();
        showSuccessToast("Item removed from cart");
      }
    } catch (error) {
      showErrorToast("Failed to update quantity");
    }
  };

  /**
   * Remove item from cart
   */
  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId).unwrap();
      showSuccessToast("Item removed from cart");
    } catch (error) {
      showErrorToast("Failed to remove item");
    }
  };

  /**
   * Clear entire cart with confirmation
   */
  const handleClearCart = async () => {
    try {
      await clearCartMutation().unwrap();
      setShowClearConfirm(false);
      showSuccessToast("Cart cleared");
    } catch (error) {
      showErrorToast("Failed to clear cart");
    }
  };

  /**
   * Navigate to salon's service booking page
   */
  const handleContinueShopping = () => {
    if (cart?.salon_id) {
      navigate(`/salons/${cart.salon_id}/book`);
    } else {
      navigate("/salons");
    }
  };

  /**
   * Proceed to checkout for appointment scheduling
   */
  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Your Cart
          </h1>
          {cart?.items?.length > 0 && (
            <p className="font-body text-[16px] text-neutral-gray-500">
              Services from{" "}
              <span className="font-semibold text-neutral-black">
                {cart?.salon_name}
              </span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
            <p className="mt-4 text-neutral-gray-500">Loading cart...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Failed to load cart. Please try again.</p>
          </div>
        )}

        {/* Empty Cart */}
        {!isLoading && !error && (cart?.items?.length === 0 || !cart) && (
          <EmptyCart onBrowse={() => navigate("/salons")} />
        )}

        {/* Cart with Items */}
        {!isLoading && !error && cart?.items?.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleContinueShopping}
                  className="flex-1 border-2 border-neutral-black text-neutral-black hover:bg-neutral-black hover:text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-all"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-6 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-all"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-primary-white rounded-lg p-6 shadow-lg sticky top-8">
                <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
                  Cart Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-body text-[14px]">
                    <span className="text-neutral-gray-500">
                      Items ({cart.item_count})
                    </span>
                    <span className="text-neutral-black font-semibold">
                      {cart.items.length}
                    </span>
                  </div>
                  <div className="pt-3 border-t-2 border-neutral-gray-600">
                    <div className="flex justify-between font-body text-[18px]">
                      <span className="text-neutral-black font-bold">Total</span>
                      <span className="text-accent-orange font-bold">
                        ₹{cart.total_amount}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-gray-500 mt-1">
                      + Booking fee and GST at checkout
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-opacity"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-neutral-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-[20px] text-neutral-black mb-2">
              Clear Cart?
            </h3>
            <p className="font-body text-[14px] text-neutral-gray-500 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-black font-body font-medium text-[14px] py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 bg-red-500 hover:bg-red-600 text-primary-white font-body font-medium text-[14px] py-2 rounded-lg transition-colors"
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
