import React from "react";

/**
 * Fixed India country code display (+91) with flag — not editable.
 */
export default function PhoneCountryPrefix({ disabled = false }) {
  return (
    <div className="w-[5.5rem] shrink-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Code <span className="text-red-500">*</span>
      </label>
      <div
        className={`input-field flex items-center justify-center gap-1.5 px-2 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-gray-50"
        }`}
        aria-label="Country code India +91"
      >
        <span className="text-base leading-none" aria-hidden="true">
          🇮🇳
        </span>
        <span className="font-medium text-gray-800">+91</span>
      </div>
    </div>
  );
}
