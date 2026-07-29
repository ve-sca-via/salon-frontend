/**
 * EmailVerificationBanner Component
 * 
 * Purpose:
 * Displays a prominent notification banner when a user has signed up but hasn't 
 * confirmed their email address yet. The banner appears at the top of the page
 * (above all content) and automatically disappears once the email is confirmed.
 * 
 * Features:
 * - Driven by `email_verified` from /auth/me, so it is correct on every visit
 *   (not just the session the account was created in) and disappears on its own
 *   once the user clicks the confirmation link
 * - Full-width horizontal banner with clear messaging
 * - Dismissible for the session (returns on reload while still unconfirmed)
 * - Provides option to resend verification email
 * 
 * Usage:
 * Place this component at the root level of your app, typically in App.jsx
 * above all other content so it appears at the very top of the page.
 */

import React, { useState } from 'react';
import { FaEnvelope, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useGetCurrentUserQuery } from '../../services/api/authApi';
import { showSuccessToast, showErrorToast, showApiErrorToast } from '../../utils/toastConfig';

const EmailVerificationBanner = () => {
  const [isDismissed, setIsDismissed] = useState(
    () => sessionStorage.getItem('email_banner_dismissed') === 'true'
  );
  const [isResending, setIsResending] = useState(false);
  const storedUser = useSelector((state) => state.auth?.user);
  const accessToken = localStorage.getItem('access_token');

  // Ask the server rather than guessing from sessionStorage. The old version
  // keyed off a `just_signed_up` flag, so it only ever appeared in the session
  // where the account was created — it stayed hidden on every later visit even
  // while the address was still unconfirmed, and it never noticed confirmation
  // actually happening. /auth/me returns `email_verified`, which is the truth.
  const { data: profileData, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  // `email_verified` is null when the server could not determine it, and
  // undefined on responses that predate the field — only an explicit false
  // means the address is genuinely unconfirmed, so only that warns the user.
  const emailVerified = profileData?.user?.email_verified ?? storedUser?.email_verified;
  const shouldShow = emailVerified === false && !isDismissed;

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
          // The address was confirmed since this page loaded — re-read the
          // profile so the banner hides itself instead of lingering.
          refetch();
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
    // Session-scoped: it comes back on reload while the address stays unconfirmed.
    sessionStorage.setItem('email_banner_dismissed', 'true');
    setIsDismissed(true);
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
                We've sent a confirmation email to <span className="font-semibold">{profileData?.user?.email || storedUser?.email || 'your email'}</span>.
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
