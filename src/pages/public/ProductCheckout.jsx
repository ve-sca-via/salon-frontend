import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import { useGetProductCartQuery, useClearProductCartMutation } from "../../services/api/productCartApi";
import {
  useCreateProductOrderMutation,
  useVerifyProductPaymentMutation,
  useDevVerifyProductPaymentMutation,
  productOrderApi,
} from "../../services/api/productOrderApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import { IS_PRODUCTION } from "../../utils/constants";
import InputField from "../../components/shared/InputField";
import Card from "../../components/shared/Card";
import { FiShield, FiLock, FiAlertTriangle, FiCreditCard, FiInfo } from "react-icons/fi";

// Removed DevPaymentModal - now uses standard Razorpay flow for both dev and prod

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function ProductCheckout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { data: cart, isLoading, isFetching } = useGetProductCartQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateProductOrderMutation();
  const [verifyPayment] = useVerifyProductPaymentMutation();
  const [devVerifyPayment] = useDevVerifyProductPaymentMutation();
  const [clearCart] = useClearProductCartMutation();

  const [paymentStep, setPaymentStep] = useState(1); // 1 = Details, 2 = Processing, 3 = Success
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (checkoutComplete) return;
    if (isLoading || isFetching) return;
    if (!cart || !cart.items || cart.items.length === 0) {
      showInfoToast("Your cart is empty", { position: "top-center" });
      navigate("/");
    }
  }, [cart, isLoading, isFetching, navigate, checkoutComplete]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const isAddressValid = () =>
    address.street && address.city && address.state && address.postal_code && address.phone;

  // Removed dev handlers - now uses standard flow

  // ── Real Razorpay flow ──
  const openRazorpay = (orderResponse) => {
    const options = {
      key: orderResponse.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderResponse.amount * 100,
      currency: orderResponse.currency,
      order_id: orderResponse.razorpay_order_id,
      name: "Lubist Products",
      description: `Order ${orderResponse.order.order_number}`,
      handler: async function (response) {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap();
          await dispatch(
            productOrderApi.endpoints.getMyProductOrders.initiate(undefined, { forceRefetch: true })
          ).unwrap();
          await clearCart().unwrap();
          setCheckoutComplete(true);
          showSuccessToast("Order placed successfully!");
          navigate("/order-confirmation", {
            replace: true,
            state: { orderNumber: orderResponse.order.order_number },
          });
        } catch {
          setPaymentStep(1);
          setIsProcessingPayment(false);
          showErrorToast("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: user?.full_name || user?.name || "",
        email: user?.email || "",
        contact: address.phone,
      },
      theme: { color: "#F89C02" },
      modal: {
        ondismiss: () => {
          setPaymentStep(1);
          setIsProcessingPayment(false);
          showInfoToast("Payment cancelled");
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const simulatePayment = async (orderResponse) => {
    try {
      // Step 2 is already shown in handleProceedToPayment
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing delay
      
      await devVerifyPayment(orderResponse.order.id).unwrap();
      await dispatch(
        productOrderApi.endpoints.getMyProductOrders.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      await clearCart().unwrap();

      setCheckoutComplete(true);
      showSuccessToast("Order placed successfully! (Demo Mode)");
      navigate("/order-confirmation", {
        replace: true,
        state: { orderNumber: orderResponse.order.order_number },
      });
    } catch (err) {
      setPaymentStep(1);
      setIsProcessingPayment(false);
      showErrorToast("Failed to complete demo payment simulation");
    }
  };

  const handleProceedToPayment = async () => {
    if (!isAddressValid()) {
      showErrorToast("Please fill in all required address fields");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentStep(2); // Show processing overlay

      // Server re-fetches price/name/image from the DB (anti-tampering), so we
      // only send product_id + quantity.
      const itemsData = cart.items.map((item) => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
      }));

      const orderResponse = await createOrder({
        shipping_address: address,
        discount_total: 0.0,
        items: itemsData,
      }).unwrap();

      if (orderResponse.dev_mode) {
        simulatePayment(orderResponse);
      } else {
        openRazorpay(orderResponse);
      }
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(1);
      showErrorToast(err?.data?.detail || "Failed to initiate payment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (!checkoutComplete && (!cart || !cart.items || cart.items.length === 0)) return null;

  if (checkoutComplete) return null;

  const subtotal = cart.items.reduce(
    (total, item) => total + (item.price || item.unit_price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      <PublicNavbar />

      {/* Processing Payment Animation (Step 2) */}
      {paymentStep === 2 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl max-w-md w-full text-center p-12 shadow-2xl">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-[#F89C02] to-orange-600 rounded-full w-24 h-24 flex items-center justify-center">
                <FiCreditCard className="text-white text-4xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Processing Payment...
            </h2>
            <p className="text-gray-600 font-body mb-6">
              Please wait while we process your payment securely
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-gray-500 hover:text-neutral-black mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="font-display font-bold text-3xl text-neutral-black mb-2">Checkout</h1>
          <p className="font-body text-neutral-gray-500">Provide shipping details and complete your purchase</p>
          
          {/* Demo Mode Warning - Matching Vendor Payment flow */}
          {!IS_PRODUCTION && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-lg p-6 shadow-lg">
              <div className="flex items-start">
                <FiInfo className="text-blue-600 mt-1 mr-4 flex-shrink-0 text-2xl" />
                <div>
                  <h3 className="font-heading font-bold text-blue-900 text-lg mb-2">
                    💳 Demo Mode - Test Payment
                  </h3>
                  <p className="text-sm text-blue-800 font-body mb-2">
                    This is a <strong>demo Razorpay integration</strong> using test credentials.
                  </p>
                  <p className="text-sm text-blue-800 font-body">
                    You'll be redirected to Razorpay's secure payment gateway to complete the transaction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-primary-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-bold text-xl text-neutral-black mb-6">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Street Address"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <InputField label="City" name="city" value={address.city} onChange={handleAddressChange} placeholder="Mumbai" required />
                <InputField label="State/Province" name="state" value={address.state} onChange={handleAddressChange} placeholder="Maharashtra" required />
                <InputField label="Postal/ZIP Code" name="postal_code" value={address.postal_code} onChange={handleAddressChange} placeholder="400001" required />
                <InputField label="Phone Number" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="10-digit mobile number" required />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-primary-white rounded-lg p-6 shadow-sm border border-gray-100 lg:sticky lg:top-8">
              <h3 className="font-display font-bold text-xl text-neutral-black mb-4">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-black line-clamp-1">{item.name || item.product_name}</span>
                      <span className="text-neutral-gray-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-neutral-black">
                      ₹{((item.price || item.unit_price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isProcessingPayment || isCreatingOrder}
                className="w-full bg-accent-orange hover:bg-orange-600 text-primary-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isCreatingOrder ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  `Pay ₹${subtotal.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-center text-neutral-gray-400 mt-4">
                {IS_PRODUCTION ? "Secure checkout powered by Razorpay" : "Demo mode — payment simulated"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
