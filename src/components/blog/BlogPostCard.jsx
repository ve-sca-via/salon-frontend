/**
 * BlogPostCard.jsx - Listing card for a single blog post
 *
 * Shared by the blog index grid and the "Read next" block at the foot of an
 * article, so a post looks the same wherever it is listed.
 *
 * The equivalent markup for crawlers lives in `api/_lib/blog.js` (`postCard`).
 * Keep the two showing the same fields.
 */

import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const BlogPostCard = ({ post }) => {
  if (!post) return null;

  const {
    slug,
    title,
    excerpt,
    cover_image_url: coverImageUrl,
    cover_image_alt: coverImageAlt,
    tags = [],
    published_at: publishedAt,
    reading_minutes: readingMinutes,
  } = post;

  return (
    <article className="group h-full">
      <Link
        to={`/blog/${slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
      >
        {/* Cover */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-bg-secondary">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              // Alt is required by the API whenever a cover is set, so an empty
              // string here means "decorative" rather than "we forgot".
              alt={coverImageAlt || ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-blue">
              <img
                src="/logo/lubist_logo_2.svg"
                alt=""
                aria-hidden="true"
                className="h-8 w-auto opacity-40"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          {tags.length > 0 && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent-orange">
              {tags[0]}
            </p>
          )}

          <h3 className="font-display text-xl leading-snug text-neutral-black transition-colors group-hover:text-accent-orange">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 line-clamp-3 flex-1 font-body text-sm leading-relaxed text-neutral-gray-400">
              {excerpt}
            </p>
          )}

          <p className="mt-4 font-body text-xs text-neutral-gray-500">
            {publishedAt && (
              <>
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
                <span aria-hidden="true"> · </span>
              </>
            )}
            {readingMinutes || 1} min read
          </p>
        </div>
      </Link>
    </article>
  );
};

export default BlogPostCard;
