import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../../store/slices/authSlice';
import { useGetCurrentUserQuery } from '../../services/api/authApi';
import { useGetVendorSalonQuery } from '../../services/api/vendorApi';
import { toast } from 'react-toastify';

const VendorProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('access_token');

  // RTK Query hooks - automatic data fetching with loading states
  const { data: currentUserData, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery(
    undefined,
    { skip: !token || !!user } // Skip if no token or user already loaded
  );

  // Fetch vendor salon profile (only runs when user is vendor or regular buyer)
  const { data: salonProfile } = useGetVendorSalonQuery(undefined, {
    skip: !user || !['vendor', 'regular_buyer'].includes(user.role)
  });

  useEffect(() => {
    // If we got user data from API and don't have it in Redux yet
    if (currentUserData?.user && !user) {
      const userData = currentUserData.user;
      
      // Validate vendor/regular_buyer role
      const allowedRoles = ['vendor', 'regular_buyer'];
      if (!allowedRoles.includes(userData.role)) {
        toast.error('Access denied. This portal is for business partners only.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return;
      }

      // Check if user is active
      if (userData.is_active === false) {
        toast.error('Your account is inactive. Please contact support.');
        return;
      }

      // Store user in Redux
      dispatch(setUser(userData));
    }
  }, [currentUserData, user, dispatch]);

  // Handle user fetch error
  useEffect(() => {
    if (userError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      dispatch(clearUser());
      toast.error('Session expired. Please login again.');
    }
  }, [userError, dispatch]);

  // Show loading spinner while verifying
  if (isLoadingUser || (!user && !userError && token)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-body text-lg">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to vendor login if not authenticated
  if (!token || userError) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Redirect if not authorized (wrong role)
  const allowedRoles = ['vendor', 'regular_buyer'];
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Redirect if user is inactive
  if (user && user.is_active === false) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Allow access even if salon is inactive - dashboard will show payment prompt
  // This allows vendors to see the payment notice and complete registration

  // All checks passed, render children
  return <>{children}</>;
};

export default VendorProtectedRoute;
