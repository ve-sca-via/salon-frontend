/**
 * Skeleton Loading Components
 * 
 * Purpose:
 * Provide smooth loading states with skeleton screens instead of spinners.
 * Improves perceived performance and reduces layout shift.
 * 
 * Features:
 * - Shimmer animation effect
 * - Multiple skeleton types (text, card, table, stats)
 * - Responsive and customizable
 * - Matches app design system
 */

import React from 'react';

/**
 * Base Skeleton with shimmer effect
 */
const SkeletonBase = ({ className = '', style = {} }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

/**
 * Skeleton Text Line
 */
export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Booking Card - matches BookingCard layout
 */
export const SkeletonBookingCard = () => {
  return (
    <div className="bg-primary-white rounded-xl shadow-md overflow-hidden mb-6 animate-pulse">
      {/* Header */}
      <div className="bg-neutral-black p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <SkeletonBase className="h-5 w-48 rounded mb-2" />
            <SkeletonBase className="h-3 w-32 rounded" />
          </div>
          <SkeletonBase className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-4 border-b border-neutral-gray-600">
          <div className="flex items-start gap-3">
            <SkeletonBase className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <SkeletonBase className="h-3 w-24 rounded mb-2" />
              <SkeletonBase className="h-4 w-32 rounded" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <SkeletonBase className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <SkeletonBase className="h-3 w-20 rounded mb-2" />
              <SkeletonBase className="h-4 w-28 rounded" />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-5">
          <SkeletonBase className="h-4 w-36 rounded mb-3" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-bg-secondary rounded-lg p-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <SkeletonBase className="h-4 w-32 rounded mb-2" />
                    <SkeletonBase className="h-3 w-16 rounded" />
                  </div>
                  <SkeletonBase className="h-5 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-5">
          <div className="space-y-3">
            <div className="flex justify-between">
              <SkeletonBase className="h-3 w-28 rounded" />
              <SkeletonBase className="h-3 w-16 rounded" />
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-gray-600">
              <SkeletonBase className="h-4 w-20 rounded" />
              <SkeletonBase className="h-6 w-24 rounded" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <SkeletonBase className="h-11 flex-1 rounded-lg" />
          <SkeletonBase className="h-11 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Stat Card - for dashboard metrics
 */
export const SkeletonStatCard = () => {
  return (
    <div className="bg-primary-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <SkeletonBase className="h-5 w-32 rounded" />
        <SkeletonBase className="h-10 w-10 rounded-lg" />
      </div>
      <SkeletonBase className="h-8 w-24 rounded mb-2" />
      <SkeletonBase className="h-4 w-40 rounded" />
    </div>
  );
};

/**
 * Skeleton Table Row - for data tables
 */
export const SkeletonTableRow = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-neutral-gray-600 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBase className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton Table - complete table with header
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-primary-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-gray-600">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <SkeletonBase className="h-4 w-24 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton Form Field
 */
export const SkeletonFormField = () => {
  return (
    <div className="mb-4 animate-pulse">
      <SkeletonBase className="h-4 w-32 rounded mb-2" />
      <SkeletonBase className="h-11 w-full rounded-lg" />
    </div>
  );
};

/**
 * Skeleton Review Card
 */
export const SkeletonReviewCard = () => {
  return (
    <div className="bg-primary-white rounded-xl shadow-md p-6 mb-4 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-12 h-12 rounded-full" />
          <div>
            <SkeletonBase className="h-4 w-32 rounded mb-2" />
            <SkeletonBase className="h-3 w-24 rounded" />
          </div>
        </div>
        <SkeletonBase className="h-5 w-20 rounded-full" />
      </div>
      <SkeletonBase className="h-4 w-full rounded mb-2" />
      <SkeletonBase className="h-4 w-full rounded mb-2" />
      <SkeletonBase className="h-4 w-3/4 rounded" />
    </div>
  );
};

/**
 * Skeleton Salon Card - for salon listings
 */
export const SkeletonSalonCard = () => {
  return (
    <div className="bg-primary-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image */}
      <SkeletonBase className="h-48 w-full" />
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <SkeletonBase className="h-5 w-40 rounded" />
          <SkeletonBase className="h-5 w-16 rounded" />
        </div>
        <SkeletonBase className="h-4 w-full rounded mb-2" />
        <SkeletonBase className="h-4 w-2/3 rounded mb-4" />
        
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-24 rounded-full" />
        </div>
        
        {/* Button */}
        <SkeletonBase className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton Service Card
 */
export const SkeletonServiceCard = () => {
  return (
    <div className="bg-primary-white rounded-lg border border-neutral-gray-600 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <SkeletonBase className="h-5 w-40 rounded mb-2" />
          <SkeletonBase className="h-3 w-full rounded mb-1" />
          <SkeletonBase className="h-3 w-2/3 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-neutral-gray-600">
        <SkeletonBase className="h-6 w-24 rounded" />
        <SkeletonBase className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton Chart/Graph placeholder
 */
export const SkeletonChart = ({ height = 'h-64' }) => {
  return (
    <div className={`bg-primary-white rounded-xl shadow-md p-6 ${height} animate-pulse`}>
      <SkeletonBase className="h-5 w-48 rounded mb-6" />
      <div className="h-full flex items-end justify-around gap-2">
        {[60, 80, 45, 90, 70, 85, 65].map((h, i) => (
          <SkeletonBase
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default SkeletonBase;
