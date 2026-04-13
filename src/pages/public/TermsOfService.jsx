import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import { FiShield, FiFileText, FiRefreshCcw, FiPhoneCall, FiAlertCircle } from 'react-icons/fi';

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-xl opacity-95">
              Please read these Terms carefully before using Lubist.
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
              Welcome to the Lubist app and website ("Lubist Platform"). By accessing or using the Lubist Platform, you are agreeing to these Terms of Service and concluding a legally binding contract with Lubist (Proprietorship).
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-semibold">
              If you do not accept these Terms, please do not use our Services.
            </p>
          </div>

          {/* Definitions */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiFileText className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                1. Account & Usage
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Customer:</strong> Anyone who accesses or uses the Services for booking, reviewing, or exploring salons. You must be at least 18 years old or above to use our services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Partner:</strong> Salons, spas, and service outlets listed on the Lubist Platform.
            </p>
          </div>

          {/* Appointments & Booking */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              2. Appointment Booking Service
            </h2>
            <ul className="space-y-4 ml-6 mb-4">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Booking:</strong> You can request appointments via the Lubist Platform. The availability is determined strictly in real-time.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Arrival:</strong> We advise arriving at the Partner location 10 minutes prior to your scheduled time. The Partner reserves the right to cancel your booking and re-allocate it in case of a late arrival.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Disputes:</strong> In the event the Partner fails to honor the confirmed booking, you must raise a dispute with us within 30 minutes from the scheduled time.</span>
              </li>
            </ul>
          </div>

          {/* Refund Policy */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiRefreshCcw className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                3. Refund Policy
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds will only be considered in the following scenarios:
            </p>
            <ul className="space-y-3 ml-6 mb-4">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>The customer paid for a service by mistake which was not availed.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>The customer paid an incorrect amount which exceeds the final bill amount.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>The salon charged an incorrect amount exceeding the true bill.</span>
              </li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-gray-900 font-semibold">
                Approved refunds are typically issued back to the original payment method within 7 working days.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertCircle className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                4. Disclaimer & Limitations of Liability
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lubist connects customers directly with salon partners. However:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>We are not liable for any in-person interactions, deficiency of service, quality of products used, or overall experience at the Partner premises.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>All services are provided "AS IS" without warranties of any kind.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>You agree to defend, indemnify, and hold harmless Lubist from third-party claims arising from your unauthorized use of the platform.</span>
              </li>
            </ul>
          </div>

          {/* Content Guidelines */}
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              5. User Content & Reviews
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You own the content (such as reviews or ratings) you submit on Lubist. By posting, you grant us an irrevocable, perpetual, royalty-free license to use, display, and distribute it. Reviews reflect personal opinions and must be honest, legal, and free from abusive/objectionable language. We reserve the right to remove any content that violates these Terms.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiPhoneCall className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Contact Us
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
                  <span className="font-semibold w-16">Email:</span>
                  <a href="mailto:support@lubist.in" className="hover:text-blue-600">
                    support@lubist.in
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold w-16">Phone:</span>
                  <a href="tel:7004950910" className="hover:text-blue-600">
                    7004950910
                  </a>
                </div>
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
