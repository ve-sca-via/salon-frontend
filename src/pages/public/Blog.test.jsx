/**
 * Integration tests for the public blog index page (client-side render).
 *
 * Renders the real <Blog/> with a real store and mocks the backend at the
 * network layer (MSW). This is the SPA click-through path; the copy crawlers
 * receive is covered separately in api/_lib/blog.test.js.
 *
 * Layout chrome is stubbed: PublicNavbar pulls in cart queries and geolocation
 * that have nothing to do with the article list.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { blogApi } from '../../services/api/blogApi';
import Blog from './Blog';

vi.mock('../../components/layout/PublicNavbar', () => ({ default: () => null }));
vi.mock('../../components/layout/Footer', () => ({ default: () => null }));

const BASE = 'http://localhost:8000/api/v1';

const makePost = (overrides = {}) => ({
  id: 'p1',
  slug: 'best-hair-spa-in-delhi',
  title: 'Best Hair Spa in Delhi',
  excerpt: 'What a hair spa costs and how often to book one.',
  cover_image_url: 'https://res.cloudinary.com/x/blog/spa.jpg',
  cover_image_alt: 'A hair spa treatment',
  tags: ['Hair Care'],
  published_at: '2026-08-01T09:00:00Z',
  reading_minutes: 6,
  ...overrides,
});

/** @returns a getter for the last /blog request URL, for asserting query params. */
function registerBackend({ posts = [makePost()], total, tags = ['Hair Care', 'Skin'] } = {}) {
  let seenUrl = null;
  server.use(
    http.get(`${BASE}/blog`, ({ request }) => {
      seenUrl = new URL(request.url);
      return HttpResponse.json({
        success: true,
        posts,
        count: posts.length,
        offset: 0,
        limit: 12,
        total: total === undefined ? posts.length : total,
      });
    }),
    http.get(`${BASE}/blog/tags`, () =>
      HttpResponse.json({ success: true, tags, count: tags.length }),
    ),
  );
  return () => seenUrl;
}

function renderPage(initialEntry = '/blog') {
  // A fresh store per render keeps RTK Query's cache from leaking between tests.
  const store = configureStore({
    reducer: { [blogApi.reducerPath]: blogApi.reducer },
    middleware: (getDefault) => getDefault().concat(blogApi.middleware),
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Blog />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Blog index', () => {
  it('lists published posts with their metadata', async () => {
    registerBackend();
    renderPage();

    expect(await screen.findByText('Best Hair Spa in Delhi')).toBeInTheDocument();
    expect(screen.getByText(/What a hair spa costs/)).toBeInTheDocument();
    expect(screen.getByText(/August 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 min read/)).toBeInTheDocument();
  });

  it('links each card to the article URL', async () => {
    registerBackend();
    renderPage();

    const link = await screen.findByRole('link', { name: /Best Hair Spa in Delhi/ });
    expect(link).toHaveAttribute('href', '/blog/best-hair-spa-in-delhi');
  });

  it('shows a loading state before the request resolves', () => {
    registerBackend();
    renderPage();
    expect(screen.getByRole('status', { name: /loading articles/i })).toBeInTheDocument();
  });

  it('renders the tag filter bar from the tags endpoint', async () => {
    registerBackend();
    renderPage();

    await screen.findByText('Best Hair Spa in Delhi');
    const filters = screen.getByRole('navigation', { name: /filter articles/i });
    expect(within(filters).getByRole('button', { name: 'All topics' })).toBeInTheDocument();
    expect(within(filters).getByRole('button', { name: 'Skin' })).toBeInTheDocument();
  });

  it('reads the active tag from the URL and sends it to the backend', async () => {
    const getSeenUrl = registerBackend();
    renderPage('/blog?tag=Hair%20Care');

    await screen.findByText('Best Hair Spa in Delhi');
    await waitFor(() => expect(getSeenUrl().searchParams.get('tag')).toBe('Hair Care'));
  });

  it('refetches with the new tag when a filter is clicked', async () => {
    const getSeenUrl = registerBackend();
    renderPage();
    await screen.findByText('Best Hair Spa in Delhi');

    await userEvent.click(screen.getByRole('button', { name: 'Skin' }));

    await waitFor(() => expect(getSeenUrl().searchParams.get('tag')).toBe('Skin'));
  });

  it('translates ?page= into the backend offset', async () => {
    const getSeenUrl = registerBackend({ total: 40 });
    renderPage('/blog?page=2');

    await screen.findByText('Best Hair Spa in Delhi');
    await waitFor(() => expect(getSeenUrl().searchParams.get('offset')).toBe('12'));
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last', async () => {
    registerBackend({ total: 20 });
    renderPage();

    await screen.findByText('Best Hair Spa in Delhi');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('hides the pager when everything fits on one page', async () => {
    registerBackend({ total: 1 });
    renderPage();

    await screen.findByText('Best Hair Spa in Delhi');
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });

  it('offers a way out of an empty filtered list', async () => {
    registerBackend({ posts: [], total: 0 });
    renderPage('/blog?tag=Nails');

    expect(await screen.findByText(/Nothing filed under "Nails" yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show all articles/i })).toBeInTheDocument();
  });

  it('points an empty blog at the salon listing rather than a dead end', async () => {
    registerBackend({ posts: [], total: 0, tags: [] });
    renderPage();

    expect(await screen.findByText(/No articles published yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse salons/i })).toHaveAttribute('href', '/salons');
  });

  it('shows a retryable error when the backend fails', async () => {
    server.use(
      http.get(`${BASE}/blog`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
      http.get(`${BASE}/blog/tags`, () => HttpResponse.json({ success: true, tags: [], count: 0 })),
    );
    renderPage();

    expect(await screen.findByText(/couldn't load the articles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('sets the document title for the browser tab', async () => {
    registerBackend();
    renderPage();

    await screen.findByText('Best Hair Spa in Delhi');
    expect(document.title).toBe('Beauty & Wellness Blog | Lubist');
  });
});
