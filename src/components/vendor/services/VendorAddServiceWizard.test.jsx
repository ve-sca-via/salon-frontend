/**
 * Integration tests for the vendor add-services wizard (batch flow).
 *
 * Renders the real 4-step wizard against an MSW-mocked backend and exercises the
 * endpoints the batch step drives:
 *   - GET    /api/v1/vendors/salon              (header salon name)
 *   - POST   /api/v1/vendors/services           (one call per added row)
 *   - PUT    /api/v1/vendors/services/{id}      (inline row edit)
 *   - DELETE /api/v1/vendors/services/{id}      (removing an added row)
 *
 * The point of the flow is that the taxonomy stays pinned: a vendor picks
 * category → subcategory once and then adds many services without leaving the
 * screen, so most assertions are about what the 2nd and 3rd POST look like.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { server } from '../../../test/mswServer';
import { vendorApi } from '../../../services/api/vendorApi';
import VendorAddServiceWizard from './VendorAddServiceWizard';
import { DRAFT_STORAGE_KEY } from './serviceWizardConstants';

const errorToasts = [];
vi.mock('../../../utils/toastConfig', () => ({
  showSuccessToast: vi.fn(),
  showInfoToast: vi.fn(),
  showErrorToast: (message) => errorToasts.push(message),
}));

const BASE = 'http://localhost:8000/api/v1/vendors';
const SALON = `${BASE}/salon`;
const SERVICES = `${BASE}/services`;

const CATEGORIES = [
  {
    id: 'cat-hair',
    name: 'Hair',
    description: 'Hair services',
    subcategories: [
      {
        id: 'sub-haircut',
        name: 'Haircut',
        description: 'Cuts',
        subcategories: [{ id: 'ss-spanish', name: 'Spanish Haircut' }],
      },
      { id: 'sub-beard', name: 'Beard Grooming', description: '', subcategories: [] },
    ],
  },
];

/** Bodies of every POST /services the wizard fired, in order. */
let createdBodies;
/** ids passed to DELETE /services/{id}. */
let deletedIds;
/** [id, body] pairs passed to PUT /services/{id}. */
let updates;

/**
 * @param failures - POST call numbers (1-based) that should fail with a 400.
 * @param resolvedSubcategoryId - what the backend reports as the resolved
 *   (deepest) taxonomy node, mimicking get-or-create of a typed name.
 */
function registerBackend({ failures = [], resolvedSubcategoryId } = {}) {
  let calls = 0;
  server.use(
    http.get(SALON, () => HttpResponse.json({ id: 'salon-1', name: 'Glow Salon' })),
    http.post(SERVICES, async ({ request }) => {
      const body = await request.json();
      calls += 1;
      createdBodies.push(body);
      if (failures.includes(calls)) {
        return HttpResponse.json({ detail: 'Category is required' }, { status: 400 });
      }
      return HttpResponse.json({
        ...body,
        id: `svc-${calls}`,
        salon_id: 'salon-1',
        subcategory_id: resolvedSubcategoryId || body.subcategory_id || null,
      });
    }),
    http.put(`${SERVICES}/:serviceId`, async ({ params, request }) => {
      const body = await request.json();
      updates.push([params.serviceId, body]);
      return HttpResponse.json({ id: params.serviceId, ...body });
    }),
    http.delete(`${SERVICES}/:serviceId`, ({ params }) => {
      deletedIds.push(params.serviceId);
      return HttpResponse.json({ message: 'deleted' });
    })
  );
}

function makeStore() {
  return configureStore({
    reducer: { [vendorApi.reducerPath]: vendorApi.reducer },
    middleware: (g) => g().concat(vendorApi.middleware),
  });
}

const onClose = vi.fn();

function renderWizard() {
  return render(
    <Provider store={makeStore()}>
      <VendorAddServiceWizard
        isOpen
        onClose={onClose}
        categories={CATEGORIES}
        categoriesLoading={false}
        initialDraft={null}
      />
    </Provider>
  );
}

const clickContinue = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

/** Walk steps 1–3 and land on the batch step. */
function goToBatchStep({ subcategory = 'Haircut', newSubcategory, subType } = {}) {
  fireEvent.click(screen.getByText('Unisex'));
  clickContinue();

  fireEvent.click(screen.getByText('Hair'));
  clickContinue();

  if (newSubcategory) {
    fireEvent.change(screen.getByPlaceholderText('New subcategory name…'), {
      target: { value: newSubcategory },
    });
  } else {
    fireEvent.click(screen.getByText(subcategory));
  }
  if (subType) fireEvent.click(screen.getByRole('button', { name: subType }));
  clickContinue();
}

/** Type a name + price into the entry form and press Add. */
function addService(name, price) {
  fireEvent.change(screen.getByLabelText('Service name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Price'), { target: { value: price } });
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
}

beforeEach(() => {
  createdBodies = [];
  deletedIds = [];
  updates = [];
  errorToasts.length = 0;
  onClose.mockClear();
  localStorage.clear();
});

