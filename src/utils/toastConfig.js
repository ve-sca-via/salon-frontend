/**
 * toastConfig.js - Centralized Toast Notification Configuration
 * 
 * PURPOSE:
 * - Provides consistent toast styling across the application
 * - Reduces code duplication
 * - Makes styling changes easier to maintain
 * 
 * USAGE:
 * import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastConfig';
 * showSuccessToast('Item added to cart!');
 * showErrorToast('Failed to process request');
 */

import { toast } from 'react-toastify';

/**
 * Base toast configuration
 * Applied to all toast types
 */
const baseConfig = {
  position: "bottom-right",
  className: "font-body",
  style: {
    fontFamily: "DM Sans, sans-serif",
  },
};

/**
 * Success toast - green background
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...baseConfig,
    autoClose: 2000,
    style: {
      ...baseConfig.style,
      backgroundColor: "#10B981", // green-500
      color: "#fff",
    },
    ...options,
  });
};

/**
 * Error toast - red background
 */
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    ...baseConfig,
    autoClose: 3000,
    style: {
      ...baseConfig.style,
      backgroundColor: "#EF4444", // red-500
      color: "#fff",
    },
    ...options,
  });
};

/**
 * Info toast - gray background
 */
export const showInfoToast = (message, options = {}) => {
  return toast.info(message, {
    ...baseConfig,
    autoClose: 2000,
    style: {
      ...baseConfig.style,
      backgroundColor: "#6B7280", // gray-500
      color: "#fff",
    },
    ...options,
  });
};

/**
 * Warning toast - orange background
 */
export const showWarningToast = (message, options = {}) => {
  return toast.warning(message, {
    ...baseConfig,
    autoClose: 2500,
    style: {
      ...baseConfig.style,
      backgroundColor: "#F59E0B", // amber-500
      color: "#fff",
    },
    ...options,
  });
};

/**
 * Custom positioned toast (e.g., top-center for important messages)
 */
export const showTopCenterToast = (message, type = 'error', options = {}) => {
  const typeConfig = {
    error: {
      backgroundColor: "#EF4444",
      autoClose: 4000,
    },
    warning: {
      backgroundColor: "#F59E0B",
      autoClose: 3500,
    },
    info: {
      backgroundColor: "#3B82F6",
      autoClose: 3000,
    },
  };

  const config = typeConfig[type] || typeConfig.error;

  return toast[type](message, {
    position: "top-center",
    className: "font-body",
    autoClose: config.autoClose,
    style: {
      fontFamily: "DM Sans, sans-serif",
      backgroundColor: config.backgroundColor,
      color: "#fff",
    },
    ...options,
  });
};
