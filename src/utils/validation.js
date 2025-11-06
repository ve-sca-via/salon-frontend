// Email validation
export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) return 'Invalid email address';
  return true;
};

// Phone validation
export const validatePhone = (value) => {
  if (!value) return 'Phone number is required';
  const phoneRegex = /^\+?[\d\s-()]+$/;
  if (!phoneRegex.test(value)) return 'Invalid phone number';
  return true;
};

// Required field validation
export const required = (fieldName) => (value) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return true;
};

// Minimum length validation
export const minLength = (min) => (value) => {
  if (!value || value.length < min) {
    return `Minimum length is ${min} characters`;
  }
  return true;
};

// Maximum length validation
export const maxLength = (max) => (value) => {
  if (value && value.length > max) {
    return `Maximum length is ${max} characters`;
  }
  return true;
};

// Minimum value validation
export const minValue = (min) => (value) => {
  if (value && parseFloat(value) < min) {
    return `Minimum value is ${min}`;
  }
  return true;
};

// Maximum value validation
export const maxValue = (max) => (value) => {
  if (value && parseFloat(value) > max) {
    return `Maximum value is ${max}`;
  }
  return true;
};

// Password strength validation
export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain a number';
  return true;
};

// Confirm password validation
export const confirmPassword = (passwordField) => (value, formValues) => {
  if (!value) return 'Please confirm your password';
  if (value !== formValues[passwordField]) {
    return 'Passwords do not match';
  }
  return true;
};

// URL validation
export const validateUrl = (value) => {
  if (!value) return true; // Optional field
  try {
    new URL(value);
    return true;
  } catch {
    return 'Invalid URL';
  }
};

// Number validation
export const validateNumber = (value) => {
  if (!value) return 'This field is required';
  if (isNaN(value)) return 'Must be a valid number';
  return true;
};

// Date validation
export const validateDate = (value) => {
  if (!value) return 'Date is required';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid date';
  return true;
};

// Future date validation
export const validateFutureDate = (value) => {
  if (!value) return 'Date is required';
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) return 'Date must be in the future';
  return true;
};

// Time validation (HH:MM format)
export const validateTime = (value) => {
  if (!value) return 'Time is required';
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) return 'Invalid time format (HH:MM)';
  return true;
};
