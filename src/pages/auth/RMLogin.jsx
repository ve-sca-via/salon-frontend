import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { login as loginApi } from '../../services/backendApi';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { FiMail, FiLock, FiUser, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import rmBgImage from '../../assets/images/rm_portal_bg.jpg';

const RMLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (message, type = 'info') => {
    const style = {
      backgroundColor: type === 'error' ? '#EF4444' : '#10B981',
      color: '#fff',
      fontFamily: 'DM Sans, sans-serif',
    };
    toast[type](message, { position: 'top-center', autoClose: 2500, style });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    dispatch(loginStart());

    try {
      console.log('🔐 RM Login attempt for:', formData.email);
      
      // Call backend API with JWT authentication
      const data = await loginApi(formData.email, formData.password);
      
      console.log('✅ Login response:', data);

      // Verify user has RM role - only relationship managers can login here
      if (data.user.role !== 'relationship_manager') {
        throw new Error('Access denied. This portal is for Relationship Managers only. Please use the appropriate login page for your role.');
      }

      // Store user in Redux
      dispatch(loginSuccess(data.user));
      
      showToast(`Welcome back, ${data.user.full_name || data.user.email}!`, 'success');
      
      // Navigate to RM dashboard
      navigate('/hmr/dashboard');
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch(loginFailure(error.message));
      showToast(error.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${rmBgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Info Section */}
          <div className="text-primary-white hidden lg:block">
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                SalonHub
              </h1>
            </Link>
            <h2 className="font-display font-bold text-4xl mb-4">
              RM Portal
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Manage salon partnerships, track performance, and drive growth. 
              Dedicated portal for Relationship Managers.
            </p>
            {[
              { title: "Salon Management", text: "Submit and manage salon listings" },
              { title: "Performance Tracking", text: "Monitor your salon portfolio" },
              { title: "Commission Insights", text: "Track earnings and performance" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">{item.title}</h4>
                  <p className="font-body text-neutral-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Login Form */}
          <div className="w-full">
            <div className="text-center mb-6 lg:hidden">
              <Link to="/">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  SalonHub
                </h1>
              </Link>
            </div>

            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              <h2 className="font-display font-bold text-[32px] text-neutral-black mb-2">
                RM Portal Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                For Relationship Managers Only
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<FiMail />}
                  required
                />
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  icon={<FiLock />}
                  required
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-neutral-gray-500 text-accent-orange focus:ring-accent-orange"
                    />
                    <span className="ml-2 font-body text-sm text-neutral-gray-500">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-body text-sm text-accent-orange hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Sign In
                </Button>
              </form>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-body font-semibold text-blue-900 mb-1">
                      Authorized Access Only
                    </h3>
                    <p className="text-sm text-blue-700 font-body">
                      This portal is exclusively for authorized Relationship Managers to manage salon partnerships.
                    </p>
                  </div>
                </div>
              </div>

             

              {/* Other Login Portals */}
              <div className="mt-6 pt-6 border-t border-neutral-gray-600">
                <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                  Looking for a different portal?
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUser className="text-lg" />
                    <span>Customer Login</span>
                  </Link>
                  <Link
                    to="/vendor-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiShoppingBag className="text-lg" />
                    <span>Vendor/Salon Login</span>
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="font-body text-sm text-neutral-gray-500 hover:text-neutral-gray-400 inline-flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMLogin;
