import { syncCartToSupabase } from "../slices/cartSlice";

// Middleware to sync cart to Supabase whenever cart changes
export const cartSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Cart actions that should trigger sync
  const cartActions = [
    "cart/addToCart",
    "cart/removeFromCart",
    "cart/updateQuantity",
    "cart/incrementQuantity",
    "cart/decrementQuantity",
    "cart/clearCart",
    "cart/clearSalonCart",
  ];

  // Check if action is a cart action
  if (cartActions.includes(action.type)) {
    const state = store.getState();
    const { auth, cart } = state;

    // Only sync if user is logged in
    if (auth.isAuthenticated && auth.user?.id) {
      store.dispatch(
        syncCartToSupabase({
          userId: auth.user.id,
          cartData: {
            items: cart.items,
            salonId: cart.salonId,
            salonName: cart.salonName,
            totalAmount: cart.totalAmount,
            itemCount: cart.itemCount,
          },
        })
      );
    }
  }

  return result;
};
