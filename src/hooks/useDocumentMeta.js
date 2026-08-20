/**
 * useDocumentMeta - set <title> and <meta name="description"> for a route
 *
 * SCOPE: this is for the CLIENT-SIDE experience only — the browser tab and the
 * document a user sees after navigating inside the SPA. It does NOT make a page
 * indexable: crawlers receive index.html before React runs, and Bing / social
 * unfurlers never run it at all.
 *
 * Real SEO metadata for /blog and /blog/:slug is emitted by the server-render
 * function (`api/render.js`), which is what those URLs actually resolve to on a
 * fresh request. This hook just keeps the tab honest during in-app navigation.
 *
 * Restores the previous values on unmount so leaving /blog does not leave an
 * article title stuck in the tab.
 */

import { useEffect } from 'react';

const setMetaDescription = (value) => {
  if (typeof document === 'undefined') return;
  const tag = document.querySelector('meta[name="description"]');
  if (tag && typeof value === 'string') {
    tag.setAttribute('content', value);
  }
};

const getMetaDescription = () => {
  if (typeof document === 'undefined') return null;
  return document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
};

export const useDocumentMeta = (title, description) => {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousTitle = document.title;
    const previousDescription = getMetaDescription();

    if (title) document.title = title;
    if (description) setMetaDescription(description);

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) setMetaDescription(previousDescription);
    };
  }, [title, description]);
};

export default useDocumentMeta;
