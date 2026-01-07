/**
 * Signup Component (Customer Registration)
 * 
 * Purpose:
 * Customer registration page for the SalonHub platform. Creates new customer
 * accounts with validation, stores auth tokens, and redirects to home page.
 * 
 * Data Management:
 * - Form data stored in local state (name, email, phone, password, confirmPassword)
 * - Registration via RTK Query (authApi.useSignupMutation)
 * - User stored in Redux auth slice (minimal state)
 * - Loading state managed by RTK Query (isLoading)
 * 
 * Key Features:
 * - Customer-only registration (role: 'customer')
 * - Client-side form validation (email format, phone length, password match)
 * - Real-time error clearing on input change
 * - Visual feedback (RTK Query loading states, toasts, inline errors)
 * - Responsive design with background image
 * 
 * Validation Rules:
 * - Name: Required, non-empty string
 * - Email: Required, valid email format
 * - Phone: Required, exactly 10 digits (non-digit chars removed)
 * - Password: Required, minimum 6 characters
 * - Confirm Password: Required, must match password
 * 
 * Security:
 * - Password confirmation to prevent typos
 * - Input sanitization (trim whitespace, validate format)
 * - Error handling for duplicate email, network issues
 * - TODO: Consider using httpOnly cookies instead of localStorage for tokens
 * - TODO: Add password strength indicator
 * 
 * User Flow:
 * 1. Enter name, email, phone, password, and confirm password
 * 2. Submit form → validate all fields client-side
 * 3. Call RTK Query signup mutation → receive tokens and user
 * 4. Store tokens in localStorage → store user in Redux
 * 5. Show success toast → navigate to home page
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import InputField from "../../components/shared/InputField";
import Button from "../../components/shared/Button";
import { setUser } from "../../store/slices/authSlice";
import { useSignupMutation } from "../../services/api/authApi";
import bgImage from "../../assets/images/bg.png";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query mutation hook - provides loading state automatically
  const [signup, { isLoading }] = useSignupMutation();

  // Form state with all required fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Field-level errors for inline validation feedback
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * handleChange - Updates form field values and clears field-specific errors
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing in a field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * validate - Validates all form fields before submission
   * Returns: true if all fields are valid, false otherwise
   * Side effects: Sets errors state with field-specific error messages
   */
  const validate = () => {
    const newErrors = {};

    // Name validation: Required, non-empty
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation: Required, valid email format
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Phone validation: Required, exactly 10 digits (after removing non-digits)
    // TODO: Add phone number formatting (e.g., (123) 456-7890)
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Password validation: Required, minimum 6 characters
    // TODO: Add password strength indicator (weak/medium/strong)
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation: Required, must match password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit - Validates form and registers new customer account
   * - Validates all fields client-side
   * - Calls RTK Query signup mutation
   * - Stores tokens in localStorage (access_token, refresh_token)
   * - Stores user in Redux auth slice via setUser
   * - Navigates to home page on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run client-side validation before making API call
    if (!validate()) return;

    try {
      // Call RTK Query signup mutation (loading state managed automatically)
      // Expects: { email, password, full_name, phone, role }
      // Returns: { access_token, refresh_token, user: { id, email, role, ... } }
      const response = await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone: formData.phone,
        role: 'customer', // Always register as customer
      }).unwrap();

      // Store authentication tokens in localStorage
      // SECURITY NOTE: Consider using httpOnly cookies instead of localStorage
      // to prevent XSS attacks from accessing tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store user in Redux auth slice
      dispatch(setUser(response.user));

      // Mark that user just signed up (for email verification banner)
      sessionStorage.setItem('just_signed_up', 'true');

      showSuccessToast("Account created successfully! Welcome to Lubist! 🎉");

      // Slight delay to ensure toast displays before navigation
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      // RTK Query errors have a 'data' property
      const errorMessage = error.data?.detail || error.message || "An error occurred during signup. Please try again.";
      
      // Provide specific error messages based on error type
      let msg = errorMessage;
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        msg = 'Email already registered. Please login instead.';
      } else if (errorMessage.includes('invalid')) {
        msg = 'Invalid registration data. Please check your inputs.';
      }

      showErrorToast(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding and Benefits (Desktop Only) */}
          <div className="text-primary-white hidden lg:block">
            {/* Logo */}
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                Lubist
              </h1>
            </Link>
            
            {/* Headline */}
            <h2 className="font-display font-bold text-4xl mb-4">
              Join Our Community!
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Create your account and start booking appointments with top-rated
              salons. Join thousands of satisfied customers today!
            </p>
            
            {/* Benefits List */}
            <div className="space-y-4">
              {/* Quick Registration Benefit */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Quick Registration
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Sign up in seconds and start booking
                  </p>
                </div>
              </div>
              
              {/* Exclusive Deals Benefit */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Exclusive Deals
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Get access to special offers and discounts
                  </p>
                </div>
              </div>
              
              {/* Manage Bookings Benefit */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Manage Bookings
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Track and manage all your appointments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="text-center mb-6 lg:hidden">
              <Link to="/" className="inline-block">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  Lubist
                </h1>
              </Link>
            </div>

            {/* Signup Form Card */}
            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black mb-2">
                  Create Account
                </h2>
                <p className="font-body text-[16px] leading-[24px] text-neutral-gray-500">
                  Join thousands of happy customers
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<FaUser />}
                  error={errors.name}
                  disabled={isLoading}
                  aria-label="Full name"
                />

                {/* Email Input */}
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<FaEnvelope />}
                  error={errors.email}
                  disabled={isLoading}
                  aria-label="Email address"
                />

                {/* Phone Input */}
                <InputField
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<FaPhone />}
                  error={errors.phone}
                  disabled={isLoading}
                  aria-label="Phone number"
                />

                {/* Password Input */}
                <div className="relative">
                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<FaLock />}
                    error={errors.password}
                    disabled={isLoading}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <InputField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<FaLock />}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </form>

              {/* Already Have Account - Login Link */}
              <div className="mt-6 text-center">
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-accent-orange hover:opacity-80 font-semibold transition-opacity"
                  >
                    Login here
                  </Link>
                </p>
              </div>

              {/* Back to Home Link */}
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="font-body text-[14px] text-neutral-gray-500 hover:text-neutral-gray-400 transition-colors inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Terms and Privacy Policy Notice */}
            <p className="text-center font-body text-[12px] text-neutral-gray-600 mt-6">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;