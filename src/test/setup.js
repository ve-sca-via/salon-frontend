import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mswServer';

// jsdom doesn't implement these; the Careers page calls them on submit/validate.
window.scrollTo = vi.fn();
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
} else {
  Element.prototype.scrollIntoView = vi.fn();
}
// alert is used as a fallback error path in the form.
window.alert = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
