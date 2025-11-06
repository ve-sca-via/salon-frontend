import { supabase } from "../../config/supabase";

/**
 * Supabase Booking Service
 * Handles all booking-related database operations
 */

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    console.log("bookingService: Creating booking with data:", bookingData);

    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    console.log("bookingService: Insert response:", { data, error });

    if (error) {
      console.error("bookingService: Insert error:", error);
      throw error;
    }

    console.log("bookingService: Booking created successfully:", data);
    return data;
  } catch (error) {
    console.error("bookingService: Error creating booking:", error);
    throw error;
  }
};

// Get bookings by user
export const getUserBookings = async (userId, status = null) => {
  try {
    let query = supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

// Get bookings by salon
export const getSalonBookings = async (salonId, date = null) => {
  try {
    let query = supabase
      .from("bookings")
      .select("*, profiles(id, full_name, email, avatar_url)")
      .eq("salon_id", salonId)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (date) {
      query = query.eq("booking_date", date);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching salon bookings:", error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, salons(*), salon_services(*), profiles(*)")
      .eq("id", bookingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, cancellationReason = null) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// Reschedule booking
export const rescheduleBooking = async (bookingId, newDate, newTimeSlot) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        booking_date: newDate,
        time_slot: newTimeSlot,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    throw error;
  }
};

// Add booking review
export const addBookingReview = async (bookingId, reviewData) => {
  try {
    // Update booking with review
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .update({
        rating: reviewData.rating,
        review: reviewData.review,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create review record
    const { data: reviewRecord, error: reviewError } = await supabase
      .from("reviews")
      .insert([
        {
          booking_id: bookingId,
          salon_id: bookingData.salon_id,
          user_id: bookingData.user_id,
          rating: reviewData.rating,
          comment: reviewData.review,
        },
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    return { booking: bookingData, review: reviewRecord };
  } catch (error) {
    console.error("Error adding booking review:", error);
    throw error;
  }
};
