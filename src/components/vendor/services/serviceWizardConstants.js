export const WIZARD_STEPS = {
  PREFERENCE: 1,
  CATEGORY: 2,
  SUBCATEGORY: 3,
  CONFIGURE: 4,
  REVIEW: 5,
};

export const TOTAL_WIZARD_STEPS = 5;

export const DRAFT_STORAGE_KEY = 'vendor_add_service_wizard_draft';

export const INITIAL_SERVICE_FORM = {
  name: '',
  description: '',
  price: '',
  discount_percentage: '',
  duration: '',
  category_id: '',
  subcategory_id: '',
  /** Vendor-typed label when subcategory is "Others" */
  custom_subcategory_name: '',
  is_custom_subcategory: false,
  gender_category: '',
  is_active: true,
  image_url: '',
};

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
