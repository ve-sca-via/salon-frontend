import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../store/slices/authSlice";
import { loadCartFromSupabaseThunk } from "../../store/slices/cartSlice";
import { login as loginApi } from "../../services/backendApi";
import Button from "../../components/shared/Button";
import InputField from "../../components/shared/InputField";
import { FiMail, FiLock, FiShoppingBag, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import bgImage from "../../assets/images/bg.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (message, type = "info") => {
    const style = {
      backgroundColor: type === "error" ? "#EF4444" : "#000000",
      color: "#fff",
      fontFamily: "DM Sans, sans-serif",
    };
    toast[type](message, { position: "top-center", autoClose: 2500, style });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(loginStart());

    try {
      console.log("Attempting login for:", formData.email);
      
      // Call backend API
      const response = await loginApi(formData.email, formData.password);
      
      if (response && response.user) {
        // Validate customer role - only customers can login here
        const userRole = response.user.role || 'customer';
        if (userRole !== 'customer') {
          throw new Error('Access denied. This login is for customers only. Please use the appropriate login portal for your role.');
        }

        // Store user in Redux (just the user object, not wrapped)
        dispatch(loginSuccess(response.user));
        
        showToast("Login successful! 🎉", "info");

        // Load user's cart (optional - silently fail if cart table doesn't exist)
        if (response.user.id) {
          try {
            dispatch(loadCartFromSupabaseThunk(response.user.id)).catch(err => {
              console.warn("Cart loading failed (table may not exist yet):", err);
            });
          } catch (err) {
            console.warn("Cart loading failed:", err);
          }
        }

        // Navigate to home page
        navigate("/");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(loginFailure(error.message));
      showToast(error.message || "Login failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
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
              Welcome Back!
            </h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Book appointments with top-rated salons in your area. Hair and SPA
              salons integrated with an easy booking system.
            </p>
            {[
              { title: "Easy Booking", text: "Book appointments instantly online" },
              { title: "Verified Salons", text: "Only trusted professionals" },
              { title: "Best Prices", text: "Exclusive deals & offers" },
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
                Sign In
              </h2>
              <p className="font-body text-[16px] text-neutral-gray-500 mb-8">
                Enter your credentials to access your account
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

              <div className="mt-6 text-center text-sm text-neutral-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-accent-orange hover:opacity-80 font-semibold transition-opacity"
                >
                  Sign up here
                </Link>
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

              {/* Other Login Portals */}
              <div className="mt-6 pt-6 border-t border-neutral-gray-600">
                <p className="text-center text-sm text-neutral-gray-500 mb-3 font-body">
                  Looking for a different portal?
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/vendor-login"
                    className="font-body text-sm text-neutral-black hover:bg-neutral-gray-600 transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-neutral-gray-600"
                  >
                    <FiShoppingBag className="text-lg" />
                    <span>Vendor/Salon Login</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
