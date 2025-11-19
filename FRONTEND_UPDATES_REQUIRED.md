# 🎨 FRONTEND UPDATES NEEDED

## Overview
The backend cart and checkout flow has been completely rebuilt. The frontend needs updates to match the new API structure and integrate Razorpay payment.

---

## ✅ Files Already Updated

### 1. **cartApi.js** ✅
- ✅ Added `checkoutCart` mutation
- ✅ Exported `useCheckoutCartMutation` hook

### 2. **paymentApi.js** ✅  
- ✅ Added `createCartPaymentOrder` mutation
- ✅ Exported `useCreateCartPaymentOrderMutation` hook

---

## 🔧 Files That Need Updates

### 1. **Cart.jsx** - Display Issues

**Problem**: Cart item fields have changed in the new backend response.

**Old Structure (what Cart.jsx expects)**:
```javascript
{
  id: "uuid",
  service_name: "Haircut",
  category: "Hair",
  plan_name: "Basic",
  description: "...",
  price: 500,
  quantity: 1
}
```

**New Structure (what backend returns)**:
```javascript
{
  id: "uuid",
  service_id: "uuid",
  salon_id: "uuid",
  quantity: 1,
  metadata: {},
  service_details: {
    id: "uuid",
    name: "Haircut",       // <-- Changed from service_name
    price: 500,
    duration_minutes: 30,
    image_url: null,
    is_active: true
  },
  salon_details: {
    id: "uuid",
    business_name: "Salon Name",
    city: "City",
    state: "State"
  },
  unit_price: 500,
  line_total: 500,
  created_at: "2025-11-18T..."
}
```

**Required Changes in Cart.jsx**:
```jsx
// OLD
<h4>{item.service_name}</h4>
<span>{item.category}</span>
<span>{item.plan_name}</span>
<p>{item.description}</p>
<p>₹{item.price}</p>

// NEW
<h4>{item.service_details.name}</h4>
{/* category and plan_name not in new structure - can remove or fetch separately */}
<p>Duration: {item.service_details.duration_minutes} mins</p>
<p>₹{item.unit_price}</p>
<p>Total: ₹{item.line_total}</p>
```

### 2. **Checkout.jsx** - Complete Rewrite Needed

**Current Flow** (outdated):
1. Get cart
2. Select date + time
3. Calculate fees
4. Navigate to `/payment` with state

**New Flow Required**:
1. Get cart via RTK Query
2. Select date + up to 3 time slots
3. **Create Razorpay order** → `POST /api/v1/payments/cart/create-order`
4. **Open Razorpay Checkout** (modal)
5. **After payment success** → call checkout endpoint with payment details
6. **Redirect** to booking confirmation page

