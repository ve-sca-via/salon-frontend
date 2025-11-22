/**
 * Salon Form Constants
 * 
 * Centralized constants for salon registration and profile forms.
 * Used by HMR agents when adding salons and vendors editing profiles.
 */

// Business types for vendor registration
export const BUSINESS_TYPES = [
  { value: 'salon', label: 'Salon' },
  { value: 'spa', label: 'Spa' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'unisex_salon', label: 'Unisex Salon' },
  { value: 'barber_shop', label: 'Barber Shop' },
  { value: 'beauty_parlor', label: 'Beauty Parlor' }
];

// Indian states for address forms
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

// Business hours presets for quick setup
export const BUSINESS_HOURS_PRESETS = {
  'weekdays-9-6': {
    label: '9 AM - 6 PM (Mon-Sat, Closed Sunday)',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: 'Closed'
    }
  },
  'everyday-9-8': {
    label: '9 AM - 8 PM (Open All Days)',
    hours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 8:00 PM',
      saturday: '9:00 AM - 8:00 PM',
      sunday: '9:00 AM - 8:00 PM'
    }
  },
  'weekdays-10-7': {
    label: '10 AM - 7 PM (Mon-Sat, Closed Sunday)',
    hours: {
      monday: '10:00 AM - 7:00 PM',
      tuesday: '10:00 AM - 7:00 PM',
      wednesday: '10:00 AM - 7:00 PM',
      thursday: '10:00 AM - 7:00 PM',
      friday: '10:00 AM - 7:00 PM',
      saturday: '10:00 AM - 7:00 PM',
      sunday: 'Closed'
    }
  },
  'custom': {
    label: 'Custom Hours (Set manually)',
    hours: null
  }
};
