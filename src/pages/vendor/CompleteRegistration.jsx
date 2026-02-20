/**
 * CompleteRegistration Component
 * 
 * Purpose:
 * Final step of vendor registration after admin approval. Allows approved vendors to
 * set up their account credentials (full name and password) using a secure token link.
 * 
 * Data Management:
 * - Token from URL search params (contains email and approval info)
 * - Registration completion via RTK Query mutation
 * - User stored in Redux on successful registration
 * 
 * Key Features:
 * - Secure token-based registration (JWT decoded client-side)
 * - Password strength validation (8+ chars, uppercase, lowercase, number)
 * - Real-time password match indicator
 * - Terms and conditions acceptance
 * - Automatic redirect to vendor dashboard after completion
 * 
 * Security:
 * - Token validation (format check and JWT decode)
 * - Server-side token verification in mutation
 * - Password requirements enforced
 * 
 * User Flow:
 * 1. Vendor receives email with registration link containing token
 * 2. Token is decoded to show email/approval info
 * 3. Vendor enters full name and creates password
 * 4. Password strength is validated in real-time
 * 5. On submit: account created, user logged in, redirected to dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';
import { FiLock, FiCheckCircle, FiAlertCircle, FiShield, FiCheck, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useCompleteVendorRegistrationMutation } from '../../services/api/vendorApi';
import { setUser } from '../../store/slices/authSlice';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // RTK Query mutation for completing registration
  const [completeRegistration, { isLoading: loading }] = useCompleteVendorRegistrationMutation();

  // Local state
  const [tokenData, setTokenData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    acceptTerms: false,
  });

  /**
   * Password strength criteria tracking
   * Validates: min length, uppercase, lowercase, number, special char
   */
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Validate and decode JWT token on mount
   * Token contains vendor email and approval info
   * TODO: Add server-side token validation for additional security
   */
  useEffect(() => {
    if (!token) {
      showErrorToast('Invalid registration link. Please contact support.');
      navigate('/vendor/login');
      return;
    }

    try {
      // Decode JWT token (format: header.payload.signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      setTokenData(decoded);
    } catch (error) {
      showErrorToast('Invalid registration token');
      // Still allow form to render - server will validate token on submit
    }
  }, [token, navigate]);

  /**
   * Update password strength indicators as user types
   */
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  /**
   * handleChange - Updates form field values
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /**
   * handleSubmit - Validates and submits registration data
   * Performs client-side validation before calling API
   * On success: stores user in Redux and redirects to dashboard
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!formData.fullName || !formData.password || !formData.confirmPassword || !formData.age || !formData.gender) {
      showErrorToast('Please fill in all fields');
      return;
    }

    if (formData.fullName.trim().length < 2) {
      showErrorToast('Please enter your full name');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      showErrorToast('Age must be between 18 and 120');
      return;
    }

    if (!['male', 'female', 'other'].includes(formData.gender.toLowerCase())) {
      showErrorToast('Please select a valid gender');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      showErrorToast('Password must be at least 8 characters long');
      return;
    }

    if (!formData.acceptTerms) {
      showErrorToast('Please accept the terms and conditions');
      return;
    }

    try {
      // Submit registration with token
      const result = await completeRegistration({
        token,
        full_name: formData.fullName.trim(),  // Backend expects snake_case
        password: formData.password,
        confirm_password: formData.confirmPassword,  // Backend expects snake_case
        age: parseInt(formData.age, 10),
        gender: formData.gender.toLowerCase(),
      }).unwrap();

      if (result.data) {
        // Store access token and refresh token
        if (result.data.access_token) {
          localStorage.setItem('access_token', result.data.access_token);
        }
        if (result.data.refresh_token) {
          localStorage.setItem('refresh_token', result.data.refresh_token);
        }

        // Store authenticated user in Redux
        dispatch(setUser(result.data.user));

        showSuccessToast('Registration completed successfully! Welcome aboard!');
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      showErrorToast(error.message || 'Registration failed. Please try again.');
    }
  };

  /**
   * Check if password meets all strength requirements
   * Note: Special character is optional but recommended
   */
  const isPasswordStrong =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUpperCase &&
    passwordStrength.hasLowerCase &&
    passwordStrength.hasNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F89C02] to-orange-600 rounded-2xl shadow-2xl mb-6">
            <FiShield className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            Complete Your Registration
          </h1>
          <p className="text-gray-600 font-body text-lg">
            Create your secure account credentials
          </p>
        </div>

        {/* Approval Confirmation Card */}
        {tokenData && (
          <div className="bg-white border-2 border-[#F89C02]/30 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiCheck className="text-[#F89C02] text-2xl" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">
                  Your Salon is Approved!
                </h3>
                <p className="text-gray-700 font-body mb-2">
                  <span className="font-semibold">Email:</span> {tokenData.email}
                </p>
                <p className="text-sm text-gray-600 font-body">
                  Complete your registration to access your vendor dashboard and start managing your salon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <InputField
                label="Your Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                icon={<FiUser />}
                required
                autoComplete="name"
              />
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age Input */}
              <div>
                <InputField
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  icon={<FiUser />}
                  required
                  min="18"
                  max="120"
                />
              </div>

              {/* Gender Select */}
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F89C02] focus:border-transparent font-body text-gray-900"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <InputField
                label="Create Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a strong password"
                icon={<FiLock />}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-body font-semibold text-gray-700 mb-3">Password Requirements:</p>
                <div className="space-y-2">
                  <PasswordRequirement
                    met={passwordStrength.hasMinLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasUpperCase}
                    text="One uppercase letter (A-Z)"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasLowerCase}
                    text="One lowercase letter (a-z)"
                  />
                  <PasswordRequirement 
                    met={passwordStrength.hasNumber} 
                    text="One number (0-9)" 
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasSpecialChar}
                    text="One special character (optional)"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="relative">
              <InputField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                icon={<FiLock />}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center">
                {formData.password === formData.confirmPassword ? (
                  <div className="flex items-center text-green-600">
                    <FiCheckCircle className="mr-2" size={18} />
                    <span className="text-sm font-body font-medium">Passwords match</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <FiAlertCircle className="mr-2" size={18} />
                    <span className="text-sm font-body font-medium">Passwords do not match</span>
                  </div>
                )}
              </div>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#F89C02] border-gray-300 rounded focus:ring-[#F89C02] focus:ring-2 mt-0.5"
                  required
                />
                <span className="text-sm text-gray-700 font-body leading-relaxed">
                  I agree to the{' '}
                  <Link 
                    to="/terms"
                    className="text-[#F89C02] hover:text-orange-700 font-semibold underline"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link 
                    to="/privacy"
                    className="text-[#F89C02] hover:text-orange-700 font-semibold underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-[#F89C02] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-heading font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading || !isPasswordStrong || !formData.acceptTerms}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-3"></div>
                  Creating Your Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiCheck className="mr-2" size={20} />
                  Complete Registration
                </div>
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 font-body">
              Already have an account?{' '}
              <Link 
                to="/vendor/login"
                className="text-[#F89C02] hover:text-orange-700 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </form>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-body">
            Need help?{' '}
            <a 
              href="mailto:support@lubist.com"
              className="text-[#F89C02] hover:text-orange-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * PasswordRequirement - Visual indicator for password strength requirement
 * Shows checkmark when requirement is met, empty circle otherwise
 */
const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center text-sm font-body">
    {met ? (
      <FiCheckCircle className="text-green-600 mr-2 flex-shrink-0" size={16} />
    ) : (
      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2 flex-shrink-0"></div>
    )}
    <span className={met ? 'text-green-700 font-medium' : 'text-gray-600'}>{text}</span>
  </div>
);

export default CompleteRegistration;
