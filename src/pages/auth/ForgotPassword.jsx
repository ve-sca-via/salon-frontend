/**
 * ForgotPassword Component
 * 
 * Purpose:
 * Allows users to request a password reset link via email.
 * Works for all user roles (customer, vendor, RM, admin).
 * 
 * Data Management:
 * - Form data stored in local state (email)
 * - Password reset via RTK Query (authApi.useForgotPasswordMutation)
 * - Loading state managed by RTK Query (isLoading)
 * 
 * Key Features:
 * - Email validation
 * - Rate limiting protection (backend: 3 attempts per hour)
 * - Visual feedback (loading states, toasts)
 * - Security: Always shows success message (doesn't reveal if email exists)
 * - Links back to login pages
 * - Responsive design with background image
 * 
 * User Flow:
 * 1. Enter email address
 * 2. Submit form → RTK Query mutation
 * 3. Show success message (regardless of email existence)
 * 4. User checks email for reset link
 * 5. Link redirects to /reset-password with token
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../../services/api/authApi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import Button from "../../components/shared/Button";
import InputField from "../../components/shared/InputField";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import bgImage from "../../assets/images/optimized/bg.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  // RTK Query mutation hook
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  /**
   * handleSubmit - Sends password reset email
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!email.trim()) {
      showErrorToast('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    try {
      // Call forgot password mutation
      const response = await forgotPassword({ email }).unwrap();
      
      if (response.success) {
        setEmailSent(true);
        showSuccessToast('Password reset instructions sent! Check your email. 📧');
      }

    } catch (error) {
      // Even on error, show success for security (don't reveal if email exists)
      const errorMessage = error.data?.detail || error.message;
      
      // Backend returns success regardless, but handle any network errors
      if (errorMessage && !errorMessage.includes('email exists')) {
        showErrorToast('Failed to send reset email. Please try again.');
      } else {
        setEmailSent(true);
        showSuccessToast('Password reset instructions sent! Check your email. 📧');
      }
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
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        {/* Mobile Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="font-display font-bold text-4xl text-primary-white">
              Lubist
            </h1>
          </Link>
        </div>

        {/* Forgot Password Form Card */}
        <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
          {!emailSent ? (
            <>
              <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                Forgot Password?
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  icon={<FiMail />}
                  disabled={isLoading}
                  required
                  aria-label="Email address"
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-body text-sm text-accent-orange hover:opacity-80 inline-flex items-center gap-2"
                >
                  <FiArrowLeft />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="font-display font-bold text-[28px] text-neutral-black mb-2">
                  Check Your Email
                </h2>
                <p className="font-body text-[16px] text-neutral-gray-500 mb-6">
                  We've sent password reset instructions to:
                </p>
                <p className="font-body text-[18px] font-semibold text-neutral-black mb-8">
                  {email}
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <p className="font-body text-sm text-blue-800 mb-2">
                    <strong>Didn't receive the email?</strong>
                  </p>
                  <ul className="font-body text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>

                {/* Resend Email Button */}
                <Button 
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setEmailSent(false)}
                  className="mb-4"
                >
                  Try Different Email
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="font-body text-sm text-accent-orange hover:opacity-80 inline-flex items-center gap-2"
                  >
                    <FiArrowLeft />
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Alternative Login Portals */}
          {!emailSent && (
            <div className="mt-6 pt-6 border-t border-neutral-gray-600">
              <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                Need a different portal?
              </p>
              <div className="flex gap-2 text-center justify-center">
                <Link
                  to="/vendor-login"
                  className="font-body text-xs text-accent-orange hover:opacity-80"
                >
                  Vendor Login
                </Link>
                <span className="text-neutral-gray-500">•</span>
                <Link
                  to="/rm-login"
                  className="font-body text-xs text-accent-orange hover:opacity-80"
                >
                  RM Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
