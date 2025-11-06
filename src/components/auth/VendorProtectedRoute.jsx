import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../../services/backendApi';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import { useGetVendorSalonQuery } from '../../services/api/vendorApi';
import { toast } from 'react-toastify';

const VendorProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Use RTK Query for vendor profile (only runs when user is vendor)
  const { data: salonProfile } = useGetVendorSalonQuery(undefined, {
    skip: !user || user.role !== 'vendor'
  });

  useEffect(() => {
    const verifyVendorAccess = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          setLoading(false);
          return;
        }

        // If user not in Redux, fetch from backend
        if (!user) {
          try {
            const userData = await getCurrentUser();
            
            // Validate vendor role
            if (userData.role !== 'vendor') {
              toast.error('Access denied. This portal is for salon owners only.');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              setLoading(false);
              return;
            }

            // Check if user is active
            if (userData.is_active === false) {
              toast.error('Your account is inactive. Please contact support.');
              setLoading(false);
              return;
            }

            // Store user in Redux
            dispatch(loginSuccess(userData));

            // RTK Query will automatically fetch vendor profile
            setAuthorized(true);
          } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            dispatch(logout());
            toast.error('Session expired. Please login again.');
          }
        } else {
          // User exists in Redux, validate role
          if (user.role !== 'vendor') {
            toast.error('Access denied. This portal is for salon owners only.');
            setAuthorized(false);
            setLoading(false);
            return;
          }

          // Check if user is active
          if (user.is_active === false) {
            toast.error('Your account is inactive. Please contact support.');
            setAuthorized(false);
            setLoading(false);
            return;
          }

          // RTK Query handles fetching salon profile automatically
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Error in vendor auth check:', error);
        toast.error('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyVendorAccess();
  }, [dispatch, user]);

  // Show loading spinner while verifying
  if (loading) {
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
  if (!localStorage.getItem('access_token')) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Redirect if not authorized (wrong role or inactive)
  if (!authorized) {
    return <Navigate to="/vendor-login" replace />;
  }

  // Allow access even if salon is inactive - dashboard will show payment prompt
  // This allows vendors to see the payment notice and complete registration

  // All checks passed, render children
  return <>{children}</>;
};

export default VendorProtectedRoute;
