/**
 * VendorLogin Component (Vendor/Salon Portal)
 * 
 * Purpose:
 * Vendor-only login page for salon owners and partners. Authenticates users,
 * validates vendor/salon role, and redirects to vendor dashboard.
 * 
 * Data Management:
 * - Form data stored in local state (email, password, rememberMe)
 * - Authentication via RTK Query (authApi.useLoginMutation)
 * - User stored in Redux auth slice (minimal state)
 * - Loading state managed by RTK Query (isLoading)
 * - Remember me functionality (stores email in localStorage)
 * 
 * Key Features:
 * - Vendor/salon role validation (blocks customer/admin/RM access)
 * - Remember me functionality (stores email in localStorage)
 * - Visual feedback (RTK Query loading states, toasts)
 * - Links to other portals (customer, RM)
 * - Vendor-specific background and branding
 * 
 * Security:
 * - Role-based access control (vendor/salon only)
 * - Password field masked
 * - Input validation (required fields, email format)
 * - Error handling for invalid credentials
 * 
 * User Flow:
 * 1. Enter email and password
 * 2. Optionally check "Remember me"
 * 3. Submit form → validate vendor/salon role
 * 4. Store tokens in localStorage → store user in Redux
 * 5. Show success toast → navigate to vendor dashboard
 * 
 * Alternative Portals:
 * - Customer: /login
 * - Relationship Manager: /rm-login
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { setUser } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../services/api/authApi';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import vendorBgImage from '../../assets/images/vendor_portal_bg.jpg';

const VendorLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // RTK Query mutation hook - provides loading state automatically
  const [login, { isLoading }] = useLoginMutation();
  
  // Form state with remember me support
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  /**
   * Load saved email from localStorage if "Remember me" was checked
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem('vendorRememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  /**
   * handleChange - Updates form field values including checkbox
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /**
   * handleSubmit - Validates and submits vendor login credentials
   * - Validates vendor/salon role
   * - Stores tokens in localStorage
   * - Stores user in Redux
   * - Handles "Remember me" functionality
   * - Navigates to vendor dashboard on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!formData.email.trim() || !formData.password) {
      showErrorToast('Please enter both email and password');
      return;
    }

    try {
      // Call RTK Query login mutation (loading state managed automatically)
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Validate response structure
      if (!response || !response.user) {
        throw new Error('Invalid login response from server');
      }

      // Validate user data completeness
      if (!response.user.id || !response.user.email) {
        throw new Error('Incomplete user data received');
      }

      // Vendor/salon role validation - only vendors/salon owners can login here
      const userRole = response.user.role || '';
      if (userRole !== 'vendor' && userRole !== 'salon') {
        throw new Error('Access denied. This portal is for salon owners only.');
      }

      // Handle "Remember me" functionality
      if (formData.rememberMe) {
        localStorage.setItem('vendorRememberedEmail', formData.email);
      } else {
        localStorage.removeItem('vendorRememberedEmail');
      }

      // Store access token and refresh token
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store authenticated user in Redux
      dispatch(setUser(response.user));

      showSuccessToast(`Welcome back, ${response.user.full_name || response.user.email}! 🎉`);

      // Slight delay to ensure toast displays before navigation
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 500);

    } catch (error) {
      // RTK Query errors have a 'data' property
      const errorMessage = error.data?.detail || error.message || 'Login failed. Please try again.';
      
      // Provide specific error messages based on error type
      let msg = errorMessage;
      if (errorMessage.includes('Access denied')) {
        msg = errorMessage;
      } else if (errorMessage.includes('Invalid')) {
        msg = 'Invalid email or password';
      }

      showErrorToast(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${vendorBgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Vendor Portal Branding (Desktop Only) */}
          <div className="text-primary-white hidden lg:block">
            {/* Logo */}
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                Lubist
              </h1>
            </Link>
            
            {/* Vendor Portal Header */}
            <h2 className="font-display font-bold text-4xl mb-4">
              Vendor Portal
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Grow your salon business with our platform. Manage bookings, 
              services, and reach more customers effortlessly.
            </p>
            
            {/* Vendor Benefits List */}
            {[
              { title: "Smart Dashboard", text: "Manage all bookings in one place" },
              { title: "Customer Reach", text: "Connect with thousands of customers" },
              { title: "Business Insights", text: "Track performance and revenue" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">{item.title}</h4>
                  <p className="font-body text-neutral-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="text-center mb-6 lg:hidden">
              <Link to="/">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  Lubist
                </h1>
              </Link>
            </div>

            {/* Vendor Login Form Card */}
            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              {/* Form Header */}
              <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                Vendor Portal Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                For Salon Owners & Partners
              </p>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<FiMail />}
                  disabled={isLoading}
                  required
                  aria-label="Email address"
                />
                
                {/* Password Input */}
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  icon={<FiLock />}
                  disabled={isLoading}
                  required
                  aria-label="Password"
                />
                
                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="rounded border-neutral-gray-500 text-accent-orange focus:ring-accent-orange"
                      aria-label="Remember my email"
                    />
                    <span className="ml-2 font-body text-sm text-neutral-gray-500">
                      Remember me
                    </span>
                  </label>
                  {/* TODO: Implement forgot password functionality */}
                  <Link
                    to="/forgot-password"
                    className="font-body text-sm text-accent-orange hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>

              {/* Vendor Verification Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiShoppingBag className="text-blue-600 text-xl mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-body font-semibold text-blue-900 mb-1">
                      For Verified Salon Owners
                    </h3>
                    <p className="text-sm text-blue-700 font-body">
                      This portal is exclusively for verified salon vendors. Need approval? Contact your Relationship Manager.
                    </p>
                  </div>
                </div>
              </div>

              

              {/* Alternative Login Portals */}
              <div className="mt-6 pt-6 border-t border-neutral-gray-600">
                <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                  Looking for a different portal?
                </p>
                <div className="flex flex-col gap-2">
                  {/* Customer Portal Link */}
                  <Link
                    to="/login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUser className="text-lg" />
                    <span>Customer Login</span>
                  </Link>
                  {/* RM Portal Link */}
                  <Link
                    to="/rm-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUsers className="text-lg" />
                    <span>Relationship Manager Login</span>
                  </Link>
                </div>
              </div>

              {/* Back to Home Link */}
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="font-body text-sm text-neutral-gray-500 hover:text-neutral-gray-400 inline-flex items-center gap-2"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
