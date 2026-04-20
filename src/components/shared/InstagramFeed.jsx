/**
 * InstagramFeed Component
 *
 * Purpose:
 * Displays real Instagram posts from @lubist_official using Instagram's
 * official oEmbed standard (blockquote + embed.js). No API token required.
 *
 * Industry standard approach:
 * - Uses Instagram's official embed.js script loaded dynamically
 * - Triggers window.instgrm.Embeds.process() after mount for SPA compatibility
 * - Horizontally scrollable post carousel — standard UX for brand IG sections
 */

import React, { useEffect } from "react";

const INSTAGRAM_HANDLE = "lubist_official";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const POST_URLS = [
  "https://www.instagram.com/p/DXQhWnGjRM-/",
  "https://www.instagram.com/p/DXOZtePGOTu/",
  "https://www.instagram.com/p/DW81vTxGEjV/",
  "https://www.instagram.com/p/DWc56lnDJqi/",
  "https://www.instagram.com/p/DWDurZsGBtq/",
  "https://www.instagram.com/p/DV71HTTE-nk/",
  "https://www.instagram.com/p/DV07pvPDKft/",
  "https://www.instagram.com/p/DV0dsf1jAff/",
  "https://www.instagram.com/p/DVx3M4kEy0K/",
];

const igGradient =
  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstagramFeed() {
  useEffect(() => {
    // Dynamically inject Instagram's embed.js if not already present
    const scriptId = "instagram-embed-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
    } else {
      // Script already exists — re-process embeds for SPA navigation
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }
  }, []);

  return (
    <section className="py-16 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            {/* Handle badge */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group w-fit"
            >
              <span
                className="flex items-center justify-center rounded-lg p-1.5 text-white"
                style={{ background: igGradient }}
              >
                <InstagramIcon size={18} />
              </span>
              <span className="font-body text-[15px] font-semibold text-gray-500 group-hover:text-gray-800 transition-colors">
                @{INSTAGRAM_HANDLE}
              </span>
            </a>

            <h2 className="font-display font-bold text-[26px] md:text-[30px] text-neutral-900 leading-tight">
              Follow Us on Instagram
            </h2>
            <p className="font-body text-[14px] text-gray-500 max-w-sm">
              Stay updated with the latest styles &amp; behind-the-scenes moments.
            </p>
          </div>

          {/* Follow CTA button */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-body font-semibold text-[14px] px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:shadow-md shadow-sm flex-shrink-0"
            style={{ background: igGradient }}
          >
            <InstagramIcon size={16} />
            Follow
          </a>
        </div>

        {/* ── Horizontal scrollable embed row ── */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {POST_URLS.map((url, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-start"
              style={{ width: "320px" }}
            >
              {/* Official Instagram blockquote embed — industry standard */}
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: "0",
                  borderRadius: "12px",
                  boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
                  margin: "0",
                  maxWidth: "320px",
                  minWidth: "280px",
                  padding: "0",
                  width: "100%",
                }}
              >
                {/* Placeholder shown while embed.js loads */}
                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, #f09433, #dc2743, #bc1888)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InstagramIcon size={20} />
                  </div>
                  <p style={{ fontSize: "13px", color: "#8e8e8e", textAlign: "center" }}>
                    Loading post…
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#0095f6" }}
                  >
                    View on Instagram
                  </a>
                </div>
              </blockquote>
            </div>
          ))}
        </div>

        {/* Hide scrollbar via inline style (cross-browser) */}
        <style>{`
          .instagram-feed-scroll::-webkit-scrollbar { display: none; }
        `}</style>

      </div>
    </section>
  );
}
