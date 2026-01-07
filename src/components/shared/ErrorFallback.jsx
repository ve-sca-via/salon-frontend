/**
 * ErrorFallback Components
 * 
 * PURPOSE:
 * Reusable error fallback UI components for different error scenarios
 * Can be used with ErrorBoundary or as standalone error states
 * 
 * COMPONENTS:
 * - NetworkError: For API/network failures
 * - NotFound: For 404 errors
 * - Unauthorized: For 401/403 errors
 * - ServerError: For 500+ errors
 * - GenericError: For unknown errors
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NetworkError - Display when API calls fail or network is down
 */
export function NetworkError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <svg className="w-20 h-20 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Connection Problem
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't connect to our servers. Please check your internet connection and try again.
        </p>

        {/* Actions */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-accent-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * NotFound - Display for 404 errors (used within pages that already have navbar)
 */
export function NotFound({ message = "The item you're looking for doesn't exist or has been removed" }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="text-center max-w-lg">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-accent-orange mb-4">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-neutral-black mb-4">
          Not Found
        </h2>
        <p className="text-lg text-neutral-gray-700 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-accent-orange text-accent-orange rounded-lg hover:bg-accent-orange hover:text-white transition-colors duration-200 font-semibold"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent-orange text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold"
          >
            Go to Homepage
          </button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-neutral-gray-300">
          <p className="text-neutral-gray-600 mb-4">Looking for something? Try these:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => navigate('/salons')} 
              className="text-accent-orange hover:underline font-medium"
            >
              Browse Salons
            </button>
            <button 
              onClick={() => navigate('/about')} 
              className="text-accent-orange hover:underline font-medium"
            >
              About Us
            </button>
            <button 
              onClick={() => navigate('/careers')} 
              className="text-accent-orange hover:underline font-medium"
            >
              Careers
            </button>
            <button 
              onClick={() => navigate('/partner-with-us')} 
              className="text-accent-orange hover:underline font-medium"
            >
              Partner With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unauthorized - Display for 401/403 errors
 */
export function Unauthorized({ message = "You don't have permission to access this page" }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <svg className="w-20 h-20 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-accent-orange hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ServerError - Display for 500+ errors
 */
export function ServerError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <svg className="w-20 h-20 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Server Error
        </h2>
        <p className="text-gray-600 mb-6">
          Our servers are having trouble processing your request. We're working on fixing it. Please try again in a few moments.
        </p>

        {/* Actions */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-accent-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * GenericError - Fallback for unknown errors
 */
export function GenericError({ error, onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <svg className="w-20 h-20 text-orange-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.toString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-accent-orange hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * LoadingError - For data fetching errors with retry
 */
export function LoadingError({ message = "Failed to load data", onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start flex-1">
          {/* Icon */}
          <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          {/* Message */}
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-red-800">
              {message}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              There was a problem loading this content. Please try again.
            </p>
          </div>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
