/**
 * html.js - the generic server-rendering layer.
 *
 * Everything here is page-agnostic on purpose. The blog is the first thing to
 * be server-rendered, but /salons/:id and /products/:slug have the identical
 * problem (a Vite SPA returns an empty <div id="root"> to every crawler) and
 * are the pages that actually earn. When they are added they should need only a
 * new `api/_lib/<thing>.js` that assembles a body and calls `renderDocument` —
 * no changes in this file and none in `api/render.js` beyond a route entry.
 *
 * So: nothing blog-specific below this line.
 */

const { SITE_URL } = require('./config');

// ---------------------------------------------------------------------------
// ESCAPING
// ---------------------------------------------------------------------------

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value for interpolation into markup or an attribute.
 *
 * Every dynamic value in this renderer goes through here EXCEPT article bodies,
 * which are already sanitised against a tag allowlist server-side (nh3, see
 * blog_service._sanitize_html) and must keep their markup to render at all.
 * That single exception is the reason the backend sanitises on write rather
 * than trusting the editor.
 */
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
};

/**
 * Serialise structured data for a <script type="application/ld+json"> block.
 *
 * The `<` escape is what stops a "</script>" sequence inside any string field
 * from closing the tag early; JSON parsers read < identically.
 */
const jsonLdScript = (data) => {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return `<script type="application/ld+json">${json}</script>`;
};

