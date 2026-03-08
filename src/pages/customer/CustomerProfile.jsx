/**
 * CustomerProfile Component
 *
 * A fully-featured customer profile dashboard with three tabs:
 *   1. Overview   — booking stats, recent bookings, quick navigation
 *   2. Edit Profile — update full_name, phone, age, gender
 *   3. Security   — change password, logout from all devices
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { useGetMyBookingsQuery } from "../../services/api/bookingApi";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
} from "../../services/api/authApi";
import { setUser, clearUser } from "../../store/slices/authSlice";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiHeart,
  FiMessageSquare,
  FiShoppingBag,
  FiEdit2,
  FiLock,
  FiGrid,
  FiEye,
  FiEyeOff,
  FiSave,
  FiX,
  FiShield,
  FiLogOut,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "edit", label: "Edit Profile", icon: FiEdit2 },
  { id: "security", label: "Security", icon: FiShield },
];

const GENDER_OPTIONS = ["male", "female", "other"];

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    completed: "bg-green-100 text-green-800",
    confirmed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-bold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ myBookings, bookingsLoading }) {
  // Each sub-component calls useNavigate() directly — most reliable approach
  const navigate = useNavigate();

  const stats = {
    total: myBookings.length,
    completed: myBookings.filter((b) => b.status === "completed").length,
    upcoming: myBookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    ).length,
    cancelled: myBookings.filter((b) => b.status === "cancelled").length,
  };

  const statCards = [
    { label: "Total Bookings", value: stats.total, bg: "bg-orange-100", iconBg: "bg-orange-200", icon: FiShoppingBag, color: "text-orange-600" },
    { label: "Completed", value: stats.completed, bg: "bg-green-50", iconBg: "bg-green-100", icon: FiStar, color: "text-green-700" },
    { label: "Upcoming", value: stats.upcoming, bg: "bg-blue-50", iconBg: "bg-blue-100", icon: FiCalendar, color: "text-blue-700" },
    { label: "Cancelled", value: stats.cancelled, bg: "bg-red-50", iconBg: "bg-red-100", icon: FiX, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, bg, iconBg, icon: Icon, color }) => (
          <div key={label} className={`${bg} rounded-xl p-5 shadow-sm border border-white`}>
            <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-bold text-[30px] text-gray-900 leading-none mb-1">
              {value}
            </p>
            <p className="text-[13px] font-medium text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickNavCard
          icon={FiShoppingBag}
          label="My Bookings"
          desc="View & manage all bookings"
          color="orange"
          onClick={() => navigate("/my-bookings")}
        />
        <QuickNavCard
          icon={FiHeart}
          label="My Favourites"
          desc="Your saved salons"
          color="pink"
          onClick={() => navigate("/favorites")}
        />
        <QuickNavCard
          icon={FiMessageSquare}
          label="My Reviews"
          desc="Reviews you've written"
          color="purple"
          onClick={() => navigate("/my-reviews")}
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[18px] text-gray-900">Recent Bookings</h3>
          {myBookings.length > 0 && (
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-[13px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              View All <FiChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {bookingsLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">Loading bookings…</p>
          </div>
        ) : myBookings.length === 0 ? (
          <div className="text-center py-10">
            <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[15px] font-medium text-gray-600 mb-4">No bookings yet</p>
            <button
              onClick={() => navigate("/salons")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[14px] px-6 py-2.5 rounded-lg transition-colors"
            >
              Browse Salons
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-semibold text-[15px] text-gray-900 truncate">
                    {booking.salon_name}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {booking.booking_time}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickNavCard({ icon: Icon, label, desc, onClick, color }) {
  const colorMap = {
    orange: { bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-500", hover: "hover:bg-orange-100" },
    pink: { bg: "bg-pink-50", border: "border-pink-200", iconBg: "bg-pink-500", hover: "hover:bg-pink-100" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-500", hover: "hover:bg-purple-100" },
  };
  const c = colorMap[color] || colorMap.orange;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${c.bg} ${c.border} ${c.hover} border rounded-xl p-4 flex items-center gap-4 text-left w-full transition-colors cursor-pointer`}
    >
      <div className={`${c.iconBg} w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-bold text-[14px] text-gray-900">{label}</p>
        <p className="text-[12px] text-gray-600 mt-0.5">{desc}</p>
      </div>
      <FiChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
    </button>
  );
}

// ─── Edit Profile Tab ─────────────────────────────────────────────────────────

function EditProfileTab({ user }) {
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
  });

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      age: user?.age || "",
      gender: user?.gender || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }

    const payload = {};
    if (form.full_name.trim()) payload.full_name = form.full_name.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.age) payload.age = parseInt(form.age);
    if (form.gender) payload.gender = form.gender;

    try {
      const result = await updateProfile(payload).unwrap();
      dispatch(setUser({ ...user, ...result.user }));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.data?.detail || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center">
          <FiEdit2 className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-gray-900">Edit Profile</h3>
          <p className="text-[13px] text-gray-500">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email — read-only */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Email Address
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
            <FiMail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-[14px] text-gray-700 flex-1">{user?.email}</span>
            <span className="text-[11px] font-medium text-gray-500 bg-gray-200 rounded-full px-2.5 py-0.5">
              Read only
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-300 focus-within:border-orange-400 transition-colors">
            <FiUser className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="flex-1 outline-none text-[14px] text-gray-900 bg-transparent placeholder-gray-400"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-300 focus-within:border-orange-400 transition-colors">
            <FiPhone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className="flex-1 outline-none text-[14px] text-gray-900 bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="e.g. 25"
              min={13}
              max={120}
              className="w-full px-4 py-3 outline-none text-[14px] text-gray-900 bg-white rounded-lg border-2 border-gray-300 focus:border-orange-400 transition-colors placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 outline-none text-[14px] text-gray-900 bg-white rounded-lg border-2 border-gray-300 focus:border-orange-400 transition-colors cursor-pointer"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-[14px] px-8 py-3 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Security Tab helpers (defined at module level to keep stable references) ─

