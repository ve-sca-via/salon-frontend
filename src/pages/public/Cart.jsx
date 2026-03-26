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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { 
  useGetCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation, 
  useClearCartMutation 
} from "../../services/api/cartApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import { SkeletonServiceCard } from "../../components/shared/Skeleton";

/**
 * CartItem - Individual cart item display
 * Shows service details, quantity controls, and remove button
 */
function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="bg-primary-white rounded-lg p-3.5 shadow-sm border border-neutral-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Service Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center mt-0.5">
          <svg
            className="w-5 h-5 text-accent-orange"
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

        {/* Service Details Main Flex */}
        <div className="flex-1 flex flex-row justify-between min-w-0">
          
          {/* Left Column: Info */}
          <div className="flex-1 pr-2">
            <h4 className="font-body font-semibold text-[15px] text-neutral-black leading-snug mb-1 truncate">
              {item.service_details?.name || item.service_name || 'Service'}
            </h4>
            
            <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[11px] text-neutral-gray-500 font-body">
              {item.service_details?.duration_minutes && (
                <>
                  <span className="px-1.5 py-0.5 bg-bg-secondary text-neutral-black rounded">
                    {item.service_details.duration_minutes} mins
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="truncate">
                {item.salon_details?.business_name || 'Salon'}
              </span>
            </div>
            
            {item.salon_details?.city && (
              <p className="font-body text-[11px] text-neutral-gray-500 mb-1.5 truncate">
                {item.salon_details.city}, {item.salon_details.state}
              </p>
            )}
            
            <p className="font-body text-[13px] text-accent-orange font-semibold">
              ₹{item.unit_price || item.price || 0}
              {item.quantity > 1 && (
                <span className="text-neutral-gray-500 text-[11px] font-normal ml-1">
                  x {item.quantity}
                </span>
              )}
            </p>
          </div>

          {/* Right Column: Controls, Total, Remove */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Quantity Controls Pill */}
            <div className="flex items-center h-7 border border-neutral-gray-600 rounded-md overflow-hidden bg-primary-white">
              <button
                onClick={() => onDecrement(item.id)}
                className="px-2 h-full hover:bg-bg-secondary transition-colors flex items-center justify-center group"
              >
                <svg className="w-3 h-3 text-neutral-gray-500 group-hover:text-neutral-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="font-body font-semibold text-[13px] text-neutral-black w-6 text-center select-none">
                {item.quantity}
              </span>
              <button
                onClick={() => onIncrement(item.id)}
                className="px-2 h-full hover:bg-bg-secondary transition-colors flex items-center justify-center group"
              >
                <svg className="w-3 h-3 text-neutral-gray-500 group-hover:text-neutral-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Total and Trash in one row */}
            <div className="flex items-center gap-3 mt-auto">
              <p className="font-body font-bold text-[14px] text-neutral-black">
                ₹{(item.unit_price || item.price || 0) * item.quantity}
              </p>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-md hover:bg-red-50"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
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
        No Services Selected
      </h3>
      <p className="font-body text-[16px] text-neutral-gray-500 mb-6">
        Add services to proceed with booking
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
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // RTK Query hooks - skip query if not authenticated
  const { data: cart, isLoading, error } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();
  
  // UI state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  /**
   * Redirect to login if user is not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { 
        replace: true,
        state: { from: "/cart" } 
      });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Return null while redirecting for unauthenticated users
   */
  if (!isAuthenticated) {
    return null;
  }

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
      showSuccessToast("Service removed");
    } catch (error) {
      showErrorToast("Failed to remove service");
    }
  };

  /**
   * Clear entire cart with confirmation
   */
  const handleClearCart = async () => {
    try {
      await clearCartMutation().unwrap();
      setShowClearConfirm(false);
      showSuccessToast("Services cleared");
    } catch (error) {
      showErrorToast("Failed to clear services");
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

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-3">
          <h1 className="font-display font-bold text-[24px] text-neutral-black mb-0.5">
            Selected Services
          </h1>
          {cart?.items?.length > 0 && (
            <p className="font-body text-[14px] text-neutral-gray-500">
              Services from{" "}
              <span className="font-semibold text-neutral-black">
                {cart?.salon_name}
              </span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonServiceCard key={i} />
              ))}
            </div>
            <div>
              <div className="bg-primary-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Failed to load services. Please try again.</p>
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
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={handleContinueShopping}
                  className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-neutral-black font-body font-medium text-[13px] py-2 px-5 rounded-md shadow-sm transition-all"
                >
                  Continue Adding Services
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="border border-red-100 bg-red-50/50 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-body font-medium text-[13px] py-2 px-5 rounded-md transition-all"
                >
                  Clear Services
                </button>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-primary-white rounded-lg p-6 shadow-lg sticky top-8">
                <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
                  Services Summary
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
              Clear Services?
            </h3>
            <p className="font-body text-[14px] text-neutral-gray-500 mb-6">
              Are you sure you want to remove all selected services? This action cannot be undone.
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
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
