/**
 * blog.js - server-rendered /blog and /blog/:slug.
 *
 * This is the copy of the blog that search engines, Bing, and WhatsApp /
 * LinkedIn / X link unfurlers actually see. The React pages in
 * src/pages/public/Blog(.Post).jsx render the same data for a visitor who is
 * already inside the SPA; the two must show the same fields, so changes here
 * and there travel together.
 *
 * Each renderer returns a shaped result rather than writing to the response, so
 * the dispatcher owns status codes and cache headers in one place and these
 * functions stay directly testable.
 */

const { fetchJson } = require('./http');
const { CACHE } = require('./config');
const { PROSE_CSS } = require('./prose');
const {
  escapeHtml,
  stripHtml,
  truncate,
  absoluteUrl,
  publisher,
  renderDocument,
  renderNotice,
} = require('./html');

// Must match POSTS_PER_PAGE in src/pages/public/Blog.jsx, or ?page=2 would show
// a different slice depending on which renderer answered.
const POSTS_PER_PAGE = 12;

const META_DESCRIPTION_LIMIT = 160;

const INDEX_TITLE = 'Beauty & Wellness Blog | Lubist';
const INDEX_DESCRIPTION =
  'Hair, skin, makeup and salon-care guides from the Lubist team — what treatments cost, how often to book them, and how to choose a salon you can trust.';

// ---------------------------------------------------------------------------
// SHARED FRAGMENTS
// ---------------------------------------------------------------------------

const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  // Fixed to UTC so the same post never shows two different dates depending on
  // which region's edge node rendered it.
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

/** Build "/blog?tag=x&page=2", omitting defaults so page 1 has one URL, not two. */
const indexPath = (tag, page) => {
  const params = new URLSearchParams();
  if (tag) params.set('tag', tag);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
};

/** Listing card — the SSR twin of src/components/blog/BlogPostCard.jsx. */
const postCard = (post) => {
  const cover = post.cover_image_url
    ? `<img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.cover_image_alt || '')}" loading="lazy" width="640" height="360" />`
    : '';
  const tag = post.tags && post.tags.length ? `<p class="card__tag">${escapeHtml(post.tags[0])}</p>` : '';
  const excerpt = post.excerpt ? `<p class="card__excerpt">${escapeHtml(post.excerpt)}</p>` : '';
  const date = formatDate(post.published_at);
  const meta = [
    date ? `<time datetime="${escapeHtml(post.published_at)}">${escapeHtml(date)}</time>` : '',
    `${post.reading_minutes || 1} min read`,
  ]
    .filter(Boolean)
    .join(' &middot; ');

  return `
<article class="card">
  <a href="/blog/${escapeHtml(post.slug)}">
    <div class="card__media">${cover}</div>
    <div class="card__body">
      ${tag}
      <h2 class="card__title">${escapeHtml(post.title)}</h2>
      ${excerpt}
      <p class="card__meta">${meta}</p>
    </div>
  </a>
</article>`;
};

// ---------------------------------------------------------------------------
// INDEX  —  /blog
// ---------------------------------------------------------------------------

