import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import { useCreateBookingMutation } from "../../services/api/bookingApi";
import { getBookingFeePercentage } from "../../services/backendApi";

// Cart Item Component
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
            {item.serviceName}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 bg-bg-secondary text-neutral-black font-body text-[12px] rounded">
              {item.category}
            </span>
            <span className="text-neutral-gray-500 font-body text-[12px]">
              •
            </span>
            <span className="text-neutral-gray-500 font-body text-[12px]">
              {item.planName}
            </span>
          </div>
          <p className="font-body text-[13px] text-neutral-gray-500 mb-2">
            {item.description}
          </p>
          <p className="font-body text-[14px] text-accent-orange font-semibold">
            ₹{item.price}{" "}
            <span className="text-neutral-gray-500 text-[12px]">+ GST</span>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Subtotal */}
          <p className="font-body font-bold text-[16px] text-neutral-black">
            ₹{item.price * item.quantity}
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

// Empty Cart Component
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
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // RTK Query mutation
  const [createBooking] = useCreateBookingMutation();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]); // Array for multiple time slots
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingFeePercentage, setBookingFeePercentage] = useState(10); // Default 10%
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Initiating, 2: Processing, 3: Success

  // Fetch booking fee percentage on component mount
  useEffect(() => {
    const fetchBookingFee = async () => {
      try {
        const response = await getBookingFeePercentage();
        setBookingFeePercentage(response.booking_fee_percentage || 10);
      } catch (error) {
        console.error("Failed to fetch booking fee:", error);
        // Keep default 10% if fetch fails
      }
    };
    fetchBookingFee();
  }, []);

  // Trigger payment processing when modal opens
  useEffect(() => {
    if (showPaymentModal && !paymentProcessing) {
      processPayment();
    }
  }, [showPaymentModal]);

  // Generate next 21 days for date selection (3 weeks)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        full: date,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        month: date
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
        year: date.getFullYear(),
        value: date.toISOString().split("T")[0],
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Generate time slots (2:30 PM to 8:15 PM with 15-min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 14; // 2 PM
    const startMinute = 30;
    const endHour = 20; // 8 PM
    const endMinute = 15;

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute)
    ) {
      const hour12 = currentHour > 12 ? currentHour - 12 : currentHour;
      const ampm = currentHour >= 12 ? "PM" : "AM";
      const timeString = `${hour12}:${currentMinute
        .toString()
        .padStart(2, "0")} ${ampm}`;
      slots.push(timeString);

      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate totals
  const servicesTotalAmount = cart.totalAmount; // Total service amount
  const bookingFee = Math.round((servicesTotalAmount * bookingFeePercentage) / 100); // Booking fee based on percentage
  const gst = Math.round(bookingFee * 0.18); // 18% GST on booking fee only
  const totalBookingAmount = bookingFee + gst; // Amount to pay now
  const remainingAmount = servicesTotalAmount - bookingFee; // Amount to pay at salon

  // Handlers
  const handleIncrement = (itemId) => {
    dispatch(incrementQuantity(itemId));
  };

  const handleDecrement = (itemId) => {
    dispatch(decrementQuantity(itemId));
    toast.info("Quantity updated", {
      position: "bottom-right",
      autoClose: 1000,
    });
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
    toast.success("Item removed from cart", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setShowClearConfirm(false);
    toast.success("Cart cleared", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  // Handle time slot selection (up to 3)
  const handleTimeSelection = (time) => {
    if (selectedTimes.includes(time)) {
      // Remove time if already selected
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      // Add time if less than 3 selected
      if (selectedTimes.length < 3) {
        setSelectedTimes([...selectedTimes, time]);
      } else {
        toast.warning("You can select up to 3 time slots only", {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
    }
  };

  const handleCheckout = async () => {
    // Validate date and time selection
    if (!selectedDate) {
      toast.error("Please select a date for your appointment", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (selectedTimes.length === 0) {
      toast.error("Please select at least one time slot for your appointment", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to complete your booking", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    // Show payment modal instead of directly creating booking
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    setPaymentStep(1);

    try {
      // Step 1: Initiating Payment (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaymentStep(2);

      // Step 2: Processing Payment (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStep(3);

      // Step 3: Payment Success - Create Booking
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsBooking(true);

      // Prepare booking data
      const bookingData = {
        salon_id: cart.salonId,
        booking_date: selectedDate,
        booking_time: selectedTimes.join(", "), // Store all selected times
        services: cart.items.map((item) => ({
          service_id: item.serviceId,
          service_name: item.serviceName,
          plan_name: item.planName,
          category: item.category,
          duration: item.duration,
          price: item.price,
          quantity: item.quantity,
        })),
        total_amount: servicesTotalAmount, // Total service amount
        booking_fee: bookingFee, // Booking fee (percentage of total)
        gst_amount: gst, // GST on booking fee
        amount_paid: totalBookingAmount, // Amount paid online (booking fee + GST)
        remaining_amount: remainingAmount, // Amount to pay at salon
        payment_status: 'paid', // Payment completed
        payment_method: 'demo', // Demo payment
        notes: `Cart checkout - ${cart.items.length} services | Booking Fee: ${bookingFeePercentage}%`,
      };

      // Create booking via RTK Query
      const newBooking = await createBooking(bookingData).unwrap();

      // Set booking details for confirmation modal
      setBookingDetails(newBooking);
      
      // Close payment modal
      setShowPaymentModal(false);
      setPaymentProcessing(false);
      
      // Show booking confirmation
      setShowBookingConfirmation(true);

      // Clear cart after successful booking
      dispatch(clearCart());

      toast.success("Booking confirmed! 🎉", {
        position: "top-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#000000",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      setShowPaymentModal(false);
      setPaymentProcessing(false);
      toast.error(error || "Failed to create booking. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#EF4444",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleContinueShopping = () => {
    if (cart.salonId) {
      navigate(`/salons/${cart.salonId}/book`);
    } else {
      navigate("/salons");
    }
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
          {cart.items.length > 0 && (
            <p className="font-body text-[16px] text-neutral-gray-500">
              Services from{" "}
              <span className="font-semibold text-neutral-black">
                {cart.salonName}
              </span>
            </p>
          )}
        </div>

        {cart.items.length === 0 ? (
          <EmptyCart onBrowse={() => navigate("/salons")} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Date & Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date & Time Selection Card */}
              <div className="bg-primary-white rounded-lg p-6 shadow-lg">
                <h3 className="font-body font-semibold text-[18px] text-neutral-black mb-4">
                  Select Date & Time of Appointment
                </h3>

                {/* Selected Date Display */}
                <div className="mb-4 p-3 border border-neutral-gray-600 rounded-lg">
                  <p className="font-body text-[14px] text-neutral-black">
                    {selectedDate
                      ? `Today | ${new Date(selectedDate).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            weekday: "short",
                            year: "numeric",
                          }
                        )}`
                      : "Select a date below"}
                  </p>
                </div>

                {/* Date Selector - Horizontal Scroll */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {dates.map((date, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(date.value)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 transition-all ${
                            selectedDate === date.value
                              ? "bg-neutral-black border-neutral-black text-primary-white"
                              : "border-neutral-gray-600 hover:border-accent-orange"
                          }`}
                        >
                          <span
                            className={`font-body font-semibold text-[12px] mb-1 ${
                              selectedDate === date.value
                                ? "text-primary-white"
                                : "text-neutral-gray-500"
                            }`}
                          >
                            {date.day}
                          </span>
                          <span className="font-body font-bold text-[20px] mb-0.5">
                            {date.date}
                          </span>
                          <span className="font-body text-[10px] uppercase">
                            {date.month}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Slot Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-[13px] text-neutral-gray-500">
                      You can select up-to 3 time slots
                    </p>
                    {selectedTimes.length > 0 && (
                      <span className="font-body text-[12px] text-accent-orange font-semibold">
                        {selectedTimes.length}/3 selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelection(time)}
                        disabled={!selectedDate}
                        className={`px-3 py-2.5 rounded-lg border font-body text-[13px] transition-all ${
                          selectedTimes.includes(time)
                            ? "bg-accent-orange border-accent-orange text-primary-white font-semibold"
                            : !selectedDate
                            ? "border-neutral-gray-600 bg-neutral-gray-600 text-neutral-gray-500 cursor-not-allowed"
                            : "border-neutral-gray-600 hover:border-accent-orange hover:bg-accent-orange/10"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Selected Times Display */}
                  {selectedTimes.length > 0 && (
                    <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                      <p className="font-body text-[12px] text-neutral-gray-500 mb-2">
                        Selected Time Slots:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTimes.map((time, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-accent-orange text-primary-white px-3 py-1 rounded-full"
                          >
                            <span className="font-body text-[13px] font-medium">
                              {time}
                            </span>
                            <button
                              onClick={() => handleTimeSelection(time)}
                              className="hover:opacity-70 transition-opacity"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-body font-semibold text-[18px] text-neutral-black">
                    Your Services ({cart.itemCount})
                  </h3>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-500 hover:text-red-700 font-body text-[14px] font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={handleRemove}
                  />
                ))}

                {/* Continue Shopping */}
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-primary-white border-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-primary-white font-body font-semibold text-[16px] py-3 rounded-lg transition-colors"
                >
                  Add More Services
                </button>
              </div>
            </div>

            {/* Right Column - Bill Summary */}
            <div className="lg:col-span-1">
              <div className="bg-primary-white rounded-lg p-6 shadow-lg sticky top-24 space-y-4">
                {/* Offers Applied */}
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-[14px] text-green-700">
                        Offers Applied
                      </p>
                      <p className="font-body text-[12px] text-green-600">
                        FIRST40
                      </p>
                    </div>
                  </div>
                  <button className="text-neutral-black hover:text-red-500">
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Bill Details */}
                <div>
                  <h4 className="font-body font-semibold text-[18px] text-neutral-black mb-3">
                    Payment Details
                  </h4>

                  {/* Services Total */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-[14px] text-neutral-gray-500">
                        Services Total
                      </span>
                      <span className="font-body text-[16px] text-neutral-black font-semibold">
                        ₹ {servicesTotalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Booking Fee */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-body text-[14px] text-neutral-black font-semibold">
                          Booking Fee ({bookingFeePercentage}%)
                        </span>
                        <p className="font-body text-[11px] text-neutral-gray-500 mt-0.5">
                          Advance payment to confirm booking
                        </p>
                      </div>
                      <span className="font-body text-[16px] text-accent-orange font-bold">
                        ₹ {bookingFee}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-body text-neutral-gray-500">
                        GST (18%)
                      </span>
                      <span className="font-body text-neutral-gray-500">
                        ₹ {gst}
                      </span>
                    </div>
                  </div>

                  {/* Pay Now */}
                  <div className="flex items-center justify-between py-3 border-t border-b border-neutral-gray-600 mb-3">
                    <div>
                      <span className="font-body text-[16px] text-neutral-black font-bold">
                        Pay Now
                      </span>
                      <p className="font-body text-[11px] text-neutral-gray-500">
                        Amount to pay online
                      </p>
                    </div>
                    <span className="font-body text-[22px] text-accent-orange font-bold">
                      ₹ {totalBookingAmount}
                    </span>
                  </div>

                  {/* Pay at Salon */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-body text-[14px] text-green-700 font-semibold">
                          Pay at Salon
                        </span>
                        <p className="font-body text-[11px] text-green-600 mt-0.5">
                          Remaining amount after service
                        </p>
                      </div>
                      <span className="font-body text-[18px] text-green-700 font-bold">
                        ₹ {remainingAmount}
                      </span>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="font-body text-[10px] text-neutral-gray-500 mt-3 leading-relaxed">
                    The total may vary after consultation depending on the
                    length, density, product & stylist you choose.
                  </p>
                </div>

                {/* Booking CTA */}
                <div className="pt-4 border-t border-neutral-gray-600">
                  <p className="font-body text-[14px] text-neutral-gray-500 italic text-center mb-3">
                    Let's Pamper You!
                  </p>
                  <button
                    onClick={handleCheckout}
                    disabled={
                      !selectedDate || selectedTimes.length === 0 || isBooking
                    }
                    className={`w-full font-body font-semibold text-[16px] py-3 rounded-lg transition-all ${
                      selectedDate && selectedTimes.length > 0 && !isBooking
                        ? "bg-gradient-orange hover:opacity-90 text-primary-white shadow-lg"
                        : "bg-neutral-gray-600 text-neutral-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isBooking ? "Processing..." : "Book & pay after service"}
                  </button>
                  <p className="font-body text-[10px] text-neutral-gray-500 text-center mt-2 leading-relaxed">
                    By booking an appointment you agree to our{" "}
                    <span className="text-accent-orange cursor-pointer underline">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-accent-orange cursor-pointer underline">
                      Privacy Policy
                    </span>
                  </p>
                </div>
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
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
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
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-neutral-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Step 1: Initiating Payment */}
            {paymentStep === 1 && (
              <div className="text-center animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="font-display font-bold text-[24px] text-neutral-black mb-2">
                  Initiating Payment
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500 mb-4">
                  Please wait while we set up your payment...
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 mt-6">
                  <p className="font-body text-[12px] text-neutral-gray-500 mb-1">
                    Amount to Pay
                  </p>
                  <p className="font-body text-[28px] text-accent-orange font-bold">
                    ₹ {totalBookingAmount}
                  </p>
                  <p className="font-body text-[11px] text-neutral-gray-500 mt-1">
                    Booking fee + GST
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Processing Payment */}
            {paymentStep === 2 && (
              <div className="text-center animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-neutral-gray-600 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-accent-orange"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-bold text-[24px] text-neutral-black mb-2">
                  Processing Payment
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500 mb-4">
                  Securely processing your payment...
                </p>
                <div className="w-full bg-neutral-gray-600 rounded-full h-2 mb-4 overflow-hidden">
                  <div className="bg-gradient-orange h-full rounded-full animate-progress"></div>
                </div>
                <p className="font-body text-[12px] text-neutral-gray-500">
                  Please do not close this window
                </p>
              </div>
            )}

            {/* Step 3: Payment Success */}
            {paymentStep === 3 && (
              <div className="text-center animate-fadeIn">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="font-display font-bold text-[24px] text-green-600 mb-2">
                  Payment Successful!
                </h3>
                <p className="font-body text-[14px] text-neutral-gray-500 mb-4">
                  Your payment has been processed successfully
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-body text-[13px] text-green-700">
                      Amount Paid
                    </span>
                    <span className="font-body text-[18px] text-green-700 font-bold">
                      ₹ {totalBookingAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-green-600">
                    <span>Payment Method</span>
                    <span>Demo Payment</span>
                  </div>
                </div>
                <p className="font-body text-[12px] text-neutral-gray-500 mt-4">
                  Creating your booking...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingConfirmation && bookingDetails && (
        <div className="fixed inset-0 bg-neutral-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-white rounded-lg p-8 max-w-lg w-full shadow-2xl animate-fadeIn">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h3 className="font-display font-bold text-[24px] text-neutral-black text-center mb-2">
              Booking Confirmed! 🎉
            </h3>
            <p className="font-body text-[14px] text-neutral-gray-500 text-center mb-6">
              Your appointment has been successfully booked
            </p>

            {/* Booking Details */}
            <div className="bg-bg-secondary rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Booking ID
                </span>
                <span className="font-body text-[13px] text-neutral-black font-semibold">
                  {bookingDetails.id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Salon
                </span>
                <span className="font-body text-[13px] text-neutral-black font-semibold">
                  {bookingDetails.salon_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Date
                </span>
                <span className="font-body text-[13px] text-neutral-black font-semibold">
                  {new Date(bookingDetails.booking_date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Time
                </span>
                <span className="font-body text-[13px] text-neutral-black font-semibold">
                  {bookingDetails.booking_time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-[13px] text-neutral-gray-500">
                  Services
                </span>
                <span className="font-body text-[13px] text-neutral-black font-semibold">
                  {bookingDetails.services.length} service(s)
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-gray-600">
                <span className="font-body text-[15px] text-neutral-black font-bold">
                  Total Amount
                </span>
                <span className="font-body text-[18px] text-accent-orange font-bold">
                  ₹ {bookingDetails.final_amount}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="font-body text-[12px] text-amber-800">
                <strong>Payment:</strong> You can pay after the service at the
                salon
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingConfirmation(false);
                  navigate("/");
                }}
                className="flex-1 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-black font-body font-medium text-[14px] py-3 rounded-lg transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  setShowBookingConfirmation(false);
                  navigate("/my-bookings");
                }}
                className="flex-1 bg-accent-orange hover:opacity-90 text-primary-white font-body font-medium text-[14px] py-3 rounded-lg transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
