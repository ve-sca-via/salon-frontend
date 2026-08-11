export const WIZARD_STEPS = {
  PREFERENCE: 1,
  CATEGORY: 2,
  SUBCATEGORY: 3,
  BATCH: 4,
};

export const TOTAL_WIZARD_STEPS = 4;

// v2 — the batch flow stores a taxonomy context + shared defaults instead of a
// single half-filled service, so a new key retires v1 drafts instead of feeding
// an incompatible shape into the wizard.
export const DRAFT_STORAGE_KEY = 'vendor_add_service_wizard_draft_v2';

/**
 * Where the batch is being added: the taxonomy the vendor picked in steps 2–3
 * plus the gender preference from step 1. Every row added on the batch step is
 * saved under this context until the vendor changes it.
 */
export const INITIAL_BATCH_CONTEXT = {
  gender_category: '',
  category_id: '',
  subcategory_id: '',
  custom_subcategory_name: '',
  sub_subcategory_id: '',
  custom_sub_subcategory_name: '',
};

/**
 * Applied to every row added in the batch until changed. Kept deliberately small:
 * only name and price vary between sibling services, and anything else can be
 * edited per service from the services list afterwards.
 */
export const INITIAL_BATCH_DEFAULTS = {
  duration: '30',
  description: '',
  discount_percentage: '',
};

export const DURATION_OPTIONS = [
  { value: 15, label: '15 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 45, label: '45 Minutes' },
  { value: 60, label: '60 Minutes' },
  { value: 75, label: '75 Minutes' },
  { value: 90, label: '90 Minutes' },
  { value: 120, label: '120 Minutes' },
  { value: 150, label: '150 Minutes' },
  { value: 180, label: '180 Minutes' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'both', label: 'Unisex' },
];

export const GENDER_PREFERENCE_OPTIONS = [
  {
    value: 'male',
    label: 'Men',
    subtitle: "Men's grooming services",
  },
  {
    value: 'female',
    label: 'Women',
    subtitle: "Women's styling services",
  },
  {
    value: 'both',
    label: 'Unisex',
    subtitle: 'Unisex spa services',
  },
];
