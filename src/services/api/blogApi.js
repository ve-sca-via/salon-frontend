/**
 * Blog API - RTK Query
 *
 * Public read-only feed for the SEO blog authored in the admin panel.
 * Mirrors the backend `app/api/blog.py` public contract:
 *
 *   GET /api/v1/blog        list live posts (tag / search / pagination)
 *   GET /api/v1/blog/tags   distinct tags for the index filter bar
 *   GET /api/v1/blog/:slug  single live post + related posts
 *
 * No auth required. These hooks drive the CLIENT-SIDE render of /blog and
 * /blog/:slug — a visitor who is already inside the SPA and clicks through.
 * A visitor (or crawler) who requests those URLs directly never reaches this
 * file at all: `vercel.json` routes them to `api/render.js`, which server-
 * renders the same data into real HTML. Both paths must show the same thing,
 * so any field added here should be added there too.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './baseQuery';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['BlogPosts', 'BlogTags'],
  endpoints: (builder) => ({
    // Paginated list of published posts, newest first
    getBlogPosts: builder.query({
      query: ({ tag, search, limit = 12, offset = 0 } = {}) => ({
        url: '/api/v1/blog',
        method: 'get',
        // Undefined params are dropped by axios, so an unfiltered call sends
        // neither `tag` nor `search` rather than empty strings the API would
        // treat as a real (never-matching) filter.
        params: {
          tag: tag || undefined,
          search: search || undefined,
          limit,
          offset,
        },
      }),
      providesTags: (result) =>
        result?.posts
          ? [
              ...result.posts.map(({ id }) => ({ type: 'BlogPosts', id })),
              { type: 'BlogPosts', id: 'LIST' },
            ]
          : [{ type: 'BlogPosts', id: 'LIST' }],
      keepUnusedDataFor: 300, // 5 min — articles change rarely
    }),

    // Distinct tags across live posts (filter bar)
    getBlogTags: builder.query({
      query: () => ({
        url: '/api/v1/blog/tags',
        method: 'get',
      }),
      providesTags: [{ type: 'BlogTags', id: 'LIST' }],
      keepUnusedDataFor: 600,
    }),

    // Single published post by slug, with up to three related posts
    getBlogPost: builder.query({
      query: (slug) => ({
        url: `/api/v1/blog/${slug}`,
        method: 'get',
      }),
      providesTags: (result, error, slug) => [{ type: 'BlogPosts', id: slug }],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogTagsQuery,
  useGetBlogPostQuery,
} = blogApi;

export default blogApi;
