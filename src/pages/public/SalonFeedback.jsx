import React, { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import {
  useGetFeedbackContextQuery,
  useSubmitFeedbackMutation,
} from "../../services/api/reviewApi";
import { showErrorToast, showSuccessToast } from "../../utils/toastConfig";
import { FiStar } from "react-icons/fi";

function StarPicker({ rating, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <FiStar
            className={`w-8 h-8 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function SalonFeedback() {
  const { id: salonId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, error } = useGetFeedbackContextQuery(
    { salonId, token },
    { skip: !salonId || !token }
  );
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();

  const salon = data?.salon || {};
  const booking = data?.booking || {};
  const existingReview = data?.existing_review;

  const serviceNames = useMemo(() => {
    const services = booking?.services || [];
    return services.map((service) => service.service_name).filter(Boolean);
  }, [booking]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      showErrorToast("This feedback link is missing its token.");
      return;
    }

    if (comment.trim().length < 10) {
      showErrorToast("Please write at least 10 characters of feedback.");
      return;
    }

    try {
      await submitFeedback({
        salonId,
        token,
        rating,
        comment: comment.trim(),
      }).unwrap();
      setSubmitted(true);
      showSuccessToast("Thanks for sharing your feedback.");
    } catch (submitError) {
      showErrorToast(submitError?.data?.detail || submitError?.message || "Failed to submit feedback");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-black mb-4">Invalid Feedback Link</h1>
          <p className="text-neutral-gray-600 mb-6">This feedback link is missing the token needed to identify your visit.</p>
          <Link to="/salons" className="inline-flex px-6 py-3 rounded-xl bg-accent-orange text-white font-semibold">
            Browse Salons
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-black mb-4">
            {error?.data?.detail || error?.message || "Unable to open feedback page"}
          </h1>
          <p className="text-neutral-gray-600">The link may be expired, invalid, or already used.</p>
        </div>
      </div>
    );
  }

  if (existingReview || submitted) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PublicNavbar />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 text-center">
            <h1 className="font-display text-3xl font-bold text-neutral-black mb-4">Feedback Already Submitted</h1>
            <p className="text-neutral-gray-600 mb-6">
              Thanks for reviewing {salon.business_name || "this salon"}.
            </p>
            <div className="flex justify-center mb-3">
              <StarPicker rating={existingReview?.rating || rating} onChange={() => {}} />
            </div>
            <p className="text-neutral-black max-w-xl mx-auto">{existingReview?.comment || comment}</p>
            <Link
              to={`/salons/${salonId}`}
              className="inline-flex mt-8 px-6 py-3 rounded-xl bg-accent-orange text-white font-semibold"
            >
              View Salon Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-8 border-b border-orange-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-orange mb-3">Thank You</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-black mb-3">
              How was your visit to {salon.business_name || "this salon"}?
            </h1>
            <p className="text-neutral-gray-600 text-base">
              Your feedback will help future customers and give the salon meaningful insight.
            </p>
          </div>

          <div className="px-8 py-8 space-y-8">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-sm text-neutral-gray-500 mb-2">Booking</p>
              <p className="font-semibold text-neutral-black">{booking.booking_number || "Completed Visit"}</p>
              <p className="text-neutral-gray-600 text-sm mt-1">{booking.booking_date}</p>
              {serviceNames.length > 0 && (
                <p className="text-neutral-gray-700 text-sm mt-3">
                  Services: {serviceNames.join(", ")}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-black mb-3">Your Rating</label>
                <StarPicker rating={rating} onChange={setRating} />
              </div>

              <div>
                <label htmlFor="feedback-comment" className="block text-sm font-semibold text-neutral-black mb-3">
                  Tell us about your experience
                </label>
                <textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  maxLength={500}
                  placeholder="Share what stood out, how the service felt, or what future customers should know."
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-accent-orange focus:ring-2 focus:ring-orange-100 resize-none"
                />
                <p className="text-right text-sm text-neutral-gray-500 mt-2">{comment.length}/500</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent-orange text-white font-semibold disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
