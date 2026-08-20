/**
 * Backend fetch helper for the server-rendering functions.
 *
 * Deliberately tiny: these functions run on every uncached crawler hit, so they
 * pull nothing from node_modules. Node 18+ on Vercel ships a global fetch.
 *
 * The distinction between "not found" and "backend broken" matters here and is
 * the whole reason this returns a shaped result instead of throwing: a missing
 * slug must answer 404 (tells a crawler to drop the URL) while an unreachable
 * API must answer 503 (tells it to come back), and the two must never be
 * confused or we permanently de-index real articles during an outage.
 */

const { BACKEND_URL, API_PREFIX } = require('./config');

// A crawler will wait, but Vercel's function timeout will not. Fail fast enough
// to render a 503 rather than being killed mid-response.
const TIMEOUT_MS = 8000;

/**
 * GET a JSON endpoint on the backend.
 *
 * @param {string} path  Path below the API prefix, e.g. "/blog/some-slug"
 * @param {Record<string, string|number|undefined>} [params]
 * @returns {Promise<{ok: true, data: object} | {ok: false, status: number, notFound: boolean}>}
 */
async function fetchJson(path, params = {}) {
  const url = new URL(`${BACKEND_URL}${API_PREFIX}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, status: response.status, notFound: response.status === 404 };
    }

    return { ok: true, data: await response.json() };
  } catch (err) {
    // Network failure, DNS, or the abort above. Never a 404 — the backend never
    // answered at all, so the URL's existence is unknown.
    console.error(`[ssr] backend request failed: ${path}`, err && err.message);
    return { ok: false, status: 503, notFound: false };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchJson, TIMEOUT_MS };
