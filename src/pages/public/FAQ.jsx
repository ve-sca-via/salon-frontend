/**
 * FAQ Component
 * 
 * Purpose:
 * Displays frequently asked questions about Lubist platform to help customers
 * understand the booking process, policies, and features.
 * 
 * Features:
 * - Top 10 most common questions
 * - Clean accordion-style layout
 * - Easy to read and navigate
 * - Contact support call-to-action
 */

import React, { useState } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import { FiHelpCircle, FiChevronDown, FiChevronUp, FiMail } from 'react-icons/fi';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Lubist?",
      answer: "Lubist is an online booking platform that helps you find and book appointments with verified salons and spas easily."
    },
    {
      question: "How do I book an appointment?",
      answer: "Just search for a salon, choose a service, select a time slot, and confirm your booking in one click."
    },
    {
      question: "Is Lubist free to use?",
      answer: "Yes! Lubist is completely free for customers — you only pay for the services you choose."
    },
    {
      question: "Are salons and spas verified?",
      answer: "Yes. We onboard only trusted and verified salons and professionals to ensure quality service."
    },
    {
      question: "Do I need to pay in advance?",
      answer: "Most services allow you to pay at the salon. Some may ask for a small online token to confirm your booking."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can — depending on the salon's cancellation or rescheduling policy."
    },
    {
      question: "How will I know my booking is confirmed?",
      answer: "You'll get an instant confirmation through SMS, email, or app notification."
    },
    {
      question: "Can I compare salons before booking?",
      answer: "Absolutely! You can compare prices, ratings, services, and reviews before making a choice."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes. Your data is protected using strict privacy and security standards."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach out anytime through the Contact Us page or email support@lubist.in."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiHelpCircle className="text-5xl" />
            </div>
            <h1 className="text-5xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl opacity-95">
              Find quick answers to common questions about Lubist
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Introduction */}
          <div className="mb-12 text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Have a question? We've got you covered with answers to the most common questions about booking and using Lubist.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {index + 1}. {faq.question}
                  </span>
                  <span className="flex-shrink-0 text-orange-600">
                    {openIndex === index ? (
                      <FiChevronUp className="text-2xl" />
                    ) : (
                      <FiChevronDown className="text-2xl" />
                    )}
                  </span>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-2 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions CTA */}
          <div className="mt-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8 text-center border border-orange-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiMail className="text-4xl text-orange-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Still Have Questions?
            </h2>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@lubist.in"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <FiMail />
                Email Support
              </a>
              <a
                href="/privacy-policy"
                className="bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Privacy Policy
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
