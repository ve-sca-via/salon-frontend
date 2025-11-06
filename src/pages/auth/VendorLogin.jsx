import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { login as loginApi } from '../../services/backendApi';
import { loginSuccess } from '../../store/slices/authSlice';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import vendorBgImage from '../../assets/images/vendor_portal_bg.jpg';

const VendorLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // Call backend login API
      const data = await loginApi(formData.email, formData.password);

      // Validate vendor/salon role - only vendors can login here
      if (data.user.role !== 'vendor' && data.user.role !== 'salon') {
        toast.error('Access denied. This portal is for salon owners only. Please use the appropriate login page for your role.', {
          position: 'top-center',
          autoClose: 3000,
        });
        return;
      }

      // Store user in Redux
      dispatch(loginSuccess(data.user));

      // Success message
      toast.success(`Welcome back, ${data.user.full_name || data.user.email}!`, {
        position: 'top-center',
        autoClose: 2000,
      });

      // Navigate to vendor dashboard
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.', {
        position: 'top-center',
        autoClose: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${vendorBgImage})` }}
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
              Vendor Portal
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Grow your salon business with our platform. Manage bookings, 
              services, and reach more customers effortlessly.
            </p>
            {[
              { title: "Smart Dashboard", text: "Manage all bookings in one place" },
              { title: "Customer Reach", text: "Connect with thousands of customers" },
              { title: "Business Insights", text: "Track performance and revenue" },
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
                Vendor Portal Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                For Salon Owners & Partners
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
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
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
                    <FiShoppingBag className="text-blue-600 text-xl mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-body font-semibold text-blue-900 mb-1">
                      For Verified Salon Owners
                    </h3>
                    <p className="text-sm text-blue-700 font-body">
                      This portal is exclusively for verified salon vendors. Need approval? Contact your Relationship Manager.
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
                    to="/rm-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiUsers className="text-lg" />
                    <span>Relationship Manager Login</span>
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

export default VendorLogin;
