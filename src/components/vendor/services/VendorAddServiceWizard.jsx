import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useCreateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useGetVendorSalonQuery,
  useUpdateVendorServiceMutation,
} from '../../../services/api/vendorApi';
import { showErrorToast } from '../../../utils/toastConfig';
import VendorServiceWizardStep1Preference from './VendorServiceWizardStep1Preference';
import VendorServiceWizardStep2Category from './VendorServiceWizardStep2Category';
import VendorServiceWizardStep3Subcategory from './VendorServiceWizardStep3Subcategory';
import VendorServiceWizardStep4BatchAdd from './VendorServiceWizardStep4BatchAdd';
import {
  INITIAL_BATCH_CONTEXT,
  INITIAL_BATCH_DEFAULTS,
  WIZARD_STEPS,
} from './serviceWizardConstants';
import {
  clearServiceWizardDraft,
  loadServiceWizardDraft,
  saveServiceWizardDraft,
} from './serviceWizardDraft';

const errorMessage = (error, fallback) =>
  error?.data?.detail || error?.message || fallback;

/**
 * Identity of the taxonomy a batch is being added under. Gender is deliberately
 * excluded: changing it mid-batch should not start a new group.
 */
const taxonomyKey = (context) =>
  [
    context.category_id,
    context.subcategory_id,
    (context.custom_subcategory_name || '').trim().toLowerCase(),
    context.sub_subcategory_id,
    (context.custom_sub_subcategory_name || '').trim().toLowerCase(),
  ].join('|');

/** Human-readable "Hair › Haircut › Spanish Haircut" for the pinned header. */
const buildContextLabel = (context, categories) => {
  const category = categories.find((c) => c.id === context.category_id);
  const subcategories = category?.subcategories || [];
  const subcategory = subcategories.find((s) => s.id === context.subcategory_id);
  const subSubcategory = (subcategory?.subcategories || []).find(
    (ss) => ss.id === context.sub_subcategory_id
  );

  return [
    category?.name,
    context.custom_subcategory_name?.trim() || subcategory?.name,
    context.custom_sub_subcategory_name?.trim() || subSubcategory?.name,
  ]
    .filter(Boolean)
    .join(' › ');
};

const buildRowPayload = (row, context) => ({
  name: row.name,
  description: (row.description || '').trim(),
  price: parseFloat(row.price) || 0,
  discount_percentage:
    row.discount_percentage === '' || parseFloat(row.discount_percentage) === 0
      ? null
      : parseFloat(row.discount_percentage),
  duration_minutes: parseInt(row.duration, 10),
  gender_category: row.gender_category || 'both',
  image_url: null,
  is_active: true,
  category_id: context.category_id || null,
  subcategory_id: context.subcategory_id || null,
  // A typed name (level 2 or 3) is get-or-created by the backend under its
  // parent, so it becomes a reusable catalog node. Undefined keys are dropped.
  subcategory_name: context.custom_subcategory_name?.trim() || undefined,
  sub_subcategory_id: context.sub_subcategory_id || null,
  sub_subcategory_name: context.custom_sub_subcategory_name?.trim() || undefined,
});

// Mirrors ServiceCreate/ServiceUpdate on the backend, which reject a shorter or
// longer name with a 422 rather than a readable message.
const NAME_MIN = 2;
const NAME_MAX = 255;

/** Returns an error string, or null when the row is good to save. */
const validateRow = ({ name, price, duration, discountPercentage }) => {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return 'Service name is required';
  if (trimmedName.length < NAME_MIN) {
    return `Service name must be at least ${NAME_MIN} characters`;
  }
  if (trimmedName.length > NAME_MAX) {
    return `Service name must be ${NAME_MAX} characters or less`;
  }
  if (!duration || parseInt(duration, 10) <= 0) return 'Duration must be greater than 0';
  if (price === '' || price === null || price === undefined) {
    return 'Price is required (use 0 for FREE services)';
  }
  const priceValue = parseFloat(price);
  if (Number.isNaN(priceValue)) return 'Price must be a number';
  if (priceValue < 0) return 'Price cannot be negative';

  if (discountPercentage !== '' && discountPercentage !== null && discountPercentage !== undefined) {
    const discountValue = parseFloat(discountPercentage);
    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      return 'Discount must be between 0 and 100';
    }
    if (priceValue <= 0 && discountValue > 0) {
      return 'Discount can only be applied when price is greater than 0';
    }
  }
  return null;
};

