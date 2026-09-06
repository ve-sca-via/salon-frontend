/**
 * Unit tests for the generic server-rendering layer.
 *
 * These cover the parts that are easy to get subtly wrong and impossible to
 * notice by looking at a rendered page: escaping (an unescaped title is an XSS
 * hole and a broken document), JSON-LD serialisation (an unescaped "</script>"
 * silently truncates the page), and the meta block search engines read.
 */
import { describe, it, expect } from 'vitest';

import {
  escapeHtml,
  jsonLdScript,
  stripHtml,
  truncate,
  absoluteUrl,
  renderDocument,
  renderNotice,
} from './html';

describe('escapeHtml', () => {
  it('escapes every character that can break out of markup or an attribute', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    );
  });

  it('renders null and undefined as an empty string, not "null"', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('stringifies non-strings', () => {
    expect(escapeHtml(7)).toBe('7');
  });
});

describe('jsonLdScript', () => {
  it('escapes < so a closing script tag inside a field cannot end the block', () => {
    const html = jsonLdScript({ headline: 'Look </script> out' });
    expect(html).not.toContain('</script> out');
    expect(html).toContain('\\u003c/script\\u003e');
    // Exactly one closing tag: the real one.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('stays valid JSON after escaping', () => {
    const html = jsonLdScript({ '@type': 'BlogPosting', headline: 'a < b & c > d' });
    const json = html.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    expect(JSON.parse(json)).toEqual({ '@type': 'BlogPosting', headline: 'a < b & c > d' });
  });
});

describe('stripHtml', () => {
  it('reduces markup to collapsed plain text', () => {
    expect(stripHtml('<h2>Hair spa</h2>\n<p>Twice   a month.</p>')).toBe('Hair spa Twice a month.');
  });

  it('handles empty input', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });
});

describe('truncate', () => {
  it('leaves text shorter than the limit alone', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('cuts on a word boundary and appends an ellipsis', () => {
    const result = truncate('the quick brown fox jumps over the lazy dog', 20);
    expect(result).toBe('the quick brown…');
    expect(result.length).toBeLessThanOrEqual(20);
    // No dangling partial word - meta descriptions get read by humans too.
    expect(result).not.toMatch(/fo…$/);
  });

  it('falls back to a hard cut when there is no usable word boundary', () => {
    const result = truncate('supercalifragilisticexpialidocious', 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('absoluteUrl', () => {
  it('builds an absolute URL from a site-relative path', () => {
    expect(absoluteUrl('/blog/x')).toBe('http://localhost:3000/blog/x');
  });

  it('tolerates a path without a leading slash', () => {
    expect(absoluteUrl('blog/x')).toBe('http://localhost:3000/blog/x');
  });
});

describe('renderDocument', () => {
  const base = {
    title: 'Best Hair Spa in Delhi',
    description: 'What it costs and how often to book one.',
    canonicalPath: '/blog/best-hair-spa-in-delhi',
    bodyHtml: '<main><h1>Best Hair Spa in Delhi</h1></main>',
  };

  it('emits a complete document a JS-less client can read', () => {
    const html = renderDocument(base);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<title>Best Hair Spa in Delhi</title>');
    expect(html).toContain('<meta name="description" content="What it costs and how often to book one." />');
    expect(html).toContain('<h1>Best Hair Spa in Delhi</h1>');
  });

  it('sets an absolute canonical and og:url from the site origin', () => {
    const html = renderDocument(base);
    expect(html).toContain('<link rel="canonical" href="http://localhost:3000/blog/best-hair-spa-in-delhi" />');
    expect(html).toContain('<meta property="og:url" content="http://localhost:3000/blog/best-hair-spa-in-delhi" />');
  });

  it('is indexable by default', () => {
    expect(renderDocument(base)).toContain('<meta name="robots" content="index, follow" />');
  });

  it('honours an explicit robots directive', () => {
    expect(renderDocument({ ...base, robots: 'noindex, follow' })).toContain(
      '<meta name="robots" content="noindex, follow" />',
    );
  });

  it('falls back to the sitewide default OG image when a page has none of its own', () => {
    const html = renderDocument(base);
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta property="og:image" content="http://localhost:3000/og-default.png" />');
    expect(html).toContain('<meta property="og:image:alt" content="Lubist - Beauty. Booking. Simplified." />');
  });

  it('uses a page-specific image over the default when provided', () => {
    const withImage = renderDocument({
      ...base,
      imageUrl: 'https://res.cloudinary.com/x/blog/a.jpg',
      imageAlt: 'A hair spa treatment',
    });
    expect(withImage).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(withImage).toContain('<meta property="og:image" content="https://res.cloudinary.com/x/blog/a.jpg" />');
    expect(withImage).toContain('<meta property="og:image:alt" content="A hair spa treatment" />');
  });

  it('escapes the title and description rather than trusting them', () => {
    const html = renderDocument({
      ...base,
      title: 'Hair "spa" <b>tips</b>',
      description: 'Costs & more',
    });
    expect(html).toContain('<title>Hair &quot;spa&quot; &lt;b&gt;tips&lt;/b&gt;</title>');
    expect(html).toContain('content="Costs &amp; more"');
  });

  it('inlines page-specific CSS alongside the shell styles', () => {
    const html = renderDocument({ ...base, extraCss: '.blog-prose{color:red}' });
    expect(html).toContain('.blog-prose{color:red}');
    expect(html).toContain('.site-header');
  });

  it('renders each structured-data block as its own ld+json script', () => {
    const html = renderDocument({
      ...base,
      structuredData: [{ '@type': 'BlogPosting' }, { '@type': 'BreadcrumbList' }],
    });
    expect(html.match(/application\/ld\+json/g)).toHaveLength(2);
  });

  it('renders shared chrome so the page is navigable without the SPA', () => {
    const html = renderDocument(base);
    expect(html).toContain('href="/salons"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('class="site-footer"');
  });
});

describe('renderNotice', () => {
  it('never lets an error or empty page into the index', () => {
    const html = renderNotice({
      title: 'Article not found | Lubist',
      heading: 'This article has moved or was removed',
      message: 'The link may be out of date.',
      ctaHref: '/blog',
      ctaLabel: 'Back to the blog',
      canonicalPath: '/blog',
    });
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
    expect(html).toContain('This article has moved or was removed');
    expect(html).toContain('href="/blog"');
  });
});
