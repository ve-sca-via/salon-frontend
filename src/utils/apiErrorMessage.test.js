/**
 * Unit tests for the shared API error formatter.
 *
 * The backend's 422 handler (app/core/handlers.py) always sets the top-level
 * message to "Validation failed" and puts the useful part in `errors`, so the
 * field breakdown has to win over the generic message.
 */
import { describe, it, expect } from 'vitest';

import { getApiErrorMessage } from './apiErrorMessage';

describe('getApiErrorMessage', () => {
  it('prefers the field breakdown of a 422 over the generic message', () => {
    const message = getApiErrorMessage({
      status: 422,
      data: {
        success: false,
        message: 'Validation failed',
        error_code: 'VALIDATION_ERROR',
        errors: [{ field: 'body.name', message: 'String should have at least 2 characters' }],
      },
    });
    expect(message).toBe('name: String should have at least 2 characters');
  });

  it('joins multiple field errors and drops array indexes from the path', () => {
    const message = getApiErrorMessage({
      status: 422,
      data: {
        message: 'Validation failed',
        errors: [
          { field: 'body.0.price', message: 'Input should be greater than or equal to 0' },
          { field: 'body.1.duration_minutes', message: 'Input should be greater than 0' },
        ],
      },
    });
    expect(message).toBe(
      'price: Input should be greater than or equal to 0; duration_minutes: Input should be greater than 0'
    );
  });

  it('accepts a plain string error list', () => {
    const message = getApiErrorMessage({
      status: 400,
      data: { message: 'Bad request', errors: ['Salon is not approved yet'] },
    });
    expect(message).toBe('Salon is not approved yet');
  });

  it('falls back to the message when errors carry nothing usable', () => {
    expect(
      getApiErrorMessage({ status: 400, data: { message: 'Bad request', errors: [] } })
    ).toBe('Bad request');
    expect(
      getApiErrorMessage({ status: 400, data: { message: 'Bad request', errors: [{}] } })
    ).toBe('Bad request');
  });

  it('still returns detail strings and the fallback', () => {
    expect(getApiErrorMessage({ status: 400, data: { detail: 'A category is required' } })).toBe(
      'A category is required'
    );
    expect(getApiErrorMessage(null, 'Nope')).toBe('Nope');
  });

  it('keeps rate limiting ahead of field errors', () => {
    expect(
      getApiErrorMessage({
        status: 429,
        data: { errors: [{ field: 'body.name', message: 'whatever' }] },
      })
    ).toBe('Too many requests. Please wait a moment and try again.');
  });
});
