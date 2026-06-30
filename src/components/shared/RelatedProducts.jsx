import React from "react";
import { useGetRelatedProductsQuery } from "../../services/api/productApi";
import ProductCard from "./ProductCard";

/**
 * "Related Products" section shown at the bottom of the product detail page.
 *
 * Fetches products related to the one being viewed (same category first, then
 * backfilled — see the backend /products/{id}/related endpoint) and renders them
 * in a horizontally scrollable row of the shared ProductCard. Renders nothing
 * while loading or when there are no related products.
 */
export default function RelatedProducts({ productId }) {
  const { data, isLoading, isError } = useGetRelatedProductsQuery(
    { productId },
    { skip: !productId }
  );

  const products = data?.products || [];

  if (isLoading || isError || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 max-w-6xl py-8">
      <h2 className="font-display font-bold text-[22px] sm:text-[26px] text-neutral-black mb-5">
        Related Products
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[170px] sm:w-[210px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
