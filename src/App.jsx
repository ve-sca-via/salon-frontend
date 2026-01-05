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

// Error Boundary for crash protection
import ErrorBoundary from './components/shared/ErrorBoundary';
// import ErrorBoundaryTest from './components/shared/ErrorBoundaryTest';

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
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

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
    // App-level Error Boundary - Last line of defense against crashes
    <ErrorBoundary fallback="app">
      <Router>
        <div className="App">
          {/* Suspense provides fallback UI while lazy-loaded components are being fetched */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-bg-secondary">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <div className="h-16 w-16 bg-gradient-to-r from-accent-orange to-orange-400 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            </div>
          }>
            <Routes>
              {/* ============================================
                  PUBLIC ROUTES (No authentication required)
                  ============================================ */}
              <Route path="/" element={
                <ErrorBoundary fallback="page">
                  <Home />
                </ErrorBoundary>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/salons" element={
                <ErrorBoundary fallback="page">
                  <PublicSalonListing />
                </ErrorBoundary>
              } />
              <Route path="/salons/:id" element={
                <ErrorBoundary fallback="page">
                  <SalonDetail />
                </ErrorBoundary>
              } />
              <Route path="/salons/:id/book" element={
                <ErrorBoundary fallback="page">
                  <ServiceBooking />
                </ErrorBoundary>
              } />
              <Route path="/cart" element={
                <ErrorBoundary fallback="page">
                  <Cart />
                </ErrorBoundary>
              } />
              <Route path="/checkout" element={
                <ErrorBoundary fallback="page">
                  <Checkout />
                </ErrorBoundary>
              } />
              <Route path="/payment" element={
                <ErrorBoundary fallback="page">
                  <Payment />
                </ErrorBoundary>
              } />
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
              <Route path="/my-bookings" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ErrorBoundary fallback="page">
                    <MyBookings />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ErrorBoundary fallback="page">
                    <Favorites />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/my-reviews" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ErrorBoundary fallback="page">
                    <MyReviews />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/customer/profile" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ErrorBoundary fallback="page">
                    <CustomerProfile />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* ============================================
                  RM (RELATIONSHIP MANAGER) PROTECTED ROUTES
                  ============================================ */}
              <Route path="/hmr/dashboard" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <HMRDashboard />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/add-salon" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <AddSalonForm />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/edit-salon/:draftId" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <AddSalonForm />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/drafts" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <Drafts />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/submissions" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <SubmissionHistory />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/profile" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <RMProfile />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />
              <Route path="/hmr/leaderboard" element={
                <RMProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <RMLeaderboard />
                  </ErrorBoundary>
                </RMProtectedRoute>
              } />

              {/* ============================================
                  VENDOR PROTECTED ROUTES
                  ============================================ */}
              {/* Dashboard & Payment - Always accessible */}
              <Route path="/vendor/dashboard" element={
                <VendorProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <VendorDashboard />
                  </ErrorBoundary>
                </VendorProtectedRoute>
              } />
              <Route path="/vendor/payment" element={
                <VendorProtectedRoute>
                  <ErrorBoundary fallback="page">
                    <VendorPayment />
                  </ErrorBoundary>
                </VendorProtectedRoute>
              } />
              
              {/* Payment-Protected Routes - Require registration fee paid */}
              <Route path="/vendor/profile" element={
                <VendorProtectedRoute>
                  <PaymentProtectionWrapper>
                    <ErrorBoundary fallback="page">
                      <SalonProfile />
                    </ErrorBoundary>
                  </PaymentProtectionWrapper>
                </VendorProtectedRoute>
              } />
              <Route path="/vendor/services" element={
                <VendorProtectedRoute>
                  <PaymentProtectionWrapper>
                    <ErrorBoundary fallback="page">
                      <ServicesManagement />
                    </ErrorBoundary>
                  </PaymentProtectionWrapper>
                </VendorProtectedRoute>
              } />
              <Route path="/vendor/staff" element={
                <VendorProtectedRoute>
                  <PaymentProtectionWrapper>
                    <ErrorBoundary fallback="page">
                      <StaffManagement />
                    </ErrorBoundary>
                  </PaymentProtectionWrapper>
                </VendorProtectedRoute>
              } />
              <Route path="/vendor/bookings" element={
                <VendorProtectedRoute>
                  <PaymentProtectionWrapper>
                    <ErrorBoundary fallback="page">
                      <BookingsManagement />
                    </ErrorBoundary>
                  </PaymentProtectionWrapper>
                </VendorProtectedRoute>
              } />

              {/* Test Error Boundary - for development */}
              {/* <Route path="/test-error" element={<ErrorBoundaryTest />} /> */}

              {/* Catch-all route: Show 404 for unknown paths */}
              <Route path="*" element={
                <ErrorBoundary fallback="page">
                  <NotFoundPage />
                </ErrorBoundary>
              } />
            </Routes>
          </Suspense>
          
          {/* Global toast notifications container */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
