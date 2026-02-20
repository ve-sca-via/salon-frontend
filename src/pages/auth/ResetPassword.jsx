/**
 * ResetPassword Component
 * 
 * Purpose:
 * Allows users to set a new password after clicking the reset link from their email.
 * Works for all user roles (customer, vendor, RM, admin).
 * 
 * Data Management:
 * - Form data stored in local state (newPassword, confirmPassword)
 * - Token extracted from URL query parameters
 * - Password reset via RTK Query (authApi.useResetPasswordMutation)
 * - Loading state managed by RTK Query (isLoading)
 * - Auto-login after successful reset (stores tokens and user data)
 * 
 * Key Features:
 * - Password strength validation (min 8 characters)
 * - Password confirmation matching
 * - Show/hide password toggle
 * - Visual feedback (loading states, toasts)
 * - Auto-login after successful reset
 * - Token validation
 * - Responsive design with background image
 * 
 * Security:
 * - Password must be at least 8 characters
 * - Passwords must match
 * - Token validated by backend
 * - Expired tokens handled gracefully
 * 
 * User Flow:
 * 1. User clicks reset link from email (contains token)
 * 2. Enter new password and confirm
 * 3. Submit form → RTK Query mutation
 * 4. Backend validates token and updates password
 * 5. Returns new access/refresh tokens
 * 6. Auto-login and redirect to appropriate dashboard
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { useResetPasswordMutation } from "../../services/api/authApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import Button from "../../components/shared/Button";
import InputField from "../../components/shared/InputField";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import bgImage from "../../assets/images/optimized/bg.webp";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // RTK Query mutation hook
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  /**
   * Extract token from URL on mount
   * Supabase sends tokens in URL hash (#) fragment, not query params (?)
   */
  useEffect(() => {
    let urlToken = null;
    
    // First, check URL hash fragment (Supabase default)
    // URL format: /reset-password#access_token=xxx&type=recovery
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1)); // Remove '#'
      urlToken = hashParams.get('access_token') || 
                 hashParams.get('token') ||
                 hashParams.get('token_hash');
      
      // Also check if type=recovery to ensure it's a password reset token
      const tokenType = hashParams.get('type');
      if (tokenType && tokenType !== 'recovery') {
        console.warn('Token type is not recovery:', tokenType);
      }
    }
    
    // Fallback: check query parameters
    if (!urlToken) {
      urlToken = searchParams.get('token') || 
                 searchParams.get('access_token') ||
                 searchParams.get('token_hash');
    }
    
    if (!urlToken) {
      showErrorToast('Invalid or missing reset token. Please request a new password reset.');
      setTimeout(() => navigate('/forgot-password'), 2000);
    } else {
      console.log('Reset token found:', urlToken.substring(0, 20) + '...');
      setToken(urlToken);
    }
  }, [searchParams, navigate]);

  /**
   * handleChange - Updates form field values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Password strength validation
   */
  const getPasswordStrength = (password) => {
    if (password.length < 8) return { strength: 'weak', text: 'Too short (min 8 characters)', color: 'text-red-500' };
    if (password.length < 10) return { strength: 'medium', text: 'Medium strength', color: 'text-yellow-500' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthCount >= 3) return { strength: 'strong', text: 'Strong password', color: 'text-green-500' };
    return { strength: 'medium', text: 'Medium strength', color: 'text-yellow-500' };
  };

  /**
   * handleSubmit - Validates and submits new password
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!token) {
      showErrorToast('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      showErrorToast('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 8) {
      showErrorToast('Password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    try {
      // Call reset password mutation
      const response = await resetPassword({
        token: token,
        new_password: formData.newPassword
      }).unwrap();
      
      if (response.success) {
        showSuccessToast('Password reset successful! Logging you in... 🎉');

        // If backend returns tokens, auto-login the user
        if (response.access_token && response.refresh_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          
          // Store user in Redux if provided
          if (response.user) {
            dispatch(setUser(response.user));
            
            // Redirect based on user role
            const userRole = response.user.role || response.user.user_role || 'customer';
            setTimeout(() => {
              switch (userRole) {
                case 'relationship_manager':
                  navigate('/hmr/dashboard');
                  break;
                case 'vendor':
                  navigate('/vendor/dashboard');
                  break;
                case 'admin':
                  navigate('/admin/dashboard');
                  break;
                default:
                  navigate('/');
              }
            }, 1000);
          } else {
            // No user data, redirect to login
            setTimeout(() => navigate('/login'), 1000);
          }
        } else {
          // No tokens returned, redirect to login
          setTimeout(() => navigate('/login'), 1000);
        }
      }

    } catch (error) {
      const errorMessage = error.data?.detail || error.message || 'Password reset failed';
      
      if (errorMessage.includes('token') || errorMessage.includes('expired')) {
        showErrorToast('Reset link has expired. Please request a new one.');
        setTimeout(() => navigate('/forgot-password'), 2000);
      } else {
        showErrorToast(errorMessage);
      }
    }
  };

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null;

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
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        {/* Mobile Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="font-display font-bold text-4xl text-primary-white">
              Lubist
            </h1>
          </Link>
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
          <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
            Reset Password
          </h2>
          <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
            Enter your new password below.
          </p>

          {!token ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-body text-sm text-red-800 font-semibold mb-1">
                    Invalid Reset Link
                  </p>
                  <p className="font-body text-sm text-red-700">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Input */}
              <div className="relative">
                <InputField
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password (min 8 characters)"
                  icon={<FiLock />}
                  disabled={isLoading}
                  required
                  aria-label="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="text-sm">
                  <p className={`font-body ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}
              
              {/* Confirm Password Input */}
              <div className="relative">
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  icon={<FiLock />}
                  disabled={isLoading}
                  required
                  aria-label="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="text-sm">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="font-body text-green-500">✓ Passwords match</p>
                  ) : (
                    <p className="font-body text-red-500">✗ Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-body text-sm text-blue-800 font-semibold mb-2">
                  Password Requirements:
                </p>
                <ul className="font-body text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters (recommended)</li>
                  <li>Include numbers and special characters (recommended)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                fullWidth 
                loading={isLoading}
                disabled={isLoading || !token}
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-body text-sm text-accent-orange hover:opacity-80"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
