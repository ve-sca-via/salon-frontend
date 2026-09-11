/**
 * BlogPost.jsx - Public article page (/blog/:slug)
 *
 * The client-side render of a single post. A *direct* request to this URL is
 * served by `api/render.js` instead (see vercel.json) so crawlers and link
 * unfurlers get real HTML with real meta tags; this component is what a visitor
 * sees when they arrive by clicking a card inside the SPA. The two must agree —
 * if you change what the article shows, change `api/_lib/blog.js` too.
 *
 * Body HTML is sanitised server-side by `blog_service._sanitize_html` (nh3, tag
 * allowlist) before it is ever stored, which is what makes the
 * dangerouslySetInnerHTML below safe. Do not render blog HTML from any other
 * source through this path.
 */

import { Link, useParams } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { useGetBlogPostQuery } from '../../services/api/blogApi';
import useDocumentMeta from '../../hooks/useDocumentMeta';
import { formatDate } from '../../utils/helpers';
import '../../components/blog/prose.css';

const BlogPost = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useGetBlogPostQuery(slug, { skip: !slug });

  const post = data?.post;
  const relatedPosts = post?.related_posts ?? [];

  // Same fallback chain the API and the SSR renderer use: explicit SEO field
  // (used verbatim, author-controlled) first, then the human-facing one.
  useDocumentMeta(
    post ? post.meta_title || `${post.title} | Lubist` : undefined,
    post ? post.meta_description || post.excerpt || undefined : undefined,
  );

  const notFound = isError && (error?.status === 404 || error?.originalStatus === 404);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <div role="status" aria-label="Loading article" className="mx-auto max-w-3xl px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 w-full rounded bg-gray-200" />
            <div className="h-10 w-2/3 rounded bg-gray-200" />
            <div className="mt-8 aspect-[16/9] w-full rounded-xl bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-4/5 rounded bg-gray-200" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl text-neutral-black">
            {notFound ? 'This article has moved or was removed' : 'We could not load this article'}
          </h1>
          <p className="mt-3 font-body text-neutral-gray-400">
            {notFound
              ? 'The link may be out of date. Everything we have published is on the blog index.'
              : 'Something went wrong on our side. Please try again in a moment.'}
          </p>
          <Link to="/blog" className="btn-primary mt-8 inline-block">
            Back to the blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* ---------- Breadcrumb ---------- */}
        <nav aria-label="Breadcrumb" className="mb-6 font-body text-sm text-neutral-gray-500">
          <Link to="/" className="hover:text-accent-orange">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <Link to="/blog" className="hover:text-accent-orange">
            Blog
          </Link>
        </nav>

        {/* ---------- Article header ---------- */}
        <header>
          {post.tags?.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-bg-secondary px-3 py-1 font-body text-xs font-medium uppercase tracking-wide text-accent-orange hover:bg-bg-tertiary"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* The page shell owns the single h1; the article body starts at h2. */}
          <h1 className="font-display text-3xl leading-tight text-neutral-black sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 font-body text-sm text-neutral-gray-500">
            {post.author_name && (
              <>
                <span className="text-neutral-gray-400">By {post.author_name}</span>
                <span aria-hidden="true"> · </span>
              </>
            )}
            {post.published_at && (
              <>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                <span aria-hidden="true"> · </span>
              </>
            )}
            {post.reading_minutes || 1} min read
          </p>
        </header>

        {/* ---------- Cover ---------- */}
        {/* Proportions are the image's own: `max-w-full` instead of `w-full` so a
            small cover is not blown up, and `max-h-[80vh]` so a portrait one
            cannot push the article off a phone screen. Must match
            `.article__cover` in `api/_lib/html.js`. */}
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt || ''}
            className="mx-auto mt-8 block h-auto max-h-[80vh] max-w-full rounded-xl"
          />
        )}

        {/* ---------- Body ---------- */}
        {/* Sanitised server-side on write (nh3 allowlist) — see file header. */}
        <div
          className="blog-prose mt-8"
          data-testid="blog-article-body"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* ---------- FAQ ----------
            Plain text, not HTML — safe to render directly. The SSR twin in
            api/_lib/blog.js also emits the matching FAQPage JSON-LD; that
            schema is what search engines see, since this client-side render
            is not what crawlers read. */}
        {post.faqs?.length > 0 && (
          <section className="mt-12" aria-label="Frequently asked questions">
            <h2 className="font-display text-2xl text-neutral-black">
              Frequently asked questions
            </h2>
            <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
              {post.faqs.map((faq, index) => (
                <details key={index} className="group py-4" data-testid="blog-faq-item">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body font-medium text-neutral-black">
                    {faq.question}
                    <span aria-hidden="true" className="shrink-0 text-neutral-gray-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 font-body text-sm leading-relaxed text-neutral-gray-500">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Conversion block ----------
            The blog's job is to capture informational searches and hand the
            reader on to the pages that actually earn. Every article ends here. */}
        <aside className="mt-12 rounded-xl bg-gradient-blue p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl text-neutral-black">Ready to book?</h2>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-neutral-gray-400">
            Find verified salons near you, compare real prices and book an appointment in
            under a minute.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/salons" className="btn-primary">
              Browse salons
            </Link>
            <Link to="/products" className="btn-outline">
              Shop products
            </Link>
          </div>
        </aside>
      </article>

      {/* ---------- Read next ---------- */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 bg-bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="font-display text-2xl text-neutral-black">Read next</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogPostCard key={related.id || related.slug} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
