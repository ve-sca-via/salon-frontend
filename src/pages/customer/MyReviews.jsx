import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
  useCreateReviewMutation,
} from "../../services/api/reviewApi";
import { FiStar, FiEdit2, FiTrash2, FiMessageSquare } from "react-icons/fi";

// Star Rating Input Component
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

// Review Card Component
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

// Edit Review Modal
function EditReviewModal({ review, onClose, onSave }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!comment.trim()) {
      toast.error("Please write a review comment");
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

  return (
    <div className="fixed inset-0 bg-neutral-black/50 flex items-center justify-center z-50 p-4">
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
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-neutral-gray-600 rounded-lg font-body text-[14px] focus:outline-none focus:border-accent-orange resize-none"
              placeholder="Share your experience with this salon..."
            />
            <p className="font-body text-[12px] text-neutral-gray-500 mt-1">
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

// Empty State Component
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

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleSaveReview = async (reviewId, updatedData) => {
    try {
      await updateReview({ reviewId, ...updatedData }).unwrap();
      toast.success("Review updated successfully", {
        position: "bottom-right",
        autoClose: 2000,
        style: {
          backgroundColor: "#000000",
          color: "#fff",
          fontFamily: "DM Sans, sans-serif",
        },
      });
    } catch (error) {
      console.error("Update review error:", error);
      toast.error(error?.message || "Failed to update review");
    }
  };

  const handleBrowse = () => {
    navigate("/salons");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full" />
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
