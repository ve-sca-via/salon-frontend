/**
 * RMLogin Component (Relationship Manager Portal)
 *
 * Purpose:
 * Relationship Manager login page. Authenticates users, validates RM role,
 * and redirects to the RM dashboard.
 *
 * Data Management:
 * - Form data in component state
 * - Authentication via RTK Query (authApi.useLoginMutation)
 * - User stored in Redux auth slice (minimal state)
 * - Loading state managed by RTK Query (isLoading)
 * - Optional "Remember me" (stores email in localStorage)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../services/api/authApi';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { FiMail, FiLock, FiUser, FiShoppingBag, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';
import rmBgMobile from '../../assets/images/optimized/rm_portal_bg_mobile.webp';
import rmBgTablet from '../../assets/images/optimized/rm_portal_bg_tablet.webp';
import rmBgDesktop from '../../assets/images/optimized/rm_portal_bg_desktop.webp';

const RMLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage, setBgImage] = useState(rmBgDesktop);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // RTK Query mutation hook - provides loading state automatically
  const [login, { isLoading }] = useLoginMutation();

  /**
   * Get responsive background image
   */
  const getResponsiveBg = () => {
    const width = window.innerWidth;
    if (width < 768) return rmBgMobile;
    if (width < 1024) return rmBgTablet;
    return rmBgDesktop;
  };

  // Load remembered email for RM portal if available and set responsive background
  useEffect(() => {
    const saved = localStorage.getItem('rmRememberedEmail');
    if (saved) setFormData(prev => ({ ...prev, email: saved, rememberMe: true }));

    // Set initial background and listen for resize
    setBgImage(getResponsiveBg());
    const handleResize = () => setBgImage(getResponsiveBg());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * handleChange - supports text inputs and checkboxes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  /**
   * handleSubmit - validates, authenticates, and routes RM users
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.email.trim() || !formData.password) {
      showErrorToast('Please fill in all fields');
      return;
    }

    try {
      // Call login mutation (RTK Query handles loading state)
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Validate response shape
      if (!response || !response.user) throw new Error('Invalid login response from server');
      if (!response.user.id || !response.user.email) throw new Error('Incomplete user data received');

      // Role validation
      const role = response.user.role || '';
      if (role !== 'relationship_manager') {
        throw new Error('Access denied. This portal is for Relationship Managers only.');
      }

      // Remember me handling
      if (formData.rememberMe) {
        localStorage.setItem('rmRememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rmRememberedEmail');
      }

      // Store access token and refresh token
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store user in Redux
      dispatch(setUser(response.user));

      showSuccessToast(`Welcome back, ${response.user.full_name || response.user.email}!`);

      // Delay navigation to allow toast to show
      setTimeout(() => navigate('/hmr/dashboard'), 500);
    } catch (error) {
      // RTK Query errors have a 'data' property with 'detail'
      const errorMessage = error.data?.detail || error.data?.message || error.message || 'Login failed';
      
      // Use backend message if available, otherwise provide user-friendly fallback
      let msg = errorMessage;
      
      // Only map if backend didn't send a clear message
      if (!errorMessage || errorMessage === 'Login failed') {
        if (error.status === 401) {
          msg = 'Invalid email or password. Please check your credentials.';
        } else if (error.status === 403) {
          msg = 'Access denied. This portal is for Relationship Managers only.';
        } else {
          msg = 'Login failed. Please try again.';
        }
      }
      
      showErrorToast(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image - Optimized WebP */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Info Section */}
          <div className="text-primary-white hidden lg:block">
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                Lubist
              </h1>
            </Link>
            <h2 className="font-display font-bold text-4xl mb-4">
              RM Portal
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Manage salon partnerships, track performance, and drive growth. 
              Dedicated portal for Relationship Managers.
            </p>
            {[
              { title: "Salon Management", text: "Submit and manage salon listings" },
              { title: "Performance Tracking", text: "Monitor your salon portfolio" },
              { title: "Commission Insights", text: "Track earnings and performance" },
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

          {/* Right - Login Form */}
          <div className="w-full">
            <div className="text-center mb-6 lg:hidden">
              <Link to="/">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  Lubist
                </h1>
              </Link>
            </div>

            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                RM Portal Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                For Relationship Managers Only
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
                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
                  Sign In
                </Button>
              </form>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-body font-semibold text-blue-900 mb-1">
                      Authorized Access Only
                    </h3>
                    <p className="text-sm text-blue-700 font-body">
                      This portal is exclusively for authorized Relationship Managers to manage salon partnerships.
                    </p>
                  </div>
                </div>
              </div>

             

              {/* Other Login Portals */}
              <div className="mt-6 pt-6 border-t border-neutral-gray-600">
                <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                  Looking for a different portal?
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUser className="text-lg" />
                    <span>Customer Login</span>
                  </Link>
                  <Link
                    to="/vendor-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiShoppingBag className="text-lg" />
                    <span>Vendor/Salon Login</span>
                  </Link>
                </div>
              </div>

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

export default RMLogin;
