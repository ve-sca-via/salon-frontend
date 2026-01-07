/**
 * ErrorBoundary Component
 * 
 * PURPOSE:
 * React Error Boundary to catch JavaScript errors anywhere in the component tree,
 * log those errors, and display a fallback UI instead of crashing the entire app.
 * 
 * FEATURES:
 * - Catches render errors, lifecycle errors, and constructor errors
 * - Multiple fallback UI variants (app-level, page-level, section-level)
 * - Reset capability to recover from errors
 * - Error logging for debugging
 * - Production-ready with user-friendly messages
 * 
 * USAGE:
 * <ErrorBoundary fallback="app">
 *   <App />
 * </ErrorBoundary>
 * 
 * <ErrorBoundary fallback="page">
 *   <Dashboard />
 * </ErrorBoundary>
 * 
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <ComplexWidget />
 * </ErrorBoundary>
 */

import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ErrorBoundary Class Component
 * Note: Error boundaries must be class components as hooks don't support error catching yet
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  /**
   * Update state when error is caught - triggers re-render with fallback UI
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details for debugging/monitoring
   * In production, this sends to error tracking service (Sentry, LogRocket, etc.)
   */
  componentDidCatch(error, errorInfo) {
    // Log to console ONLY in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary Caught:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // TODO: Send to error monitoring service in production
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  /**
   * Reset error boundary state - allows retry
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && typeof this.props.fallback !== 'string') {
        return React.cloneElement(this.props.fallback, {
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset
        });
      }

      // Use predefined fallback variants
      const fallbackType = this.props.fallback || 'section';
      
      switch (fallbackType) {
        case 'app':
          return (
            <AppLevelFallback 
              error={this.state.error}
              resetError={this.handleReset}
            />
          );
        case 'page':
          return (
            <PageLevelFallback 
              error={this.state.error}
              resetError={this.handleReset}
            />
          );
        case 'section':
        default:
          return (
            <SectionLevelFallback 
              error={this.state.error}
              resetError={this.handleReset}
            />
          );
      }
    }

    return this.props.children;
  }
}

/**
 * App-Level Fallback - Critical failure, show full-screen error
 */
function AppLevelFallback({ error, resetError }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We're sorry, but the application encountered an unexpected error. 
          Please try refreshing the page.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 break-all">
              {error.toString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-accent-orange hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Reload Application
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Home Page
          </button>
        </div>

        {/* Support Info */}
        <p className="mt-6 text-sm text-gray-500">
          If this problem persists, please contact support
        </p>
      </div>
    </div>
  );
}

/**
 * Page-Level Fallback - Page crashed, show error within layout
 */
function PageLevelFallback({ error, resetError }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          This page encountered an error
        </h2>
        <p className="text-gray-600 mb-6">
          Don't worry, the rest of the application is working fine. 
          Try going back or refreshing this page.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-3 bg-gray-50 rounded text-left">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.toString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
          <button
            onClick={resetError}
            className="flex-1 bg-accent-orange hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>

        {/* Home Link */}
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-accent-orange hover:text-orange-600 font-medium"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

/**
 * HOC wrapper to use navigate in PageLevelFallback
 */
function PageLevelFallbackWrapper(props) {
  const navigate = useNavigate();
  return <PageLevelFallback {...props} navigate={navigate} />;
}

/**
 * Section-Level Fallback - Small component crashed, show inline error
 */
function SectionLevelFallback({ error, resetError }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
      <div className="flex items-start">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error Content */}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Unable to load this section
          </h3>
          <p className="text-sm text-red-700 mb-3">
            This component encountered an error. Other parts of the page are working normally.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-3 p-2 bg-white rounded text-left">
              <p className="text-xs font-mono text-red-600 break-all">
                {error.toString()}
              </p>
            </div>
          )}

          {/* Retry Button */}
          <button
            onClick={resetError}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1.5 px-3 rounded transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
