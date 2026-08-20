import {
  DRAFT_STORAGE_KEY,
  INITIAL_BATCH_CONTEXT,
  INITIAL_BATCH_DEFAULTS,
  WIZARD_STEPS,
} from './serviceWizardConstants';

/**
 * The draft only remembers *where* the vendor was adding services (taxonomy,
 * gender, shared defaults) — never the rows themselves. Rows are saved to the
 * API the moment they are added, so there is no unsaved service to restore.
 */
export function loadServiceWizardDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      step: parsed.step || WIZARD_STEPS.PREFERENCE,
      context: { ...INITIAL_BATCH_CONTEXT, ...(parsed.context || {}) },
      contextLabel: parsed.contextLabel || '',
      defaults: { ...INITIAL_BATCH_DEFAULTS, ...(parsed.defaults || {}) },
      savedAt: parsed.savedAt || null,
    };
  } catch {
    return null;
  }
}

export function saveServiceWizardDraft({ step, context, contextLabel, defaults }) {
  try {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        step,
        context,
        contextLabel: contextLabel || '',
        defaults,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* ignore quota errors */
  }
}

export function clearServiceWizardDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
