/**
 * Tests for the server-rendered blog pages.
 *
 * These render against a mocked backend (MSW) and assert on the HTML string,
 * because the HTML string is the product: it is literally what a crawler that
 * runs no JavaScript receives. Anything asserted here is something that would
 * otherwise only be caught by curling production.
 *
 * The load-bearing case is `renderBlogPost` on a backend outage: it must answer
 * 503, never 404. A 404 tells a crawler the URL is gone, so confusing the two
 * would de-index live articles during any API blip — and that mistake is
 * invisible in a browser, where both look like an error page.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '../../src/test/mswServer';
import { renderBlogIndex, renderBlogPost, indexPath, POSTS_PER_PAGE } from './blog';

const BASE = 'http://localhost:8000/api/v1';

const makePost = (overrides = {}) => ({
  id: 'p1',
  slug: 'best-hair-spa-in-delhi',
  title: 'Best Hair Spa in Delhi',
  excerpt: 'What a hair spa costs and how often you should book one.',
  cover_image_url: 'https://res.cloudinary.com/x/blog/spa.jpg',
  cover_image_alt: 'A hair spa treatment in progress',
  tags: ['Hair Care', 'Delhi'],
  author_name: 'Riya Sharma',
  published_at: '2026-08-01T09:00:00Z',
  updated_at: '2026-08-05T09:00:00Z',
  reading_minutes: 6,
  ...overrides,
});

/** Register the list + tags endpoints the index page calls. */
function registerIndex({ posts = [makePost()], total, tags = ['Hair Care', 'Skin'] } = {}) {
  let seenUrl = null;
  server.use(
    http.get(`${BASE}/blog`, ({ request }) => {
      seenUrl = new URL(request.url);
      return HttpResponse.json({
        success: true,
        posts,
        count: posts.length,
        offset: 0,
        limit: POSTS_PER_PAGE,
        total: total === undefined ? posts.length : total,
      });
    }),
    http.get(`${BASE}/blog/tags`, () =>
      HttpResponse.json({ success: true, tags, count: tags.length }),
    ),
  );
  return () => seenUrl;
}

function registerPost(post = makePost(), related = []) {
  server.use(
    http.get(`${BASE}/blog/${post.slug}`, () =>
      HttpResponse.json({
        success: true,
        message: 'Blog post retrieved',
        post: { ...post, content: post.content ?? '<h2>Why</h2><p>Because.</p>', related_posts: related },
      }),
    ),
  );
}

// =====================================================================
// indexPath
// =====================================================================
describe('indexPath', () => {
  it('gives page 1 exactly one URL, with no redundant query string', () => {
    // Two URLs for the same list is duplicate content; ?page=1 must not exist.
    expect(indexPath('', 1)).toBe('/blog');
    expect(indexPath('Hair Care', 1)).toBe('/blog?tag=Hair+Care');
  });

  it('encodes the tag and carries the page number', () => {
    expect(indexPath('Skin & Hair', 2)).toBe('/blog?tag=Skin+%26+Hair&page=2');
  });
});

