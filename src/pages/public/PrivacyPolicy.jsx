/**
 * Privacy Policy Component
 * 
 * Purpose:
 * Displays Lubist's privacy policy explaining data collection, usage, sharing,
 * security measures, and user rights in compliance with privacy regulations.
 * 
 * Features:
 * - Comprehensive privacy information
 * - Structured sections for easy navigation
 * - Contact information for privacy concerns
 * - Responsive layout with proper typography
 */

import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import { FiShield, FiLock, FiEye, FiFileText, FiMail, FiPhone } from 'react-icons/fi';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiShield className="text-5xl" />
            </div>
            <h1 className="text-5xl font-display font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl opacity-95">
              Your privacy matters to us. Learn how we protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At Lubist, your privacy matters to us. We are committed to protecting your personal 
              information and giving you a secure, transparent, and trustworthy booking experience. 
              This Privacy Policy explains how your data is collected, used, and protected when you 
              use the Lubist website or mobile app.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-semibold">
              By using Lubist, you agree to this policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiEye className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Information We Collect
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We only collect information that helps us deliver a smooth experience. This includes:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Basic details like name, phone number, optional email, gender, and profile photo</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Booking information such as selected services, salons, appointment times, and cancellations</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Technical data like IP address, device type, browser details, and approximate location</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              This helps us show nearby salons, improve features, and resolve technical issues.
            </p>
          </div>

          {/* How We Use Your Data */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiFileText className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                How We Use Your Data
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your information helps us:
            </p>
            <ul className="space-y-3 ml-6 mb-4">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Confirm appointments and show real-time availability</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Send reminders and booking updates</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Improve recommendations and app performance</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Process secure payments or advance tokens</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Detect misuse or suspicious activity</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may contact you through SMS, WhatsApp, email, or app notifications.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-gray-900 font-semibold">
                We do not sell or rent your personal data.
              </p>
            </div>
          </div>

          {/* When We Share Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              When We Share Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data may be shared only when necessary such as with:
            </p>
            <ul className="space-y-3 ml-6 mb-4">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>The salon you book with</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Payment partners for secure transactions</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Communication services for reminders</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Cloud and analytics providers for platform improvement</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Data may also be shared if legally required or in case of business transfer, with prior notice.
            </p>
          </div>

          {/* Cookies & Tracking */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Cookies & Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies to save preferences, keep you logged in, and improve speed and performance. 
              You can control cookies in your browser settings.
            </p>
          </div>

          {/* Data Storage & Retention */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Data Storage & Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored securely on servers in India or other countries with strong security standards.
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Account data stays until deleted</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Booking records may be kept for legal requirements</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Technical logs are retained temporarily for support and analysis</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Public reviews may remain without showing identity</span>
              </li>
            </ul>
          </div>

          {/* Security Measures */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiLock className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Security Measures
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We use encryption, secure servers, access controls, and regular security reviews. 
              While we try our best, no online system is completely immune to risks.
            </p>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can:
            </p>
            <ul className="space-y-3 ml-6 mb-4">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Update profile details</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Request your stored information</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Delete your account</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Withdraw consent or stop promotional messages</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Contact us at{' '}
              <a href="mailto:support@lubist.in" className="text-blue-600 hover:text-blue-700 font-semibold">
                support@lubist.in
              </a>{' '}
              for assistance.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Lubist is not intended for users under 13 years old.
            </p>
          </div>

          {/* External Services */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              External Services
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Links to third-party platforms like Google Maps or salon pages have separate privacy policies.
            </p>
          </div>

          {/* Policy Updates */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Policy Updates
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this policy periodically. Continued use of Lubist means acceptance of changes.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiMail className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Contact
              </h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <p className="text-gray-900 font-semibold mb-4 text-lg">
                Lubist (Proprietorship)
              </p>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Argora, Ranchi, Jharkhand, India
                </p>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiPhone className="text-blue-600" />
                  <a href="tel:7004950910" className="hover:text-blue-600">
                    7004950910
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiMail className="text-blue-600" />
                  <a href="mailto:support@lubist.in" className="hover:text-blue-600">
                    support@lubist.in
                  </a>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <FiMail className="text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Grievance Support:</p>
                    <a href="mailto:grievance@lubist.in" className="hover:text-blue-600">
                      grievance@lubist.in
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic mt-4">
                  Response time: Within 15 working days
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Last updated: November 2025
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
