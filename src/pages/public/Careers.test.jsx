/**
 * Integration tests for the public Careers application page.
 *
 * Renders the real <Careers/> page (with the real FileUpload component) and
 * mocks the backend at the network layer with MSW. Exercises the single
 * public endpoint this page uses against career_service:
 *   - POST /api/v1/careers/apply   (multipart submit -> success screen)
 *
 * Also covers client-side validation (no request fired) and confirms the page
 * only sends the fields the narrowed /apply contract still stores.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';

import { server } from '../../test/mswServer';
import Careers from './Careers';

// Layout chrome is irrelevant to the apply flow and pulls in router/asset noise.
vi.mock('../../components/layout/PublicNavbar', () => ({ default: () => null }));
vi.mock('../../components/layout/Footer', () => ({ default: () => null }));

const APPLY = 'http://localhost:8000/api/v1/careers/apply';

let capturedBody; // the FormData the component handed to fetch

// The handler intentionally does NOT read the request body: parsing a multipart
// body with file parts via request.formData()/text() is pathologically slow
// under msw/undici + jsdom and stalls the response. We assert what was sent by
// capturing the FormData in a fetch spy instead (fast, synchronous entries()).
function registerApply({ status = 200 } = {}) {
  server.use(
    http.post(APPLY, () => {
      if (status !== 200) {
        return HttpResponse.json({ detail: 'boom' }, { status });
      }
      return HttpResponse.json({
        id: 'app-1',
        application_number: 'CA-20260112-APP00001',
        message: 'Application submitted successfully!',
        email_sent: true,
      });
    }),
  );
}

// Wraps the (msw-patched) global fetch to record the outgoing FormData, then
// delegates so msw still intercepts. Returns a restore fn.
function captureFetchBody() {
  const real = global.fetch;
  global.fetch = vi.fn(async (url, opts) => {
    if (opts?.body instanceof FormData) capturedBody = opts.body;
    return real(url, opts);
  });
  return () => {
    global.fetch = real;
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Careers />
    </MemoryRouter>,
  );
}

function fillTextFields() {
  fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'John Applicant' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your age'), { target: { value: '28' } });
  fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), { target: { value: '9876543210' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your permanent address'), { target: { value: '1 Test Street' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your current address'), { target: { value: '2 Test Avenue' } });
  fireEvent.change(screen.getByPlaceholderText(/Tell us why/i), { target: { value: 'I would love to join.' } });
  // highest_qualification is a <select>
  fireEvent.change(screen.getByRole('combobox'), { target: { value: "Bachelor's Degree" } });
}

function uploadFile(name, filename, type) {
  const input = document.querySelector(`input[name="${name}"]`);
  const file = new File([new Uint8Array([1, 2, 3])], filename, { type });
  fireEvent.change(input, { target: { files: [file] } });
}

function attachAllDocs() {
  uploadFile('resume', 'resume.pdf', 'application/pdf');
  uploadFile('aadhaar_card', 'aadhaar.jpg', 'image/jpeg');
  uploadFile('photo', 'photo.jpg', 'image/jpeg');
}

function submitForm() {
  // Submit the form node directly so onSubmit fires deterministically across
  // the jsdom/React versions (a bare submit-button click can be flaky).
  fireEvent.submit(document.querySelector('form'));
}

beforeEach(() => {
  capturedBody = undefined;
});

describe('Careers (public apply form)', () => {
  it('submits a valid application and shows the success screen', async () => {
    registerApply();
    const restore = captureFetchBody();
    try {
      renderPage();

      fillTextFields();
      attachAllDocs();

      submitForm();

      expect(
        await screen.findByText('Application Submitted!', {}, { timeout: 5000 }),
      ).toBeInTheDocument();
      expect(screen.getByText('CA-20260112-APP00001')).toBeInTheDocument();

      // Only the narrowed-contract fields are sent.
      const entries = [...capturedBody.entries()];
      const names = entries.map(([k]) => k);
      expect(names).toEqual(
        expect.arrayContaining([
          'full_name', 'email', 'phone', 'age', 'permanent_address',
          'current_address', 'highest_qualification', 'cover_letter',
          'resume', 'aadhaar_card', 'photo',
        ]),
      );
      const fileNames = Object.fromEntries(
        entries.filter(([, v]) => v instanceof File).map(([k, v]) => [k, v.name]),
      );
      expect(fileNames).toEqual({
        resume: 'resume.pdf',
        aadhaar_card: 'aadhaar.jpg',
        photo: 'photo.jpg',
      });
      // Dropped-column fields must NOT be sent by the form.
      expect(names).not.toContain('linkedin_url');
      expect(names).not.toContain('expected_salary');
      expect(names).not.toContain('pan_card');
    } finally {
      restore();
    }
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    let posted = false;
    server.use(
      http.post(APPLY, () => {
        posted = true;
        return HttpResponse.json({ application_number: 'X' });
      }),
    );
    renderPage();

    submitForm();

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Resume is required')).toBeInTheDocument();
    expect(posted).toBe(false); // no network call on invalid form
  });

  it('validates email and phone format', async () => {
    renderPage();
    fillTextFields();
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByPlaceholderText('10-digit mobile number'), { target: { value: '123' } });
    attachAllDocs();

    submitForm();

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText(/Invalid phone number/i)).toBeInTheDocument();
  });

  it('surfaces a failure without crashing when the API errors', async () => {
    registerApply({ status: 500 });
    renderPage();
    fillTextFields();
    attachAllDocs();

    submitForm();

    // Stays on the form (no success screen); the page alerts on failure.
    await waitFor(() => expect(window.alert).toHaveBeenCalled(), { timeout: 5000 });
    expect(screen.queryByText('Application Submitted!')).not.toBeInTheDocument();
  });
});
