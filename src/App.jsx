/**
 * App.jsx - Main Application Root Component
 * 
 * PURPOSE:
 * - Configures React Router with all application routes
 * - Implements code splitting via lazy loading for better performance
 * - Manages authentication state and role-based routing
 * 
 * ROUTE STRUCTURE:
 * - Public routes: Home, Salon listings, Login pages
 * - Customer routes: Bookings, Favorites, Reviews, Profile
 * - RM (Relationship Manager) routes: Dashboard, Add/Edit salons, Submissions
 * - Vendor routes: Dashboard, Profile, Services, Staff, Bookings, Payments
 * 
 * AUTHENTICATION:
 * - Backend JWT authentication with Redux state management
 * - Token refresh handled by axios interceptors in backendApi.js
 * 
 * DATA MANAGEMENT:
 * - Cart uses RTK Query with database-first architecture
 * - Components fetch data on mount via RTK Query hooks
 * 
 * PERFORMANCE:
 * - All page components lazy loaded for optimal bundle splitting
 * - Suspense fallback shows loading spinner during component load
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { getUserLocation } from './store/slices/locationSlice';

// Protected route wrappers for role-based access control
import ProtectedRoute from './components/auth/ProtectedRoute';
import RMProtectedRoute from './components/auth/RMProtectedRoute';
import VendorProtectedRoute from './components/auth/VendorProtectedRoute';
import PaymentProtectionWrapper from './components/vendor/PaymentProtectionWrapper';

// Lazy load all page components for code splitting
// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const RMLogin = lazy(() => import('./pages/auth/RMLogin'));
const VendorLogin = lazy(() => import('./pages/auth/VendorLogin'));
const Signup = lazy(() => import('./pages/auth/Signup'));

// Public pages
const Home = lazy(() => import('./pages/public/Home'));
const PublicSalonListing = lazy(() => import('./pages/public/PublicSalonListing'));
const SalonDetail = lazy(() => import('./pages/public/SalonDetail'));
const ServiceBooking = lazy(() => import('./pages/public/ServiceBooking'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const Payment = lazy(() => import('./pages/public/Payment'));
const BookingConfirmation = lazy(() => import('./pages/public/BookingConfirmation'));
const Careers = lazy(() => import('./pages/public/Careers'));
const About = lazy(() => import('./pages/public/About'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const PartnerWithUs = lazy(() => import('./pages/public/PartnerWithUs'));

// Customer pages
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const Favorites = lazy(() => import('./pages/customer/Favorites'));
const MyReviews = lazy(() => import('./pages/customer/MyReviews'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));

// RM (Relationship Manager) pages
const HMRDashboard = lazy(() => import('./pages/hmr/HMRDashboard'));
const AddSalonForm = lazy(() => import('./pages/hmr/AddSalonForm'));
const Drafts = lazy(() => import('./pages/hmr/Drafts'));
const SubmissionHistory = lazy(() => import('./pages/hmr/SubmissionHistory'));
const RMProfile = lazy(() => import('./pages/hmr/RMProfile'));
const RMLeaderboard = lazy(() => import('./pages/hmr/RMLeaderboard'));

// Vendor pages
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const SalonProfile = lazy(() => import('./pages/vendor/SalonProfile'));
const ServicesManagement = lazy(() => import('./pages/vendor/ServicesManagement'));
const StaffManagement = lazy(() => import('./pages/vendor/StaffManagement'));
const BookingsManagement = lazy(() => import('./pages/vendor/BookingsManagement'));
const CompleteRegistration = lazy(() => import('./pages/vendor/CompleteRegistration'));
const VendorPayment = lazy(() => import('./pages/vendor/VendorPayment'));

function App() {
  const dispatch = useDispatch();

  // One-time token format migration for backward compatibility
  useEffect(() => {
    const oldToken = localStorage.getItem('token');
    if (oldToken && !localStorage.getItem('access_token')) {
      localStorage.setItem('access_token', oldToken);
      localStorage.removeItem('token');
    }
  }, []);

  // Fetch user location on app mount
  useEffect(() => {
    dispatch(getUserLocation());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        {/* Suspense provides fallback UI while lazy-loaded components are being fetched */}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <Routes>
            {/* ============================================
                PUBLIC ROUTES (No authentication required)
                ============================================ */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/salons" element={<PublicSalonListing />} />
            <Route path="/salons/:id" element={<SalonDetail />} />
            <Route path="/salons/:id/book" element={<ServiceBooking />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            
            {/* Authentication pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/rm-login" element={<RMLogin />} />
            <Route path="/vendor-login" element={<VendorLogin />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Vendor Registration - Publicly accessible via email token */}
            <Route path="/vendor/complete-registration" element={<CompleteRegistration />} />

            {/* ============================================
                CUSTOMER PROTECTED ROUTES
                ============================================ */}
            <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute allowedRoles={['customer']}><Favorites /></ProtectedRoute>} />
            <Route path="/my-reviews" element={<ProtectedRoute allowedRoles={['customer']}><MyReviews /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />

            {/* ============================================
                RM (RELATIONSHIP MANAGER) PROTECTED ROUTES
                ============================================ */}
            <Route path="/hmr/dashboard" element={<RMProtectedRoute><HMRDashboard /></RMProtectedRoute>} />
            <Route path="/hmr/add-salon" element={<RMProtectedRoute><AddSalonForm /></RMProtectedRoute>} />
            <Route path="/hmr/edit-salon/:draftId" element={<RMProtectedRoute><AddSalonForm /></RMProtectedRoute>} />
            <Route path="/hmr/drafts" element={<RMProtectedRoute><Drafts /></RMProtectedRoute>} />
            <Route path="/hmr/submissions" element={<RMProtectedRoute><SubmissionHistory /></RMProtectedRoute>} />
            <Route path="/hmr/profile" element={<RMProtectedRoute><RMProfile /></RMProtectedRoute>} />
            <Route path="/hmr/leaderboard" element={<RMProtectedRoute><RMLeaderboard /></RMProtectedRoute>} />

            {/* ============================================
                VENDOR PROTECTED ROUTES
                ============================================ */}
            {/* Dashboard & Payment - Always accessible */}
            <Route path="/vendor/dashboard" element={<VendorProtectedRoute><VendorDashboard /></VendorProtectedRoute>} />
            <Route path="/vendor/payment" element={<VendorProtectedRoute><VendorPayment /></VendorProtectedRoute>} />
            
            {/* Payment-Protected Routes - Require registration fee paid */}
            <Route path="/vendor/profile" element={<VendorProtectedRoute><PaymentProtectionWrapper><SalonProfile /></PaymentProtectionWrapper></VendorProtectedRoute>} />
            <Route path="/vendor/services" element={<VendorProtectedRoute><PaymentProtectionWrapper><ServicesManagement /></PaymentProtectionWrapper></VendorProtectedRoute>} />
            <Route path="/vendor/staff" element={<VendorProtectedRoute><PaymentProtectionWrapper><StaffManagement /></PaymentProtectionWrapper></VendorProtectedRoute>} />
            <Route path="/vendor/bookings" element={<VendorProtectedRoute><PaymentProtectionWrapper><BookingsManagement /></PaymentProtectionWrapper></VendorProtectedRoute>} />

            {/* Catch-all route: Redirect any unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        
        {/* Global toast notifications container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
