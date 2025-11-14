/**
 * Career Page
 * 
 * Purpose:
 * Public career page for Relationship Manager (RM) job applications
 * 
 * Features:
 * - Job description and requirements
 * - Application form with file uploads
 * - Form validation
 * - Success/error handling
 * - Responsive design following brand design tokens
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import FileUpload from '../../components/shared/FileUpload';

const Careers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_city: '',
    current_address: '',
    willing_to_relocate: false,
    experience_years: 0,
    previous_company: '',
    current_salary: '',
    expected_salary: '',
    notice_period_days: '',
    highest_qualification: '',
    university_name: '',
    graduation_year: '',
    cover_letter: '',
    linkedin_url: '',
    portfolio_url: ''
  });

  // File data
  const [files, setFiles] = useState({
    resume: null,
    aadhaar_card: null,
    pan_card: null,
    photo: null,
    address_proof: null,
    educational_certificates: [],
    experience_letter: null,
    salary_slip: null
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required text fields
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }

    // Required files
    if (!files.resume) newErrors.resume = 'Resume is required';
    if (!files.aadhaar_card) newErrors.aadhaar_card = 'Aadhaar card is required';
    if (!files.pan_card) newErrors.pan_card = 'PAN card is required';
    if (!files.photo) newErrors.photo = 'Photo is required';
    if (!files.address_proof) newErrors.address_proof = 'Address proof is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      if (files.resume) formDataToSend.append('resume', files.resume);
      if (files.aadhaar_card) formDataToSend.append('aadhaar_card', files.aadhaar_card);
      if (files.pan_card) formDataToSend.append('pan_card', files.pan_card);
      if (files.photo) formDataToSend.append('photo', files.photo);
      if (files.address_proof) formDataToSend.append('address_proof', files.address_proof);
      if (files.experience_letter) formDataToSend.append('experience_letter', files.experience_letter);
      if (files.salary_slip) formDataToSend.append('salary_slip', files.salary_slip);

      // Educational certificates (multiple files)
      files.educational_certificates.forEach((file, index) => {
        formDataToSend.append('educational_certificates', file);
      });

      const response = await fetch('http://localhost:8000/api/v1/careers/apply', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setApplicationNumber(data.application_number);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.detail || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-blue">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <div className="bg-primary-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-orange rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-neutral-black mb-4">
                Application Submitted!
              </h1>

              <p className="text-neutral-gray-400 text-lg mb-6">
                Thank you for applying to join our team. We've received your application and will review it shortly.
              </p>

              <div className="bg-bg-secondary border-2 border-accent-orange rounded-lg p-6 mb-8">
                <p className="text-sm font-semibold text-neutral-gray-400 mb-2">
                  Your Application Number
                </p>
                <p className="font-display text-2xl text-accent-orange">
                  {applicationNumber}
                </p>
                <p className="text-xs text-neutral-gray-500 mt-2">
                  Please save this number for future reference
                </p>
              </div>

              <div className="space-y-3 text-left bg-bg-tertiary rounded-lg p-6 mb-8">
                <h3 className="font-display text-lg text-neutral-black mb-3">What happens next?</h3>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent-orange text-primary-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-neutral-gray-400 text-sm">Our HR team will review your application within 5-7 business days</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent-orange text-primary-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-neutral-gray-400 text-sm">Shortlisted candidates will receive a call for initial screening</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent-orange text-primary-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-neutral-gray-400 text-sm">Selected candidates will be invited for in-person interviews</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="bg-gradient-orange text-primary-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-blue">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="bg-neutral-black text-primary-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Join Our Team
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray-500">
              We're looking for passionate Relationship Managers to grow with us
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Job Description - Left Column */}
            <div className="md:col-span-1">
              <div className="bg-primary-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h2 className="font-display text-2xl text-neutral-black mb-4">
                  Relationship Manager
                </h2>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Location</h3>
                    <p className="text-neutral-gray-400">Mumbai, Delhi, Bangalore</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Experience</h3>
                    <p className="text-neutral-gray-400">0-3 years in sales/client relations</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Salary Range</h3>
                    <p className="text-neutral-gray-400">₹3-5 LPA + Incentives</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Key Responsibilities</h3>
                    <ul className="text-neutral-gray-400 space-y-2 list-disc list-inside">
                      <li>Onboard new salon partners</li>
                      <li>Maintain vendor relationships</li>
                      <li>Achieve monthly targets</li>
                      <li>Provide platform support</li>
                      <li>Conduct quality audits</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Requirements</h3>
                    <ul className="text-neutral-gray-400 space-y-2 list-disc list-inside">
                      <li>Bachelor's degree</li>
                      <li>Excellent communication</li>
                      <li>Two-wheeler (preferred)</li>
                      <li>Sales/marketing experience</li>
                      <li>Smartphone proficiency</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-black mb-2">Benefits</h3>
                    <ul className="text-neutral-gray-400 space-y-2 list-disc list-inside">
                      <li>Performance bonuses</li>
                      <li>Career growth</li>
                      <li>Travel allowance</li>
                      <li>Health insurance</li>
                      <li>Training programs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form - Right Column */}
            <div className="md:col-span-2">
              <div className="bg-primary-white rounded-2xl shadow-lg p-8">
                <h2 className="font-display text-2xl text-neutral-black mb-6">
                  Apply Now
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-accent-orange">
                      Personal Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Full Name <span className="text-accent-orange">*</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent ${
                            errors.full_name ? 'border-red-500' : 'border-neutral-gray-600'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Email <span className="text-accent-orange">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-neutral-gray-600'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Phone Number <span className="text-accent-orange">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent ${
                            errors.phone ? 'border-red-500' : 'border-neutral-gray-600'
                          }`}
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Current City
                        </label>
                        <input
                          type="text"
                          name="current_city"
                          value={formData.current_city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-neutral-black mb-2">
                        Current Address
                      </label>
                      <textarea
                        name="current_address"
                        value={formData.current_address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        placeholder="Enter your full address"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="willing_to_relocate"
                          checked={formData.willing_to_relocate}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-accent-orange focus:ring-accent-orange border-neutral-gray-600 rounded"
                        />
                        <span className="text-sm text-neutral-gray-400">
                          I am willing to relocate if required
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-accent-orange">
                      Professional Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Total Experience (Years)
                        </label>
                        <input
                          type="number"
                          name="experience_years"
                          value={formData.experience_years}
                          onChange={handleInputChange}
                          min="0"
                          max="50"
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Previous/Current Company
                        </label>
                        <input
                          type="text"
                          name="previous_company"
                          value={formData.previous_company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Current Salary (₹/month)
                        </label>
                        <input
                          type="number"
                          name="current_salary"
                          value={formData.current_salary}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="e.g., 25000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Expected Salary (₹/month)
                        </label>
                        <input
                          type="number"
                          name="expected_salary"
                          value={formData.expected_salary}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="e.g., 35000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Notice Period (Days)
                        </label>
                        <input
                          type="number"
                          name="notice_period_days"
                          value={formData.notice_period_days}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="e.g., 30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Educational Background */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-accent-orange">
                      Educational Background
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Highest Qualification
                        </label>
                        <select
                          name="highest_qualification"
                          value={formData.highest_qualification}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        >
                          <option value="">Select qualification</option>
                          <option value="12th Pass">12th Pass</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          University/College Name
                        </label>
                        <input
                          type="text"
                          name="university_name"
                          value={formData.university_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="Enter institution name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          name="graduation_year"
                          value={formData.graduation_year}
                          onChange={handleInputChange}
                          min="1980"
                          max="2030"
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="e.g., 2020"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-accent-orange">
                      Required Documents
                    </h3>

                    <FileUpload
                      label="Resume / CV"
                      name="resume"
                      required
                      accept=".pdf,.doc,.docx"
                      onChange={(file) => handleFileChange('resume', file)}
                      error={errors.resume}
                      helpText="Upload your latest resume in PDF or Word format"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FileUpload
                        label="Aadhaar Card"
                        name="aadhaar_card"
                        required
                        onChange={(file) => handleFileChange('aadhaar_card', file)}
                        error={errors.aadhaar_card}
                      />

                      <FileUpload
                        label="PAN Card"
                        name="pan_card"
                        required
                        onChange={(file) => handleFileChange('pan_card', file)}
                        error={errors.pan_card}
                      />

                      <FileUpload
                        label="Passport Size Photo"
                        name="photo"
                        required
                        preview
                        accept=".jpg,.jpeg,.png"
                        onChange={(file) => handleFileChange('photo', file)}
                        error={errors.photo}
                      />

                      <FileUpload
                        label="Address Proof"
                        name="address_proof"
                        required
                        onChange={(file) => handleFileChange('address_proof', file)}
                        error={errors.address_proof}
                        helpText="Utility bill, rent agreement, etc."
                      />
                    </div>
                  </div>

                  {/* Optional Documents */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-neutral-gray-600">
                      Optional Documents
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FileUpload
                        label="Experience Letter"
                        name="experience_letter"
                        onChange={(file) => handleFileChange('experience_letter', file)}
                        helpText="If you have previous work experience"
                      />

                      <FileUpload
                        label="Salary Slip / Offer Letter"
                        name="salary_slip"
                        onChange={(file) => handleFileChange('salary_slip', file)}
                        helpText="Latest salary slip or previous offer letter"
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-black mb-4 pb-2 border-b-2 border-neutral-gray-600">
                      Additional Information
                    </h3>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-black mb-2">
                        Cover Letter
                      </label>
                      <textarea
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-black mb-2">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          name="portfolio_url"
                          value={formData.portfolio_url}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-neutral-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t-2 border-neutral-gray-600">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        w-full bg-gradient-orange text-primary-white py-4 rounded-lg 
                        font-semibold text-lg transition-all
                        ${loading 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:shadow-lg transform hover:-translate-y-0.5'
                        }
                      `}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting Application...
                        </span>
                      ) : (
                        'Submit Application'
                      )}
                    </button>

                    <p className="text-xs text-neutral-gray-500 text-center mt-4">
                      By submitting this application, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Careers;
