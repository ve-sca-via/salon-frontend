/**
 * Signup Component (Customer Registration)
 *
 * Modes:
 * - Email signup: single-step form (Name, Email, Age, Gender, Passwords)
 * - Phone signup: 3 steps -> (1) Phone Input -> (2) OTP Verify -> (3) Details Form (Name, Email, Age, Gender, Passwords)
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiKey } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import InputField from "../../components/shared/InputField";
import Button from "../../components/shared/Button";
import { setUser } from "../../store/slices/authSlice";
import {
  useSignupMutation,
  useSendPhoneSignupOTPMutation,
  useVerifyPhoneSignupOTPMutation,
} from "../../services/api/authApi";
import bgImage from "../../assets/images/bg.png";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [sendPhoneSignupOTP, { isLoading: isSendingOTP }] = useSendPhoneSignupOTPMutation();
  const [verifyPhoneSignupOTP, { isLoading: isVerifyingOTP }] = useVerifyPhoneSignupOTPMutation();

  const [signupMethod, setSignupMethod] = useState("phone");
  // steps: "phone_input", "verify_phone", "form"
  const [step, setStep] = useState("phone_input");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const isPhoneMethod = signupMethod === "phone";
  const cleanPhone = formData.phone.replace(/\D/g, "");

  useEffect(() => {
    if (!otpExpiry) {
      setCountdown(0);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((otpExpiry - now) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiry]);

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMethodChange = (method) => {
    if (method === signupMethod) return;
    setSignupMethod(method);
    setStep(method === "phone" ? "phone_input" : "form");
    setErrors({});
  };

  const handleOtpChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(onlyDigits);
  };

  const validatePhoneStep = () => {
    const newErrors = {};
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetailsStep = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.age || !formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        newErrors.age = "Age must be between 13 and 120";
      }
    }

    if (!formData.gender || !formData.gender.trim()) {
      newErrors.gender = "Gender is required";
    } else {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(formData.gender.toLowerCase())) {
        newErrors.gender = "Please select a valid gender";
      }
    }

    if (!isPhoneMethod) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOtpForPhoneSignup = async (e) => {
    if (e) e.preventDefault();
    if (!validatePhoneStep()) return;

    try {
      const response = await sendPhoneSignupOTP({
        phone: cleanPhone,
        country_code: "91",
      }).unwrap();

      setVerificationId(response.verification_id);
      setOtp("");

      const expiresIn = response.expires_in || 300;
      setOtpExpiry(Date.now() + expiresIn * 1000);
      setStep("verify_phone");
      
      showSuccessToast(response.message || "OTP sent successfully");
    } catch (error) {
      let msg = error.data?.detail || error.message || "Failed to send OTP.";
      if (msg.toLowerCase().includes("registered")) {
        msg = "This phone number is already registered. Please login instead.";
      }
      showErrorToast(msg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!verificationId) {
      showErrorToast("OTP is not active. Please resend OTP.");
      return;
    }

    if (otp.length !== 6) {
      showErrorToast("OTP must be 6 digits");
      return;
    }

    try {
      const response = await verifyPhoneSignupOTP({
        phone: cleanPhone,
        otp,
        verification_id: verificationId,
      }).unwrap();

      if (!response?.success) {
        throw new Error(response?.message || "Phone verification failed");
      }

      setVerificationToken(response.verification_token);
      setStep("form");
      showSuccessToast("Phone verified! Please complete your details.");
    } catch (error) {
      const errorMessage = error.data?.detail || error.message || "OTP verification failed";
      showErrorToast(errorMessage);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!validateDetailsStep()) return;

    try {
      const payload = {
        email: formData.email.trim(),
        password: isPhoneMethod ? `PhoneUser!${Math.random().toString(36).slice(2, 12)}` : formData.password,
        full_name: formData.name,
        age: parseInt(formData.age, 10),
        gender: formData.gender.toLowerCase(),
        user_role: "customer",
      };

      if (isPhoneMethod && verificationToken) {
        payload.verification_token = verificationToken;
      }

      const response = await signup(payload).unwrap();

      if (!response?.access_token || !response?.refresh_token) {
        throw new Error("Signup succeeded but tokens were not returned");
      }

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      dispatch(setUser(response.user));
      sessionStorage.setItem("just_signed_up", "true");

      showSuccessToast("Account created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      let msg = error.data?.detail || error.message || "An error occurred during signup.";
      if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("registered")) {
        msg = "This email is already linked to another account.";
      } else if (msg.toLowerCase().includes("registered")) {
        msg = "This number/email is already registered.";
      } else if (msg.includes("AuthApiError") || msg.includes("Registration failed")) {
        msg = "Failed to create account. Please try again.";
      }
      showErrorToast(msg);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-neutral-black/70"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-primary-white hidden lg:block">
            <Link to="/" className="inline-block mb-8">
              <h1 className="font-display font-bold text-5xl text-primary-white">Lubist</h1>
            </Link>

            <h2 className="font-display font-bold text-4xl mb-4">Join Our Community</h2>
            <p className="font-body text-lg text-neutral-gray-600 mb-8">
              Create your account and start booking appointments with top-rated salons.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">Flexible Signup</h4>
                  <p className="font-body text-neutral-gray-600">Choose email signup or phone signup</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">Trusted Access</h4>
                  <p className="font-body text-neutral-gray-600">Phone signup includes OTP verification</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-body font-semibold text-lg">Manage Bookings</h4>
                  <p className="font-body text-neutral-gray-600">Track and manage all your appointments</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="text-center mb-6 lg:hidden">
              <Link to="/" className="inline-block">
                <h1 className="font-display font-bold text-4xl text-primary-white">Lubist</h1>
              </Link>
            </div>

            <div className="bg-primary-white rounded-[10px] shadow-2xl p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black mb-2">
                  Create Account
                </h2>
                <p className="font-body text-[16px] leading-[24px] text-neutral-gray-500">
                  {step === "phone_input" && "Sign up with your phone number"}
                  {step === "verify_phone" && `Enter the 6-digit OTP sent to +91 ${cleanPhone}`}
                  {step === "form" && "Please provide your details below"}
                </p>
              </div>

              {step === "phone_input" && (
                <form onSubmit={sendOtpForPhoneSignup} className="space-y-4">
                  <InputField
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="Enter your 10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={<FaPhone />}
                    error={errors.phone}
                    disabled={isSendingOTP}
                    aria-label="Phone number"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="mt-6"
                    loading={isSendingOTP}
                    disabled={isSendingOTP}
                  >
                    Send OTP
                  </Button>

                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 h-px bg-neutral-gray-300" />
                    <span className="font-body text-xs text-neutral-gray-400 uppercase tracking-wide">or</span>
                    <div className="flex-1 h-px bg-neutral-gray-300" />
                  </div>
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => handleMethodChange('email')}
                      className="font-body text-sm font-semibold text-accent-orange hover:opacity-75 transition-opacity underline underline-offset-2"
                    >
                      Sign up with Email instead
                    </button>
                  </div>
                </form>
              )}

              {step === "verify_phone" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-body text-sm text-blue-800">
                      Verify your phone number to continue.
                    </p>
                    <p className="font-body text-xs text-blue-700 mt-1">
                      {countdown > 0 ? `OTP expires in ${formatCountdown()}` : "OTP expired. Please resend."}
                    </p>
                  </div>

                  <InputField
                    label="Enter OTP Code"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    icon={<FiKey />}
                    maxLength={6}
                    disabled={isVerifyingOTP}
                    required
                    autoFocus
                    aria-label="OTP code"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isVerifyingOTP}
                    disabled={isVerifyingOTP || otp.length !== 6}
                  >
                    Verify Phone
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={(e) => sendOtpForPhoneSignup(null)}
                      className="font-body text-accent-orange hover:opacity-80 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={countdown > 0 || isSendingOTP}
                    >
                      {isSendingOTP ? "Sending..." : "Resend OTP"}
                    </button>

                    {countdown > 0 && (
                      <span className="font-body text-neutral-gray-500">Resend in {formatCountdown()}</span>
                    )}
                  </div>
                  
                  <div className="text-center mt-4">
                     <button type="button" onClick={() => setStep("phone_input")} className="text-sm text-neutral-gray-500 hover:text-neutral-black transition-colors">
                        Change phone number
                     </button>
                  </div>
                </form>
              )}

              {step === "form" && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  
                  {isPhoneMethod && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                       <span className="font-body text-sm text-green-800 font-medium">Number verified: +91 {cleanPhone}</span>
                       <FaPhone className="text-green-600" size={14}/>
                    </div>
                  )}

                  <InputField
                    label="Full Name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<FaUser />}
                    error={errors.name}
                    disabled={isSignupLoading}
                    aria-label="Full name"
                  />

                  <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<FaEnvelope />}
                    error={errors.email}
                    disabled={isSignupLoading}
                    aria-label="Email address"
                  />

                  <InputField
                    label="Age"
                    type="number"
                    name="age"
                    placeholder="Enter your age (13-120)"
                    value={formData.age}
                    onChange={handleChange}
                    icon={<FaUser />}
                    error={errors.age}
                    disabled={isSignupLoading}
                    aria-label="Age"
                    min="13"
                    max="120"
                    required
                  />

                  <div className="space-y-2">
                    <label className="block font-body text-[14px] font-medium text-neutral-black">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isSignupLoading}
                      className={`w-full px-4 py-3 rounded-[10px] border ${
                        errors.gender ? "border-red-500" : "border-neutral-gray-300"
                      } font-body text-[16px] text-neutral-black placeholder-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      aria-label="Gender"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  {!isPhoneMethod && (
                    <div className="relative">
                      <InputField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        icon={<FaLock />}
                        error={errors.password}
                        disabled={isSignupLoading}
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={isSignupLoading}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  )}

                  {!isPhoneMethod && (
                    <div className="relative">
                      <InputField
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={<FaLock />}
                        error={errors.confirmPassword}
                        disabled={isSignupLoading}
                        aria-label="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        disabled={isSignupLoading}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="mt-6"
                    loading={isSignupLoading}
                    disabled={isSignupLoading}
                  >
                    Create Account
                  </Button>

                  {signupMethod === "email" && (
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={() => handleMethodChange('phone')}
                        className="font-body text-sm font-semibold text-neutral-gray-600 hover:text-neutral-black transition-colors"
                      >
                        Sign up with Phone instead
                      </button>
                    </div>
                  )}
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="font-body text-[14px] text-neutral-gray-500">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent-orange hover:opacity-80 font-semibold transition-opacity">
                    Login here
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/"
                  className="font-body text-[14px] text-neutral-gray-500 hover:text-neutral-gray-400 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>

            <p className="text-center font-body text-[12px] text-neutral-gray-600 mt-6">
              By signing up, you agree to our Terms of Service and{" "}
              <Link to="/privacy-policy" className="text-accent-orange hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
