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
import {
  findOthersSubcategory,
  isOthersSubcategory,
  resolveCategoryById,
} from './serviceWizardUtils';

const buildServicePayload = (formData, isActive) => ({
  name: (formData.name?.trim() || formData.custom_subcategory_name?.trim() || '').trim(),
  description: formData.description.trim(),
  price: parseFloat(formData.price) || 0,
  discount_percentage:
    formData.discount_percentage === '' || parseFloat(formData.discount_percentage) === 0
      ? null
      : parseFloat(formData.discount_percentage),
  duration_minutes: parseInt(formData.duration, 10),
  category_id: formData.category_id || null,
  subcategory_id: formData.subcategory_id || null,
  gender_category: formData.gender_category || 'both',
  image_url: formData.image_url || null,
  is_active: isActive,
});

const validateConfigureStep = (formData, categories = []) => {
  const serviceName =
    formData.name?.trim() ||
    (formData.is_custom_subcategory ? formData.custom_subcategory_name?.trim() : '');

  if (!serviceName) {
    showErrorToast('Service name is required');
    return false;
  }
  if (!formData.category_id) {
    showErrorToast('Category is required');
    return false;
  }
  if (formData.is_custom_subcategory) {
    if (!formData.custom_subcategory_name?.trim()) {
      showErrorToast('Custom service name is required');
      return false;
    }
    const cat = resolveCategoryById(categories, formData.category_id);
    const others = findOthersSubcategory(cat);
    if (!others?.id || formData.subcategory_id !== others.id) {
      showErrorToast('Custom services must use the Others subcategory');
      return false;
    }
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
  const [skipSubcategoryStep, setSkipSubcategoryStep] = useState(false);
  const [draftServiceId, setDraftServiceId] = useState(null);

  const isSaving = isCreating || isUpdating;

  const persistDraft = useCallback(
    (nextStep, nextForm, nextSkipSub, nextDraftId) => {
      saveServiceWizardDraft({
        step: nextStep,
        formData: nextForm,
        customMode: nextSkipSub,
        draftServiceId: nextDraftId ?? draftServiceId,
      });
    },
    [draftServiceId]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (initialDraft) {
      setStep(initialDraft.step || WIZARD_STEPS.PREFERENCE);
      setFormData({ ...INITIAL_SERVICE_FORM, ...initialDraft.formData });
      setSkipSubcategoryStep(Boolean(initialDraft.customMode));
      setDraftServiceId(initialDraft.draftServiceId || null);
    } else {
      setStep(WIZARD_STEPS.PREFERENCE);
      setFormData(INITIAL_SERVICE_FORM);
      setSkipSubcategoryStep(false);
      setDraftServiceId(null);
    }
  }, [isOpen, initialDraft]);

  const handleClose = () => {
    onClose();
  };

  const handleWizardBack = () => {
    if (step === WIZARD_STEPS.PREFERENCE) {
      const hasProgress =
        formData.gender_category ||
        formData.category_id ||
        formData.name;
      if (hasProgress) {
        persistDraft(step, formData, skipSubcategoryStep, draftServiceId);
      }
      handleClose();
      return;
    }
    if (step === WIZARD_STEPS.CONFIGURE) {
      if (skipSubcategoryStep) {
        setStep(WIZARD_STEPS.CATEGORY);
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
        updated.custom_subcategory_name = '';
        updated.is_custom_subcategory = false;
      }
      if (name === 'subcategory_id') {
        const cat = resolveCategoryById(categories, updated.category_id);
        const sub = cat?.subcategories?.find((s) => s.id === value);
        if (sub && isOthersSubcategory(sub)) {
          updated.is_custom_subcategory = true;
          updated.name = updated.custom_subcategory_name?.trim() || updated.name || '';
        } else if (sub) {
          updated.is_custom_subcategory = false;
          updated.custom_subcategory_name = '';
          updated.name = sub.name || updated.name;
        }
      }
      if (name === 'name' && prev.is_custom_subcategory) {
        updated.custom_subcategory_name = value;
      }
      return updated;
    });
  };

  const goToStep = (nextStep, updates = {}) => {
    const nextForm = { ...formData, ...updates };
    setFormData(nextForm);
    setStep(nextStep);
    persistDraft(nextStep, nextForm, skipSubcategoryStep, draftServiceId);
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
    setFormData((prev) => ({
      ...prev,
      category_id: cat.id,
      subcategory_id: '',
      custom_subcategory_name: '',
      is_custom_subcategory: false,
      name: prev.is_custom_subcategory ? '' : prev.name || '',
    }));
    setSkipSubcategoryStep(false);
  };

  const handleCustomFromStep2 = () => {
    if (!formData.category_id) {
      showErrorToast('Select a category first, then add your custom service');
      return;
    }
    setSkipSubcategoryStep(false);
    goToStep(WIZARD_STEPS.SUBCATEGORY, {
      is_custom_subcategory: false,
      subcategory_id: '',
      custom_subcategory_name: '',
    });
  };

  const handleStep2Continue = () => {
    if (!formData.category_id) {
      showErrorToast('Please select a category or create a custom service');
      return;
    }
    goToStep(WIZARD_STEPS.SUBCATEGORY);
  };

  const handleSelectSubcategory = (sub) => {
    if (!sub?.id || isOthersSubcategory(sub)) return;
    setFormData((prev) => ({
      ...prev,
      subcategory_id: sub.id,
      is_custom_subcategory: false,
      custom_subcategory_name: '',
      name: sub.name || '',
      description: prev.description || sub.description || '',
    }));
  };

  const handleCustomNameChange = (text) => {
    const trimmed = text.trim();
    const cat = resolveCategoryById(categories, formData.category_id);
    const others = findOthersSubcategory(cat);

    if (!formData.category_id) {
      showErrorToast('Select a category first');
      return;
    }
    if (!others?.id) {
      showErrorToast('Others subcategory is not available for this category yet. Try again in a moment.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      custom_subcategory_name: text,
      is_custom_subcategory: Boolean(trimmed),
      subcategory_id: trimmed ? others.id : '',
      name: trimmed || (prev.is_custom_subcategory ? '' : prev.name),
      description: trimmed ? prev.description : prev.description,
    }));
  };

  const handleStep3Continue = () => {
    if (!formData.category_id) {
      showErrorToast('Please select a category');
      return;
    }
    if (!formData.subcategory_id) {
      showErrorToast('Select a catalog service or enter a custom service name');
      return;
    }
    if (formData.is_custom_subcategory && !formData.custom_subcategory_name?.trim()) {
      showErrorToast('Enter a name for your custom service');
      return;
    }
    if (formData.is_custom_subcategory && !formData.name?.trim()) {
      setFormData((prev) => ({
        ...prev,
        name: prev.custom_subcategory_name.trim(),
      }));
    }
    goToStep(WIZARD_STEPS.CONFIGURE);
  };

  const handleConfigureContinue = (e) => {
    e.preventDefault();
    const updates = {};
    if (formData.is_custom_subcategory && !formData.name?.trim()) {
      updates.name = formData.custom_subcategory_name.trim();
    }
    const merged = { ...formData, ...updates };
    if (!validateConfigureStep(merged, categories)) return;
    goToStep(WIZARD_STEPS.REVIEW, updates);
  };

  const saveToApi = async (isActive) => {
    if (!validateConfigureStep(formData, categories)) return;

    const payload = buildServicePayload(formData, isActive);

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
        onCustomService={handleCustomFromStep2}
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
        onSelectCategory={handleSelectCategory}
        onSelectSubcategory={handleSelectSubcategory}
        onCustomNameChange={handleCustomNameChange}
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
        hideCategoryField={Boolean(formData.category_id)}
        hideSubcategoryField={
          Boolean(formData.subcategory_id) && !formData.is_custom_subcategory
        }
        forceOthersSubcategory={formData.is_custom_subcategory}
        submitLabel="Continue"
      />
    );
  }

  return (
    <VendorServiceWizardStep5Review
      salonName={salonName}
      formData={formData}
      categories={categories}
      onBack={handleWizardBack}
      onPublish={handlePublish}
      onSaveDraft={handleSaveDraft}
      onCancel={() => {
        persistDraft(step, formData, skipSubcategoryStep, draftServiceId);
        handleClose();
      }}
      isSaving={isSaving}
    />
  );
};

export { loadServiceWizardDraft };

export default VendorAddServiceWizard;
