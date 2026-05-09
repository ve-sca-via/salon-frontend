import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetProductCartQuery, useClearProductCartMutation } from "../../services/api/productCartApi";
import {
  useCreateProductOrderMutation,
  useVerifyProductPaymentMutation,
  useDevVerifyProductPaymentMutation,
} from "../../services/api/productOrderApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import InputField from "../../components/shared/InputField";
import { FiShield, FiLock, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

const IS_DEV = import.meta.env.VITE_APP_ENV === "development";

// ─── Dev Mock Payment Modal ──────────────────────────────────────────────────
function DevPaymentModal({ amount, orderNumber, onSuccess, onCancel, isProcessing }) {
  const [step, setStep] = useState("idle"); // idle | processing | done

  const handlePay = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1500)); // simulate delay
    setStep("done");
    await new Promise((r) => setTimeout(r, 800));
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#072654] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLock className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide">Razorpay Secure</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400 text-[#072654] text-[10px] font-bold px-2 py-0.5 rounded-full">
            <FiAlertTriangle className="w-3 h-3" />
            DEV MODE
          </div>
        </div>

        <div className="px-6 py-6">
          {step === "done" ? (
            <div className="text-center py-6">
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-gray-800 font-bold text-lg">Payment Successful!</p>
              <p className="text-gray-500 text-sm mt-1">Redirecting…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">₹{amount.toFixed(2)}</p>
                <p className="text-gray-400 text-xs mt-1">Order #{orderNumber}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-xs text-yellow-800">
                <strong>Development Mode:</strong> No real payment will be charged. Click below to simulate a successful payment.
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  disabled={step === "processing"}
                  className="w-full bg-[#072654] hover:bg-[#0a3070] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {step === "processing" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <FiShield className="w-4 h-4" />
                      Simulate Payment
                    </>
                  )}
                </button>

                <button
                  onClick={onCancel}
                  disabled={step === "processing"}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-1 text-gray-400 text-[10px]">
          <FiLock className="w-3 h-3" />
          Secured by Razorpay (Dev Simulation)
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function ProductCheckout() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: cart, isLoading } = useGetProductCartQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateProductOrderMutation();
  const [verifyPayment] = useVerifyProductPaymentMutation();
  const [devVerifyPayment] = useDevVerifyProductPaymentMutation();
  const [clearCart] = useClearProductCartMutation();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
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
    if (!isLoading && (!cart || !cart.items || cart.items.length === 0)) {
      showInfoToast("Your cart is empty", { position: "top-center" });
      navigate("/");
    }
  }, [cart, isLoading, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const isAddressValid = () =>
    address.street && address.city && address.state && address.postal_code && address.phone;

  // ── Dev mode: complete order without Razorpay ──
  const handleDevSuccess = async () => {
    if (!pendingOrder) return;
    try {
      await devVerifyPayment(pendingOrder.order.id).unwrap();
      await clearCart().unwrap();
      showSuccessToast("Order placed successfully! (Dev Mode)");
      navigate("/order-confirmation", {
        state: { orderNumber: pendingOrder.order.order_number },
      });
    } catch (err) {
      showErrorToast("Failed to complete dev payment");
    } finally {
      setShowDevModal(false);
      setIsProcessingPayment(false);
      setPendingOrder(null);
    }
  };

  const handleDevCancel = () => {
    setShowDevModal(false);
    setIsProcessingPayment(false);
    showInfoToast("Payment cancelled");
  };

  // ── Real Razorpay flow ──
  const openRazorpay = (orderResponse) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
          await clearCart().unwrap();
          setIsProcessingPayment(false);
          showSuccessToast("Order placed successfully!");
          navigate("/order-confirmation", {
            state: { orderNumber: orderResponse.order.order_number },
          });
        } catch {
          setIsProcessingPayment(false);
          showErrorToast("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: address.phone,
      },
      theme: { color: "#F89C02" },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          showInfoToast("Payment cancelled");
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleProceedToPayment = async () => {
    if (!isAddressValid()) {
      showErrorToast("Please fill in all required address fields");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const itemsData = cart.items.map((item) => ({
        product_id: item.product_id || item.id,
        product_name: item.name || item.product_name,
        quantity: item.quantity,
        unit_price: item.price || item.unit_price,
        image_url: item.image_url || (item.image_urls ? item.image_urls[0] : null),
      }));

      const orderResponse = await createOrder({
        shipping_address: address,
        discount_total: 0.0,
        items: itemsData,
      }).unwrap();

      // If backend signals dev mode (placeholder keys), show mock UI
      if (orderResponse.dev_mode) {
        setPendingOrder(orderResponse);
        setShowDevModal(true);
        return; // don't set isProcessingPayment to false yet
      }

      // Production: open real Razorpay
      openRazorpay(orderResponse);
    } catch (err) {
      setIsProcessingPayment(false);
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

  if (!cart || !cart.items || cart.items.length === 0) return null;

  const subtotal = cart.items.reduce(
    (total, item) => total + (item.price || item.unit_price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      {/* Dev Payment Modal */}
      {showDevModal && pendingOrder && (
        <DevPaymentModal
          amount={subtotal}
          orderNumber={pendingOrder.order.order_number}
          onSuccess={handleDevSuccess}
          onCancel={handleDevCancel}
          isProcessing={isProcessingPayment}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
          {IS_DEV && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg w-fit">
              <FiAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Development mode — payment will be simulated without charging you
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
                {IS_DEV ? "Dev mode — payment simulated" : "Secure checkout powered by Razorpay"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