**New Checkout.jsx Structure**:
```jsx
import { useGetCartQuery } from '../../services/api/cartApi';
import { useCreateCartPaymentOrderMutation, useCheckoutCartMutation } from '../../services/api';

export default function Checkout() {
  const { data: cart, isLoading } = useGetCartQuery();
  const [createOrder] = useCreateCartPaymentOrderMutation();
  const [checkoutCart] = useCheckoutCartMutation();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // Max 3
  
  // Handle time slot selection (max 3)
  const handleTimeSlotToggle = (slot) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
    } else if (selectedTimeSlots.length < 3) {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    } else {
      toast.warning('Maximum 3 time slots allowed');
    }
  };

  // Step 1: Create Razorpay order
  const handleProceedToPayment = async () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      toast.error('Please select date and time slots');
      return;
    }

    try {
      // Create order
      const orderData = await createOrder().unwrap();
      
      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        order_id: orderData.order_id,
        name: 'Salon Platform',
        description: 'Booking Convenience Fee',
        handler: async function (response) {
          // Step 2: After successful payment, complete checkout
          await handleCheckout(response);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#FF6B35'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  // Step 2: Complete checkout after payment
  const handleCheckout = async (paymentResponse) => {
    try {
      const result = await checkoutCart({
        booking_date: selectedDate,
        time_slots: selectedTimeSlots,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        payment_method: 'razorpay',
        notes: ''
      }).unwrap();
      
      toast.success('Booking confirmed!');
      navigate(`/booking-confirmation/${result.booking_id}`);
    } catch (error) {
      toast.error('Checkout failed. Please contact support.');
    }
  };

  // Render with new cart structure
  return (
    <div>
      {/* Cart summary with service_details */}
      {cart?.items?.map(item => (
        <div key={item.id}>
          <h3>{item.service_details.name}</h3>
          <p>₹{item.unit_price} x {item.quantity} = ₹{item.line_total}</p>
        </div>
      ))}
      
      {/* Date selection */}
      {/* Time slot selection (max 3) */}
      
      {/* Pricing breakdown */}
      <div>
        <p>Services Total: ₹{cart?.total_amount}</p>
        <p>Booking Fee (10%): ₹{/* calculate */}</p>
        <p>GST (18%): ₹{/* calculate */}</p>
        <p>Pay Now: ₹{/* booking fee + gst */}</p>
        <p>Pay at Salon: ₹{cart?.total_amount}</p>
      </div>
      
      <button onClick={handleProceedToPayment}>
        Proceed to Payment
      </button>
    </div>
  );
}
```

### 3. **Add Razorpay Script**

Add to `index.html` in the `<head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 4. **SalonDetails.jsx** - Add to Cart Button

**Current**: No accepting_bookings check
**Needed**: Check salon.accepting_bookings before showing "Add to Cart"

```jsx
// In SalonDetails.jsx
const { data: salon } = useGetSalonDetailsQuery(salonId);

// Add to Cart button should be disabled if:
const canAddToCart = salon?.is_active && salon?.accepting_bookings;

<button 
  onClick={handleAddToCart}
  disabled={!canAddToCart}
  className={!canAddToCart ? 'opacity-50 cursor-not-allowed' : ''}
>
  {!canAddToCart ? 'Bookings Not Available' : 'Add to Cart'}
</button>
```

### 5. **Store Configuration** - Add paymentApi

In `store/store.js`:
```javascript
import { cartApi } from '../services/api/cartApi';
import { paymentApi } from '../services/api/paymentApi';

export const store = configureStore({
  reducer: {
    [cartApi.reducerPath]: cartApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      cartApi.middleware,
      paymentApi.middleware,
      // ... other middleware
    ),
});
```

---

## 📋 Summary of Required Frontend Changes

| File | Status | Changes Needed |
|------|--------|----------------|
| `cartApi.js` | ✅ Done | Added checkout endpoint |
| `paymentApi.js` | ✅ Done | Added cart payment order |
| `Cart.jsx` | ⚠️ Update | Fix field mappings (service_name → service_details.name) |
| `Checkout.jsx` | 🔄 Rewrite | Full Razorpay integration |
| `SalonDetails.jsx` | ⚠️ Update | Check accepting_bookings |
| `index.html` | ➕ Add | Razorpay script tag |
| `store.js` | ⚠️ Check | Ensure paymentApi is registered |

---

## 🎯 Testing Checklist

1. ✅ Add service to cart
2. ✅ View cart with correct service details
3. ✅ Update quantities
4. ✅ Remove items
5. ✅ Select date and time slots (max 3)
6. ✅ Create Razorpay order
7. ✅ Complete payment
8. ✅ Verify booking created
9. ✅ Cart cleared after checkout
10. ✅ View booking in "My Bookings"

---

## 💡 Quick Fix Priority

**High Priority** (Blocks functionality):
1. Update Cart.jsx field mappings
2. Rewrite Checkout.jsx with Razorpay
3. Add Razorpay script to index.html

**Medium Priority** (UX improvements):
4. Add accepting_bookings check in SalonDetails
5. Update cart empty state messages

**Low Priority** (Nice to have):
6. Add loading states during payment
7. Add payment error handling
8. Add booking confirmation page
