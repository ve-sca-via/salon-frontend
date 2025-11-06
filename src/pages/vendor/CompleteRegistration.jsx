import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiLock, FiCheckCircle, FiAlertCircle, FiShield, FiCheck, FiUser } from 'react-icons/fi';
import { useCompleteVendorRegistrationMutation } from '../../services/api/vendorApi';
import { loginSuccess } from '../../store/slices/authSlice';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // RTK Query mutation
  const [completeRegistration, { isLoading: loading }] = useCompleteVendorRegistrationMutation();

  const [tokenData, setTokenData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid registration link. Please contact support.');
      navigate('/vendor/login');
      return;
    }

    try {
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
      console.error('Error decoding token:', error);
      toast.error('Invalid registration token');
    }
  }, [token, navigate]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.fullName.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      const result = await completeRegistration({
        token,
        fullName: formData.fullName.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      if (result.data) {
        // Store user in Redux
        dispatch(loginSuccess(result.data.user));

        toast.success('Registration completed successfully! Welcome aboard!');
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const isPasswordStrong =
    passwordStrength.hasMinLength &&
    passwordStrength.hasUpperCase &&
    passwordStrength.hasLowerCase &&
    passwordStrength.hasNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
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

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <InputField
                label="Create Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a strong password"
                icon={<FiLock />}
                required
                autoComplete="new-password"
              />
            </div>

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

            <div>
              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                icon={<FiLock />}
                required
                autoComplete="new-password"
              />
            </div>

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
                  <a 
                    href="/terms" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F89C02] hover:text-orange-700 font-semibold underline"
                  >
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a 
                    href="/privacy" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F89C02] hover:text-orange-700 font-semibold underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

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

            <p className="text-center text-sm text-gray-600 font-body">
              Already have an account?{' '}
              <a 
                href="/vendor/login" 
                className="text-[#F89C02] hover:text-orange-700 font-semibold"
              >
                Sign in here
              </a>
            </p>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-body">
            Need help?{' '}
            <a 
              href="mailto:support@salonhub.com" 
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