function PwInput({ fieldKey, label, placeholder, showPw, pwForm, onToggleShow, onPwChange }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border-2 border-gray-300 focus-within:border-orange-400 transition-colors">
        <FiLock className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          type={showPw[fieldKey] ? "text" : "password"}
          name={`${fieldKey}_password`}
          value={pwForm[`${fieldKey}_password`]}
          onChange={onPwChange}
          placeholder={placeholder}
          className="flex-1 outline-none text-[14px] text-gray-900 bg-transparent placeholder-gray-400"
          required
        />
        <button
          type="button"
          onClick={() => onToggleShow(fieldKey)}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          {showPw[fieldKey] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ user }) {
  const dispatch = useDispatch();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const toggleShow = (key) => setShowPw((p) => ({ ...p, [key]: !p[key] }));

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      }).unwrap();
      toast.success("Password changed successfully!");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err?.data?.detail || "Failed to change password");
    }
  };

  const strengthLevel = () => {
    const len = pwForm.new_password.length;
    if (!len) return null;
    if (len < 8) return { label: "Too short", color: "bg-red-400", width: "w-1/4" };
    if (len < 12) return { label: "Fair", color: "bg-yellow-400", width: "w-2/4" };
    if (len < 16) return { label: "Good", color: "bg-blue-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };
  const strength = strengthLevel();

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
            <FiLock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-[20px] text-gray-900">Change Password</h3>
            <p className="text-[13px] text-gray-500">Keep your account protected</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <PwInput fieldKey="current" label="Current Password" placeholder="Enter your current password"
            showPw={showPw} pwForm={pwForm} onToggleShow={toggleShow} onPwChange={handlePwChange} />
          <PwInput fieldKey="new" label="New Password" placeholder="At least 8 characters"
            showPw={showPw} pwForm={pwForm} onToggleShow={toggleShow} onPwChange={handlePwChange} />
          <PwInput fieldKey="confirm" label="Confirm New Password" placeholder="Re-enter new password"
            showPw={showPw} pwForm={pwForm} onToggleShow={toggleShow} onPwChange={handlePwChange} />

          {/* Strength bar */}
          {strength && (
            <div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
              </div>
              <p className="text-[12px] font-medium text-gray-600 mt-1">Strength: {strength.label}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-[14px] px-8 py-3 rounded-lg transition-colors"
          >
            {changingPassword ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FiLock className="w-4 h-4" />
            )}
            {changingPassword ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Fetch fresh profile data from /me — ensures age, gender, phone are up-to-date
  // even if they weren't included in the original login token response.
  const { data: profileData } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });
  // Merge: API response wins over Redux state for profile fields
  const profile = profileData?.user
    ? { ...user, ...profileData.user }
    : user;

  const { data: bookingsData, isLoading: bookingsLoading } = useGetMyBookingsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const myBookings = bookingsData?.data || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Customer";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-[34px] text-gray-900 mb-1">My Profile</h1>
          <p className="text-[15px] text-gray-500">
            Manage your account, personal details and security settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
              {/* Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-24" />

              <div className="px-6 pb-6 -mt-12">
                {/* Avatar — gender-based illustrated SVG */}
                <div className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-4 border-white overflow-hidden bg-white">
                  {profile?.gender === "female" ? (
                    /* Female avatar */
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <rect width="100" height="100" fill="#fce7f3"/>
                      {/* Hair */}
                      <ellipse cx="50" cy="30" rx="22" ry="22" fill="#7c3aed"/>
                      <path d="M28 38 Q20 70 22 82 Q35 75 50 78 Q65 75 78 82 Q80 70 72 38 Q61 48 50 48 Q39 48 28 38Z" fill="#7c3aed"/>
                      {/* Face */}
                      <ellipse cx="50" cy="36" rx="17" ry="18" fill="#FDDBB4"/>
                      {/* Eyes */}
                      <ellipse cx="43" cy="33" rx="2.5" ry="3" fill="#1e1e1e"/>
                      <ellipse cx="57" cy="33" rx="2.5" ry="3" fill="#1e1e1e"/>
                      {/* Smile */}
                      <path d="M44 42 Q50 47 56 42" stroke="#c2185b" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                      {/* Blush */}
                      <ellipse cx="39" cy="39" rx="4" ry="2.5" fill="#f9a8d4" opacity="0.6"/>
                      <ellipse cx="61" cy="39" rx="4" ry="2.5" fill="#f9a8d4" opacity="0.6"/>
                      {/* Body */}
                      <path d="M30 100 Q30 75 50 72 Q70 75 70 100Z" fill="#ec4899"/>
                    </svg>
                  ) : profile?.gender === "male" ? (
                    /* Male avatar */
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <rect width="100" height="100" fill="#dbeafe"/>
                      {/* Hair */}
                      <ellipse cx="50" cy="28" rx="20" ry="17" fill="#1d4ed8"/>
                      <rect x="30" y="28" width="40" height="10" fill="#1d4ed8"/>
                      {/* Face */}
                      <ellipse cx="50" cy="38" rx="17" ry="18" fill="#FDDBB4"/>
                      {/* Eyes */}
                      <ellipse cx="43" cy="35" rx="2.5" ry="3" fill="#1e1e1e"/>
                      <ellipse cx="57" cy="35" rx="2.5" ry="3" fill="#1e1e1e"/>
                      {/* Smile */}
                      <path d="M44 44 Q50 49 56 44" stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                      {/* Ears */}
                      <ellipse cx="33" cy="38" rx="3" ry="4" fill="#f5c49b"/>
                      <ellipse cx="67" cy="38" rx="3" ry="4" fill="#f5c49b"/>
                      {/* Body */}
                      <path d="M28 100 Q28 74 50 71 Q72 74 72 100Z" fill="#2563eb"/>
                      {/* Collar */}
                      <path d="M44 71 L50 80 L56 71" fill="white" opacity="0.8"/>
                    </svg>
                  ) : (
                    /* Neutral / no gender set */
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <rect width="100" height="100" fill="#fff7ed"/>
                      {/* Hair */}
                      <ellipse cx="50" cy="30" rx="20" ry="18" fill="#f97316"/>
                      {/* Face */}
                      <ellipse cx="50" cy="38" rx="17" ry="18" fill="#FDDBB4"/>
                      {/* Eyes */}
                      <ellipse cx="43" cy="35" rx="2.5" ry="3" fill="#1e1e1e"/>
                      <ellipse cx="57" cy="35" rx="2.5" ry="3" fill="#1e1e1e"/>
                      {/* Smile */}
                      <path d="M44 44 Q50 49 56 44" stroke="#9a3412" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                      {/* Body */}
                      <path d="M28 100 Q28 74 50 71 Q72 74 72 100Z" fill="#f97316"/>
                    </svg>
                  )}
                </div>

                <h2 className="font-bold text-[20px] text-gray-900 text-center mb-0.5">
                  {displayName}
                </h2>
                <p className="text-[13px] text-gray-500 text-center mb-5">Customer Account</p>

                {/* Details */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[13px] truncate">{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[13px]">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.gender && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[13px] capitalize">{profile.gender}</span>
                    </div>
                  )}
                  {profile?.age && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[13px]">Age: {profile.age}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-[13px]">
                      Member since{" "}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Recently"}
                    </span>
                  </div>
                </div>

                {/* Tab nav */}
                <nav className="space-y-1">
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-[14px] transition-colors ${
                        activeTab === id
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* ── Content ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <OverviewTab myBookings={myBookings} bookingsLoading={bookingsLoading} />
            )}
            {activeTab === "edit" && <EditProfileTab user={profile} />}
            {activeTab === "security" && <SecurityTab user={profile} />}
          </div>
        </div>
      </div>
    </div>
  );
}
