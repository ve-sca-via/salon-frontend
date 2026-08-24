/**
 * Blog.jsx - Public blog index (/blog)
 *
 * Lists published articles newest-first with a tag filter and pagination.
 *
 * IMPORTANT — there are two renderers for this URL:
 *   • This React page: what a visitor sees after clicking through inside the SPA.
 *   • `api/render.js` (+ `api/_lib/blog.js`): what a *direct request* to /blog
 *     returns, because vercel.json routes /blog to the serverless function
 *     before the SPA catch-all. That is the copy search engines index.
 * Filters live in the query string (?tag=&page=) precisely so both renderers
 * read the same state and a shared link opens the same list either way.
 */

import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { useGetBlogPostsQuery, useGetBlogTagsQuery } from '../../services/api/blogApi';
import useDocumentMeta from '../../hooks/useDocumentMeta';

// Matches the backend's default page size and the SSR renderer's.
const POSTS_PER_PAGE = 12;

const PAGE_TITLE = 'Beauty & Wellness Blog | Lubist';
const PAGE_DESCRIPTION =
  'Hair, skin, makeup and salon-care guides from the Lubist team — what treatments cost, how often to book them, and how to choose a salon you can trust.';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTag = searchParams.get('tag') || '';
  // Page numbers are 1-based in the URL; anything unparseable falls back to 1.
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const offset = (page - 1) * POSTS_PER_PAGE;

  useDocumentMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  const { data, isLoading, isFetching, isError, refetch } = useGetBlogPostsQuery({
    tag: activeTag,
    limit: POSTS_PER_PAGE,
    offset,
  });

  const { data: tagData } = useGetBlogTagsQuery();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const tags = tagData?.tags ?? [];
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  // Rebuild the query string rather than mutating it, so switching a tag always
  // resets to page 1 instead of landing on an out-of-range page of the new list.
  const buildParams = useMemo(
    () => (nextTag, nextPage) => {
      const params = {};
      if (nextTag) params.tag = nextTag;
      if (nextPage > 1) params.page = String(nextPage);
      return params;
    },
    [],
  );

  const goTo = (nextTag, nextPage) => {
    setSearchParams(buildParams(nextTag, nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chipClass = (isActive) =>
    [
      'rounded-full border px-4 py-1.5 font-body text-sm transition-colors',
      isActive
        ? 'border-neutral-black bg-neutral-black text-white'
        : 'border-gray-300 text-neutral-gray-400 hover:border-neutral-black hover:text-neutral-black',
    ].join(' ');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ---------- Header ---------- */}
      <header className="bg-gradient-blue">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
          <p className="font-body text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
            The Lubist Journal
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-neutral-black sm:text-5xl">
            Beauty &amp; Wellness Guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-neutral-gray-400">
            {PAGE_DESCRIPTION}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        {/* ---------- Tag filter ---------- */}
        {tags.length > 0 && (
          <nav aria-label="Filter articles by topic" className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goTo('', 1)}
              aria-current={!activeTag ? 'true' : undefined}
              className={chipClass(!activeTag)}
            >
              All topics
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => goTo(tag, 1)}
                aria-current={activeTag === tag ? 'true' : undefined}
                className={chipClass(activeTag === tag)}
              >
                {tag}
              </button>
            ))}
          </nav>
        )}

        {/* ---------- States ---------- */}
        {isLoading ? (
          <div
            role="status"
            aria-label="Loading articles"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="aspect-[16/9] w-full bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-5/6 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <h2 className="font-display text-2xl text-neutral-black">
              We couldn&apos;t load the articles
            </h2>
            <p className="mt-2 font-body text-neutral-gray-400">
              Something went wrong on our side. Please try again.
            </p>
            <button type="button" onClick={refetch} className="btn-primary mt-6">
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-display text-2xl text-neutral-black">
              {activeTag ? `Nothing filed under "${activeTag}" yet` : 'No articles published yet'}
            </h2>
            <p className="mt-2 font-body text-neutral-gray-400">
              {activeTag
                ? 'Try another topic — or browse everything we have written so far.'
                : 'New guides are on the way. In the meantime, browse the salons near you.'}
            </p>
            {activeTag ? (
              <button type="button" onClick={() => goTo('', 1)} className="btn-primary mt-6">
                Show all articles
              </button>
            ) : (
              <Link to="/salons" className="btn-primary mt-6 inline-block">
                Browse salons
              </Link>
            )}
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
                isFetching ? 'opacity-60 transition-opacity' : ''
              }`}
            >
              {posts.map((post) => (
                <BlogPostCard key={post.id || post.slug} post={post} />
              ))}
            </div>

            {/* ---------- Pagination ---------- */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="mt-12 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  onClick={() => goTo(activeTag, page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-neutral-black transition-colors hover:border-neutral-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-body text-sm text-neutral-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(activeTag, page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-neutral-black transition-colors hover:border-neutral-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
