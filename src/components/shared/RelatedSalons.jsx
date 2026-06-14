import React from "react";
import { useGetRelatedSalonsQuery } from "../../services/api/salonApi";
import { SalonCard } from "./SalonCard";

/**
 * "Related Salons" section shown at the bottom of the salon detail page.
 *
 * Fetches salons related to the one being viewed (same city first, then
 * backfilled — see the backend /salons/{id}/related endpoint) and renders them
 * in a horizontally scrollable row of the shared SalonCard. Renders nothing
 * while loading or when there are no related salons, so it never leaves an
 * empty heading on the page.
 */
export default function RelatedSalons({ salonId, userLocation }) {
  const { data, isLoading, isError } = useGetRelatedSalonsQuery(
    { salonId },
    { skip: !salonId }
  );

  const salons = data?.salons || [];

  if (isLoading || isError || salons.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="font-display font-bold text-[22px] sm:text-[26px] text-neutral-black mb-5">
        Related Salons
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="snap-start shrink-0 w-[260px] sm:w-[280px]"
          >
            <SalonCard salon={salon} userLocation={userLocation} />
          </div>
        ))}
      </div>
    </section>
  );
}