async function renderBlogIndex({ tag = '', page = 1 } = {}) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const listResult = await fetchJson('/blog', {
    tag: tag || undefined,
    limit: POSTS_PER_PAGE,
    offset,
  });

  if (!listResult.ok) {
    return {
      status: 503,
      cacheControl: CACHE.error,
      html: renderNotice({
        title: 'Blog temporarily unavailable | Lubist',
        heading: 'The blog is taking a moment',
        message:
          'We could not load the articles just now. Please refresh in a minute — nothing has been removed.',
        ctaHref: '/salons',
        ctaLabel: 'Browse salons instead',
        canonicalPath: '/blog',
      }),
    };
  }

  // The filter bar is a nicety; a failure here must not cost us the article
  // list, which is the part that has to be indexed.
  const tagResult = await fetchJson('/blog/tags');
  const allTags = tagResult.ok ? tagResult.data.tags || [] : [];

  const posts = listResult.data.posts || [];
  const total = listResult.data.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const title = tag
    ? `${tag} Articles | Lubist Blog`
    : currentPage > 1
      ? `${INDEX_TITLE} — Page ${currentPage}`
      : INDEX_TITLE;

  const description = tag
    ? truncate(
        `Guides and advice on ${tag} from the Lubist team — treatment costs, how often to book, and how to pick the right salon.`,
        META_DESCRIPTION_LIMIT,
      )
    : truncate(INDEX_DESCRIPTION, META_DESCRIPTION_LIMIT);

  // rel=prev/next tells a crawler the pages are one sequence rather than a set
  // of near-duplicate lists.
  const headExtra = [
    currentPage > 1
      ? `<link rel="prev" href="${escapeHtml(absoluteUrl(indexPath(tag, currentPage - 1)))}" />`
      : '',
    currentPage < totalPages
      ? `<link rel="next" href="${escapeHtml(absoluteUrl(indexPath(tag, currentPage + 1)))}" />`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const chips = allTags.length
    ? `<nav class="chips" aria-label="Filter articles by topic">
  <a class="chip" href="/blog"${!tag ? ' aria-current="page"' : ''}>All topics</a>
  ${allTags
    .map(
      (t) =>
        `<a class="chip" href="${escapeHtml(indexPath(t, 1))}"${t === tag ? ' aria-current="page"' : ''}>${escapeHtml(t)}</a>`,
    )
    .join('\n  ')}
</nav>`
    : '';

  const grid = posts.length
    ? `<div class="grid">${posts.map(postCard).join('')}</div>`
    : `<div class="notice">
  <h2>${escapeHtml(tag ? `Nothing filed under "${tag}" yet` : 'No articles published yet')}</h2>
  <p>New guides are on the way. In the meantime, browse the salons near you.</p>
  <a class="btn btn--primary" href="/salons">Browse salons</a>
</div>`;

  const pager =
    totalPages > 1
      ? `<nav class="pager" aria-label="Blog pagination">
  ${currentPage > 1 ? `<a href="${escapeHtml(indexPath(tag, currentPage - 1))}" rel="prev">Previous</a>` : ''}
  <span>Page ${currentPage} of ${totalPages}</span>
  ${currentPage < totalPages ? `<a href="${escapeHtml(indexPath(tag, currentPage + 1))}" rel="next">Next</a>` : ''}
</nav>`
      : '';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Lubist Blog',
      description: INDEX_DESCRIPTION,
      url: absoluteUrl(indexPath(tag, currentPage)),
      publisher: publisher(),
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
        datePublished: post.published_at || undefined,
        image: post.cover_image_url || undefined,
      })),
    },
  ];

  return {
    status: 200,
    cacheControl: CACHE.index,
    html: renderDocument({
      title,
      description,
      canonicalPath: indexPath(tag, currentPage),
      headExtra,
      structuredData,
      bodyHtml: `
<div class="hero">
  <div class="wrap">
    <p class="eyebrow">The Lubist Journal</p>
    <h1>${escapeHtml(tag || 'Beauty & Wellness Guides')}</h1>
    <p>${escapeHtml(description)}</p>
  </div>
</div>
<main class="wrap">
  ${chips}
  ${grid}
  ${pager}
</main>`,
    }),
  };
}

// ---------------------------------------------------------------------------
// ARTICLE  —  /blog/:slug
// ---------------------------------------------------------------------------

