/**
 * Backend API Client for Salon Management App
 * Now uses axios with automatic token refresh and request queuing
 */

import { get, post, put, del, patch, handleApiError } from './apiClient';

// =====================================================
// AUTHENTICATION
// =====================================================

/**
 * Register new user
 */
export const register = async (userData) => {
  try {
    const data = await post('/api/auth/signup', userData);
    
    // Store tokens
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login with email and password
 */
export const login = async (email, password) => {
  try {
    const data = await post('/api/auth/login', { email, password });
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout current user
 */
export const logout = async () => {
  try {
    await post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return await get('/api/auth/me');
};

/**
 * Refresh access token (handled automatically by axios interceptor)
 * This is kept for backward compatibility
 */
export const refreshAccessToken = async () => {
  // Note: Token refresh is now handled automatically by apiClient
  // This function exists for backward compatibility only
  console.warn('refreshAccessToken() is deprecated - token refresh is now automatic');
  return true;
};

// =====================================================
// RM (RELATIONSHIP MANAGER) ENDPOINTS
// =====================================================

/**
 * Submit vendor join request (salon submission)
 */
export const submitVendorRequest = async (requestData, isDraft = false) => {
  const params = isDraft ? '?is_draft=true' : '';
  return await post(`/api/rm/vendor-requests${params}`, requestData);
};

/**
 * Get RM's own vendor requests
 */
export const getOwnVendorRequests = async (statusFilter = null, limit = 50, offset = 0) => {
  const params = new URLSearchParams();
  if (statusFilter) params.append('status_filter', statusFilter);
  params.append('limit', limit);
  params.append('offset', offset);
  
  return await get(`/api/rm/vendor-requests?${params.toString()}`);
};

/**
 * Get specific vendor request details
 */
export const getVendorRequestById = async (requestId) => {
  return await get(`/api/rm/vendor-requests/${requestId}`);
};

/**
 * Update vendor request (draft)
 */
export const updateVendorRequest = async (requestId, requestData, submitForApproval = false) => {
  const params = submitForApproval ? '?submit_for_approval=true' : '';
  return await put(`/api/rm/vendor-requests/${requestId}${params}`, requestData);
};

/**
 * Delete vendor request (draft only)
 */
export const deleteVendorRequest = async (requestId) => {
  return await del(`/api/rm/vendor-requests/${requestId}`);
};

/**
 * Get RM's own profile and dashboard statistics
 */
export const getRMProfile = async () => {
  return await get('/api/rm/dashboard');
};

/**
 * Update RM profile
 */
export const updateRMProfile = async (profileData) => {
  return await put('/api/rm/profile', profileData);
};

/**
 * Get RM's score history
 */
export const getRMScoreHistory = async (limit = 50, offset = 0) => {
  return await get(`/api/rm/score-history?limit=${limit}&offset=${offset}`);
};

// =====================================================
// VENDOR ENDPOINTS
// =====================================================

/**
 * Complete vendor registration (after approval)
 */
export const completeVendorRegistration = async (token, registrationData) => {
  const data = await post('/api/vendors/complete-registration', {
    token: token,
    full_name: registrationData.full_name,
    password: registrationData.password,
    confirm_password: registrationData.confirm_password,
  });
  
  // Store tokens after successful registration
  if (data && data.data) {
    if (data.data.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
    }
    if (data.data.refresh_token) {
      localStorage.setItem('refresh_token', data.data.refresh_token);
    }
  }
  
  return data;
};

/**
 * Process vendor payment (Demo mode)
 */
export const processVendorPayment = async () => {
  return await post('/api/vendors/process-payment');
};

/**
 * Get vendor's own salon profile
 */
export const getVendorSalonProfile = async () => {
  return await get('/api/vendors/salon');
};

/**
 * Update vendor salon profile
 */
export const updateVendorSalonProfile = async (salonData) => {
  return await put('/api/vendors/salon', salonData);
};

/**
 * Get vendor's services
 */
export const getVendorServices = async () => {
  return await get('/api/vendors/services');
};

/**
 * Get service categories
 */
export const getServiceCategories = async () => {
  return await get('/api/vendors/service-categories');
};

/**
 * Create new service
 */
export const createVendorService = async (serviceData) => {
  return await post('/api/vendors/services', serviceData);
};

/**
 * Update service
 */
export const updateVendorService = async (serviceId, serviceData) => {
  return await put(`/api/vendors/services/${serviceId}`, serviceData);
};

/**
 * Delete service
 */
export const deleteVendorService = async (serviceId) => {
  return await del(`/api/vendors/services/${serviceId}`);
};

/**
 * Get vendor's staff members
 */
export const getVendorStaff = async () => {
  return await get('/api/vendors/staff');
};

/**
 * Create staff member
 */
export const createVendorStaff = async (staffData) => {
  return await post('/api/vendors/staff', staffData);
};

/**
 * Update staff member
 */
export const updateVendorStaff = async (staffId, staffData) => {
  return await put(`/api/vendors/staff/${staffId}`, staffData);
};

/**
 * Delete staff member
 */
export const deleteVendorStaff = async (staffId) => {
  return await del(`/api/vendors/staff/${staffId}`);
};

/**
 * Get vendor's bookings
 */
export const getVendorBookings = async (status = null, limit = 50, offset = 0) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('limit', limit);
  params.append('offset', offset);
  
  return await get(`/api/vendors/bookings?${params.toString()}`);
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status) => {
  return await put(`/api/vendors/bookings/${bookingId}/status`, { status });
};

/**
 * Get vendor analytics
 */
export const getVendorAnalytics = async () => {
  return await get('/api/vendors/analytics');
};

// =====================================================
// CUSTOMER ENDPOINTS (for public/customer portal)
// =====================================================

/**
 * Search salons by location or query
 */
export const searchSalons = async ({ query, location, serviceType, lat, lon, radius, city, state, service_ids }) => {
  const queryParams = new URLSearchParams();
  
  // Text search
  if (query) queryParams.append('q', query);
  if (location || city) queryParams.append('city', location || city);
  if (serviceType) queryParams.append('service_type', serviceType);
  
  // Location-based search
  if (lat) queryParams.append('lat', lat);
  if (lon) queryParams.append('lon', lon);
  if (radius) queryParams.append('radius', radius);
  if (state) queryParams.append('state', state);
  if (service_ids) queryParams.append('service_ids', service_ids);
  
  const queryString = queryParams.toString();
  // Use text search if query provided, otherwise use location search
  const endpoint = query ? '/api/salons/search/query' : '/api/salons/search/nearby';
  return await get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get salon details
 */
export const getSalonDetails = async (salonId) => {
  return await get(`/api/salons/${salonId}`);
};

/**
 * Get salon services
 */
export const getSalonServices = async (salonId) => {
  return await get(`/api/salons/${salonId}/services`);
};

/**
 * Get booking fee percentage from system config
 */
export const getBookingFeePercentage = async () => {
  return await get('/api/salons/config/booking-fee-percentage');
};

/**
 * Get salon staff
 */
export const getSalonStaff = async (salonId) => {
  return await get(`/api/salons/${salonId}/staff`);
};

/**
 * Get salon available slots
 */
export const getSalonAvailableSlots = async (salonId, date, serviceIds) => {
  const params = new URLSearchParams();
  params.append('date', date);
  if (serviceIds) params.append('service_ids', serviceIds);
  
  return await get(`/api/salons/${salonId}/available-slots?${params.toString()}`);
};

/**
 * Create booking
 */
export const createBooking = async (bookingData) => {
  return await post('/api/bookings', bookingData);
};

/**
 * Get customer bookings
 */
export const getCustomerBookings = async () => {
  return await get('/api/customers/bookings/my-bookings');
};

// =====================================================
// PAYMENT ENDPOINTS
// =====================================================

/**
 * Initiate payment
 */
export const initiatePayment = async (paymentData) => {
  return await post('/api/payments/initiate', paymentData);
};

/**
 * Verify payment
 */
export const verifyPayment = async (verificationData) => {
  return await post('/api/payments/verify', verificationData);
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (limit = 50, offset = 0) => {
  return await get(`/api/payments/history?limit=${limit}&offset=${offset}`);
};

// =====================================================
// CUSTOMER PORTAL - Additional Functions
// =====================================================

/**
 * Get all salons (for browsing) - public endpoint, only shows paid and approved salons
 */
export const getSalons = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.offset) queryParams.append('offset', filters.offset);
  
  const queryString = queryParams.toString();
  return await get(`/api/salons/public${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get salon by ID (with full details)
 */
export const getSalonById = async (salonId) => {
  return await get(`/api/salons/${salonId}`);
};

/**
 * Get customer bookings
 */
export const getMyBookings = async () => {
  return await get('/api/customers/bookings/my-bookings');
};

/**
 * Cancel a booking
 */
export const cancelMyBooking = async (bookingId) => {
  return await put(`/api/customers/bookings/${bookingId}/cancel`);
};

// Alias for consistency
export const cancelBooking = cancelMyBooking;

/**
 * Get customer favorites
 */
export const getFavorites = async () => {
  return await get('/api/customers/favorites');
};

/**
 * Add salon to favorites
 */
export const addFavorite = async (salonId) => {
  return await post('/api/customers/favorites', { salon_id: salonId });
};

/**
 * Remove salon from favorites
 */
export const removeFavorite = async (salonId) => {
  return await del(`/api/customers/favorites/${salonId}`);
};

/**
 * Get customer reviews
 */
export const getMyReviews = async () => {
  return await get('/api/customers/reviews/my-reviews');
};

/**
 * Create a review
 */
export const createReview = async (reviewData) => {
  return await post('/api/customers/reviews', reviewData);
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, reviewData) => {
  return await put(`/api/customers/reviews/${reviewId}`, reviewData);
};

/**
 * Get cart items
 */
export const getCart = async () => {
  return await get('/api/customers/cart');
};

/**
 * Add item to cart
 */
export const addToCartAPI = async (cartItem) => {
  return await post('/api/customers/cart', cartItem);
};

/**
 * Remove item from cart
 */
export const removeFromCartAPI = async (itemId) => {
  return await del(`/api/customers/cart/${itemId}`);
};

/**
 * Checkout cart (create booking from cart)
 */
export const checkoutCart = async (checkoutData) => {
  return await post('/api/customers/cart/checkout', checkoutData);
};

export default {
  // Auth
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  
  // RM
  submitVendorRequest,
  getOwnVendorRequests,
  getVendorRequestById,
  getRMProfile,
  updateRMProfile,
  getRMScoreHistory,
  
  // Vendor
  completeVendorRegistration,
  getVendorSalonProfile,
  updateVendorSalonProfile,
  getVendorServices,
  getServiceCategories,
  createVendorService,
  updateVendorService,
  deleteVendorService,
  getVendorStaff,
  createVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  getVendorBookings,
  updateBookingStatus,
  getVendorAnalytics,
  
  // Customer
  getSalons,
  getSalonById,
  searchSalons,
  getSalonDetails,
  getSalonServices,
  getBookingFeePercentage,
  getSalonStaff,
  getSalonAvailableSlots,
  createBooking,
  getMyBookings,
  getCustomerBookings,
  cancelBooking,
  cancelMyBooking,
  getFavorites,
  addFavorite,
  removeFavorite,
  getMyReviews,
  createReview,
  updateReview,
  getCart,
  addToCartAPI,
  removeFromCartAPI,
  checkoutCart,
  
  // Payment
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
};
