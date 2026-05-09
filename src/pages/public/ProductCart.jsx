import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { 
  useGetProductCartQuery, 
  useUpdateProductCartItemMutation, 
  useRemoveProductFromCartMutation, 
  useClearProductCartMutation 
} from "../../services/api/productCartApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import Skeleton from "../../components/shared/Skeleton";
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowLeft } from "react-icons/fi";
import OptimizedImage from "../../components/shared/OptimizedImage";

function ProductCartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 p-1">
          <OptimizedImage
            src={item.image_url || '/images/placeholders/product-placeholder.jpg'}
            alt={item.name}
            className="w-full h-full"
            objectFit="contain"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base mb-1 truncate group-hover:text-accent-orange transition-colors">
            {item.name}
          </h4>
          <p className="text-accent-orange font-bold text-lg">
            ₹{item.price.toFixed(2)}
          </p>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label="Remove item"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => onDecrement(item.id)}
              className="p-1 hover:bg-white rounded-md transition-all text-gray-500 hover:text-accent-orange"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-gray-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onIncrement(item.id)}
              className="p-1 hover:bg-white rounded-md transition-all text-gray-500 hover:text-accent-orange"
            >
              <FiPlus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ onBrowse }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
      <div className="w-24 h-24 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-orange">
        <FiShoppingBag className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Looks like you haven't added any products yet. Explore our premium collection!
      </p>
      <button
        onClick={onBrowse}
        className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-accent-orange/20"
      >
        Start Shopping
      </button>
    </div>
  );
}

export default function ProductCart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const { data: cart, isLoading, error } = useGetProductCartQuery(undefined, {
    skip: !isAuthenticated
  });
  
  const [updateItem] = useUpdateProductCartItemMutation();
  const [removeItem] = useRemoveProductFromCartMutation();
  const [clearCart] = useClearProductCartMutation();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/product-cart" } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleIncrement = async (itemId) => {
    const item = cart?.items?.find(i => i.id === itemId);
    if (item) {
      try {
        await updateItem({ itemId, quantity: item.quantity + 1 }).unwrap();
      } catch (err) {
        showErrorToast("Failed to update quantity");
      }
    }
  };

  const handleDecrement = async (itemId) => {
    const item = cart?.items?.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      try {
        await updateItem({ itemId, quantity: item.quantity - 1 }).unwrap();
      } catch (err) {
        showErrorToast("Failed to update quantity");
      }
    } else if (item && item.quantity === 1) {
      handleRemove(itemId);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId).unwrap();
      showSuccessToast("Product removed from cart");
    } catch (err) {
      showErrorToast("Failed to remove product");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      setShowClearConfirm(false);
      showSuccessToast("Cart cleared");
    } catch (err) {
      showErrorToast("Failed to clear cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-colors text-gray-600"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Your Product Cart</h1>
          </div>
          {cart?.items?.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-center">
            Failed to load your cart. Please try again.
          </div>
        ) : !cart?.items?.length ? (
          <EmptyCart onBrowse={() => navigate("/")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <ProductCartItem
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.item_count})</span>
                    <span>₹{cart.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-accent-orange">
                      ₹{cart.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/product-checkout")}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-orange/20"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
            <p className="text-gray-500 mb-8">
              Are you sure you want to remove all products from your cart?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-500/20"
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
