/**
 * Normalize API error payloads for user-facing toasts.
 * Handles rate limiting (429) and technical SlowAPI detail strings.
 */

const RATE_LIMIT_DETAIL_PATTERN =
  /too many requests|rate.?limit|rate_limit_exceeded|\d+\s+per\s+\d+/i;

const DEFAULT_RATE_LIMIT_MESSAGE =
  'Too many requests. Please wait a moment and try again.';

/**
 * Field-level detail from the backend's 422 handler, whose top-level `message`
 * is always the generic "Validation failed":
 *   { message, errors: [{ field: "body.name", message: "..." }], ... }
 * ErrorResponse also allows a plain string list, so both shapes are read here.
 * Returns '' when there is nothing usable, so callers keep their own fallback.
 */
function formatFieldErrors(errors) {
  if (!Array.isArray(errors)) return '';
  return errors
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && typeof entry.message === 'string') {
        // "body.name" / "body.0.price" -> "name" / "price": the wrapper and any
        // array index are noise to the person reading the toast.
        const field = String(entry.field || '')
          .split('.')
          .filter((part) => part && part !== 'body' && !/^\d+$/.test(part))
          .pop();
        return field ? `${field}: ${entry.message.trim()}` : entry.message.trim();
      }
      return '';
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * @param {unknown} error - RTK Query / axios error shape
 * @param {string} fallback - Message when nothing usable is found
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const status = error.status ?? error.response?.status;
  const data = error.data ?? error.response?.data;

  if (status === 429 || data?.error === 'rate_limit_exceeded') {
    return data?.message || data?.detail || DEFAULT_RATE_LIMIT_MESSAGE;
  }

  if (typeof data === 'string') {
    if (RATE_LIMIT_DETAIL_PATTERN.test(data)) {
      return DEFAULT_RATE_LIMIT_MESSAGE;
    }
    return data;
  }

  if (data && typeof data === 'object') {
    const detail = data.detail;
    const message = data.message;

    // Prefer the per-field breakdown: a 422's top-level message is generic.
    const fieldErrors = formatFieldErrors(data.errors);
    if (fieldErrors) return fieldErrors;

    if (typeof message === 'string' && message.trim()) {
      if (RATE_LIMIT_DETAIL_PATTERN.test(message) && !data.error) {
        return DEFAULT_RATE_LIMIT_MESSAGE;
      }
      return message;
    }

    if (typeof detail === 'string' && detail.trim()) {
      if (RATE_LIMIT_DETAIL_PATTERN.test(detail)) {
        return DEFAULT_RATE_LIMIT_MESSAGE;
      }
      return detail;
    }
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    if (RATE_LIMIT_DETAIL_PATTERN.test(error.message)) {
      return DEFAULT_RATE_LIMIT_MESSAGE;
    }
    return error.message;
  }

  return fallback;
}