/** Strip tags and collapse whitespace — for meta descriptions built from body copy. */
const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Truncate on a word boundary, with an ellipsis, for meta-length limits. */
const truncate = (text, limit) => {
  const value = String(text || '').trim();
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

/** Absolute URL for a site-relative path — canonical tags and og:url need one. */
const absoluteUrl = (path) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

// ---------------------------------------------------------------------------
// PAGE CHROME
// ---------------------------------------------------------------------------

// Nav shown on every server-rendered page. These are plain <a> links, so
// following one leaves the static document and loads the SPA — which is exactly
// what should happen: only the blog is server-rendered today.
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/salons', label: 'Browse Salons' },
  { href: '/products', label: 'Products' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

const FOOTER_LINKS = [
  { href: '/salons', label: 'Browse Salons' },
  { href: '/blog', label: 'Blog' },
  { href: '/partner-with-us', label: 'Partner With Us' },
  { href: '/faq', label: 'FAQs' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

/**
 * Layout CSS for the server-rendered shell.
 *
 * Hand-written rather than generated because these documents never load the
 * Tailwind bundle. Values are taken from the SPA's design tokens (index.css)
 * so a reader cannot tell which renderer served the page. Article typography is
 * NOT defined here — that comes from PROSE_CSS, the shared stylesheet.
 */
const SHELL_CSS = `
*,*::before,*::after{box-sizing:border-box}
body,h1,h2,h3,h4,p,ul,ol,li,figure,blockquote{margin:0;padding:0}
ul,ol{list-style:none}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
body{background:#fff;color:#111827;font-family:"DM Sans",system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:"Marcellus",Georgia,serif;font-weight:400;color:#111827}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.wrap--narrow{max-width:760px}

/* Header */
.site-header{position:sticky;top:0;z-index:20;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.site-header .wrap{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:12px;padding-bottom:12px}
.site-header img{height:42px;width:auto}
.site-nav{display:flex;gap:20px;flex-wrap:wrap}
.site-nav a{font-size:.9375rem;color:#374151}
.site-nav a:hover{color:#b26e02}
@media(max-width:640px){.site-nav{display:none}}

/* Hero */
.hero{background:linear-gradient(180deg,#F5F8FE 0%,#CEE0F6 100%);padding:56px 0;text-align:center}
.hero .eyebrow{font-size:.8125rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#f89c02}
.hero h1{font-size:2.5rem;line-height:1.15;margin:12px 0 0}
.hero p{max-width:640px;margin:16px auto 0;color:#555;font-size:1rem}

/* Cards */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;padding:48px 0}
.card{display:flex;flex-direction:column;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;transition:box-shadow .2s}
.card:hover{box-shadow:0 10px 15px rgba(0,0,0,.1)}
.card__media{aspect-ratio:16/9;background:linear-gradient(180deg,#F5F8FE 0%,#CEE0F6 100%);overflow:hidden}
.card__media img{width:100%;height:100%;object-fit:cover}
.card__body{padding:20px;display:flex;flex-direction:column;flex:1}
.card__tag{font-size:.75rem;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:#f89c02;margin-bottom:8px}
.card__title{font-size:1.25rem;line-height:1.3;margin-bottom:8px}
.card__excerpt{font-size:.9375rem;color:#555;flex:1}
.card__meta{margin-top:16px;font-size:.75rem;color:#6b7280}

/* Filters + pagination */
.chips{display:flex;flex-wrap:wrap;gap:8px;padding-top:40px}
.chip{border:1px solid #d1d5db;border-radius:9999px;padding:6px 16px;font-size:.875rem;color:#555}
.chip:hover{border-color:#111827;color:#111827}
.chip[aria-current="page"]{background:#111827;border-color:#111827;color:#fff}
.pager{display:flex;justify-content:center;align-items:center;gap:16px;padding-bottom:56px;font-size:.875rem;color:#6b7280}
.pager a{border:1px solid #d1d5db;border-radius:8px;padding:8px 16px;color:#111827}
.pager a:hover{border-color:#111827}

/* Article */
.article{padding:40px 0 24px}
.breadcrumb{font-size:.875rem;color:#6b7280;margin-bottom:24px}
.breadcrumb a:hover{color:#b26e02}
.article__tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.article__tags a{background:#F5F8FE;border-radius:9999px;padding:4px 12px;font-size:.75rem;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:#b26e02}
.article h1{font-size:2.25rem;line-height:1.2}
.article__meta{margin-top:16px;font-size:.875rem;color:#6b7280}
.article__cover{margin-top:32px;border-radius:12px;width:100%}
.article .blog-prose{margin-top:32px}

/* Conversion block + read-next */
.cta{margin:48px 0;padding:32px 24px;border-radius:12px;text-align:center;background:linear-gradient(180deg,#F5F8FE 0%,#CEE0F6 100%)}
.cta h2{font-size:1.5rem}
.cta p{max-width:440px;margin:8px auto 0;font-size:.9375rem;color:#555}
.cta__actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:24px}
.btn{border-radius:8px;padding:10px 20px;font-weight:500;font-size:.9375rem}
.btn--primary{background:#f89c02;color:#fff}
.btn--outline{border:2px solid #111827;color:#111827}
.read-next{border-top:1px solid #e5e7eb;background:#F5F8FE;padding:8px 0 40px}
.read-next h2{font-size:1.5rem;padding-top:40px}
.read-next .grid{padding:24px 0 0}

/* Empty / error states */
.notice{padding:80px 20px;text-align:center}
.notice h1{font-size:1.875rem}
.notice p{margin:12px 0 0;color:#555}
.notice .btn{display:inline-block;margin-top:28px}

/* Footer */
.site-footer{background:#111827;color:#9ca3af;padding:40px 0;font-size:.875rem}
.site-footer .wrap{display:flex;flex-wrap:wrap;gap:16px 24px;justify-content:space-between;align-items:center}
.site-footer nav{display:flex;flex-wrap:wrap;gap:16px}
.site-footer a:hover{color:#fff}

@media(max-width:640px){
  .hero{padding:40px 0}
  .hero h1{font-size:2rem}
  .article h1{font-size:1.75rem}
}
`;

const siteHeader = () => `
<header class="site-header">
  <div class="wrap">
    <a href="/" aria-label="Lubist home"><img src="/logo/lubist_logo_2.svg" alt="Lubist" width="150" height="42" /></a>
    <nav class="site-nav" aria-label="Primary">
      ${NAV_LINKS.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join('')}
    </nav>
  </div>
</header>`;

const siteFooter = () => `
<footer class="site-footer">
  <div class="wrap">
    <p>&copy; ${new Date().getFullYear()} Lubist. All rights reserved.</p>
    <nav aria-label="Footer">
      ${FOOTER_LINKS.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join('')}
    </nav>
  </div>
</footer>`;

/** Publisher block reused by every JSON-LD graph on the site. */
const publisher = () => ({
  '@type': 'Organization',
  name: 'Lubist',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/logo/lubist_logo_2.svg'),
  },
});

// ---------------------------------------------------------------------------
// DOCUMENT
// ---------------------------------------------------------------------------

/**
 * Assemble a complete, standalone HTML document.
 *
 * "Complete" is the point of the whole exercise: title, description, canonical,
 * Open Graph, Twitter card and structured data are all in the source, and so is
 * the page copy. Nothing here depends on JavaScript running.
 *
 * @param {object} options
 * @param {string} options.title           <title> and og:title
 * @param {string} options.description     meta description / og:description
 * @param {string} options.canonicalPath   site-relative path, e.g. "/blog/x"
 * @param {string} [options.bodyHtml]      the page content (already escaped/sanitised)
 * @param {string} [options.extraCss]      page-specific stylesheet (e.g. PROSE_CSS)
 * @param {string} [options.ogType]        "website" (default) or "article"
 * @param {string} [options.imageUrl]      absolute og:image URL
 * @param {string} [options.imageAlt]      og:image:alt
 * @param {object[]} [options.structuredData] JSON-LD objects
 * @param {string} [options.robots]        e.g. "noindex, follow" for error pages
 * @param {string} [options.headExtra]     raw markup appended to <head> (rel=prev/next)
 */
function renderDocument({
  title,
  description,
  canonicalPath,
  bodyHtml = '',
  extraCss = '',
  ogType = 'website',
  imageUrl,
  imageAlt,
  structuredData = [],
  robots,
  headExtra = '',
}) {
  const canonical = absoluteUrl(canonicalPath);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
${robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : '<meta name="robots" content="index, follow" />'}
<link rel="icon" type="image/svg+xml" href="/vite.svg" />

<meta property="og:site_name" content="Lubist" />
<meta property="og:type" content="${escapeHtml(ogType)}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ''}
${imageUrl && imageAlt ? `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />` : ''}

<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ''}

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&family=DM+Sans:wght@400;500;600;700&display=swap" />
<style>${SHELL_CSS}${extraCss}</style>
${structuredData.filter(Boolean).map(jsonLdScript).join('\n')}
${headExtra}
</head>
<body>
${siteHeader()}
${bodyHtml}
${siteFooter()}
</body>
</html>`;
}

/** A styled message page — used for 404s and backend outages alike. */
function renderNotice({ title, heading, message, ctaHref, ctaLabel, canonicalPath, robots }) {
  return renderDocument({
    title,
    description: message,
    canonicalPath,
    robots: robots || 'noindex, follow',
    bodyHtml: `
<main class="wrap wrap--narrow">
  <div class="notice">
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(message)}</p>
    <a class="btn btn--primary" href="${escapeHtml(ctaHref)}">${escapeHtml(ctaLabel)}</a>
  </div>
</main>`,
  });
}

module.exports = {
  escapeHtml,
  jsonLdScript,
  stripHtml,
  truncate,
  absoluteUrl,
  publisher,
  renderDocument,
  renderNotice,
  siteHeader,
  siteFooter,
  SHELL_CSS,
  NAV_LINKS,
  FOOTER_LINKS,
};