// =====================================================================
// renderBlogIndex
// =====================================================================
describe('renderBlogIndex', () => {
  let getSeenUrl;
  beforeEach(() => {
    getSeenUrl = registerIndex();
  });

  it('renders the article titles into the markup, not into a JS bundle', async () => {
    const { status, html } = await renderBlogIndex({});
    expect(status).toBe(200);
    expect(html).toContain('Best Hair Spa in Delhi');
    expect(html).toContain('href="/blog/best-hair-spa-in-delhi"');
    expect(html).toContain('What a hair spa costs');
  });

  it('sets an indexable canonical on /blog', async () => {
    const { html } = await renderBlogIndex({});
    expect(html).toContain('<link rel="canonical" href="http://localhost:3000/blog" />');
    expect(html).toContain('<meta name="robots" content="index, follow" />');
  });

  it('caches at the edge so crawls do not hit the API every time', async () => {
    const { cacheControl } = await renderBlogIndex({});
    expect(cacheControl).toMatch(/s-maxage=\d+/);
  });

  it('renders the tag filter bar with the active tag marked', async () => {
    const { html } = await renderBlogIndex({ tag: 'Hair Care' });
    expect(html).toContain('href="/blog?tag=Hair+Care"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('All topics');
  });

  it('passes the tag through to the backend', async () => {
    await renderBlogIndex({ tag: 'Hair Care' });
    expect(getSeenUrl().searchParams.get('tag')).toBe('Hair Care');
  });

  it('translates ?page= into the backend offset', async () => {
    await renderBlogIndex({ page: 3 });
    expect(getSeenUrl().searchParams.get('offset')).toBe(String(POSTS_PER_PAGE * 2));
    expect(getSeenUrl().searchParams.get('limit')).toBe(String(POSTS_PER_PAGE));
  });

  it('treats a junk page number as page 1 rather than sending NaN', async () => {
    await renderBlogIndex({ page: 'banana' });
    expect(getSeenUrl().searchParams.get('offset')).toBe('0');
  });

  it('links paginated pages as a sequence with rel prev/next', async () => {
    registerIndex({ posts: [makePost()], total: 40 });
    const { html } = await renderBlogIndex({ page: 2 });
    expect(html).toContain('<link rel="prev" href="http://localhost:3000/blog" />');
    expect(html).toContain('<link rel="next" href="http://localhost:3000/blog?page=3" />');
    expect(html).toContain('Page 2 of 4');
  });

  it('omits the pager entirely when everything fits on one page', async () => {
    const { html } = await renderBlogIndex({});
    expect(html).not.toContain('class="pager"');
  });

  it('escapes a post title rather than letting stored markup into the page', async () => {
    registerIndex({ posts: [makePost({ title: '<img src=x onerror=alert(1)>' })] });
    const { html } = await renderBlogIndex({});
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('describes the collection with Blog structured data', async () => {
    const { html } = await renderBlogIndex({});
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Blog"');
    expect(html).toContain('"@type":"BlogPosting"');
  });

  it('still returns an indexable 200 when there are no posts yet', async () => {
    registerIndex({ posts: [], total: 0 });
    const { status, html } = await renderBlogIndex({});
    expect(status).toBe(200);
    expect(html).toContain('No articles published yet');
    expect(html).toContain('href="/salons"');
  });

  it('keeps the article list when only the tags endpoint fails', async () => {
    // The filter bar is a nicety; the list is the part that has to be indexed.
    server.use(
      http.get(`${BASE}/blog`, () =>
        HttpResponse.json({
          success: true,
          posts: [makePost()],
          count: 1,
          offset: 0,
          limit: POSTS_PER_PAGE,
          total: 1,
        }),
      ),
      http.get(`${BASE}/blog/tags`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
    );
    const { status, html } = await renderBlogIndex({});
    expect(status).toBe(200);
    expect(html).toContain('Best Hair Spa in Delhi');
    expect(html).not.toContain('class="chips"');
  });

  it('answers 503 and refuses to cache when the backend is down', async () => {
    server.use(http.get(`${BASE}/blog`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
    const { status, cacheControl, html } = await renderBlogIndex({});
    expect(status).toBe(503);
    expect(cacheControl).toBe('no-store');
    expect(html).toContain('noindex');
  });
});

// =====================================================================
// renderBlogPost
// =====================================================================
describe('renderBlogPost', () => {
  it('puts the article body in the markup', async () => {
    registerPost(makePost({ content: '<h2>How often?</h2><p>Once a month.</p>' }));
    const { status, html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(status).toBe(200);
    // Sanitised HTML from the editor is rendered as markup, deliberately.
    expect(html).toContain('<h2>How often?</h2>');
    expect(html).toContain('<p>Once a month.</p>');
  });

  it('renders exactly one h1 — the title — so the body can start at h2', async () => {
    registerPost(makePost({ content: '<h2>A</h2><h2>B</h2>' }));
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('<h1>Best Hair Spa in Delhi</h1>');
  });

  it('prefers the explicit SEO fields over the display ones', async () => {
    registerPost(
      makePost({
        meta_title: 'Hair Spa Cost in Delhi (2026 Guide)',
        meta_description: 'Prices, frequency and what to ask for.',
      }),
    );
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('<title>Hair Spa Cost in Delhi (2026 Guide)</title>');
    expect(html).toContain('content="Prices, frequency and what to ask for."');
  });

  it('uses an author-supplied meta_title verbatim, without appending the brand again', async () => {
    registerPost(makePost({ meta_title: 'Best Men’s Salon in Ranchi | Lubist' }));
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('<title>Best Men’s Salon in Ranchi | Lubist</title>');
    expect(html).not.toContain('Lubist | Lubist');
  });

  it('falls back title -> excerpt when the SEO fields are blank', async () => {
    registerPost(makePost({ meta_title: '', meta_description: '' }));
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('<title>Best Hair Spa in Delhi | Lubist</title>');
    expect(html).toContain('What a hair spa costs');
  });

  it('derives a description from the body when there is no excerpt either', async () => {
    registerPost(
      makePost({
        excerpt: '',
        meta_description: '',
        content: '<h2>Why</h2><p>Because your scalp needs it.</p>',
      }),
    );
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('Why Because your scalp needs it.');
  });

  it('emits the article Open Graph block link unfurlers read', async () => {
    registerPost();
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="og:image" content="https://res.cloudinary.com/x/blog/spa.jpg" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain(
      '<link rel="canonical" href="http://localhost:3000/blog/best-hair-spa-in-delhi" />',
    );
  });

  it('emits BlogPosting and BreadcrumbList structured data', async () => {
    registerPost();
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"datePublished":"2026-08-01T09:00:00Z"');
    expect(html).toContain('"dateModified":"2026-08-05T09:00:00Z"');
    expect(html).toContain('"name":"Riya Sharma"');
  });

  it('inlines the article stylesheet, since the page loads no CSS bundle', async () => {
    registerPost();
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('.blog-prose h2 {');
    expect(html).toContain('class="blog-prose"');
  });

  it('links onward to the money pages from every article', async () => {
    // Articles that do not link into /salons and /products transfer no value.
    registerPost();
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('href="/salons"');
    expect(html).toContain('href="/products"');
  });

  it('renders the read-next block from related posts', async () => {
    registerPost(makePost(), [makePost({ id: 'p2', slug: 'keratin-vs-smoothening', title: 'Keratin vs Smoothening' })]);
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('Read next');
    expect(html).toContain('href="/blog/keratin-vs-smoothening"');
  });

  it('omits the read-next block when there is nothing related', async () => {
    registerPost(makePost(), []);
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).not.toContain('Read next');
  });

  it('links each tag back to its filtered index', async () => {
    registerPost();
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('href="/blog?tag=Hair+Care"');
  });

  it('answers 404 for a slug the backend does not have', async () => {
    server.use(
      http.get(`${BASE}/blog/nope`, () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })),
    );
    const { status, html } = await renderBlogPost({ slug: 'nope' });
    expect(status).toBe(404);
    expect(html).toContain('noindex');
    expect(html).toContain('href="/blog"');
  });

  it('answers 503, NOT 404, when the backend is unreachable', async () => {
    // A 404 here would tell crawlers a live, ranking article was removed.
    server.use(
      http.get(`${BASE}/blog/best-hair-spa-in-delhi`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    );
    const { status, cacheControl } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(status).toBe(503);
    expect(cacheControl).toBe('no-store');
  });

  it('answers 404 with no request at all when the slug is missing', async () => {
    const { status } = await renderBlogPost({ slug: '' });
    expect(status).toBe(404);
  });

  it('renders FAQs as a details/summary accordion and a matching FAQPage block', async () => {
    registerPost(
      makePost({
        faqs: [
          { question: 'How often should I get a hair spa?', answer: 'Every 4-6 weeks for most hair types.' },
          { question: 'Is it safe for coloured hair?', answer: 'Yes, ask for a colour-safe product.' },
        ],
      }),
    );
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).toContain('<summary>How often should I get a hair spa?</summary>');
    expect(html).toContain('<p>Every 4-6 weeks for most hair types.</p>');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"Is it safe for coloured hair?"');
    expect(html).toContain('"@type":"Answer"');
  });

  it('omits the FAQ section and FAQPage data when there are no FAQs', async () => {
    registerPost(makePost({ faqs: [] }));
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).not.toContain('class="faq"');
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it('escapes FAQ text rather than letting stored markup into the page', async () => {
    registerPost(
      makePost({
        faqs: [{ question: '<img src=x onerror=alert(1)>', answer: 'Safe answer' }],
      }),
    );
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes a malicious title while still rendering the sanitised body', async () => {
    registerPost(
      makePost({
        title: 'Spa <script>alert(1)</script>',
        content: '<p>Body copy</p>',
      }),
    );
    const { html } = await renderBlogPost({ slug: 'best-hair-spa-in-delhi' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('<p>Body copy</p>');
  });
});
