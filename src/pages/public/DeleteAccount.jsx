/**
 * Delete Account Component
 *
 * Purpose:
 * Public, no-login-required page explaining how a Lubist user requests deletion
 * of their account and associated data. This URL is submitted to the Google Play
 * Console (Data safety -> account deletion) and is shown on the store listing, so
 * it must name the app, spell out the steps, and state what is deleted vs. kept.
 *
 * Features:
 * - Two documented routes: in-app self-service, and an email request
 * - Explicit list of what is erased and what is retained (and why)
 * - Contact details for follow-up
 */

import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import useDocumentMeta from '../../hooks/useDocumentMeta';
import {
  FiTrash2,
  FiSmartphone,
  FiMail,
  FiCheckCircle,
  FiArchive,
  FiAlertTriangle,
  FiClock,
  FiPhone,
} from 'react-icons/fi';

// Steps shown for the in-app route. Kept in sync with the Profile screen of the
// Lubist mobile app (Profile -> Delete Account).
const IN_APP_STEPS = [
  'Open the Lubist app and sign in to your account.',
  'Tap the Profile tab, then scroll to the bottom of the screen.',
  'Tap "Delete Account".',
  'Confirm it is you: if you signed up with your phone number, enter the code we text you. If you signed up with an email address, enter your password.',
  'Type DELETE in the confirmation box.',
  'Tap "Delete Account" once more. Your account is deleted immediately and you are signed out.',
];

const EMAIL_STEPS = [
  <>
    Email{' '}
    <a href="mailto:support@lubist.com" className="text-blue-600 hover:text-blue-700 font-semibold">
      support@lubist.com
    </a>{' '}
    from the email address registered on your Lubist account.
  </>,
  <>
    Use the subject line <span className="font-semibold text-gray-900">Delete My Account</span>.
  </>,
  'Include the phone number registered on your account so we can verify it is you.',
  'We verify your request and delete the account within 30 days, then confirm by email.',
];

const DELETED_DATA = [
  'Your name, email address, phone number, age and gender',
  'Your profile photo and saved addresses',
  'Your saved salons, saved products and cart',
  'Your reviews and ratings (removed from public salon pages)',
  'Your login credentials — you will be signed out of every device',
];

const RETAINED_DATA = [
  {
    label: 'Booking and payment records',
    detail:
      'Kept for up to 8 years as required by Indian tax and financial record-keeping law, and for payment reconciliation with our payment provider. These records are anonymised — your name, email and phone number are removed, so they can no longer be linked to you.',
  },
  {
    label: 'Fraud and security logs',
    detail:
      'Basic technical logs are retained for a short period to protect the platform against abuse, then deleted automatically.',
  },
];

export default function DeleteAccount() {
  useDocumentMeta(
    'Delete Your Account | Lubist',
    'How to request deletion of your Lubist account and the data associated with it — in-app or by email.',
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiTrash2 className="text-5xl" />
            </div>
            <h1 className="text-5xl font-display font-bold mb-4">Delete Your Account</h1>
            <p className="text-xl opacity-95">
              How to request deletion of your Lubist account and the data associated with it.
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
              This page explains how to request that your <span className="font-semibold">Lubist</span>{' '}
              account — used in the Lubist mobile app and on lubist.com — and its associated data are
              deleted. You can do it yourself inside the app, or ask us to do it by email.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded flex gap-3">
              <FiAlertTriangle className="text-2xl text-amber-600 shrink-0 mt-0.5" />
              <p className="text-gray-900">
                Deleting your account is permanent and cannot be undone. Your bookings, saved salons
                and reviews will no longer be available to you. To use Lubist again you would need to
                create a new account.
              </p>
            </div>
          </div>

          {/* Option 1: In-app */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiSmartphone className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Option 1: Delete from the Lubist app
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              This is the fastest route — your account is deleted straight away.
            </p>
            <ol className="space-y-3 ml-2">
              {IN_APP_STEPS.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-6">
              <p className="text-gray-900">
                If you have an upcoming booking, cancel or complete it first — the app will tell you
                if anything is still open.
              </p>
            </div>
          </div>

          {/* Option 2: Email */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiMail className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Option 2: Request deletion by email
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use this if you no longer have the app installed, cannot sign in, or hold a salon
              partner (vendor) account.
            </p>
            <ol className="space-y-3 ml-2">
              {EMAIL_STEPS.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* What gets deleted */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiCheckCircle className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                What is deleted
              </h2>
            </div>
            <ul className="space-y-3 ml-6">
              {DELETED_DATA.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What is kept */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiArchive className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                What we have to keep
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              A small amount of data must be retained even after your account is deleted:
            </p>
            <ul className="space-y-4 ml-6">
              {RETAINED_DATA.map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    <span className="font-semibold text-gray-900">{item.label}</span> — {item.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FiClock className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">
                How long it takes
              </h2>
            </div>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  <span className="font-semibold text-gray-900">In the app:</span> immediate. Your
                  personal details are erased the moment you confirm.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  <span className="font-semibold text-gray-900">By email:</span> within 30 days of us
                  verifying your request.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Backups are rotated on a rolling schedule and any residual copies are removed
                  within 90 days.
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FiMail className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-display font-bold text-gray-900">Contact</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <p className="text-gray-900 font-semibold mb-4 text-lg">Lubist (Proprietorship)</p>
              <div className="space-y-3">
                <p className="text-gray-700">Argora, Ranchi, Jharkhand, India</p>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiPhone className="text-blue-600" />
                  <a href="tel:+919204166560" className="hover:text-blue-600">
                    +91 9204166560
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FiMail className="text-blue-600" />
                  <a href="mailto:support@lubist.com" className="hover:text-blue-600">
                    support@lubist.com
                  </a>
                </div>
                <p className="text-gray-600 text-sm italic mt-4">
                  Response time: Within 15 working days
                </p>
              </div>
            </div>
          </div>

          {/* Related policy */}
          <div className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              For full details on what we collect and why, see our{' '}
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-semibold">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Last Updated */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">Last updated: July 2026</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
