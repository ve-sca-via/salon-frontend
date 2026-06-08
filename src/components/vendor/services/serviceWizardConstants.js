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
  sub_subcategory_id: '',
  custom_category_name: '',
  custom_subcategory_name: '',
  custom_sub_subcategory_name: '',
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