describe('add-services batch step', () => {
  it('saves an added row immediately with the pinned taxonomy and shared defaults', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');

    await waitFor(() => expect(createdBodies).toHaveLength(1));
    expect(createdBodies[0]).toMatchObject({
      name: "Men's Haircut",
      price: 300,
      duration_minutes: 30,
      gender_category: 'both',
      is_active: true,
      category_id: 'cat-hair',
      subcategory_id: 'sub-haircut',
      discount_percentage: null,
    });
    // Nothing was typed, so no get-or-create names are sent.
    expect(createdBodies[0]).not.toHaveProperty('subcategory_name');
    expect(createdBodies[0]).not.toHaveProperty('sub_subcategory_name');
  });

  it('keeps the wizard open and clears the entry form so the next service can be typed', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Service name')).toHaveValue('');
    expect(screen.getByLabelText('Price')).toHaveValue(null);
    expect(screen.getByLabelText('Service name')).toHaveFocus();

    addService('Kids Haircut', '200');
    await waitFor(() => expect(createdBodies).toHaveLength(2));

    // Same context, no re-picking of category/subcategory in between.
    expect(createdBodies[1]).toMatchObject({
      name: 'Kids Haircut',
      price: 200,
      category_id: 'cat-hair',
      subcategory_id: 'sub-haircut',
    });
    expect(screen.getByText("Men's Haircut")).toBeInTheDocument();
    expect(screen.getByText('Kids Haircut')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done — 2 added' })).toBeInTheDocument();
  });

  it('applies changed duration and gender defaults to subsequent rows only', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.change(screen.getByLabelText('Duration for new services'), {
      target: { value: '60' },
    });
    fireEvent.change(screen.getByLabelText('Gender for new services'), {
      target: { value: 'male' },
    });

    addService('Hair Spa', '900');
    await waitFor(() => expect(createdBodies).toHaveLength(2));

    expect(createdBodies[0]).toMatchObject({ duration_minutes: 30, gender_category: 'both' });
    expect(createdBodies[1]).toMatchObject({ duration_minutes: 60, gender_category: 'male' });
  });

  it('sends a typed subcategory name once, then reuses the id the backend resolved', async () => {
    registerBackend({ resolvedSubcategoryId: 'sub-kids' });
    renderWizard();
    goToBatchStep({ newSubcategory: 'Kids Haircut' });

    addService('Boys Cut', '150');
    await waitFor(() => expect(createdBodies).toHaveLength(1));
    expect(createdBodies[0]).toMatchObject({
      subcategory_name: 'Kids Haircut',
      subcategory_id: null,
    });

    addService('Girls Cut', '180');
    await waitFor(() => expect(createdBodies).toHaveLength(2));
    // The typed name is not re-sent: a second get-or-create could race and
    // duplicate the catalog node.
    expect(createdBodies[1]).toMatchObject({ subcategory_id: 'sub-kids' });
    expect(createdBodies[1]).not.toHaveProperty('subcategory_name');
  });

  it('passes a chosen sub-type through as the deepest node', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep({ subcategory: 'Haircut', subType: 'Spanish Haircut' });

    addService('Spanish Fade', '450');

    await waitFor(() => expect(createdBodies).toHaveLength(1));
    expect(createdBodies[0]).toMatchObject({
      subcategory_id: 'sub-haircut',
      sub_subcategory_id: 'ss-spanish',
    });
  });

  it('marks a failed row and re-posts it on retry', async () => {
    registerBackend({ failures: [1] });
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');

    expect(await screen.findByText('Category is required')).toBeInTheDocument();
    expect(screen.getByText(/1 service failed to save/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));

    await waitFor(() => expect(createdBodies).toHaveLength(2));
    await waitFor(() =>
      expect(screen.queryByText('Category is required')).not.toBeInTheDocument()
    );
    expect(createdBodies[1]).toMatchObject({ name: "Men's Haircut", price: 300 });
  });

  it('rejects a duplicate name in the same subcategory without hitting the API', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    addService("men's haircut", '350');

    expect(errorToasts).toContain('"men\'s haircut" is already in this list');
    expect(createdBodies).toHaveLength(1);
  });

  it('validates name, price and discount before firing a request', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService('', '300');
    expect(errorToasts).toContain('Service name is required');

    // ServiceCreate.name is min_length=2 server-side; catch it before the request.
    addService('a', '122');
    expect(errorToasts).toContain('Service name must be at least 2 characters');

    addService('Beard Trim', '');
    expect(errorToasts).toContain('Price is required (use 0 for FREE services)');

    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.change(screen.getByLabelText('Discount (%)'), { target: { value: '150' } });
    addService('Beard Trim', '200');
    expect(errorToasts).toContain('Discount must be between 0 and 100');

    expect(createdBodies).toHaveLength(0);
  });

  it('rejects a too-short name on an inline edit too', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.click(await screen.findByRole('button', { name: "Edit Men's Haircut" }));
    fireEvent.change(screen.getByLabelText("Edit name for Men's Haircut"), {
      target: { value: 'a' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(errorToasts).toContain('Service name must be at least 2 characters')
    );
    expect(updates).toHaveLength(0);
  });

  it('shows the field-level reason when the backend rejects a row', async () => {
    server.use(
      http.get(SALON, () => HttpResponse.json({ id: 'salon-1', name: 'Glow Salon' })),
      http.post(SERVICES, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Validation failed',
            error_code: 'VALIDATION_ERROR',
            errors: [
              { field: 'body.name', message: 'String should have at least 2 characters' },
            ],
          },
          { status: 422 }
        )
      )
    );
    renderWizard();
    goToBatchStep();

    addService('Beard Trim', '150');

    // Not the bare "Validation failed" the 422 envelope carries at the top level.
    expect(
      await screen.findByText('name: String should have at least 2 characters')
    ).toBeInTheDocument();
  });

  it('deletes an added row from the server when it is removed', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.click(await screen.findByRole('button', { name: "Remove Men's Haircut" }));

    await waitFor(() => expect(deletedIds).toEqual(['svc-1']));
    await waitFor(() =>
      expect(screen.queryByText("Men's Haircut")).not.toBeInTheDocument()
    );
  });

  it('updates an added row in place when it is edited', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.click(await screen.findByRole('button', { name: "Edit Men's Haircut" }));
    fireEvent.change(screen.getByLabelText("Edit price for Men's Haircut"), {
      target: { value: '350' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]).toEqual(['svc-1', { name: "Men's Haircut", price: 350 }]);
    expect(await screen.findByText(/₹350/)).toBeInTheDocument();
  });

  it('switches subcategory without losing the services already added', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.click(screen.getByRole('button', { name: 'Change subcategory' }));
    fireEvent.click(await screen.findByText('Beard Grooming'));
    clickContinue();

    addService('Beard Trim', '150');
    await waitFor(() => expect(createdBodies).toHaveLength(2));

    expect(createdBodies[1]).toMatchObject({ subcategory_id: 'sub-beard' });

    // Both groups stay on screen, the one being added to first.
    const groups = screen.getAllByRole('heading', { level: 2 });
    expect(groups[0]).toHaveTextContent('Hair › Beard Grooming · 1 added');
    expect(groups[1]).toHaveTextContent('Hair › Haircut · 1 added');
    expect(screen.getByRole('button', { name: 'Done — 2 added' })).toBeInTheDocument();
  });

  it('keeps adding to the same group when the subcategory is re-picked unchanged', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    fireEvent.click(screen.getByRole('button', { name: 'Change subcategory' }));
    clickContinue();

    addService('Kids Haircut', '200');
    await waitFor(() => expect(createdBodies).toHaveLength(2));

    const groups = screen.getAllByRole('heading', { level: 2 });
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveTextContent('Hair › Haircut · 2 added');
  });

  it('stores where the vendor was, and clears it once they are done', async () => {
    registerBackend();
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await waitFor(() => expect(createdBodies).toHaveLength(1));

    const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
    expect(draft.contextLabel).toBe('Hair › Haircut');
    expect(draft.context).toMatchObject({
      category_id: 'cat-hair',
      subcategory_id: 'sub-haircut',
      gender_category: 'both',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Done — 1 added' }));

    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('asks before leaving with rows that failed to save', async () => {
    registerBackend({ failures: [1] });
    renderWizard();
    goToBatchStep();

    addService("Men's Haircut", '300');
    await screen.findByText('Category is required');

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});

describe('resuming a stored position', () => {
  it('opens straight on the batch step for the saved subcategory', async () => {
    registerBackend();
    render(
      <Provider store={makeStore()}>
        <VendorAddServiceWizard
          isOpen
          onClose={onClose}
          categories={CATEGORIES}
          categoriesLoading={false}
          initialDraft={{
            step: 4,
            context: {
              gender_category: 'female',
              category_id: 'cat-hair',
              subcategory_id: 'sub-haircut',
              custom_subcategory_name: '',
              sub_subcategory_id: '',
              custom_sub_subcategory_name: '',
            },
            contextLabel: 'Hair › Haircut',
            defaults: { duration: '45', description: '', discount_percentage: '' },
          }}
        />
      </Provider>
    );

    expect(await screen.findByLabelText('Service name')).toBeInTheDocument();
    expect(screen.getByText('Hair › Haircut')).toBeInTheDocument();

    addService('Blow Dry', '400');

    await waitFor(() => expect(createdBodies).toHaveLength(1));
    expect(createdBodies[0]).toMatchObject({
      subcategory_id: 'sub-haircut',
      duration_minutes: 45,
      gender_category: 'female',
    });
    // A resumed sitting starts with an empty list; earlier rows are already saved.
    expect(
      within(screen.getByRole('heading', { level: 2 }).parentElement).getAllByText(/₹/)
    ).toHaveLength(1);
  });
});
