/**
 * About Component
 * 
 * Purpose:
 * Displays the About Us information for Lubist platform, explaining the mission,
 * vision, and value proposition to both customers and salon owners.
 * 
 * Features:
 * - Company overview and mission
 * - Value propositions for customers and salon owners
 * - Location and expansion information
 * - Brand tagline and messaging
 */

import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import { FiCheckCircle, FiMapPin, FiTrendingUp, FiUsers } from 'react-icons/fi';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-display font-bold mb-6">
              About Lubist
            </h1>
            <p className="text-2xl font-body leading-relaxed opacity-95">
              Beauty. Booking. Simplified.
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">
              Who We Are
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Lubist is a modern beauty and wellness platform that makes booking salon and spa services 
                simple, fast, and stress-free.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                What started as an idea to remove waiting lines and uncertainty has grown into a trusted 
                digital platform where customers can easily discover verified salons, check real-time 
                availability, compare services, read reviews, and book appointments within seconds — 
                no calls, no confusion.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                At the same time, Lubist supports salon owners and beauty professionals by giving them 
                smart tools to manage bookings, reduce last-minute cancellations, improve online visibility, 
                and grow their business smoothly in the digital world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">
              Our Mission
            </h2>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <p className="text-xl text-gray-700 leading-relaxed text-center">
                Founded in Ranchi, Jharkhand, Lubist is expanding across India with a clear mission: 
                to make beauty and wellness accessible, reliable, and delightful for everyone.
              </p>
            </div>
            <p className="text-lg text-gray-600 text-center italic">
              Because beauty isn't just a service — it's an experience.
            </p>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
            What Makes Lubist Different
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Customers */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiUsers className="text-4xl text-orange-600" />
                <h3 className="text-2xl font-display font-bold text-gray-900">
                  For Customers
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Discover verified salons with real reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Check real-time availability instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Compare services and prices easily</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Book appointments in seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">No calls, no confusion, no waiting</span>
                </li>
              </ul>
            </div>

            {/* For Salon Owners */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiTrendingUp className="text-4xl text-blue-600" />
                <h3 className="text-2xl font-display font-bold text-gray-900">
                  For Salon Owners
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Smart booking management tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Reduce last-minute cancellations</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Improve online visibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Grow business in the digital world</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Reach more customers effortlessly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Expansion */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <FiMapPin className="text-5xl text-orange-600" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
              Growing Across India
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Founded in <strong>Ranchi, Jharkhand</strong>, Lubist is on a mission to transform 
              the beauty and wellness industry across India.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're expanding to new cities and towns, bringing the convenience of digital booking 
              and the power of technology to salons and customers everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Lubist – Beauty. Booking. Simplified.
          </h2>
          <p className="text-xl leading-relaxed opacity-95 mb-8">
            Join thousands of customers and salon owners who trust Lubist for their beauty needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/salons"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Salons
            </a>
            <a
              href="/vendor-login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Register Your Salon
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
