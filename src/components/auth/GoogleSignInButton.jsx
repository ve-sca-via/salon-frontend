import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleSignInButton = ({
  onClick,
  loading,
  text = "Continue with Google",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-neutral-gray-300 rounded-lg font-body font-medium text-[16px] text-neutral-black hover:bg-neutral-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle size={24} />
      <span>{loading ? "Signing in..." : text}</span>
    </button>
  );
};

export default GoogleSignInButton;
