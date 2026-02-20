// Environment detection
export const IS_PRODUCTION = import.meta.env.MODE === 'production' || import.meta.env.VITE_APP_ENV === 'production';
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';

// App configuration
export const APP_NAME = 'Lubist';
export const APP_VERSION = '1.0.0';

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SALON: 'salon',
  HMR: 'hmr',
  ADMIN: 'admin',
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

// Salon statuses
export const SALON_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

// Service categories
export const SERVICE_CATEGORIES = [
  'Hair',
  'Spa',
  'Nails',
  'Makeup',
  'Treatments',
  'Massage',
  'Facial',
  'Waxing',
  'Other',
];

// Working days
export const WORKING_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Pagination
export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

// Toast configuration
export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Map configuration
export const DEFAULT_MAP_CENTER = {
  lat: 40.7128,
  lng: -74.0060,
};
export const DEFAULT_MAP_ZOOM = 12;

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SALON_CREATED: 'Salon submitted successfully!',
  SALON_APPROVED: 'Salon approved successfully!',
  SALON_REJECTED: 'Salon rejected.',
};
