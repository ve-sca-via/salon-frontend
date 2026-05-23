import { DRAFT_STORAGE_KEY, INITIAL_SERVICE_FORM } from './serviceWizardConstants';

export function loadServiceWizardDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      step: parsed.step || 1,
      formData: { ...INITIAL_SERVICE_FORM, ...(parsed.formData || {}) },
      customMode: Boolean(parsed.customMode),
      customEntryStep: parsed.customEntryStep || 2,
      draftServiceId: parsed.draftServiceId || null,
      savedAt: parsed.savedAt || null,
    };
  } catch {
    return null;
  }
}

export function saveServiceWizardDraft({
  step,
  formData,
  customMode,
  customEntryStep,
  draftServiceId,
}) {
  try {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        step,
        formData,
        customMode: Boolean(customMode),
        customEntryStep: customEntryStep || null,
        draftServiceId: draftServiceId || null,
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
