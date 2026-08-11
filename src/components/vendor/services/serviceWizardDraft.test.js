/**
 * Unit tests for the add-services draft helpers.
 *
 * The draft only remembers *where* a vendor was adding services — the taxonomy,
 * the gender preference and the shared defaults. Rows are written to the API as
 * they are added, so there is deliberately no service payload in here.
 */
import { describe, it, expect, beforeEach } from 'vitest';

import {
  clearServiceWizardDraft,
  loadServiceWizardDraft,
  saveServiceWizardDraft,
} from './serviceWizardDraft';
import {
  DRAFT_STORAGE_KEY,
  INITIAL_BATCH_CONTEXT,
  INITIAL_BATCH_DEFAULTS,
  WIZARD_STEPS,
} from './serviceWizardConstants';

beforeEach(() => {
  localStorage.clear();
});

describe('serviceWizardDraft', () => {
  it('returns null when nothing is stored', () => {
    expect(loadServiceWizardDraft()).toBeNull();
  });

  it('round-trips the step, context, label and defaults', () => {
    saveServiceWizardDraft({
      step: WIZARD_STEPS.BATCH,
      context: {
        ...INITIAL_BATCH_CONTEXT,
        gender_category: 'female',
        category_id: 'cat-hair',
        subcategory_id: 'sub-haircut',
      },
      contextLabel: 'Hair › Haircut',
      defaults: { ...INITIAL_BATCH_DEFAULTS, duration: '45' },
    });

    const draft = loadServiceWizardDraft();
    expect(draft.step).toBe(WIZARD_STEPS.BATCH);
    expect(draft.contextLabel).toBe('Hair › Haircut');
    expect(draft.context.category_id).toBe('cat-hair');
    expect(draft.context.subcategory_id).toBe('sub-haircut');
    expect(draft.context.gender_category).toBe('female');
    expect(draft.defaults.duration).toBe('45');
    expect(draft.savedAt).toEqual(expect.any(String));
  });

  it('fills missing context and defaults keys from the initial shapes', () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ step: WIZARD_STEPS.SUBCATEGORY, context: { category_id: 'cat-hair' } })
    );

    const draft = loadServiceWizardDraft();
    expect(draft.context).toEqual({ ...INITIAL_BATCH_CONTEXT, category_id: 'cat-hair' });
    expect(draft.defaults).toEqual(INITIAL_BATCH_DEFAULTS);
    expect(draft.contextLabel).toBe('');
  });

  it('returns null for unparseable storage instead of throwing', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, 'not-json');
    expect(loadServiceWizardDraft()).toBeNull();
  });

  it('clears the stored draft', () => {
    saveServiceWizardDraft({
      step: WIZARD_STEPS.CATEGORY,
      context: INITIAL_BATCH_CONTEXT,
      contextLabel: '',
      defaults: INITIAL_BATCH_DEFAULTS,
    });
    clearServiceWizardDraft();
    expect(loadServiceWizardDraft()).toBeNull();
  });
});
