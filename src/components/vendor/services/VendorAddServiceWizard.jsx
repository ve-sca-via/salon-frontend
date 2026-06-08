import React, { useCallback, useEffect, useState } from 'react';
import {
  useCreateVendorServiceMutation,
  useGetVendorSalonQuery,
  useUpdateVendorServiceMutation,
} from '../../../services/api/vendorApi';
import { showErrorToast, showSuccessToast } from '../../../utils/toastConfig';
import VendorConfigureService from './VendorConfigureService';
import VendorServiceWizardStep1Preference from './VendorServiceWizardStep1Preference';
import VendorServiceWizardStep2Category from './VendorServiceWizardStep2Category';
import VendorServiceWizardStep3Subcategory from './VendorServiceWizardStep3Subcategory';
import VendorServiceWizardStep5Review from './VendorServiceWizardStep5Review';
import {
  INITIAL_SERVICE_FORM,
  WIZARD_STEPS,
} from './serviceWizardConstants';
import {
  clearServiceWizardDraft,
  loadServiceWizardDraft,
  saveServiceWizardDraft,
} from './serviceWizardDraft';

const buildServicePayload = (formData, isActive, isCustomServiceFlow) => {
  const base = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: parseFloat(formData.price) || 0,
    discount_percentage:
      formData.discount_percentage === '' || parseFloat(formData.discount_percentage) === 0
        ? null
        : parseFloat(formData.discount_percentage),
    duration_minutes: parseInt(formData.duration, 10),
    gender_category: formData.gender_category || 'both',
    image_url: formData.image_url || null,
    is_active: isActive,
  };

  // A typed sub-type name (level 3) is optional; backend get-or-creates it under
  // the chosen subcategory. Undefined keys are dropped from the JSON body.
  const subSubcategoryName = formData.custom_sub_subcategory_name?.trim() || undefined;

  if (isCustomServiceFlow) {
    return {
      ...base,
      category_name: formData.custom_category_name.trim(),
      subcategory_name: formData.custom_subcategory_name.trim(),
      sub_subcategory_name: subSubcategoryName,
    };
  }

  return {
    ...base,
    category_id: formData.category_id || null,
    subcategory_id: formData.subcategory_id || null,
    sub_subcategory_id: formData.sub_subcategory_id || null,
    sub_subcategory_name: subSubcategoryName,
  };
};

const validateConfigureStep = (formData, isCustomServiceFlow) => {
  if (!formData.name?.trim()) {
    showErrorToast('Service name is required');
    return false;
  }
  if (isCustomServiceFlow) {
    if (!formData.custom_category_name?.trim()) {
      showErrorToast('Category is required');
      return false;
    }
    if (!formData.custom_subcategory_name?.trim()) {
      showErrorToast('Subcategory is required');
      return false;
    }
  } else if (!formData.category_id) {
    showErrorToast('Category is required');
    return false;
  }
  if (!formData.duration || parseInt(formData.duration, 10) <= 0) {
    showErrorToast('Duration must be greater than 0');
    return false;
  }
  if (formData.price === '' || formData.price === null || formData.price === undefined) {
    showErrorToast('Price is required (use 0 for FREE services)');
    return false;
  }
  if (parseFloat(formData.price) < 0) {
    showErrorToast('Price cannot be negative');
    return false;
  }
  if (formData.discount_percentage !== '' && formData.discount_percentage !== null) {
    const discountValue = parseFloat(formData.discount_percentage);
    if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      showErrorToast('Discount must be between 0 and 100');
      return false;
    }
    if (parseFloat(formData.price) <= 0 && discountValue > 0) {
      showErrorToast('Discount can only be applied when price is greater than 0');
      return false;
    }
  }
  return true;
};