async function renderBlogPost({ slug }) {
  if (!slug) {
    return notFoundResult();
  }

  const result = await fetchJson(`/blog/${encodeURIComponent(slug)}`);

  if (!result.ok) {
    // 404 is a real answer (drafts and archived posts return it too, which is
    // intended — an unpublished slug must not be discoverable). Anything else
    // means the backend is unreachable, and telling a crawler "gone" during an
    // outage would drop pages that already rank.
    return result.notFound ? notFoundResult() : outageResult();
  }

  const post = result.data.post;
  if (!post) return notFoundResult();

  const related = post.related_posts || [];

  // Same fallback chain as the admin SERP preview and the React page: the
  // explicit SEO field, then the human-facing one, then the body text.
  const metaTitle = post.meta_title || post.title;
  const metaDescription = truncate(
    post.meta_description || post.excerpt || stripHtml(post.content),
    META_DESCRIPTION_LIMIT,
  );

  const tags = post.tags || [];
  const tagLinks = tags.length
    ? `<div class="article__tags">${tags
        .map((t) => `<a href="${escapeHtml(indexPath(t, 1))}">${escapeHtml(t)}</a>`)
        .join('')}</div>`
    : '';

  const byline = [
    post.author_name ? `By ${escapeHtml(post.author_name)}` : '',
    post.published_at
      ? `<time datetime="${escapeHtml(post.published_at)}">${escapeHtml(formatDate(post.published_at))}</time>`
      : '',
    `${post.reading_minutes || 1} min read`,
  ]
    .filter(Boolean)
    .join(' &middot; ');

  const cover = post.cover_image_url
    ? `<img class="article__cover" src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.cover_image_alt || '')}" width="1200" height="675" />`
    : '';

  const readNext = related.length
    ? `<section class="read-next">
  <div class="wrap">
    <h2>Read next</h2>
    <div class="grid">${related.map(postCard).join('')}</div>
  </div>
</section>`
    : '';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: metaDescription,
      image: post.cover_image_url ? [post.cover_image_url] : undefined,
      datePublished: post.published_at || undefined,
      dateModified: post.updated_at || post.published_at || undefined,
      author: post.author_name
        ? { '@type': 'Person', name: post.author_name }
        : { '@type': 'Organization', name: 'Lubist' },
      publisher: publisher(),
      keywords: tags.length ? tags.join(', ') : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': absoluteUrl(`/blog/${post.slug}`),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
        { '@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(`/blog/${post.slug}`) },
      ],
    },
  ];

  return {
    status: 200,
    cacheControl: CACHE.post,
    html: renderDocument({
      title: `${metaTitle} | Lubist`,
      description: metaDescription,
      canonicalPath: `/blog/${post.slug}`,
      ogType: 'article',
      imageUrl: post.cover_image_url || undefined,
      imageAlt: post.cover_image_alt || undefined,
      extraCss: PROSE_CSS,
      structuredData,
      bodyHtml: `
<main>
  <article class="wrap wrap--narrow article">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> / <a href="/blog">Blog</a>
    </nav>
    ${tagLinks}
    <h1>${escapeHtml(post.title)}</h1>
    <p class="article__meta">${byline}</p>
    ${cover}
    <div class="blog-prose">${post.content || ''}</div>
    <aside class="cta">
      <h2>Ready to book?</h2>
      <p>Find verified salons near you, compare real prices and book an appointment in under a minute.</p>
      <div class="cta__actions">
        <a class="btn btn--primary" href="/salons">Browse salons</a>
        <a class="btn btn--outline" href="/products">Shop products</a>
      </div>
    </aside>
  </article>
  ${readNext}
</main>`,
    }),
  };
}

// The article body above is the ONE value in this file not passed through
// escapeHtml: it is stored HTML, sanitised against a tag allowlist by
// blog_service._sanitize_html (nh3) before it ever reaches the database. That
// server-side sanitisation is what makes this safe — do not route any other
// HTML through this template.

function notFoundResult() {
  return {
    status: 404,
    cacheControl: CACHE.notFound,
    html: renderNotice({
      title: 'Article not found | Lubist',
      heading: 'This article has moved or was removed',
      message:
        'The link may be out of date. Everything we have published is on the blog index.',
      ctaHref: '/blog',
      ctaLabel: 'Back to the blog',
      canonicalPath: '/blog',
    }),
  };
}

function outageResult() {
  return {
    status: 503,
    cacheControl: CACHE.error,
    html: renderNotice({
      title: 'Article temporarily unavailable | Lubist',
      heading: 'This article is taking a moment',
      message:
        'We could not load it just now. Please refresh in a minute — it has not been removed.',
      ctaHref: '/blog',
      ctaLabel: 'Back to the blog',
      canonicalPath: '/blog',
    }),
  };
}

module.exports = {
  renderBlogIndex,
  renderBlogPost,
  POSTS_PER_PAGE,
  indexPath,
  postCard,
  formatDate,
};
