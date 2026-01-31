/**
 * Login Component (Customer Portal)
 * 
 * Purpose:
 * Customer-only login page for the SalonHub platform. Authenticates users,
 * validates customer role, and redirects to home page after successful login.
 * 
 * Data Management:
 * - Form data stored in local state (email, password, rememberMe)
 * - Authentication via RTK Query (authApi.useLoginMutation)
 * - User stored in Redux auth slice (minimal state)
 * - Loading state managed by RTK Query (isLoading)
 * - Cart automatically loaded via RTK Query on mount
 * 
 * Key Features:
 * - Customer role validation (blocks vendor/admin/RM access)
 * - Remember me functionality (stores email in localStorage)
 * - Visual feedback (loading states, toasts)
 * - Links to other portals (vendor, RM)
 * - Responsive design with background image
 * - Token storage (access_token, refresh_token in localStorage)
 * 
 * Security:
 * - Role-based access control (customer only)
 * - Password field masked
 * - Input validation (required fields, email format)
 * - Error handling for invalid credentials
 * - Automatic token refresh handled by apiClient.js interceptors
 * 
 * User Flow:
 * 1. Enter email and password
 * 2. Optionally check "Remember me"
 * 3. Submit form → RTK Query mutation → validate customer role
 * 4. Store tokens in localStorage + user in Redux
 * 5. Show success toast → Navigate to home page
 * 6. Cart loads automatically via RTK Query
 * 
 * Alternative Portals:
 * - Vendor/Salon: /vendor-login
 * - Relationship Manager: /rm-login
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { useLoginMutation } from "../../services/api/authApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import Button from "../../components/shared/Button";
import InputField from "../../components/shared/InputField";
import { FiMail, FiLock, FiShoppingBag, FiUsers, FiEye, FiEyeOff } from "react-icons/fi";
import bgImage from "../../assets/images/optimized/bg.webp";

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    rememberMe: false 
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // RTK Query mutation hook - provides loading state automatically
  const [login, { isLoading }] = useLoginMutation();

  /**
   * Load saved email from localStorage if "Remember me" was checked
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  /**
   * handleChange - Updates form field values
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  /**
   * handleSubmit - Validates and submits login credentials
   * - Uses RTK Query mutation (automatic loading states)
   * - Validates customer role
   * - Stores user in Redux
   * - Handles "Remember me" functionality
   * - Navigates to home page on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!formData.email.trim() || !formData.password) {
      showErrorToast('Please enter both email and password');
      return;
    }

    try {
      // Call login mutation (RTK Query handles loading state)
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

      // Customer role validation - only customers can login here
      const userRole = response.user.role || 'customer';
      if (userRole !== 'customer') {
        throw new Error('Access denied. Please use the appropriate login portal for your role.');
      }

      // Handle "Remember me" functionality
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store access token and refresh token
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store authenticated user in Redux
      dispatch(setUser(response.user));
      
      showSuccessToast('Login successful! Welcome back! 🎉');

      // Cart is automatically loaded via RTK Query when cart components mount
      // No manual cart fetching needed - useGetCartQuery() handles it

      // Slight delay to ensure toast displays before navigation
      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (error) {
      // RTK Query errors have a 'data' property
      const errorMessage = error.data?.detail || error.message || 'Login failed';
      showErrorToast(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Marketing Content (Desktop Only) */}
          <div className="text-primary-white hidden lg:block">
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                Lubist
              </h1>
            </Link>
            <h2 className="font-display font-bold text-4xl mb-4">
              Welcome Back!
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Book appointments with top-rated salons in your area. Hair and SPA
              salons integrated with an easy booking system.
            </p>
            {[
              { title: "Easy Booking", text: "Book appointments instantly online" },
              { title: "Verified Salons", text: "Only trusted professionals" },
              { title: "Best Prices", text: "Exclusive deals & offers" },
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

          {/* Right Section - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="text-center mb-6 lg:hidden">
              <Link to="/">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  Lubist
                </h1>
              </Link>
            </div>

            {/* Login Form Card */}
            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                Enter your credentials to access your account
              </p>

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
                <div className="relative">
                  <InputField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    icon={<FiLock />}
                    disabled={isLoading}
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                
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

              {/* Sign Up Link */}
              <div className="mt-6 text-center text-sm text-neutral-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-accent-orange hover:opacity-80 font-semibold transition-opacity"
                >
                  Sign up here
                </Link>
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

              {/* Alternative Login Portals */}
              {/* <div className="mt-6 pt-6 border-t border-neutral-gray-600">
                <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                  Looking for a different portal?
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/vendor-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiShoppingBag className="text-lg" />
                    <span>Vendor/Salon Login</span>
                  </Link>
                  <Link
                    to="/rm-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUsers className="text-lg" />
                    <span>Relationship Manager Login</span>
                  </Link>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
