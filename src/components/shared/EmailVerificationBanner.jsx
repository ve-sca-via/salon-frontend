/**
 * EmailVerificationBanner Component
 * 
 * Purpose:
 * Displays a prominent notification banner when a user has signed up but hasn't 
 * confirmed their email address yet. The banner appears at the top of the page
 * (above all content) and automatically disappears once the email is confirmed.
 * 
 * Features:
 * - Shows immediately after signup if email confirmation is required
 * - Full-width horizontal banner with clear messaging
 * - Dismissible (user can hide it temporarily for the session)
 * - Provides option to resend verification email
 * - Uses session storage to track if user just signed up
 * 
 * Usage:
 * Place this component at the root level of your app, typically in App.jsx
 * above all other content so it appears at the very top of the page.
 */

import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { showSuccessToast, showErrorToast, showApiErrorToast } from '../../utils/toastConfig';

const EmailVerificationBanner = () => {
  const [uiTick, setUiTick] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const user = useSelector((state) => state.auth?.user);
  const accessToken = localStorage.getItem('access_token');
  const justSignedUp = sessionStorage.getItem('just_signed_up');
  const bannerDismissed = sessionStorage.getItem('email_banner_dismissed');
  const shouldShow =
    justSignedUp === 'true' &&
    bannerDismissed !== 'true' &&
    !!(user || accessToken);
  
  useEffect(() => {
    const rerender = () => setUiTick((t) => t + 1);

    // Listen for manual confirmation (when user clicks email link and comes back)
    // We'll rely on user dismissing the banner or clicking email link
    const handleStorageChange = (e) => {
      if (e.key === 'just_signed_up') {
        rerender();
      }
      // If email_verified flag is set (you can set this after email confirmation)
      if (e.key === 'email_verified' && e.newValue === 'true') {
        sessionStorage.removeItem('just_signed_up');
        sessionStorage.removeItem('email_banner_dismissed');
        rerender();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:just_signed_up', rerender);

    // Safety net: poll sessionStorage so the banner reliably picks up
    // the just_signed_up flag even if the same-tab dispatch was missed
    // (e.g. due to route transitions or Suspense remounts).
    const intervalId = setInterval(rerender, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:just_signed_up', rerender);
      clearInterval(intervalId);
    };
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      
      // Call backend to resend verification email
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.success !== false) {
        if (data?.already_verified) {
          sessionStorage.removeItem('just_signed_up');
          sessionStorage.removeItem('email_banner_dismissed');
          setUiTick((t) => t + 1);
          showSuccessToast(data.message || 'Your email is already verified.');
          return;
        }
        showSuccessToast(data?.message || 'Verification email sent! Please check your inbox.');
        return;
      }

      showApiErrorToast(
        { status: response.status, data },
        data?.detail || data?.message || 'Failed to resend email. Please try again later.'
      );
    } catch (error) {
      console.error('Error resending verification email:', error);
      showErrorToast('Failed to resend email. Please check your internet connection.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setUiTick((t) => t + 1);
    // Store dismissal in session storage (will show again on page reload if still unverified)
    sessionStorage.setItem('email_banner_dismissed', 'true');
  };

  // Don't render if not visible
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-accent-orange to-yellow-500 text-white shadow-lg relative z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left side - Icon and message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="relative">
                <FaEnvelope className="text-2xl" />
                <FaExclamationCircle className="absolute -top-1 -right-1 text-sm bg-red-500 rounded-full" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">
                📧 Please verify your email address
              </p>
              <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                We've sent a confirmation email to <span className="font-semibold">{user?.email || 'your email'}</span>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Resend button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-accent-orange font-semibold rounded-lg 
                hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                text-xs sm:text-sm whitespace-nowrap"
            >
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss notification"
              title="Hide this notification"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
