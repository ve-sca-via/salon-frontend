import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";
import InputField from "../../components/shared/InputField";
import Button from "../../components/shared/Button";
import { loginSuccess } from "../../store/slices/authSlice";
import { register } from "../../services/backendApi";
import bgImage from "../../assets/images/bg.png";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Call backend registration API
      const response = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone: formData.phone,
        role: 'customer', // Always register as customer
      });

      // Store token and user info
      if (response.access_token && response.user) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Update Redux state (just the user object)
        dispatch(loginSuccess(response.user));

        toast.success("Account created successfully! Welcome to SalonHub! 🎉", {
          position: "top-center",
          autoClose: 2000,
          style: {
            backgroundColor: "#000000",
            color: "#fff",
            fontFamily: "DM Sans, sans-serif",
          },
        });

        navigate("/");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        style: {
          backgroundColor: "#EF4444",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-primary-white hidden lg:block">
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">
                SalonHub
              </h1>
            </Link>
            <h2 className="font-display font-bold text-4xl mb-4">
              Join Our Community!
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Create your account and start booking appointments with top-rated
              salons. Join thousands of satisfied customers today!
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Quick Registration
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Sign up in seconds and start booking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Exclusive Deals
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Get access to special offers and discounts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">
                    Manage Bookings
                  </h4>
                  <p className="font-body text-neutral-gray-600">
                    Track and manage all your appointments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full">
            {/* Logo for Mobile */}
            <div className="text-center mb-6 lg:hidden">
              <Link to="/" className="inline-block">
                <h1 className="font-display font-bold text-4xl text-primary-white">
                  SalonHub
                </h1>
              </Link>
            </div>

            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black mb-2">
                  Create Account
                </h2>
                <p className="font-body text-[16px] leading-[24px] text-neutral-gray-500">
                  Join thousands of happy customers
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={<FaUser />}
                  error={errors.name}
                />

                {/* Email */}
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<FaEnvelope />}
                  error={errors.email}
                />

                {/* Phone */}
                <InputField
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<FaPhone />}
                  error={errors.phone}
                />

                {/* Password */}
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<FaLock />}
                  error={errors.password}
                />

                {/* Confirm Password */}
                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<FaLock />}
                  error={errors.confirmPassword}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  loading={loading}
                >
                  Create Account
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-accent-orange hover:opacity-80 font-semibold transition-opacity"
                  >
                    Login here
                  </Link>
                </p>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="font-body text-[14px] text-neutral-gray-500 hover:text-neutral-gray-400 transition-colors inline-flex items-center gap-2"
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

            {/* Terms */}
            <p className="text-center font-body text-[12px] text-neutral-gray-600 mt-6">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;