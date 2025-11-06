import { supabase } from "../../config/supabase";

/**
 * Supabase Salon Service
 * Handles all salon-related database operations
 */

// Get all salons
export const getAllSalons = async () => {
  try {
    const { data, error } = await supabase
      .from("salons")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching salons:", error);
    throw error;
  }
};

// Get salon by ID
export const getSalonById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("salons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching salon:", error);
    throw error;
  }
};

// Get salon services by category
export const getSalonServices = async (salonId, category = null) => {
  try {
    let query = supabase
      .from("salon_services")
      .select("*")
      .eq("salon_id", salonId);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching salon services:", error);
    throw error;
  }
};

// Get salon service plans
export const getSalonServicePlans = async (salonId, category = null) => {
  try {
    let query = supabase
      .from("salon_service_plans")
      .select("*")
      .eq("salon_id", salonId);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching service plans:", error);
    throw error;
  }
};

// Search salons
export const searchSalons = async (searchTerm, filters = {}) => {
  try {
    let query = supabase.from("salons").select("*");

    // Search by name or location
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
      );
    }

    // Apply filters
    if (filters.rating) {
      query = query.gte("rating", filters.rating);
    }

    if (filters.services && filters.services.length > 0) {
      query = query.contains("services", filters.services);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error searching salons:", error);
    throw error;
  }
};

// Get salon availability
export const getSalonAvailability = async (salonId, date) => {
  try {
    const { data, error } = await supabase
      .from("salon_availability")
      .select("*")
      .eq("salon_id", salonId)
      .eq("date", date)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching salon availability:", error);
    throw error;
  }
};
