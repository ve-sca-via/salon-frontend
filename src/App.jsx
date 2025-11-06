import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginSuccess, logout } from './store/slices/authSlice';
import { loadCartFromSupabaseThunk, clearCart } from './store/slices/cartSlice';
import { supabase } from './config/supabase';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RMProtectedRoute from './components/auth/RMProtectedRoute';
import VendorProtectedRoute from './components/auth/VendorProtectedRoute';

// Lazy load all page components for code splitting
const Login = lazy(() => import('./pages/auth/Login'));
const RMLogin = lazy(() => import('./pages/auth/RMLogin'));
const VendorLogin = lazy(() => import('./pages/auth/VendorLogin'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Home = lazy(() => import('./pages/public/Home'));
const PublicSalonListing = lazy(() => import('./pages/public/PublicSalonListing'));
const SalonDetail = lazy(() => import('./pages/public/SalonDetail'));
const ServiceBooking = lazy(() => import('./pages/public/ServiceBooking'));
const Cart = lazy(() => import('./pages/public/Cart'));
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const Favorites = lazy(() => import('./pages/customer/Favorites'));
const MyReviews = lazy(() => import('./pages/customer/MyReviews'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));
const HMRDashboard = lazy(() => import('./pages/hmr/HMRDashboard'));
const AddSalonForm = lazy(() => import('./pages/hmr/AddSalonForm'));
const Drafts = lazy(() => import('./pages/hmr/Drafts'));
const SubmissionHistory = lazy(() => import('./pages/hmr/SubmissionHistory'));
const RMProfile = lazy(() => import('./pages/hmr/RMProfile'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const SalonProfile = lazy(() => import('./pages/vendor/SalonProfile'));
const ServicesManagement = lazy(() => import('./pages/vendor/ServicesManagement'));
const StaffManagement = lazy(() => import('./pages/vendor/StaffManagement'));
const BookingsManagement = lazy(() => import('./pages/vendor/BookingsManagement'));
const CompleteRegistration = lazy(() => import('./pages/vendor/CompleteRegistration'));
const VendorPayment = lazy(() => import('./pages/vendor/VendorPayment'));

const SalonDashboard = () => <div>Salon Dashboard</div>;

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // One-time cleanup: migrate old 'token' to 'access_token'
    const oldToken = localStorage.getItem('token');
    if (oldToken && !localStorage.getItem('access_token')) {
      localStorage.setItem('access_token', oldToken);
      localStorage.removeItem('token');
    }

    // Load cart from Supabase if user is already logged in
    if (isAuthenticated && user?.id) {
      dispatch(loadCartFromSupabaseThunk(user.id)).catch(err => {
        console.warn("Cart loading failed on app init:", err);
      });
    }

    // Note: Supabase auth listener removed - we're using backend JWT authentication now
    // Auth state is managed via Redux when user logs in through backend API
  }, [dispatch, isAuthenticated, user?.id]);

  return (
    <Router>
      <div className="App">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/salons" element={<PublicSalonListing />} />
            <Route path="/salons/:id" element={<SalonDetail />} />
            <Route path="/salons/:id/book" element={<ServiceBooking />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/rm-login" element={<RMLogin />} />
            <Route path="/vendor-login" element={<VendorLogin />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Vendor Registration (Public/Token-based) */}
            <Route path="/vendor/complete-registration" element={<CompleteRegistration />} />

            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute allowedRoles={['customer']}><Favorites /></ProtectedRoute>} />
            <Route path="/my-reviews" element={<ProtectedRoute allowedRoles={['customer']}><MyReviews /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />

            <Route path="/salon/dashboard" element={<ProtectedRoute allowedRoles={['salon']}><SalonDashboard /></ProtectedRoute>} />

            {/* RM Protected Routes */}
            <Route path="/hmr/dashboard" element={<RMProtectedRoute><HMRDashboard /></RMProtectedRoute>} />
            <Route path="/hmr/add-salon" element={<RMProtectedRoute><AddSalonForm /></RMProtectedRoute>} />
            <Route path="/hmr/edit-salon/:draftId" element={<RMProtectedRoute><AddSalonForm /></RMProtectedRoute>} />
            <Route path="/hmr/drafts" element={<RMProtectedRoute><Drafts /></RMProtectedRoute>} />
            <Route path="/hmr/submissions" element={<RMProtectedRoute><SubmissionHistory /></RMProtectedRoute>} />
            <Route path="/hmr/profile" element={<RMProtectedRoute><RMProfile /></RMProtectedRoute>} />

            {/* Vendor Protected Routes */}
            <Route path="/vendor/dashboard" element={<VendorProtectedRoute><VendorDashboard /></VendorProtectedRoute>} />
            <Route path="/vendor/payment" element={<VendorProtectedRoute><VendorPayment /></VendorProtectedRoute>} />
            <Route path="/vendor/profile" element={<VendorProtectedRoute><SalonProfile /></VendorProtectedRoute>} />
            <Route path="/vendor/services" element={<VendorProtectedRoute><ServicesManagement /></VendorProtectedRoute>} />
            <Route path="/vendor/staff" element={<VendorProtectedRoute><StaffManagement /></VendorProtectedRoute>} />
            <Route path="/vendor/bookings" element={<VendorProtectedRoute><BookingsManagement /></VendorProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
