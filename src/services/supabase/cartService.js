import { supabase } from "../../config/supabase";


/**
 * Cart Service - Syncs cart with Supabase for cross-device support
 */

// Save cart to Supabase
export const saveCartToSupabase = async (userId, cartData) => {

  try {
    // If cart is empty, delete the cart record
    if (!cartData.items || cartData.items.length === 0) {
      await supabase
        .from("user_carts")
        .delete()
        .eq("user_id", userId);
      return null;
    }

    const { data, error } = await supabase
      .from("user_carts")
      .upsert(
        {
          user_id: userId,
          salon_id: cartData.salonId,
          salon_name: cartData.salonName,
          items: cartData.items,
          total_amount: cartData.totalAmount,
          item_count: cartData.itemCount,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving cart to Supabase:", error);
    throw error;
  }
};

// Load cart from Supabase
export const loadCartFromSupabase = async (userId) => {

  try {
    const { data, error } = await supabase
      .from("user_carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No cart found - this is okay
        return null;
      }
      throw error;
    }

    return {
      items: data.items || [],
      salonId: data.salon_id,
      salonName: data.salon_name,
      totalAmount: parseFloat(data.total_amount) || 0,
      itemCount: data.item_count || 0,
    };
  } catch (error) {
    console.error("Error loading cart from Supabase:", error);
    return null;
  }
};

// Clear cart from Supabase
export const clearCartFromSupabase = async (userId) => {


  try {
    const { error } = await supabase
      .from("user_carts")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error clearing cart from Supabase:", error);
    throw error;
  }
};
