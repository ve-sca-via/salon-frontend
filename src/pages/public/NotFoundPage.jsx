/**
 * NotFoundPage.jsx - Dedicated 404 Page
 * 
 * PURPOSE:
 * - Standalone 404 page for invalid routes
 * - Includes navbar and footer for navigation
 * - Consistent design with rest of the app
 * 
 * USAGE:
 * - Used in App.jsx catch-all route
 * - Shows when user navigates to non-existent route
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      <PublicNavbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-accent-orange mb-4">404</h1>
            <h2 className="text-3xl font-bold text-neutral-black mb-4">Page Not Found</h2>
            <p className="text-lg text-neutral-gray-700 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-accent-orange text-accent-orange rounded-lg hover:bg-accent-orange hover:text-white transition-colors duration-200 font-semibold"
            >
              Go Back
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-accent-orange text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold"
            >
              Go to Homepage
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-neutral-gray-300">
            <p className="text-neutral-gray-600 mb-4">Looking for something? Try these:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/salons" className="text-accent-orange hover:underline font-medium">
                Browse Salons
              </Link>
              <Link to="/about" className="text-accent-orange hover:underline font-medium">
                About Us
              </Link>
              <Link to="/careers" className="text-accent-orange hover:underline font-medium">
                Careers
              </Link>
              <Link to="/partner-with-us" className="text-accent-orange hover:underline font-medium">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-black text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-neutral-gray-400">
            &copy; {new Date().getFullYear()} Vescavia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
