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
 * Position aligned with ToastContainer in App.jsx
 */
const baseConfig = {
  position: "top-right",
  className: "font-body",
  style: {
    fontFamily: "DM Sans, sans-serif",
  },
};

// Helper: Safely dismiss all toasts to instantly show the newest one without queues or double-firing
const dismissToast = () => {
  toast.dismiss();
};

/**
 * Success toast - green background
 */
export const showSuccessToast = (message, options = {}) => {
  dismissToast();
  const customId = typeof message === 'string' ? message : undefined;

  return toast.success(message, {
    ...baseConfig,
    toastId: customId,
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
  dismissToast();
  const customId = typeof message === 'string' ? message : undefined;

  return toast.error(message, {
    ...baseConfig,
    toastId: customId,
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
 * Info toast - neutral gray background (design token: neutral-gray-400)
 */
export const showInfoToast = (message, options = {}) => {
  dismissToast();
  const customId = typeof message === 'string' ? message : undefined;

  return toast.info(message, {
    ...baseConfig,
    toastId: customId,
    autoClose: 2000,
    style: {
      ...baseConfig.style,
      backgroundColor: "#555555", // neutral-gray-400 from design tokens
      color: "#fff",
    },
    ...options,
  });
};

/**
 * Warning toast - brand orange background (design token: accent-orange)
 */
export const showWarningToast = (message, options = {}) => {
  dismissToast();
  const customId = typeof message === 'string' ? message : undefined;

  return toast.warning(message, {
    ...baseConfig,
    toastId: customId,
    autoClose: 2500,
    style: {
      ...baseConfig.style,
      backgroundColor: "#F89C02", // accent-orange from design tokens
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
      backgroundColor: "#EF4444", // red-500
      autoClose: 4000,
    },
    warning: {
      backgroundColor: "#F89C02", // accent-orange from design tokens
      autoClose: 3500,
    },
    info: {
      backgroundColor: "#555555", // neutral-gray-400 from design tokens
      autoClose: 3000,
    },
  };

  const config = typeConfig[type] || typeConfig.error;
  dismissToast();
  const customId = typeof message === 'string' ? message : undefined;

  return toast[type](message, {
    position: "top-center",
    className: "font-body",
    toastId: customId,
    autoClose: config.autoClose,
    style: {
      fontFamily: "DM Sans, sans-serif",
      backgroundColor: config.backgroundColor,
      color: "#fff",
    },
    ...options,
  });
};
