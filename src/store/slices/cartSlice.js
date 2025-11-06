import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  saveCartToSupabase,
  loadCartFromSupabase,
  clearCartFromSupabase,
} from "../../services/supabase/cartService";

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return {
    items: [],
    salonId: null,
    salonName: null,
    totalAmount: 0,
    itemCount: 0,
  };
};

// Save cart to localStorage
const saveCartToStorage = (state) => {
  try {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: state.items,
        salonId: state.salonId,
        salonName: state.salonName,
        totalAmount: state.totalAmount,
        itemCount: state.itemCount,
      })
    );
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Sync cart to Supabase (async thunk)
export const syncCartToSupabase = createAsyncThunk(
  "cart/syncToSupabase",
  async ({ userId, cartData }, { rejectWithValue }) => {
    try {
      await saveCartToSupabase(userId, cartData);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load cart from Supabase (async thunk)
export const loadCartFromSupabaseThunk = createAsyncThunk(
  "cart/loadFromSupabase",
  async (userId, { rejectWithValue }) => {
    try {
      const cart = await loadCartFromSupabase(userId);
      return cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Load cart from storage (called on app init)
    loadCart: (state) => {
      const savedCart = loadCartFromStorage();
      return savedCart;
    },

    // Add item to cart
    addToCart: (state, action) => {
      const {
        salonId,
        salonName,
        serviceId,
        serviceName,
        planName,
        category,
        duration,
        price,
        description,
      } = action.payload;

      // Check if cart is empty or belongs to same salon
      if (state.items.length === 0 || state.salonId === salonId) {
        state.salonId = salonId;
        state.salonName = salonName;

        // Check if item already exists in cart
        const existingItem = state.items.find(
          (item) => item.serviceId === serviceId
        );

        if (existingItem) {
          // Increase quantity if item exists
          existingItem.quantity += 1;
        } else {
          // Add new item
          state.items.push({
            id: Date.now(), // Unique cart item ID
            serviceId,
            serviceName,
            planName,
            category,
            duration,
            price,
            description,
            quantity: 1,
          });
        }

        // Recalculate totals
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      } else {
        // Return error if trying to add from different salon
        return {
          ...state,
          error: "Cannot add services from different salons",
        };
      }
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);

      // Clear salon info if cart is empty
      if (state.items.length === 0) {
        state.salonId = null;
        state.salonName = null;
      }

      // Recalculate totals
      state.itemCount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Save to localStorage
      saveCartToStorage(state);
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item.id === itemId);

      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          // Remove item if quantity is 0
          state.items = state.items.filter((item) => item.id !== itemId);
        }

        // Clear salon info if cart is empty
        if (state.items.length === 0) {
          state.salonId = null;
          state.salonName = null;
        }

        // Recalculate totals
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },

    // Increment quantity
    incrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find((item) => item.id === itemId);

      if (item) {
        item.quantity += 1;

        // Recalculate totals
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },

    // Decrement quantity
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find((item) => item.id === itemId);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter((item) => item.id !== itemId);

          // Clear salon info if cart is empty
          if (state.items.length === 0) {
            state.salonId = null;
            state.salonName = null;
          }
        }

        // Recalculate totals
        state.itemCount = state.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Save to localStorage
        saveCartToStorage(state);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.salonId = null;
      state.salonName = null;
      state.totalAmount = 0;
      state.itemCount = 0;

      // Save to localStorage
      saveCartToStorage(state);
    },

    // Clear cart for a specific salon (used when switching salons)
    clearSalonCart: (state, action) => {
      const salonId = action.payload;
      if (state.salonId === salonId) {
        state.items = [];
        state.salonId = null;
        state.salonName = null;
        state.totalAmount = 0;
        state.itemCount = 0;

        // Save to localStorage
        saveCartToStorage(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle loadCartFromSupabase
      .addCase(loadCartFromSupabaseThunk.fulfilled, (state, action) => {
        if (action.payload) {
          // Merge Supabase cart with local cart
          state.items = action.payload.items || [];
          state.salonId = action.payload.salonId;
          state.salonName = action.payload.salonName;
          state.totalAmount = action.payload.totalAmount;
          state.itemCount = action.payload.itemCount;

          // Save to localStorage
          saveCartToStorage(state);
        }
      })
      .addCase(loadCartFromSupabaseThunk.rejected, (state, action) => {
        console.error("Failed to load cart from Supabase:", action.payload);
      });
  },
});

export const {
  loadCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  clearSalonCart,
} = cartSlice.actions;

export default cartSlice.reducer;
