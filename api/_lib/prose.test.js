/**
 * Drift guard for the article stylesheet.
 *
 * Article typography exists in three places by necessity:
 *   1. salon-admin-panel/src/components/blog/prose.css   (canonical — other repo)
 *   2. src/components/blog/prose.css                     (verbatim copy, imported by the SPA)
 *   3. api/_lib/prose.js                                 (the same CSS as a string, inlined
 *                                                         into the server-rendered document)
 *
 * A server-rendered page cannot import a stylesheet from src/, hence 3. This
 * test pins 3 to 2 so they cannot silently diverge — if it fails, regenerate
 * PROSE_CSS from the CSS file rather than editing the string.
 *
 * 1 vs 2 crosses a repo boundary and cannot be asserted here; `diff` them by
 * hand when either changes. If they drift, the admin Preview tab stops being a
 * preview of the published page, which is the failure the whole arrangement
 * exists to prevent.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { PROSE_CSS } from './prose';

// Resolved from the project root rather than import.meta.url: these tests run
// in the jsdom environment, where import.meta.url is not a file:// URL.
const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/components/blog/prose.css'),
  'utf-8',
);

describe('PROSE_CSS', () => {
  it('is byte-identical to src/components/blog/prose.css', () => {
    // Line endings are the one difference allowed: git may check the .css file
    // out with CRLF on Windows while the .js string holds LF.
    const normalise = (value) => value.replace(/\r\n/g, '\n');
    expect(normalise(PROSE_CSS)).toBe(normalise(stylesheet));
  });

  it('defines the .blog-prose block the server-rendered article depends on', () => {
    // A guard against the string being emptied or truncated in a way that still
    // "matches" because both copies were broken the same way.
    expect(PROSE_CSS).toContain('.blog-prose {');
    expect(PROSE_CSS).toContain('.blog-prose h2 {');
    expect(PROSE_CSS).toContain('.blog-prose a {');
    expect(PROSE_CSS.length).toBeGreaterThan(2000);
  });
});
