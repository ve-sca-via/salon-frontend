/**
 * SalonProfile Component
 * 
 * Purpose:
 * Allows vendors to view and edit their salon profile information including basic details,
 * business hours, images, and settings. Central hub for managing salon presence on the platform.
 * 
 * Data Management:
 * - Fetches salon data via RTK Query (useGetVendorSalonQuery)
 * - Updates via mutation (useUpdateVendorSalonMutation)
 * - Local state for edit mode and form data
 * 
 * Key Features:
 * - Edit mode toggle for profile updates
 * - Business hours management with 12h/24h conversion
 * - Status indicators (active/inactive, payment status)
 * - Image management (logo, cover, gallery) - TODO: Upload functionality
 * - Responsive layout with sidebar stats
 * 
 * Business Hours:
 * - Stored in 12-hour format (e.g., "9:00 AM - 6:00 PM")
 * - Converted to 24-hour for time inputs
 * - Supports "Closed" state for any day
 * 
 * User Flow:
 * 1. View salon profile in read-only mode
 * 2. Click "Edit Profile" to enable editing
 * 3. Modify fields and business hours
 * 4. Save changes or cancel to revert
 * 5. View status indicators and quick stats
 */

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { 
  useGetVendorSalonQuery, 
  useUpdateVendorSalonMutation 
} from '../../services/api/vendorApi';
import { FiEdit2, FiSave, FiX, FiMapPin, FiPhone, FiMail, FiClock, FiImage } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';