/**
 * 5-step add service flow with local draft + optional inactive API draft on publish step.
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

  const [createService, { isLoading: isCreating }] = useCreateVendorServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateVendorServiceMutation();

  const [step, setStep] = useState(WIZARD_STEPS.PREFERENCE);
  const [formData, setFormData] = useState(INITIAL_SERVICE_FORM);
  /** True when vendor chose "Create Custom Service" — configure form starts empty */
  const [isCustomServiceFlow, setIsCustomServiceFlow] = useState(false);
  /** Wizard step the vendor was on when they opened the custom configure form */
  const [customEntryStep, setCustomEntryStep] = useState(WIZARD_STEPS.CATEGORY);
  const [draftServiceId, setDraftServiceId] = useState(null);

  const isSaving = isCreating || isUpdating;

  const persistDraft = useCallback(
    (nextStep, nextForm, customFlow, nextDraftId, entryStep = customEntryStep) => {
      saveServiceWizardDraft({
        step: nextStep,
        formData: nextForm,
        customMode: customFlow,
        customEntryStep: entryStep,
        draftServiceId: nextDraftId ?? draftServiceId,
      });
    },
    [draftServiceId, customEntryStep]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (initialDraft) {
      setStep(initialDraft.step || WIZARD_STEPS.PREFERENCE);
      setFormData({ ...INITIAL_SERVICE_FORM, ...initialDraft.formData });
      setIsCustomServiceFlow(Boolean(initialDraft.customMode));
      setCustomEntryStep(initialDraft.customEntryStep || WIZARD_STEPS.CATEGORY);
      setDraftServiceId(initialDraft.draftServiceId || null);
    } else {
      setStep(WIZARD_STEPS.PREFERENCE);
      setFormData(INITIAL_SERVICE_FORM);
      setIsCustomServiceFlow(false);
      setCustomEntryStep(WIZARD_STEPS.CATEGORY);
      setDraftServiceId(null);
    }
  }, [isOpen, initialDraft]);

  const handleClose = () => {
    onClose();
  };

  const openCustomConfigureForm = (fromStep = WIZARD_STEPS.CATEGORY) => {
    setIsCustomServiceFlow(true);
    setCustomEntryStep(fromStep);
    const emptyForm = {
      ...formData,
      category_id: '',
      subcategory_id: '',
      sub_subcategory_id: '',
      custom_category_name: '',
      custom_subcategory_name: '',
      custom_sub_subcategory_name: '',
      name: '',
      description: '',
    };
    setFormData(emptyForm);
    setStep(WIZARD_STEPS.CONFIGURE);
    persistDraft(WIZARD_STEPS.CONFIGURE, emptyForm, true, draftServiceId, fromStep);
  };

  const handleWizardBack = () => {
    if (step === WIZARD_STEPS.PREFERENCE) {
      const hasProgress =
        formData.gender_category ||
        formData.category_id ||
        formData.name;
      if (hasProgress) {
        persistDraft(step, formData, isCustomServiceFlow, draftServiceId);
      }
      handleClose();
      return;
    }
    if (step === WIZARD_STEPS.CONFIGURE) {
      if (isCustomServiceFlow) {
        setStep(customEntryStep);
      } else {
        setStep(WIZARD_STEPS.SUBCATEGORY);
      }
      return;
    }
    if (step === WIZARD_STEPS.SUBCATEGORY) {
      setStep(WIZARD_STEPS.CATEGORY);
      return;
    }
    if (step === WIZARD_STEPS.REVIEW) {
      setStep(WIZARD_STEPS.CONFIGURE);
      return;
    }
    setStep((s) => s - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'category_id') {
        updated.subcategory_id = '';
        updated.sub_subcategory_id = '';
        updated.custom_sub_subcategory_name = '';
      }
      if (name === 'subcategory_id') {
        updated.sub_subcategory_id = '';
        updated.custom_sub_subcategory_name = '';
      }
      return updated;
    });
  };

  const goToStep = (nextStep, updates = {}) => {
    const nextForm = { ...formData, ...updates };
    setFormData(nextForm);
    setStep(nextStep);
    persistDraft(nextStep, nextForm, isCustomServiceFlow, draftServiceId);
  };

  const handleSelectGender = (value) => {
    setFormData((prev) => ({ ...prev, gender_category: value }));
  };

  const handleStep1Continue = () => {
    if (!formData.gender_category) {
      showErrorToast('Please select a preference');
      return;
    }
    goToStep(WIZARD_STEPS.CATEGORY);
  };

  const handleSelectCategory = (cat) => {
    if (!cat?.id) return;
    setIsCustomServiceFlow(false);
    setFormData((prev) => ({
      ...prev,
      category_id: cat.id,
      subcategory_id: '',
      name: '',
    }));
  };

  const handleStep2Continue = () => {
    if (!formData.category_id) {
      showErrorToast('Please select a category or create a custom service');
      return;
    }
    goToStep(WIZARD_STEPS.SUBCATEGORY);
  };

  const handleSelectSubcategory = (sub) => {
    if (!sub?.id) return;
    setIsCustomServiceFlow(false);
    setFormData((prev) => ({
      ...prev,
      subcategory_id: sub.id,
      // Reset the optional 3rd level whenever the subcategory changes.
      sub_subcategory_id: '',
      custom_sub_subcategory_name: '',
      name: '',
      description: prev.description || sub.description || '',
    }));
  };

  const handleSelectSubSubcategory = (subSub) => {
    // Tapping the active chip again (subSub === null) clears the selection.
    setFormData((prev) => ({
      ...prev,
      sub_subcategory_id: subSub?.id || '',
      custom_sub_subcategory_name: '',
    }));
  };

  const handleChangeCustomSubSubcategory = (value) => {
    setFormData((prev) => ({
      ...prev,
      custom_sub_subcategory_name: value,
      // Typing a new sub-type clears any tapped catalog selection.
      sub_subcategory_id: value ? '' : prev.sub_subcategory_id,
    }));
  };

  const handleStep3Continue = () => {
    if (!formData.subcategory_id) {
      showErrorToast('Please select a catalog service or create a custom one');
      return;
    }
    goToStep(WIZARD_STEPS.CONFIGURE);
  };

  const handleConfigureContinue = (e) => {
    e.preventDefault();
    if (!validateConfigureStep(formData, isCustomServiceFlow)) return;
    goToStep(WIZARD_STEPS.REVIEW);
  };

  const saveToApi = async (isActive) => {
    if (!validateConfigureStep(formData, isCustomServiceFlow)) return;

    const payload = buildServicePayload(formData, isActive, isCustomServiceFlow);

    try {
      if (draftServiceId) {
        await updateService({ serviceId: draftServiceId, ...payload }).unwrap();
        showSuccessToast(
          isActive ? 'Service published successfully!' : 'Draft saved successfully!'
        );
      } else {
        const created = await createService(payload).unwrap();
        if (!isActive && created?.id) {
          setDraftServiceId(created.id);
        }
        showSuccessToast(
          isActive ? 'Service published successfully!' : 'Draft saved successfully!'
        );
      }
      clearServiceWizardDraft();
      handleClose();
    } catch (error) {
      showErrorToast(error?.data?.detail || error?.message || 'Failed to save service');
    }
  };

  const handlePublish = () => saveToApi(true);
  const handleSaveDraft = () => saveToApi(false);

  if (!isOpen) return null;

  if (step === WIZARD_STEPS.PREFERENCE) {
    return (
      <VendorServiceWizardStep1Preference
        salonName={salonName}
        formData={formData}
        onSelectGender={handleSelectGender}
        onBack={handleWizardBack}
        onContinue={handleStep1Continue}
      />
    );
  }

  if (step === WIZARD_STEPS.CATEGORY) {
    return (
      <VendorServiceWizardStep2Category
        salonName={salonName}
        formData={formData}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onSelectCategory={handleSelectCategory}
        onCustomService={() => openCustomConfigureForm(WIZARD_STEPS.CATEGORY)}
        onBack={handleWizardBack}
        onContinue={handleStep2Continue}
      />
    );
  }

  if (step === WIZARD_STEPS.SUBCATEGORY) {
    return (
      <VendorServiceWizardStep3Subcategory
        salonName={salonName}
        formData={formData}
        categories={categories}
        onSelectSubcategory={handleSelectSubcategory}
        onSelectSubSubcategory={handleSelectSubSubcategory}
        onChangeCustomSubSubcategory={handleChangeCustomSubSubcategory}
        onCustomService={() => openCustomConfigureForm(WIZARD_STEPS.SUBCATEGORY)}
        onBack={handleWizardBack}
        onContinue={handleStep3Continue}
      />
    );
  }

  if (step === WIZARD_STEPS.CONFIGURE) {
    return (
      <VendorConfigureService
        isOpen
        onClose={handleWizardBack}
        editingService={null}
        formData={formData}
        handleChange={handleChange}
        setFormData={setFormData}
        onSubmit={handleConfigureContinue}
        categories={categories}
        categoriesLoading={categoriesLoading}
        isSaving={false}
        wizardMode
        wizardStep={WIZARD_STEPS.CONFIGURE}
        hideGenderField={Boolean(formData.gender_category)}
        hideCategoryField={!isCustomServiceFlow && Boolean(formData.category_id)}
        hideSubcategoryField={!isCustomServiceFlow && Boolean(formData.subcategory_id)}
        useTextCategoryFields={isCustomServiceFlow}
        submitLabel="Continue"
      />
    );
  }

  return (
    <VendorServiceWizardStep5Review
      salonName={salonName}
      formData={formData}
      categories={categories}
      isCustomServiceFlow={isCustomServiceFlow}
      onBack={handleWizardBack}
      onPublish={handlePublish}
      onSaveDraft={handleSaveDraft}
      onCancel={() => {
        persistDraft(step, formData, isCustomServiceFlow, draftServiceId);
        handleClose();
      }}
      isSaving={isSaving}
    />
  );
};

export { loadServiceWizardDraft };

export default VendorAddServiceWizard;
