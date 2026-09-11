/**
 * Integration tests for the public article page (client-side render).
 *
 * The server-rendered twin is covered in api/_lib/blog.test.js. What is
 * specific to this side: the route param drives the request, the sanitised
 * body HTML is rendered as markup, and a 404 is distinguishable from a failure.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import { blogApi } from '../../services/api/blogApi';
import BlogPost from './BlogPost';

vi.mock('../../components/layout/PublicNavbar', () => ({ default: () => null }));
vi.mock('../../components/layout/Footer', () => ({ default: () => null }));

const BASE = 'http://localhost:8000/api/v1';
const SLUG = 'best-hair-spa-in-delhi';

const makePost = (overrides = {}) => ({
  id: 'p1',
  slug: SLUG,
  title: 'Best Hair Spa in Delhi',
  excerpt: 'What a hair spa costs.',
  content: '<h2>How often?</h2><p>Once a month.</p>',
  cover_image_url: 'https://res.cloudinary.com/x/blog/spa.jpg',
  cover_image_alt: 'A hair spa treatment',
  tags: ['Hair Care', 'Delhi'],
  author_name: 'Riya Sharma',
  published_at: '2026-08-01T09:00:00Z',
  reading_minutes: 6,
  related_posts: [],
  ...overrides,
});

function registerPost(post = makePost()) {
  server.use(
    http.get(`${BASE}/blog/${post.slug}`, () =>
      HttpResponse.json({ success: true, message: 'Blog post retrieved', post }),
    ),
  );
}

function renderPage(slug = SLUG) {
  const store = configureStore({
    reducer: { [blogApi.reducerPath]: blogApi.reducer },
    middleware: (getDefault) => getDefault().concat(blogApi.middleware),
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('BlogPost', () => {
  it('renders the article header from the route param', async () => {
    registerPost();
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Best Hair Spa in Delhi' })).toBeInTheDocument();
    expect(screen.getByText(/By Riya Sharma/)).toBeInTheDocument();
    expect(screen.getByText(/August 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/6 min read/)).toBeInTheDocument();
  });

  it('renders the sanitised body HTML as markup, not as text', async () => {
    registerPost();
    renderPage();

    const body = await screen.findByTestId('blog-article-body');
    // The body starts at h2 — the page shell owns the single h1.
    expect(within(body).getByRole('heading', { level: 2, name: 'How often?' })).toBeInTheDocument();
    expect(within(body).getByText('Once a month.')).toBeInTheDocument();
    expect(body.innerHTML).toContain('<h2>How often?</h2>');
  });

  it('applies the shared prose class so it matches the admin preview', async () => {
    registerPost();
    renderPage();

    expect(await screen.findByTestId('blog-article-body')).toHaveClass('blog-prose');
  });

  it('shows the cover image with its alt text', async () => {
    registerPost();
    renderPage();

    const cover = await screen.findByAltText('A hair spa treatment');
    expect(cover).toHaveAttribute('src', 'https://res.cloudinary.com/x/blog/spa.jpg');
  });

  it('links each tag back to the filtered index', async () => {
    registerPost();
    renderPage();

    expect(await screen.findByRole('link', { name: 'Hair Care' })).toHaveAttribute(
      'href',
      '/blog?tag=Hair%20Care',
    );
  });

  it('links onward to the pages that actually earn', async () => {
    registerPost();
    renderPage();

    expect(await screen.findByRole('link', { name: /browse salons/i })).toHaveAttribute('href', '/salons');
    expect(screen.getByRole('link', { name: /shop products/i })).toHaveAttribute('href', '/products');
  });

  it('renders the read-next block from related posts', async () => {
    registerPost(
      makePost({
        related_posts: [
          { id: 'p2', slug: 'keratin-vs-smoothening', title: 'Keratin vs Smoothening', tags: [], reading_minutes: 4 },
        ],
      }),
    );
    renderPage();

    expect(await screen.findByText('Read next')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Keratin vs Smoothening/ })).toHaveAttribute(
      'href',
      '/blog/keratin-vs-smoothening',
    );
  });

  it('renders FAQs as a collapsible list', async () => {
    registerPost(
      makePost({
        faqs: [
          { question: 'How often should I get a hair spa?', answer: 'Every 4-6 weeks for most hair types.' },
          { question: 'Is it safe for coloured hair?', answer: 'Yes, ask for a colour-safe product.' },
        ],
      }),
    );
    renderPage();

    expect(await screen.findByText('Frequently asked questions')).toBeInTheDocument();
    const items = screen.getAllByTestId('blog-faq-item');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('How often should I get a hair spa?').closest('summary')).toBeInTheDocument();
    expect(within(items[0]).getByText('Every 4-6 weeks for most hair types.')).toBeInTheDocument();
  });

  it('omits the FAQ section when the post has none', async () => {
    registerPost(makePost({ faqs: [] }));
    renderPage();

    await screen.findByTestId('blog-article-body');
    expect(screen.queryByText('Frequently asked questions')).not.toBeInTheDocument();
  });

  it('omits the read-next block when nothing is related', async () => {
    registerPost();
    renderPage();

    await screen.findByTestId('blog-article-body');
    expect(screen.queryByText('Read next')).not.toBeInTheDocument();
  });

  it('shows a loading state while the article is in flight', () => {
    registerPost();
    renderPage();
    expect(screen.getByRole('status', { name: /loading article/i })).toBeInTheDocument();
  });

  it('tells the reader a 404 is a dead link, not an outage', async () => {
    server.use(
      http.get(`${BASE}/blog/nope`, () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })),
    );
    renderPage('nope');

    expect(await screen.findByText(/moved or was removed/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the blog/i })).toHaveAttribute('href', '/blog');
  });

  it('distinguishes a backend failure from a missing article', async () => {
    server.use(
      http.get(`${BASE}/blog/${SLUG}`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
    );
    renderPage();

    expect(await screen.findByText(/could not load this article/i)).toBeInTheDocument();
    expect(screen.queryByText(/moved or was removed/i)).not.toBeInTheDocument();
  });

  it('prefers meta_title for the browser tab when the author set one, used verbatim', async () => {
    registerPost(makePost({ meta_title: 'Hair Spa Cost in Delhi (2026)' }));
    renderPage();

    await screen.findByTestId('blog-article-body');
    expect(document.title).toBe('Hair Spa Cost in Delhi (2026)');
  });

  it('falls back to the title when meta_title is blank', async () => {
    registerPost(makePost({ meta_title: '' }));
    renderPage();

    await screen.findByTestId('blog-article-body');
    expect(document.title).toBe('Best Hair Spa in Delhi | Lubist');
  });
});
