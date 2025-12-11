/**
 * MyReviews Component
 * 
 * Purpose:
 * Displays all reviews written by the customer with options to view and edit them.
 * Shows review status (published, under review, draft) and allows customers to
 * update their ratings and comments.
 * 
 * Data Management:
 * - Reviews from RTK Query (useGetMyReviewsQuery)
 * - Review updates via RTK Query mutation (useUpdateReviewMutation)
 * - Local state for edit modal management
 * 
 * Key Features:
 * - Display all customer reviews in a grid layout
 * - Edit reviews via modal dialog
 * - Star rating input (1-5 stars)
 * - Review status indicators (published, under review, draft)
 * - Empty state with "Browse Salons" call-to-action
 * - Character limit enforcement (500 chars)
 * 
 * User Flow:
 * 1. Customer views their review history
 * 2. Clicks edit icon to modify a review
 * 3. Updates rating and/or comment in modal
 * 4. Saves changes (with validation)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../utils/toastConfig";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
} from "../../services/api/reviewApi";
import { FiStar, FiEdit2, FiMessageSquare } from "react-icons/fi";

/**
 * StarRatingInput - Interactive star rating selector
 * Allows users to select a rating from 1-5 stars by clicking
 */
function StarRatingInput({ rating, onRatingChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="transition-colors"
        >
          <FiStar
            className={`w-6 h-6 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-gray-500"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * ReviewCard - Displays individual review with salon info, rating, and edit button
 * Shows review status badge (published, under review, draft)
 */
function ReviewCard({ review, onEdit }) {
  return (
    <div className="bg-primary-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-[18px] text-neutral-black mb-1">
            {review.salon_name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-body text-[12px] text-neutral-gray-500">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <button
          onClick={() => onEdit(review)}
          className="text-accent-orange hover:text-orange-600 transition-colors"
          title="Edit review"
        >
          <FiEdit2 className="w-5 h-5" />
        </button>
      </div>

      {/* Review Content */}
      <p className="font-body text-[14px] text-neutral-gray-500 leading-relaxed mb-3">
        {review.comment}
      </p>

      {/* Review Status */}
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full font-body text-[12px] font-semibold ${
            review.status === "approved"
              ? "bg-green-50 text-green-700"
              : review.status === "pending"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          {review.status === "approved"
            ? "Published"
            : review.status === "pending"
            ? "Under Review"
            : "Draft"}
        </span>
      </div>
    </div>
  );
}

/**
 * EditReviewModal - Modal dialog for editing review rating and comment
 * Features character limit (500), validation, and backdrop close
 */
function EditReviewModal({ review, onClose, onSave }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);

  /**
   * handleSave - Validates and saves review changes
   */
  const handleSave = async () => {
    if (!comment.trim()) {
      showErrorToast("Please write a review comment");
      return;
    }

    setSaving(true);
    try {
      await onSave(review.id, { rating, comment });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleBackdropClick - Closes modal when clicking outside
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-neutral-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primary-white rounded-lg p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-bold text-[24px] text-neutral-black mb-4">
          Edit Review
        </h3>

        <div className="space-y-4">
          {/* Salon Name */}
          <div>
            <label className="font-body text-[14px] text-neutral-gray-500 mb-1 block">
              Salon
            </label>
            <p className="font-body font-semibold text-[16px] text-neutral-black">
              {review.salon_name}
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="font-body text-[14px] text-neutral-gray-500 mb-2 block">
              Your Rating
            </label>
            <StarRatingInput rating={rating} onRatingChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="font-body text-[14px] text-neutral-gray-500 mb-2 block">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                // Enforce 500 character limit
                if (e.target.value.length <= 500) {
                  setComment(e.target.value);
                }
              }}
              rows={5}
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-lg font-body text-[14px] focus:outline-none resize-none ${
                !comment.trim() && saving
                  ? "border-red-500"
                  : "border-neutral-gray-600 focus:border-accent-orange"
              }`}
              placeholder="Share your experience with this salon..."
            />
            <p className={`font-body text-[12px] mt-1 ${
              comment.length >= 500 ? "text-accent-orange font-semibold" : "text-neutral-gray-500"
            }`}>
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-neutral-gray-600 hover:bg-neutral-gray-500 text-neutral-black font-body font-medium text-[14px] py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-accent-orange hover:opacity-90 text-primary-white font-body font-medium text-[14px] py-3 rounded-lg transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * EmptyReviews - Empty state when customer has no reviews yet
 * Encourages users to browse salons and book services
 */
function EmptyReviews({ onBrowse }) {
  return (
    <div className="bg-primary-white rounded-lg p-12 text-center shadow-md">
      <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <FiMessageSquare className="w-12 h-12 text-neutral-gray-500" />
      </div>
      <h3 className="font-display font-bold text-[24px] text-neutral-black mb-2">
        No Reviews Yet
      </h3>
      <p className="font-body text-[16px] text-neutral-gray-500 mb-6">
        Book a service and share your experience with others
      </p>
      <button
        onClick={onBrowse}
        className="bg-accent-orange hover:opacity-90 text-primary-white font-body font-semibold text-[16px] px-8 py-3 rounded-lg transition-opacity"
      >
        Browse Salons
      </button>
    </div>
  );
}

export default function MyReviews() {
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: reviewsData, isLoading, error } = useGetMyReviewsQuery();
  const [updateReview] = useUpdateReviewMutation();
  
  const myReviews = reviewsData?.data || [];

  // Local state
  const [editingReview, setEditingReview] = useState(null);

  /**
   * handleEditReview - Opens edit modal for selected review
   */
  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  /**
   * handleSaveReview - Saves review updates via RTK Query mutation
   */
  const handleSaveReview = async (reviewId, updatedData) => {
    try {
      await updateReview({ reviewId, ...updatedData }).unwrap();
      showSuccessToast("Review updated successfully");
    } catch (error) {
      showErrorToast(error?.message || "Failed to update review");
    }
  };

  /**
   * handleBrowse - Navigate to salons listing page
   */
  const handleBrowse = () => {
    navigate("/salons");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full" />
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            Loading your reviews...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-black mb-4">
            {error?.message || "Failed to load reviews"}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-orange text-primary-white px-6 py-3 rounded-lg font-body font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-[36px] text-neutral-black mb-2">
            My Reviews
          </h1>
          <p className="font-body text-[16px] text-neutral-gray-500">
            {myReviews.length > 0
              ? `You have written ${myReviews.length} review${myReviews.length > 1 ? "s" : ""}`
              : "No reviews yet"}
          </p>
        </div>

        {/* Reviews List */}
        {myReviews.length === 0 ? (
          <EmptyReviews onBrowse={handleBrowse} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleSaveReview}
        />
      )}
    </div>
  );
}