const SalonProfile = () => {
  // RTK Query hooks for fetching and updating salon data
  const { data: salonData, isLoading: profileLoading } = useGetVendorSalonQuery();
  const [updateSalonProfile, { isLoading: isUpdating }] = useUpdateVendorSalonMutation();
  
  // Handle data structure variations from API response
  // Some endpoints return { salon: {...} }, others return data directly
  const salonProfile = salonData?.salon || salonData;
  
  // Edit mode toggle state
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data state - synced with salon profile from API
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    logo_url: '',
    cover_images: [],
    business_hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
  });

  /**
   * Helper: Convert database format to business_hours object
   * Database has: opening_time, closing_time, working_days array
   * UI needs: { monday: "9:00 AM - 6:00 PM", tuesday: "Closed", ... }
   */
  const convertDbToBusinessHours = (salon) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const businessHours = {};
    
    // If business_hours JSONB exists, use it directly (new format)
    if (salon.business_hours && typeof salon.business_hours === 'object') {
      return salon.business_hours;
    }
    
    // Otherwise, convert from opening_time/closing_time/working_days (legacy format)
    if (salon.opening_time && salon.closing_time) {
      // Convert 24-hour to 12-hour format
      const formatTime = (time24) => {
        if (!time24) return '';
        const [hours24, minutes] = time24.split(':').map(Number);
        const period = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      };
      
      const openTime = formatTime(salon.opening_time);
      const closeTime = formatTime(salon.closing_time);
      const hoursStr = `${openTime} - ${closeTime}`;
      
      // Set hours for working days, "Closed" for others
      const workingDays = (salon.working_days || []).map(d => d.toLowerCase());
      
      days.forEach(day => {
        businessHours[day] = workingDays.includes(day) ? hoursStr : 'Closed';
      });
    } else {
      // No data, set all to empty
      days.forEach(day => {
        businessHours[day] = '';
      });
    }
    
    return businessHours;
  };

  /**
   * Sync form data with salon profile when it loads or changes
   */
  useEffect(() => {
    if (salonProfile) {
      setFormData({
        business_name: salonProfile.business_name || '',
        email: salonProfile.email || '',
        phone: salonProfile.phone || '',
        website: salonProfile.website || '',
        address: salonProfile.address || '',
        city: salonProfile.city || '',
        state: salonProfile.state || '',
        pincode: salonProfile.pincode || '',
        description: salonProfile.description || '',
        logo_url: salonProfile.logo_url || '',
        cover_images: salonProfile.cover_images || [],
        business_hours: convertDbToBusinessHours(salonProfile),
      });
    }
  }, [salonProfile]);

  /**
   * convertTo24Hour - Converts 12-hour time format to 24-hour format
   * Used for HTML time inputs which require 24-hour format
   * @param {string} time12h - Time in 12-hour format (e.g., "9:00 AM")
   * @returns {string} Time in 24-hour format (e.g., "09:00")
   */
  const convertTo24Hour = (time12h) => {
    if (!time12h || time12h === 'Closed') return '';
    
    // Parse 12-hour format using regex
    const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return ''; // Invalid format
    
    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  /**
   * convertTo12Hour - Converts 24-hour time format to 12-hour format
   * Used to display user-friendly times and store in database
   * @param {string} time24h - Time in 24-hour format (e.g., "09:00")
   * @returns {string} Time in 12-hour format (e.g., "9:00 AM")
   */
  const convertTo12Hour = (time24h) => {
    if (!time24h) return '';
    
    const [hours24, minutes] = time24h.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  /**
   * handleChange - Updates form field values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * handleBusinessHoursChange - Updates business hours for a specific day
   * @param {string} day - Day of week (e.g., "monday")
   * @param {string} value - Time range or "Closed" (e.g., "9:00 AM - 6:00 PM")
   */
  const handleBusinessHoursChange = (day, value) => {
    setFormData({
      ...formData,
      business_hours: {
        ...formData.business_hours,
        [day]: value,
      },
    });
  };

  /**
   * handleSave - Submits updated profile data to backend
   * Disables edit mode on success
   */
  const handleSave = async () => {
    try {
      await updateSalonProfile(formData).unwrap();
      showSuccessToast('Salon profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showErrorToast(error?.message || 'Failed to update profile');
    }
  };

  /**
   * handleCancel - Reverts form data to original profile values
   * Exits edit mode without saving
   */
  const handleCancel = () => {
    if (salonProfile) {
      setFormData({
        business_name: salonProfile.business_name || '',
        email: salonProfile.email || '',
        phone: salonProfile.phone || '',
        website: salonProfile.website || '',
        address: salonProfile.address || '',
        city: salonProfile.city || '',
        state: salonProfile.state || '',
        pincode: salonProfile.pincode || '',
        description: salonProfile.description || '',
        logo_url: salonProfile.logo_url || '',
        cover_images: salonProfile.cover_images || [],
        business_hours: salonProfile.business_hours || {},
      });
    }
    setIsEditing(false);
  };

  // Loading state - show spinner while fetching profile data
  if (profileLoading && !salonProfile) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading salon profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Days of week for business hours section
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Salon Profile</h1>
            <p className="text-gray-600 font-body mt-1">Manage your salon information and settings</p>
          </div>
        </div>

        {/* Status Banner */}
        {salonProfile && (
          <div
            className={`rounded-lg p-4 ${
              salonProfile.is_active
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`text-sm font-body font-semibold ${
                    salonProfile.is_active ? 'text-green-900' : 'text-yellow-900'
                  }`}
                >
                  {salonProfile.is_active ? 'Salon Active' : 'Salon Inactive'}
                </h3>
                <p
                  className={`text-sm font-body ${
                    salonProfile.is_active ? 'text-green-700' : 'text-yellow-700'
                  }`}
                >
                  {salonProfile.is_active
                    ? 'Your salon is visible to customers and accepting bookings'
                    : 'Complete payment to activate your salon'}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  salonProfile.is_active ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-gray-900">Basic Information</h2>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-accent-orange hover:bg-orange-50"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-gray-600 hover:bg-gray-100"
                      disabled={isUpdating}
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={isUpdating}
                    >
                      <FiSave className="mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <InputField
                  label="Business Name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  icon={<FiMapPin />}
                  disabled={!isEditing}
                  placeholder="Enter business name"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<FiMail />}
                    disabled={!isEditing}
                    placeholder="contact@salon.com"
                  />

                  <InputField
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={<FiPhone />}
                    disabled={!isEditing}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>

                <InputField
                  label="Website (Optional)"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  icon={<FiMapPin />}
                  disabled={!isEditing}
                  placeholder="https://www.yoursalon.com"
                />

                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  icon={<FiMapPin />}
                  disabled={!isEditing}
                  placeholder="Complete address"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Mumbai"
                  />

                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Maharashtra"
                  />

                  <InputField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="400001"
                  />
                </div>

                <div>
                  <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent disabled:bg-gray-50 font-body"
                    placeholder="Tell customers about your salon..."
                  />
                </div>
              </div>
            </Card>

            {/* Business Hours Card */}
            <Card className="mt-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <FiClock className="mr-2 text-accent-orange" />
                Business Hours
              </h2>
              <div className="space-y-3">
                {days.map((day) => {
                  const dayHours = formData.business_hours[day.key] || '';
                  const isClosed = dayHours === 'Closed';
                  
                  // Parse business hours with fallback to default times
                  // Format expected: "9:00 AM - 6:00 PM" or "Closed"
                  let startTime12 = '9:00 AM';
                  let endTime12 = '6:00 PM';
                  
                  if (!isClosed && dayHours && dayHours.includes(' - ')) {
                    const times = dayHours.split(' - ');
                    if (times.length === 2) {
                      startTime12 = times[0];
                      endTime12 = times[1];
                    }
                  }
                  
                  return (
                    <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="w-full sm:w-28">
                        <span className="text-sm font-body font-semibold text-gray-700">
                          {day.label}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {isClosed ? (
                          <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-body">Closed</span>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, '9:00 AM - 6:00 PM')}
                                className="text-xs text-accent-orange hover:text-orange-700 font-body"
                                aria-label={`Set hours for ${day.label}`}
                              >
                                Set Hours
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={convertTo24Hour(startTime12)}
                              onChange={(e) => {
                                const newStartTime = convertTo12Hour(e.target.value);
                                handleBusinessHoursChange(day.key, `${newStartTime} - ${endTime12}`);
                              }}
                              disabled={!isEditing}
                              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent disabled:bg-gray-50 font-body text-sm"
                              aria-label={`Opening time for ${day.label}`}
                            />
                            <span className="text-gray-600 text-sm">to</span>
                            <input
                              type="time"
                              value={convertTo24Hour(endTime12)}
                              onChange={(e) => {
                                const newEndTime = convertTo12Hour(e.target.value);
                                handleBusinessHoursChange(day.key, `${startTime12} - ${newEndTime}`);
                              }}
                              disabled={!isEditing}
                              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent disabled:bg-gray-50 font-body text-sm"
                              aria-label={`Closing time for ${day.label}`}
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, 'Closed')}
                                className="px-3 py-2 text-sm font-body text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Closed
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images Card */}
            <Card>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center">
                <FiImage className="mr-2 text-accent-orange" />
                Salon Images
              </h3>
              
              {/* Cover Image */}
              <div className="mb-4">
                <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                  Cover Image
                </label>
                {salonProfile?.cover_images && salonProfile.cover_images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={salonProfile.cover_images[0]}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {/* TODO: Implement image upload functionality */}
                    {isEditing && (
                      <button 
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        aria-label="Edit cover image"
                        type="button"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FiImage className="text-gray-400 text-3xl mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-body">No cover image</p>
                      {isEditing && <p className="text-xs text-gray-500 font-body mt-1">Click to upload</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="mb-4">
                <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                  Logo
                </label>
                {salonProfile?.logo_url ? (
                  <div className="relative inline-block">
                    <img
                      src={salonProfile.logo_url}
                      alt="Logo"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {/* TODO: Implement image upload functionality */}
                    {isEditing && (
                      <button 
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        aria-label="Edit logo"
                        type="button"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FiImage className="text-gray-400 text-2xl" />
                      {isEditing && <p className="text-xs text-gray-500 font-body mt-1">Upload</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                  Salon Gallery ({salonProfile?.cover_images?.length > 1 ? salonProfile.cover_images.length - 1 : 0} images)
                </label>
                {salonProfile?.cover_images && salonProfile.cover_images.length > 1 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {salonProfile.cover_images.slice(1).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {/* TODO: Implement image deletion functionality */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button 
                              className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
                              aria-label={`Delete gallery image ${index + 1}`}
                              type="button"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FiImage className="text-gray-400 text-2xl mx-auto mb-1" />
                      <p className="text-xs text-gray-600 font-body">No images</p>
                    </div>
                  </div>
                )}
              </div>

              {/* TODO: Implement image upload functionality */}
              {isEditing && (
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Upload Images
                </Button>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-body">Registration Status</span>
                  <span
                    className={`text-sm font-body font-semibold ${
                      salonProfile?.registration_fee_paid ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {salonProfile?.registration_fee_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-body">Account Status</span>
                  <span
                    className={`text-sm font-body font-semibold ${
                      salonProfile?.is_active ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {salonProfile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-body">Member Since</span>
                  <span className="text-sm text-gray-900 font-body">
                    {salonProfile?.created_at
                      ? new Date(salonProfile.created_at).toLocaleDateString('en-US')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalonProfile;
