import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetProductCartQuery, useClearProductCartMutation } from "../../services/api/productCartApi";
import { useCreateProductOrderMutation, useVerifyProductPaymentMutation } from "../../services/api/productOrderApi";
import { useGetPublicConfigsQuery } from "../../services/api/configApi";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toastConfig";
import InputField from "../../components/shared/InputField";

export default function ProductCheckout() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Fetch cart data
  const { data: cart, isLoading, error } = useGetProductCartQuery();
  
  // Fetch public configs (for Razorpay Key ID)
  const { data: configs } = useGetPublicConfigsQuery();

  // Mutations
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateProductOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyProductPaymentMutation();
  const [clearCart] = useClearProductCartMutation();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Address Form State
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: user?.phone || ""
  });

  // Redirect to cart if empty
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

  const isAddressValid = () => {
    return address.street && address.city && address.state && address.postal_code && address.phone;
  };

  const handleProceedToPayment = async () => {
    if (!isAddressValid()) {
      showErrorToast("Please fill in all required address fields");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const itemsData = cart.items.map(item => ({
        product_id: item.product_id || item.id,
        product_name: item.name || item.product_name,
        quantity: item.quantity,
        unit_price: item.price || item.unit_price,
        image_url: item.image_url || (item.images ? item.images[0] : null)
      }));

      // Step 1: Create Order in DB & Razorpay
      const orderResponse = await createOrder({
        shipping_address: address,
        discount_total: 0.0,
        items: itemsData
      }).unwrap();

      // Step 2: Open Razorpay checkout
      const options = {
        key: configs?.razorpay_key_id, // Fetch from configs
        amount: orderResponse.amount, // amount in paise
        currency: orderResponse.currency,
        order_id: orderResponse.razorpay_order_id,
        name: 'Lubist Products',
        description: `Order ${orderResponse.order.order_number}`,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }).unwrap();

            // Clear Cart and Redirect
            await clearCart().unwrap();
            setIsProcessingPayment(false);
            showSuccessToast('Order placed successfully!');
            
            navigate('/order-confirmation', { 
              state: { orderNumber: orderResponse.order.order_number }
            });
          } catch (err) {
            setIsProcessingPayment(false);
            showErrorToast('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: address.phone
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            showInfoToast("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setIsProcessingPayment(false);
      showErrorToast(err?.data?.detail || 'Failed to initiate payment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (error || !cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  const subtotal = cart.items.reduce((total, item) => total + (item.price || item.unit_price) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

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
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping Details */}
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
                <InputField
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Mumbai"
                  required
                />
                <InputField
                  label="State/Province"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="Maharashtra"
                  required
                />
                <InputField
                  label="Postal/ZIP Code"
                  name="postal_code"
                  value={address.postal_code}
                  onChange={handleAddressChange}
                  placeholder="400001"
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
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
                  <span>Total Amount</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isProcessingPayment || isCreatingOrder || isVerifyingPayment}
                className="w-full bg-accent-orange hover:bg-orange-600 text-primary-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isProcessingPayment || isCreatingOrder || isVerifyingPayment ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  `Pay ₹${subtotal.toFixed(2)}`
                )}
              </button>
              
              <p className="text-xs text-center text-neutral-gray-400 mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
