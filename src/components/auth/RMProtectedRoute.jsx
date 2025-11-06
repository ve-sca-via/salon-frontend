import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../services/backendApi';
import { fetchRMProfile } from '../../store/slices/rmAgentSlice';

/**
 * Protected Route for RM (Relationship Manager) Portal
 * Ensures only authenticated RMs with valid JWT tokens can access
 */
const RMProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.rmAgent);
  
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const verifyAndFetchUser = async () => {
      // If we have a token but no user data, fetch it
      if (token && !user) {
        try {
          console.log('🔍 Token found, fetching user profile...');
          const userData = await getCurrentUser();
          
          // Verify user is RM
          if (userData.role !== 'relationship_manager') {
            console.error('❌ User is not an RM:', userData.role);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return;
          }
          
          console.log('✅ RM verified:', userData.email);
          dispatch(loginSuccess(userData));
          
          // Fetch RM profile with stats
          if (!profile) {
            dispatch(fetchRMProfile());
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else if (user && user.role === 'relationship_manager' && !profile) {
        // User exists but profile not loaded
        console.log('📊 Loading RM profile...');
        dispatch(fetchRMProfile());
      }
    };

    verifyAndFetchUser();
  }, [token, user, profile, dispatch]);

  // No token - redirect to login
  if (!token) {
    console.log('❌ No access token found, redirecting to login');
    return <Navigate to="/rm-login" state={{ from: location }} replace />;
  }

  // Token exists but user not loaded yet - show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 font-body text-lg">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // User loaded but not an RM - redirect with error
  if (user.role !== 'relationship_manager') {
    console.error('❌ Access denied: User is not an RM');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return <Navigate to="/rm-login" state={{ from: location, error: 'Access denied. RM role required.' }} replace />;
  }

  // Check if RM is active
  if (user.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Account Inactive</h2>
            <p className="text-gray-600 font-body mb-6">
              Your RM account has been deactivated. Please contact the administrator for assistance.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/rm-login';
              }}
              className="bg-accent-orange text-white px-6 py-3 rounded-xl font-body font-semibold hover:bg-orange-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render protected content
  console.log('✅ RM access granted:', user.email);
  return <>{children}</>;
};

export default RMProtectedRoute;
