/**
 * Partner With Us Component
 * 
 * Purpose:
 * Landing page for potential business partners (salons, clinics, spas) to join the Lubist platform.
 * Showcases partner benefits, success stories, and provides an easy onboarding flow.
 * 
 * Key Features:
 * - Hero section with value proposition
 * - Partner logos showcase
 * - Key benefits section
 * - Step-by-step onboarding process
 * - Contact form for partnership inquiries
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";

/**
 * Key benefits of partnering with Lubist
 */
const benefits = [
  {
    title: "Boost Your Revenue by 25%",
    description: "Experience significant growth in your income with Lubist's effective platform that helps you reach more customers.",
    icon: "📈"
  },
  {
    title: "Gain New Customers",
    description: "Expand your clientele effortlessly through Lubist's wide network and reach new customers who are looking for services like yours.",
    icon: "👥"
  },
  {
    title: "Enhance Your Brand Visibility",
    description: "Boost your presence and become more recognizable with Lubist's powerful marketing tools and community reach.",
    icon: "✨"
  }
];

/**
 * Onboarding steps for new partners
 */
const steps = [
  {
    number: "1",
    title: "Fill Out the Partnership Form",
    description: "Share your details with us by completing a quick form."
  },
  {
    number: "2",
    title: "Verification and Introduction",
    description: "Our team will connect with you to verify information and get to know you."
  },
  {
    number: "3",
    title: "Grow your business with Lubist",
    description: "Get listed on Lubist and grow your business."
  }
];

const PartnerWithUs = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert("Thank you! We'll send you a verification code shortly.");
      setIsSubmitting(false);
      setPhoneNumber("");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-blue py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-neutral-black mb-6">
            Grow Your Business with Lubist
          </h1>
          <p className="text-lg md:text-xl text-neutral-gray-400 max-w-3xl mx-auto mb-8">
            Expand your reach, boost your bookings, and join a trusted network of salons, clinics and spas ready to grow together.
          </p>
          <a
            href="#contact-form"
            className="inline-block bg-accent-orange text-primary-white font-accent font-semibold px-8 py-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Become a Partner
          </a>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-16 md:py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-black mb-4">
              Why Partner with Lubist?
            </h2>
            <p className="text-lg text-neutral-gray-400 max-w-3xl mx-auto">
              Wondering how to grow your business? Lubist is your one-stop solution to boost visibility, gain new clients, and increase revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-primary-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="font-accent font-bold text-xl text-neutral-black mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Partner Section */}
      <section className="py-16 md:py-24 bg-primary-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-black mb-4">
              How to Partner with Us
            </h2>
            <p className="text-lg text-neutral-gray-400 max-w-3xl mx-auto">
              Getting started with Lubist is simple. Just follow these three easy steps to begin your partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-bg-secondary rounded-xl p-8 h-full">
                  <div className="bg-accent-orange text-primary-white text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-accent font-bold text-xl text-neutral-black mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Connector line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-1 bg-accent-orange transform -translate-x-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 md:py-24 bg-gradient-blue">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-primary-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl text-neutral-black mb-4 text-center">
              Want to Partner With Us?
            </h2>
            <p className="text-neutral-gray-400 text-center mb-8">
              We'll send you a verification code to get started.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-neutral-black font-accent font-semibold mb-2"
                >
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your contact number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-neutral-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all"
                />
                <p className="text-sm text-neutral-gray-500 mt-2">
                  Enter a 10-digit mobile number
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent-orange text-primary-white font-accent font-bold py-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isSubmitting ? "Submitting..." : "Continue"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-neutral-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/vendor-login"
                  className="text-accent-orange font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-black text-primary-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-neutral-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of successful businesses already growing with Lubist. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact-form"
              className="inline-block bg-accent-orange text-primary-white font-accent font-semibold px-8 py-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-lg"
            >
              Get Started Now
            </a>
            <Link
              to="/vendor-login"
              className="inline-block bg-transparent border-2 border-primary-white text-primary-white font-accent font-semibold px-8 py-4 rounded-lg hover:bg-primary-white hover:text-neutral-black transition-all duration-300"
            >
              Vendor Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerWithUs;
