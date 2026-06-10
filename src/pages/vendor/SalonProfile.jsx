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

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VendorPageShell from '../../components/vendor/VendorPageShell';
import {
  FIGMA_PROFILE_BG,
  SalonProfilePageHeader,
  SalonProfileStatusCard,
  SalonProfileSection,
  SalonProfileSectionHeader,
  SalonProfileField,
  SalonProfileSaveButton,
  SalonProfileStatRow,
  inputClass,
  selectClass,
  textareaClass,
} from '../../components/vendor/profile/SalonProfileFigmaUI';
import { 
  useGetVendorSalonQuery, 
  useUpdateVendorSalonMutation 
} from '../../services/api/vendorApi';
import { FiEdit2, FiClock, FiImage, FiUpload, FiTrash2, FiNavigation, FiFileText } from 'react-icons/fi';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '../../utils/toastConfig';
import { SkeletonFormField } from '../../components/shared/Skeleton';
import { uploadSalonImage, uploadAgreementDocument, getAgreementDocumentSignedUrl } from '../../services/api/uploadApi';
import { INDIAN_STATES } from '../../utils/salonFormConstants';

const SalonProfile = () => {
  const { user } = useSelector((state) => state.auth);
  // RTK Query hooks for fetching and updating salon data
  const { data: salonData, isLoading: profileLoading } = useGetVendorSalonQuery();
  const [updateSalonProfile, { isLoading: isUpdating }] = useUpdateVendorSalonMutation();
  
  // Handle data structure variations from API response
  // Some endpoints return { salon: {...} }, others return data directly
  const salonProfile = salonData?.salon || salonData;
  
  // Edit mode toggle state
  const [isEditing, setIsEditing] = useState(false);
  
  // File input refs
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const agreementInputRef = useRef(null);
  
  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
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
    outlet: '',
    is_gst: false,
    latitude: '',
    longitude: '',
    logo_url: '',
    cover_images: [],
    agreement_document_url: '',
    opening_time: '',
    closing_time: '',
    working_days: [],
    business_hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
    facilities: {},
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
        outlet: salonProfile.outlet || '',
        is_gst: salonProfile.is_gst || false,
        latitude: salonProfile.latitude || '',
        longitude: salonProfile.longitude || '',
        logo_url: salonProfile.logo_url || '',
        cover_images: salonProfile.cover_images || [],
        agreement_document_url: salonProfile.agreement_document_url || '',
        opening_time: salonProfile.opening_time || '',
        closing_time: salonProfile.closing_time || '',
        working_days: salonProfile.working_days || [],
        business_hours: convertDbToBusinessHours(salonProfile),
        facilities: salonProfile.facilities || salonProfile.documents?.facilities || {},
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
      // Prepare data with proper formatting
      const dataToSend = {
        ...formData,
        // Include business_hours for detailed day-by-day schedule
        business_hours: formData.business_hours,
        // Ensure times are in HH:MM:SS format (backend expects time with seconds)
        opening_time: formData.opening_time ? (formData.opening_time.length === 5 ? `${formData.opening_time}:00` : formData.opening_time) : null,
        closing_time: formData.closing_time ? (formData.closing_time.length === 5 ? `${formData.closing_time}:00` : formData.closing_time) : null,
        // Convert string coordinates to numbers if present
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      console.log('Saving profile with data:', dataToSend);
      await updateSalonProfile(dataToSend).unwrap();
      showSuccessToast('Salon profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      showErrorToast(error?.data?.detail || error?.message || 'Failed to update profile');
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
        outlet: salonProfile.outlet || '',
        is_gst: salonProfile.is_gst || false,
        latitude: salonProfile.latitude || '',
        longitude: salonProfile.longitude || '',
        logo_url: salonProfile.logo_url || '',
        cover_images: salonProfile.cover_images || [],
        agreement_document_url: salonProfile.agreement_document_url || '',
        opening_time: salonProfile.opening_time || '',
        closing_time: salonProfile.closing_time || '',
        working_days: salonProfile.working_days || [],
        business_hours: convertDbToBusinessHours(salonProfile),
        facilities: salonProfile.facilities || salonProfile.documents?.facilities || {},
      });
    }
    setIsEditing(false);
  };

  /**
   * handleFetchLocation - Gets current location using browser Geolocation API
   */
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      showErrorToast('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(8);
        const lng = position.coords.longitude.toFixed(8);
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng,
        });
        showSuccessToast(`Location fetched: ${lat}, ${lng}`);
        setFetchingLocation(false);
      },
      (error) => {
        console.error('Error fetching location:', error);
        showErrorToast('Failed to fetch location. Please enable location permissions.');
        setFetchingLocation(false);
      }
    );
  };

  /**
   * handleLogoUpload - Uploads new logo image
   */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const url = await uploadSalonImage(file, 'logos');
      setFormData({ ...formData, logo_url: url });
      showSuccessToast('Logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload error:', error);
      showErrorToast('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  /**
   * handleCoverUpload - Uploads new cover image
   */
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingCover(true);
      const url = await uploadSalonImage(file, 'covers');
      // Cover image is the first in the array
      const newCoverImages = [url, ...(formData.cover_images || []).slice(1)];
      setFormData({ ...formData, cover_images: newCoverImages });
      showSuccessToast('Cover image uploaded successfully!');
    } catch (error) {
      console.error('Cover upload error:', error);
      showErrorToast('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  /**
   * handleGalleryUpload - Uploads new gallery images
   */
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showErrorToast('All files must be images');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Each image should be less than 5MB');
        return;
      }
    }

    try {
      setUploadingGallery(true);
      const uploadPromises = files.map(file => uploadSalonImage(file, 'gallery'));
      const urls = await Promise.all(uploadPromises);
      
      // Keep cover image (first item), add new gallery images
      const currentCover = formData.cover_images?.[0] || '';
      const existingGallery = formData.cover_images?.slice(1) || [];
      const newCoverImages = [currentCover, ...existingGallery, ...urls].filter(Boolean);
      
      setFormData({ ...formData, cover_images: newCoverImages });
      showSuccessToast(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Gallery upload error:', error);
      showErrorToast('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
    }
  };

  /**
   * handleDeleteGalleryImage - Removes a gallery image
   */
  const handleDeleteGalleryImage = (index) => {
    const actualIndex = index + 1; // Account for cover image at index 0
    const newCoverImages = formData.cover_images.filter((_, i) => i !== actualIndex);
    setFormData({ ...formData, cover_images: newCoverImages });
    showInfoToast('Image removed. Click Save to apply changes.');
  };

  /**
   * handleAgreementUpload - Uploads agreement document
   */
  const handleAgreementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (PDF or images)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showErrorToast('Please select a PDF or image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast('File size should be less than 10MB');
      return;
    }

    try {
      setUploadingAgreement(true);
      const path = await uploadAgreementDocument(file);
      setFormData({ ...formData, agreement_document_url: path });
      showSuccessToast('Agreement document uploaded successfully!');
    } catch (error) {
      console.error('Agreement upload error:', error);
      showErrorToast('Failed to upload agreement document');
    } finally {
      setUploadingAgreement(false);
    }
  };

  /**
   * handleViewAgreement - Opens agreement document in new tab
   */
  const handleViewAgreement = async () => {
    if (!formData.agreement_document_url) {
      showWarningToast('No agreement document available');
      return;
    }

    try {
      const signedUrl = await getAgreementDocumentSignedUrl(formData.agreement_document_url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      showErrorToast('Failed to open agreement document');
    }
  };

  // Loading state - show skeleton form while fetching profile data
  if (profileLoading && !salonProfile) {
    return (
      <DashboardLayout role={user?.role || "vendor"}>
        <VendorPageShell bgClass={FIGMA_PROFILE_BG}>
        <div className={`${FIGMA_PROFILE_BG} px-4 py-6 space-y-6`}>
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-48 rounded-lg bg-[#F3F3F3]" />
            <div className="h-4 w-64 rounded-lg bg-[#F3F3F3]" />
            <div className="h-20 rounded-2xl bg-[#DCFCE7]/60" />
            <div className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(34,26,17,0.06)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonFormField key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
        </VendorPageShell>
      </DashboardLayout>
    );
  }

  const isRegularBuyer = user?.role === 'regular_buyer';
  const profileTitle = isRegularBuyer ? 'Business Profile' : 'Salon Profile';
  const profileSubtitle = `Manage your ${isRegularBuyer ? 'business' : 'salon'} information and settings`;

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
    <DashboardLayout role={user?.role || "vendor"}>
      <VendorPageShell bgClass={FIGMA_PROFILE_BG}>
      <div className={`${FIGMA_PROFILE_BG} space-y-6 px-4 py-6 max-lg:min-h-[calc(100dvh-4rem)] lg:space-y-8`}>
        <SalonProfilePageHeader title={profileTitle} subtitle={profileSubtitle} />

        {salonProfile && (
          <SalonProfileStatusCard
            isActive={salonProfile.is_active}
            activeTitle={isRegularBuyer ? 'Account Active' : 'Active Status'}
            activeMessage={
              isRegularBuyer
                ? 'Your account is active and verified'
                : 'Your salon is visible to customers and accepting bookings'
            }
            inactiveTitle={isRegularBuyer ? 'Account Inactive' : 'Salon Inactive'}
            inactiveMessage={
              isRegularBuyer
                ? 'Complete payment to activate your account'
                : 'Complete payment to activate your salon'
            }
          />
        )}

        <SalonProfileSection>
          <SalonProfileSectionHeader
            title="Basic Information"
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            isUpdating={isUpdating}
          />

          <div className="space-y-5">
            <SalonProfileField label="Business Name">
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter business name"
                required
                className={inputClass}
              />
            </SalonProfileField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SalonProfileField label="Email (Linked to Account)">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  placeholder="contact@salon.com"
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </SalonProfileField>

              <SalonProfileField label="Phone">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+91 XXXXXXXXXX"
                  className={inputClass}
                />
              </SalonProfileField>
            </div>

            <SalonProfileField label="Website">
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://www.yoursalon.com"
                className={inputClass}
              />
            </SalonProfileField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SalonProfileField label="Outlet Type">
                <select
                  name="outlet"
                  value={formData.outlet || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={selectClass}
                >
                  <option value="">Select Outlet Type</option>
                  <option value="Company owned">Company Owned</option>
                  <option value="franchisee">Franchisee</option>
                </select>
              </SalonProfileField>
              <SalonProfileField label="Are you GST registered?">
                <select
                  name="is_gst"
                  value={formData.is_gst ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_gst: e.target.value === 'true' })}
                  disabled={!isEditing}
                  className={selectClass}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </SalonProfileField>
            </div>

            <SalonProfileField label="Address">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Complete address"
                className={inputClass}
              />
            </SalonProfileField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SalonProfileField label="City">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Mumbai"
                  className={inputClass}
                />
              </SalonProfileField>
              <SalonProfileField label="State">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={selectClass}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </SalonProfileField>
              <SalonProfileField label="Pincode">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="400001"
                  className={inputClass}
                />
              </SalonProfileField>
            </div>

            <SalonProfileField label="Location Coordinates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Latitude e.g. 28.4926"
                  className={inputClass}
                />
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Longitude e.g. 77.0920"
                  className={inputClass}
                />
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={fetchingLocation}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#F89E07] px-4 py-2 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6] disabled:opacity-50"
                >
                  <FiNavigation size={16} />
                  {fetchingLocation ? 'Fetching...' : 'Fetch My Location'}
                </button>
              )}
            </SalonProfileField>

            <SalonProfileField label="Default Opening & Closing Time">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                  aria-label="Opening time"
                />
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClass}
                  aria-label="Closing time"
                />
              </div>
            </SalonProfileField>

            <SalonProfileField label="Description">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className={textareaClass}
                placeholder="Tell customers about your salon..."
              />
            </SalonProfileField>
          </div>

          {isEditing && (
            <SalonProfileSaveButton
              onClick={handleSave}
              disabled={isUpdating}
              loading={isUpdating}
            />
          )}
        </SalonProfileSection>

        <SalonProfileSection title="Business Hours">
          <div className="flex items-center gap-2 mb-4 -mt-2">
            <FiClock className="text-[#F89E07]" size={20} />
            <p className="font-vendor text-sm text-[#7A7A7A]">Set hours for each day of the week</p>
          </div>
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
                    <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b border-[#F3F3F3] last:border-0">
                      <div className="w-full sm:w-28">
                        <span className="font-vendor text-sm font-semibold text-[#2C2C2C]">
                          {day.label}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {isClosed ? (
                          <div className="flex flex-1 items-center justify-between rounded-lg bg-[#F3F3F3] px-4 py-2">
                            <span className="font-vendor text-sm text-[#7A7A7A]">Closed</span>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, '9:00 AM - 6:00 PM')}
                                className="font-vendor text-xs font-semibold text-[#F89E07] hover:text-[#E08F06]"
                                aria-label={`Set hours for ${day.label}`}
                              >
                                Set Hours
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            <input
                              type="time"
                              value={convertTo24Hour(startTime12)}
                              onChange={(e) => {
                                const newStartTime = convertTo12Hour(e.target.value);
                                handleBusinessHoursChange(day.key, `${newStartTime} - ${endTime12}`);
                              }}
                              disabled={!isEditing}
                              className={`${inputClass} flex-1 sm:flex-none sm:w-36`}
                              aria-label={`Opening time for ${day.label}`}
                            />
                            <span className="font-vendor text-sm text-[#7A7A7A]">to</span>
                            <input
                              type="time"
                              value={convertTo24Hour(endTime12)}
                              onChange={(e) => {
                                const newEndTime = convertTo12Hour(e.target.value);
                                handleBusinessHoursChange(day.key, `${startTime12} - ${newEndTime}`);
                              }}
                              disabled={!isEditing}
                              className={`${inputClass} flex-1 sm:flex-none sm:w-36`}
                              aria-label={`Closing time for ${day.label}`}
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, 'Closed')}
                                className="whitespace-nowrap rounded-lg px-3 py-2 font-vendor text-sm font-medium text-red-600 hover:bg-red-50"
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
        </SalonProfileSection>

        <SalonProfileSection title="Facilities">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'air_conditioner', label: 'Air Conditioner' },
              { id: 'car_parking', label: 'Car Parking' },
              { id: 'free_wifi', label: 'Free WiFi' },
              { id: 'shower_facility', label: 'Shower Facility' },
              { id: 'steam_room', label: 'Steam Room' },
              { id: 'hygienic_environment', label: 'Hygienic environment' },
              { id: 'comfortable_seating', label: 'Comfortable seating' },
              { id: 'sanitized_tools', label: 'Sanitized Tools' },
            ].map((facility) => (
              <label
                key={facility.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                  formData.facilities?.[`facility_${facility.id}`]
                    ? 'border-[#F89E07] bg-[#FFF1E6]'
                    : 'border-[#F3F3F3] bg-[#FAFAFA]'
                } ${isEditing ? 'hover:border-[#F89E07]/50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!formData.facilities?.[`facility_${facility.id}`]}
                  onChange={(e) => {
                    if (isEditing) {
                      setFormData({
                        ...formData,
                        facilities: {
                          ...formData.facilities,
                          [`facility_${facility.id}`]: e.target.checked,
                        },
                      });
                    }
                  }}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-[#D4D4D4] text-[#F89E07] focus:ring-[#F89E07]"
                />
                <span className="font-vendor text-sm font-medium text-[#2C2C2C]">{facility.label}</span>
              </label>
            ))}
          </div>
        </SalonProfileSection>

        <SalonProfileSection title="Salon Images">
          <div className="mb-4">
            <SalonProfileField label="Cover Image">
                {formData.cover_images && formData.cover_images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={formData.cover_images[0]}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          ref={coverInputRef}
                          onChange={handleCoverUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button 
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Edit cover image"
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={uploadingCover}
                        >
                          {uploadingCover ? '...' : <FiEdit2 size={16} />}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    className={`flex h-32 w-full items-center justify-center rounded-xl bg-[#F3F3F3] ${isEditing ? 'cursor-pointer hover:bg-[#E8E8E8]' : ''}`}
                    onClick={() => isEditing && coverInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <FiImage className="mx-auto mb-2 text-3xl text-[#7A7A7A]" />
                      <p className="font-vendor text-sm text-[#7A7A7A]">No cover image</p>
                      {isEditing && <p className="mt-1 font-vendor text-xs text-[#7A7A7A]">Click to upload</p>}
                    </div>
                    {isEditing && (
                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    )}
                  </div>
                )}
            </SalonProfileField>
          </div>

          <div className="mb-4">
            <SalonProfileField label="Logo">
                {formData.logo_url ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button 
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Edit logo"
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? '...' : <FiEdit2 size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    className={`flex h-24 w-24 items-center justify-center rounded-xl bg-[#F3F3F3] ${isEditing ? 'cursor-pointer hover:bg-[#E8E8E8]' : ''}`}
                    onClick={() => isEditing && logoInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <FiImage className="text-2xl text-[#7A7A7A]" />
                      {isEditing && <p className="mt-1 font-vendor text-xs text-[#7A7A7A]">Upload</p>}
                    </div>
                    {isEditing && (
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    )}
                  </div>
                )}
            </SalonProfileField>
          </div>

          <SalonProfileField
            label={`Salon Gallery (${formData.cover_images?.length > 1 ? formData.cover_images.length - 1 : 0} images)`}
          >
                {formData.cover_images && formData.cover_images.length > 1 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {formData.cover_images.slice(1).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button 
                              className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
                              aria-label={`Delete gallery image ${index + 1}`}
                              type="button"
                              onClick={() => handleDeleteGalleryImage(index)}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-xl bg-[#F3F3F3]">
                    <div className="text-center">
                      <FiImage className="mx-auto mb-1 text-2xl text-[#7A7A7A]" />
                      <p className="font-vendor text-xs text-[#7A7A7A]">No images</p>
                    </div>
                  </div>
                )}
          </SalonProfileField>

          {isEditing && (
            <>
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F89E07] font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6] disabled:opacity-50"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
              >
                <FiUpload size={16} />
                {uploadingGallery ? 'Uploading...' : 'Add Gallery Images'}
              </button>
            </>
          )}
        </SalonProfileSection>

        <SalonProfileSection title="Agreement Document">
          {formData.agreement_document_url ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] p-3">
                <p className="font-vendor text-sm font-medium text-[#22C55E]">Document uploaded</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleViewAgreement}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F89E07] py-2.5 font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6]"
                >
                  <FiFileText size={16} />
                  View Document
                </button>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      ref={agreementInputRef}
                      onChange={handleAgreementUpload}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => agreementInputRef.current?.click()}
                      disabled={uploadingAgreement}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F3F3F3] bg-[#F3F3F3] py-2.5 font-vendor text-sm font-semibold text-[#2C2C2C] hover:bg-[#E8E8E8] disabled:opacity-50"
                    >
                      <FiUpload size={16} />
                      {uploadingAgreement ? 'Uploading...' : 'Replace'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 rounded-xl bg-[#F3F3F3] p-3">
                <p className="font-vendor text-sm text-[#7A7A7A]">No agreement document uploaded</p>
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={agreementInputRef}
                    onChange={handleAgreementUpload}
                    accept=".pdf,image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => agreementInputRef.current?.click()}
                    disabled={uploadingAgreement}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F89E07] font-vendor text-sm font-semibold text-[#F89E07] hover:bg-[#FFF1E6] disabled:opacity-50"
                  >
                    <FiUpload size={16} />
                    {uploadingAgreement ? 'Uploading...' : 'Upload Document'}
                  </button>
                </>
              )}
            </div>
          )}
        </SalonProfileSection>

        <SalonProfileSection title="Quick Stats">
          <SalonProfileStatRow
            label="Registration Status"
            value={salonProfile?.registration_fee_paid ? 'Paid' : 'Pending'}
            valueClassName={
              salonProfile?.registration_fee_paid ? 'text-[#22C55E]' : 'text-[#EAB308]'
            }
          />
          <SalonProfileStatRow
            label="Account Status"
            value={salonProfile?.is_active ? 'Active' : 'Inactive'}
            valueClassName={salonProfile?.is_active ? 'text-[#22C55E]' : 'text-red-600'}
          />
          <SalonProfileStatRow
            label="Member Since"
            value={
              salonProfile?.created_at
                ? new Date(salonProfile.created_at).toLocaleDateString('en-US')
                : 'N/A'
            }
          />
        </SalonProfileSection>
      </div>
      </VendorPageShell>
    </DashboardLayout>
  );
};

export default SalonProfile;