/**
 * 4-step add-service flow: preference → category → subcategory → batch entry.
 *
 * The batch step keeps the taxonomy pinned and saves each service the moment it
 * is added, so a vendor with hundreds of services types name + price + Add in a
 * loop instead of walking the whole wizard once per service.
 */
const VendorAddServiceWizard = ({
  isOpen,
  onClose,
  categories,
  categoriesLoading,
  initialDraft,
}) => {
  const { data: salonData } = useGetVendorSalonQuery(undefined, { skip: !isOpen });
  const salonName = salonData?.salon?.name || 'Your salon';

  const [createService] = useCreateVendorServiceMutation();
  const [updateService] = useUpdateVendorServiceMutation();
  const [deleteService] = useDeleteVendorServiceMutation();

  const [step, setStep] = useState(WIZARD_STEPS.PREFERENCE);
  const [context, setContext] = useState(INITIAL_BATCH_CONTEXT);
  const [contextLabel, setContextLabel] = useState('');
  const [defaults, setDefaults] = useState(INITIAL_BATCH_DEFAULTS);
  /** Groups rows by the taxonomy they were added under; survives id promotion. */
  const [contextId, setContextId] = useState(1);
  const [rows, setRows] = useState([]);

  const contextKeyRef = useRef(null);
  const localIdRef = useRef(0);
  /**
   * Saves are chained so only one create is in flight at a time. Two rows added
   * under a newly typed subcategory would otherwise race to get-or-create it and
   * end up with duplicate catalog nodes.
   */
  const queueRef = useRef(Promise.resolve());
  /**
   * contextId -> subcategory id the backend resolved for the first saved row.
   * Later rows in the same batch send that id instead of re-sending typed names.
   */
  const resolvedSubcategoryRef = useRef({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialDraft) {
      const resumedContext = { ...INITIAL_BATCH_CONTEXT, ...(initialDraft.context || {}) };
      setStep(initialDraft.step || WIZARD_STEPS.PREFERENCE);
      setContext(resumedContext);
      setContextLabel(initialDraft.contextLabel || '');
      setDefaults({ ...INITIAL_BATCH_DEFAULTS, ...(initialDraft.defaults || {}) });
      contextKeyRef.current = taxonomyKey(resumedContext);
    } else {
      setStep(WIZARD_STEPS.PREFERENCE);
      setContext(INITIAL_BATCH_CONTEXT);
      setContextLabel('');
      setDefaults(INITIAL_BATCH_DEFAULTS);
      contextKeyRef.current = null;
    }
    // Rows are already saved server-side; a new sitting starts with an empty list.
    setRows([]);
    setContextId(1);
    localIdRef.current = 0;
    queueRef.current = Promise.resolve();
    resolvedSubcategoryRef.current = {};
  }, [isOpen, initialDraft]);

  // Remember where the vendor was adding services, not what they half-typed.
  useEffect(() => {
    if (!isOpen) return;
    if (step === WIZARD_STEPS.PREFERENCE && !context.gender_category) return;
    saveServiceWizardDraft({ step, context, contextLabel, defaults });
  }, [isOpen, step, context, contextLabel, defaults]);

  const enqueueSave = useCallback(
    (row) => {
      queueRef.current = queueRef.current.then(async () => {
        const promoted = resolvedSubcategoryRef.current[row.contextId];
        const effectiveContext = promoted
          ? {
              ...row.context,
              subcategory_id: promoted,
              custom_subcategory_name: '',
              sub_subcategory_id: '',
              custom_sub_subcategory_name: '',
            }
          : row.context;

        try {
          const created = await createService(
            buildRowPayload(row, effectiveContext)
          ).unwrap();
          if (created?.subcategory_id) {
            resolvedSubcategoryRef.current[row.contextId] = created.subcategory_id;
          }
          setRows((prev) =>
            prev.map((r) =>
              r.localId === row.localId
                ? { ...r, status: 'saved', serviceId: created?.id || null, error: null }
                : r
            )
          );
        } catch (error) {
          setRows((prev) =>
            prev.map((r) =>
              r.localId === row.localId
                ? {
                    ...r,
                    status: 'error',
                    error: errorMessage(error, 'Failed to save service'),
                  }
                : r
            )
          );
        }
      });
    },
    [createService]
  );

  const handleSelectGender = (value) => {
    setContext((prev) => ({ ...prev, gender_category: value }));
  };

  const handleStep1Continue = () => {
    if (!context.gender_category) {
      showErrorToast('Please select a preference');
      return;
    }
    setStep(WIZARD_STEPS.CATEGORY);
  };

  const handleSelectCategory = (category) => {
    if (!category?.id) return;
    setContext((prev) => ({
      ...prev,
      category_id: category.id,
      subcategory_id: '',
      custom_subcategory_name: '',
      sub_subcategory_id: '',
      custom_sub_subcategory_name: '',
    }));
  };

  const handleStep2Continue = () => {
    if (!context.category_id) {
      showErrorToast('Please select a category');
      return;
    }
    setStep(WIZARD_STEPS.SUBCATEGORY);
  };

  const handleSelectSubcategory = (sub) => {
    if (!sub?.id) return;
    setContext((prev) => ({
      ...prev,
      subcategory_id: sub.id,
      // Picking a catalog subcategory clears any half-typed custom name.
      custom_subcategory_name: '',
      // Reset the optional 3rd level whenever the subcategory changes.
      sub_subcategory_id: '',
      custom_sub_subcategory_name: '',
    }));
  };

  const handleChangeCustomSubcategory = (value) => {
    setContext((prev) => ({
      ...prev,
      custom_subcategory_name: value,
      // Typing a new subcategory clears any tapped catalog card and its children.
      subcategory_id: value ? '' : prev.subcategory_id,
      sub_subcategory_id: value ? '' : prev.sub_subcategory_id,
    }));
  };

  const handleSelectSubSubcategory = (subSub) => {
    // Tapping the active chip again (subSub === null) clears the selection.
    setContext((prev) => ({
      ...prev,
      sub_subcategory_id: subSub?.id || '',
      custom_sub_subcategory_name: '',
    }));
  };

  const handleChangeCustomSubSubcategory = (value) => {
    setContext((prev) => ({
      ...prev,
      custom_sub_subcategory_name: value,
      // Typing a new sub-type clears any tapped catalog selection.
      sub_subcategory_id: value ? '' : prev.sub_subcategory_id,
    }));
  };

  const handleStep3Continue = () => {
    if (!context.subcategory_id && !context.custom_subcategory_name?.trim()) {
      showErrorToast('Select a subcategory or add a new one');
      return;
    }
    // Re-entering the same subcategory keeps adding to the group already on screen.
    const key = taxonomyKey(context);
    if (key !== contextKeyRef.current) {
      contextKeyRef.current = key;
      setContextId((id) => id + 1);
    }
    setContextLabel(buildContextLabel(context, categories));
    setStep(WIZARD_STEPS.BATCH);
  };

  const handleChangeDefault = (field, value) => {
    setDefaults((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRow = ({ name, price }) => {
    const error = validateRow({
      name,
      price,
      duration: defaults.duration,
      discountPercentage: defaults.discount_percentage,
    });
    if (error) {
      showErrorToast(error);
      return false;
    }

    const trimmedName = name.trim();
    const isDuplicate = rows.some(
      (r) =>
        r.contextId === contextId &&
        r.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showErrorToast(`"${trimmedName}" is already in this list`);
      return false;
    }

    localIdRef.current += 1;
    const row = {
      localId: `row-${localIdRef.current}`,
      name: trimmedName,
      price,
      duration: defaults.duration,
      description: defaults.description,
      discount_percentage: defaults.discount_percentage,
      gender_category: context.gender_category || 'both',
      contextId,
      contextLabel,
      // Snapshotted so a later subcategory change can't retarget a queued row.
      context,
      status: 'saving',
      error: null,
      serviceId: null,
    };

    setRows((prev) => [...prev, row]);
    enqueueSave(row);
    return true;
  };

  const handleRetryRow = (localId) => {
    const row = rows.find((r) => r.localId === localId);
    if (!row || row.status === 'saving') return;
    setRows((prev) =>
      prev.map((r) =>
        r.localId === localId ? { ...r, status: 'saving', error: null } : r
      )
    );
    enqueueSave({ ...row, status: 'saving', error: null });
  };

  const handleDeleteRow = async (localId) => {
    const row = rows.find((r) => r.localId === localId);
    if (!row) return true;

    if (row.serviceId) {
      try {
        await deleteService(row.serviceId).unwrap();
      } catch (error) {
        showErrorToast(errorMessage(error, 'Failed to remove service'));
        return false;
      }
    }
    setRows((prev) => prev.filter((r) => r.localId !== localId));
    return true;
  };

  const handleSaveRowEdit = async (localId, draft) => {
    const row = rows.find((r) => r.localId === localId);
    if (!row) return false;

    const error = validateRow({
      name: draft.name,
      price: draft.price,
      duration: row.duration,
      discountPercentage: row.discount_percentage,
    });
    if (error) {
      showErrorToast(error);
      return false;
    }

    const trimmedName = draft.name.trim();
    const isDuplicate = rows.some(
      (r) =>
        r.localId !== localId &&
        r.contextId === row.contextId &&
        r.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showErrorToast(`"${trimmedName}" is already in this list`);
      return false;
    }

    if (row.serviceId) {
      try {
        await updateService({
          serviceId: row.serviceId,
          name: trimmedName,
          price: parseFloat(draft.price) || 0,
        }).unwrap();
      } catch (err) {
        showErrorToast(errorMessage(err, 'Failed to update service'));
        return false;
      }
    }

    setRows((prev) =>
      prev.map((r) =>
        r.localId === localId ? { ...r, name: trimmedName, price: draft.price } : r
      )
    );
    return true;
  };

  const handleDone = () => {
    const failed = rows.filter((r) => r.status === 'error').length;
    if (failed > 0) {
      const confirmed = window.confirm(
        `${failed} service${failed > 1 ? 's' : ''} failed to save and will be lost. Leave anyway?`
      );
      if (!confirmed) return;
    }
    clearServiceWizardDraft();
    onClose();
  };

  const handleBack = () => {
    if (step === WIZARD_STEPS.PREFERENCE) {
      onClose();
      return;
    }
    setStep((s) => s - 1);
  };

  if (!isOpen) return null;

  if (step === WIZARD_STEPS.PREFERENCE) {
    return (
      <VendorServiceWizardStep1Preference
        salonName={salonName}
        formData={context}
        onSelectGender={handleSelectGender}
        onBack={handleBack}
        onContinue={handleStep1Continue}
      />
    );
  }

  if (step === WIZARD_STEPS.CATEGORY) {
    return (
      <VendorServiceWizardStep2Category
        salonName={salonName}
        formData={context}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onSelectCategory={handleSelectCategory}
        onBack={handleBack}
        onContinue={handleStep2Continue}
      />
    );
  }

  if (step === WIZARD_STEPS.SUBCATEGORY) {
    return (
      <VendorServiceWizardStep3Subcategory
        salonName={salonName}
        formData={context}
        categories={categories}
        onSelectSubcategory={handleSelectSubcategory}
        onChangeCustomSubcategory={handleChangeCustomSubcategory}
        onSelectSubSubcategory={handleSelectSubSubcategory}
        onChangeCustomSubSubcategory={handleChangeCustomSubSubcategory}
        onBack={handleBack}
        onContinue={handleStep3Continue}
      />
    );
  }

  return (
    <VendorServiceWizardStep4BatchAdd
      salonName={salonName}
      contextLabel={contextLabel}
      genderCategory={context.gender_category || 'both'}
      onChangeGender={handleSelectGender}
      defaults={defaults}
      onChangeDefault={handleChangeDefault}
      rows={rows}
      currentContextId={contextId}
      onAddRow={handleAddRow}
      onRetryRow={handleRetryRow}
      onDeleteRow={handleDeleteRow}
      onSaveRowEdit={handleSaveRowEdit}
      onChangeSubcategory={() => setStep(WIZARD_STEPS.SUBCATEGORY)}
      onBack={handleBack}
      onDone={handleDone}
    />
  );
};

export { loadServiceWizardDraft };

export default VendorAddServiceWizard;
