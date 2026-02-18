import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import InputField from '../../components/shared/InputField';
import Button from '../../components/shared/Button';
import { SkeletonFormField } from '../../components/shared/Skeleton';
import { 
  useSubmitVendorRequestMutation, 
  useUpdateVendorRequestMutation,
  useGetVendorRequestByIdQuery,
  useGetServiceCategoriesQuery
} from '../../services/api/rmApi';
import { uploadSalonImage, uploadAgreementDocument, getAgreementDocumentSignedUrl } from '../../services/api/uploadApi';
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } from '../../utils/toastConfig';
import { 
  INDIAN_STATES, 
  BUSINESS_HOURS_PRESETS,
  BUSINESS_TYPES
} from '../../utils/salonFormConstants';
import { FiUpload, FiMapPin, FiChevronLeft, FiChevronRight, FiCheck, FiPlus, FiTrash2, FiInfo, FiImage } from 'react-icons/fi';

/**
 * AddSalonForm Component
 * 
 * Purpose:
 * Multi-step form for Relationship Managers (HMR) to add or edit salon submissions.
 * Handles complete salon onboarding process including business details, services,
 * images, and review before submission. Supports draft saving and editing existing drafts.
 * 
 * Data Management:
 * - Form state via react-hook-form
 * - Images uploaded to Supabase storage
 * - Draft/submission via RTK Query (rmApi)
 * - Local state for services, images, and step navigation
 * - Automatic caching and refetching via RTK Query
 * 
 * Key Features:
 * - 4-step wizard (Basic Info → Services → Photos → Review)
 * - Draft auto-save functionality
 * - Image upload to Supabase (cover, logo, gallery)
 * - Service quick-add from common templates
 * - Business hours presets
 * - Form validation at each step
 * - Edit mode for existing drafts
 * - Optimistic UI updates with RTK Query
 * 
 * Security Notes:
 * - Supabase uploads use authenticated client (checks RLS policies)
 * - Image URLs are public but stored in secure buckets
 * - Draft data contains sensitive business info - ensure proper access control
 * 
 * User Flow:
 * 1. RM navigates to /hmr/add-salon or /hmr/edit-salon/:draftId
 * 2. Step 1: Enter business details (name, address, hours, description)
 * 3. Step 2: Add services (manual or quick-add from templates)
 * 4. Step 3: Upload images (cover required, logo/gallery optional)
 * 5. Step 4: Review all information
 * 6. Submit for approval or save as draft
 * 7. Navigate to dashboard or drafts page
 */

const AddSalonForm = () => {
  const { draftId } = useParams(); // Get draft ID from URL if editing
  
  // RTK Query hooks 
  const [submitVendorRequest, { isLoading: isSubmitting }] = useSubmitVendorRequestMutation();
  const [updateVendorRequest, { isLoading: isUpdating }] = useUpdateVendorRequestMutation();
  const { data: draftData, isLoading: loadingDraft } = useGetVendorRequestByIdQuery(draftId, {
    skip: !draftId, // Only fetch if draftId exists
  });
  const { data: categoriesData, isLoading: loadingCategories } = useGetServiceCategoriesQuery();
  
  // React Hook Form setup
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: {
      services: [{ name: '', category_id: '', price: '', duration_minutes: '' }]
    }
  });

  // Navigation
  const navigate = useNavigate();

  // Redux state (only auth)
  const { user } = useSelector((state) => state.auth);

  // Get service categories from API
  const serviceCategories = categoriesData?.data || [];

  // UI State (wizard steps and selections)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHoursPreset, setSelectedHoursPreset] = useState('weekdays-9-6');
  
  // Form data state (data being built before submission)
  const [services, setServices] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [agreementDocument, setAgreementDocument] = useState(null);
  
  // Upload progress state
  const [uploading, setUploading] = useState(false);
  
  // Location state
  const [gettingLocation, setGettingLocation] = useState(false);

  // Edit mode derived from URL param
  const isEditMode = Boolean(draftId);

  const totalSteps = 4;

  // Load draft data if editing
  useEffect(() => {
    if (draftId && draftData && serviceCategories.length > 0) { // FIX: Wait for categories to load
      // Populate form with draft data
      const draft = draftData;
      const documents = draft.documents || {};
      
      // Basic info
      reset({
        name: draft.business_name || '',
        business_type: draft.business_type || 'salon',
        owner_name: draft.owner_name || '',
        owner_email: draft.owner_email || '',
        owner_phone: draft.owner_phone || '',
        email: documents.email || draft.owner_email || '',
        phone: documents.phone || draft.owner_phone || '',
        address_line1: draft.business_address?.split(',')[0] || '',
        address_line2: draft.business_address?.split(',')[1]?.trim() || '',
        city: draft.city || '',
        state: draft.state || '',
        pincode: draft.pincode || '',
        description: documents.description || '',
        // Location coordinates
        latitude: draft.latitude || '',
        longitude: draft.longitude || '',
        // Business hours
        monday: documents.business_hours?.monday || '9:00 AM - 6:00 PM',
        tuesday: documents.business_hours?.tuesday || '9:00 AM - 6:00 PM',
        wednesday: documents.business_hours?.wednesday || '9:00 AM - 6:00 PM',
        thursday: documents.business_hours?.thursday || '9:00 AM - 6:00 PM',
        friday: documents.business_hours?.friday || '9:00 AM - 6:00 PM',
        saturday: documents.business_hours?.saturday || '9:00 AM - 6:00 PM',
        sunday: documents.business_hours?.sunday || 'Closed',
      });
      
      // Services - check both new and old format
      let loadedServices = [];
      
      // FIX: Try documents.services first (most reliable)
      if (documents.services && documents.services.length > 0) {
        // Services already have category_id
        loadedServices = documents.services;
        console.log('✅ Loaded services from documents.services (with category_id)');
      } else if (draft.services_offered) {
        // New format: services_offered is a JSONB object with categories (category name as key)
        console.log('⚠️ Loading services from services_offered (requires category lookup)');
        Object.entries(draft.services_offered).forEach(([categoryName, serviceList]) => {
          if (Array.isArray(serviceList)) {
            // Find category ID by name
            const categoryObj = serviceCategories.find(cat => cat.name === categoryName);
            const categoryId = categoryObj ? categoryObj.id : null;
            
            if (!categoryId) {
              console.error(`❌ Could not find category_id for category: ${categoryName}`);
            }
            
            serviceList.forEach(service => {
              loadedServices.push({
                name: service.name || '',
                category_id: categoryId, // Use category_id, not category
                price: service.price || '',
                duration_minutes: service.duration_minutes || 30,
                description: service.description || ''
              });
            });
          }
        });
      }
      
      console.log('=== SERVICE LOADING DEBUG ===');
      console.log('Draft Services Offered:', draft.services_offered);
      console.log('Document Services:', documents.services);
      console.log('Loaded Services:', loadedServices);
      console.log('Services with category_id:', loadedServices.filter(s => s.category_id).length);
      console.log('Services WITHOUT category_id:', loadedServices.filter(s => !s.category_id).length);
      console.log('Service Categories Available:', serviceCategories.length);
      console.log('============================');
      
      if (loadedServices.length > 0) {
        setServices(loadedServices);
      }
      
      // Images
      if (draft.cover_image_url) {
        setCoverImage(draft.cover_image_url);
      } else if (documents.cover_image) {
        setCoverImage(documents.cover_image);
      }
      
      if (documents.logo) {
        setLogo(documents.logo);
      }
      
      // Load agreement document from draft
      if (draft.registration_certificate) {
        setAgreementDocument(draft.registration_certificate);
      }
      
      if (draft.gallery_images && draft.gallery_images.length > 0) {
        setUploadedImages(draft.gallery_images);
      } else if (documents.images && documents.images.length > 0) {
        setUploadedImages(documents.images);
      }
      
      // Business hours preset
      if (documents.business_hours) {
        setSelectedHoursPreset('custom');
      }
      
      // Use saved current step from draft (defaults to step 1 if not saved)
      const startStep = documents.current_step && typeof documents.current_step === 'number' 
        ? Math.min(Math.max(documents.current_step, 1), 4) // Cap between 1-4
        : 1; // Default to step 1 if not saved
      
      console.log('=== DRAFT LOADING DEBUG ===');
      console.log('Draft ID:', draftId);
      console.log('Saved Step:', documents.current_step);
      console.log('Starting at Step:', startStep);
      console.log('Business Name:', draft.business_name);
      console.log('Services:', loadedServices.length);
      console.log('Cover Image:', draft.cover_image_url || documents.cover_image ? 'yes' : 'no');
      console.log('==========================');
      
      setCurrentStep(startStep);
      showInfoToast(`Draft loaded. Starting from Step ${startStep}...`);
    }
  }, [draftId, draftData, serviceCategories, reset]); // FIX: Added serviceCategories to dependencies

  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(type); // Set uploading to specific type to show correct loading state
    try {
      if (type === 'cover') {
        const url = await uploadSalonImage(files[0], 'covers');
        setCoverImage(url);
        showSuccessToast('Cover image uploaded!');
      } else if (type === 'logo') {
        const url = await uploadSalonImage(files[0], 'logos');
        setLogo(url);
        showSuccessToast('Logo uploaded!');
      } else if (type === 'gallery') {
        const urls = await Promise.all(
          files.map(file => uploadSalonImage(file, 'gallery'))
        );
        setUploadedImages([...uploadedImages, ...urls]);
        showSuccessToast(`${files.length} image(s) uploaded!`);
      } else if (type === 'agreement') {
        const url = await uploadAgreementDocument(files[0]);
        setAgreementDocument(url);
        showSuccessToast('Agreement document uploaded!');
      }
    } catch (error) {
      console.error(`Upload error for ${type}:`, error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload image';
      showErrorToast(`${type} upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const addService = () => {
    setServices([...services, { name: '', category_id: '', price: '', duration_minutes: '', description: '' }]);
  };

  const removeService = (index) => {
    if (services.length === 1) {
      showWarningToast('At least one service is required!');
      return;
    }
    setServices(services.filter((_, i) => i !== index));
    showInfoToast('Service removed');
  };

  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  // Get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showErrorToast('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    showInfoToast('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
        const timestamp = new Date(position.timestamp).toLocaleString();
        
        // Console log all the details
        console.log('=== GEOLOCATION DATA ===');
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Accuracy:', accuracy, 'meters');
        console.log('Altitude:', altitude, 'meters');
        console.log('Altitude Accuracy:', altitudeAccuracy, 'meters');
        console.log('Heading:', heading, 'degrees');
        console.log('Speed:', speed, 'm/s');
        console.log('Timestamp:', timestamp);
        console.log('Full Position Object:', position);
        console.log('========================');
        
        // Set the latitude and longitude in the form
        setValue('latitude', latitude.toFixed(6));
        setValue('longitude', longitude.toFixed(6));
        
        setGettingLocation(false);
        showSuccessToast(`Location captured! Accuracy: ${Math.round(accuracy)}m`);
      },
      (error) => {
        setGettingLocation(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        
        showErrorToast(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const onSubmit = async (data, isDraft = false, submitForApproval = false) => {
    try {
      // Validate required fields only for final submission (not draft)
      if (!isDraft && !submitForApproval) {
        if (!agreementDocument) {
          showErrorToast('Agreement document is required for submission');
          setCurrentStep(1);
          return;
        }
        if (!coverImage) {
          showErrorToast('Cover image is required for submission');
          setCurrentStep(3);
          return;
        }
        if (services.length === 0 || !services.some(s => s.name && s.price)) {
          showErrorToast('At least one service is required for submission');
          setCurrentStep(2);
          return;
        }
      }

      // Helper: Parse business hours to get opening/closing times
      const parseBusinessHours = () => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const workingDays = [];
        let opening_time = null;
        let closing_time = null;
        
        // Helper to convert 12-hour to 24-hour format (HH:MM:SS)
        const convertTo24Hour = (time12h) => {
          if (!time12h || time12h === 'Closed') return null;
          
          // Handle edge cases
          const trimmed = time12h.trim();
          if (!trimmed.includes(' ')) return null; // No AM/PM
          
          const parts = trimmed.split(' ');
          if (parts.length !== 2) return null;
          
          const [time, period] = parts;
          if (!time.includes(':')) return null;
          
          const timeParts = time.split(':');
          if (timeParts.length < 2) return null;
          
          let hours = parseInt(timeParts[0]);
          let minutes = parseInt(timeParts[1]) || 0;
          
          if (isNaN(hours) || isNaN(minutes)) return null;
          
          if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
          
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        };
        
        days.forEach(day => {
          const hours = data[day];
          
          if (hours && hours !== 'Closed' && hours.trim() !== '') {
            // Add to working days (capitalize first letter)
            workingDays.push(day.charAt(0).toUpperCase() + day.slice(1));
            
            // Parse time range: "9:00 AM - 6:00 PM"
            if (hours.includes(' - ')) {
              const [open, close] = hours.split(' - ').map(t => t.trim());
              
              // Use first non-closed day's hours as representative times
              if (!opening_time) {
                opening_time = convertTo24Hour(open);
              }
              if (!closing_time) {
                closing_time = convertTo24Hour(close);
              }
            }
          }
        });
        
        return { opening_time, closing_time, working_days: workingDays };
      };
      
      const { opening_time, closing_time, working_days } = parseBusinessHours();
      
      // Helper: Convert services to array format for documents.services
      // Backend reads from documents.services and needs category_id
      const prepareServicesArray = () => {
        console.log('=== PREPARE SERVICES DEBUG ===');
        console.log('Services State:', services);
        console.log('Services with category_id:', services.filter(s => s.category_id));
        console.log('Services WITHOUT category_id:', services.filter(s => !s.category_id));
        console.log('Services filtered:', services.filter(s => s.name && s.price && s.category_id));
        console.log('=============================');
        
        // FIX: Warn user if services are missing category_id
        const servicesWithoutCategory = services.filter(s => s.name && s.price && !s.category_id);
        if (servicesWithoutCategory.length > 0) {
          const serviceNames = servicesWithoutCategory.map(s => s.name).join(', ');
          console.error(`⚠️ WARNING: ${servicesWithoutCategory.length} services missing category_id: ${serviceNames}`);
          showErrorToast(
            `⚠️ ${servicesWithoutCategory.length} service(s) are missing a category: ${serviceNames}. ` +
            `These services will NOT be visible to the vendor. Please select a category for each service.`
          );
        }
        
        return services
          .filter(s => s.name && s.price && s.category_id)
          .map(s => ({
            name: s.name,
            category_id: s.category_id,
            price: parseFloat(s.price),
            duration_minutes: parseInt(s.duration_minutes) || 30,
            description: s.description || '',
          }));
      };
      
      // Helper: Group services by category for services_offered JSONB column
      const groupServicesByCategory = () => {
        const servicesArray = prepareServicesArray();
        const grouped = {};
        
        servicesArray.forEach(service => {
          // Find category name from serviceCategories
          const category = serviceCategories.find(cat => cat.id === service.category_id);
          const categoryName = category ? category.name : 'Uncategorized';
          
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          
          grouped[categoryName].push({
            name: service.name,
            price: service.price,
            duration_minutes: service.duration_minutes,
            description: service.description
          });
        });
        
        return Object.keys(grouped).length > 0 ? grouped : null;
      };
      
      // Prepare vendor request data matching backend schema
      const vendorRequestData = {
        // Required fields
        business_name: data.name,
        business_type: data.business_type || 'salon',
        owner_name: data.owner_name || user?.name || user?.full_name || 'Owner',
        owner_email: data.owner_email || data.email,
        owner_phone: data.owner_phone || data.phone,
        business_address: `${data.address_line1}${data.address_line2 ? ', ' + data.address_line2 : ''}`,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        
        // Optional location coordinates - handle empty strings and numeric values
        latitude: data.latitude && typeof data.latitude === 'string' && data.latitude.trim() !== '' ? parseFloat(data.latitude) : (data.latitude && typeof data.latitude === 'number' ? data.latitude : null),
        longitude: data.longitude && typeof data.longitude === 'string' && data.longitude.trim() !== '' ? parseFloat(data.longitude) : (data.longitude && typeof data.longitude === 'number' ? data.longitude : null),
        
        // Legal
        gst_number: data.gst_number || null,
        pan_number: data.pan_number || null,
        business_license: data.business_license || null,
        registration_certificate: agreementDocument || null,  // Agreement document URL
        
        // Media fields (direct columns)
        cover_image_url: coverImage || null,
        gallery_images: uploadedImages.length > 0 ? uploadedImages : null,
        
        // Operations fields (direct columns) - BUSINESS HOURS FIX
        opening_time: opening_time,  // From parseBusinessHours()
        closing_time: closing_time,  // From parseBusinessHours()
        working_days: working_days.length > 0 ? working_days : null,  // From parseBusinessHours()
        
        // Services - Store in BOTH places for full compatibility
        services_offered: groupServicesByCategory(),  // Grouped by category for database column
        
        // Documents JSONB - Store services here for backend to read
        documents: {
          description: data.description || '',
          email: data.email,
          phone: data.phone,
          logo: logo || null,
          services: prepareServicesArray(),
          business_hours: {
            monday: data.monday || 'Closed',
            tuesday: data.tuesday || 'Closed',
            wednesday: data.wednesday || 'Closed',
            thursday: data.thursday || 'Closed',
            friday: data.friday || 'Closed',
            saturday: data.saturday || 'Closed',
            sunday: data.sunday || 'Closed',
          },
          // Save current step so we can resume from the right place
          current_step: currentStep,
          images: uploadedImages.length > 0 ? uploadedImages : null,
          cover_image: coverImage || null,
        },
      };

      // Console log the vendor request data including lat/long
      console.log('=== FORM SUBMISSION DATA ===');
      console.log('Business Name:', vendorRequestData.business_name);
      console.log('Latitude:', vendorRequestData.latitude);
      console.log('Longitude:', vendorRequestData.longitude);
      console.log('Full Address:', vendorRequestData.business_address);
      console.log('City:', vendorRequestData.city, 'State:', vendorRequestData.state);
      console.log('Full Vendor Request Data:', vendorRequestData);
      console.log('============================');

      // Update existing draft or create new using RTK Query mutations
      if (isEditMode && draftId) {
        await updateVendorRequest({ 
          requestId: draftId,
          requestData: vendorRequestData, 
          submitForApproval 
        }).unwrap();
        
        if (submitForApproval) {
          const isRejected = draftData?.status === 'rejected';
          showSuccessToast(
            isRejected 
              ? '✅ Salon resubmitted successfully! Admin will review your corrections.' 
              : '✅ Draft submitted for approval! You will be notified once reviewed.',
            { autoClose: 4000 }
          );
        } else {
          showSuccessToast(
            '💾 Draft updated successfully!',
            { autoClose: 3000 }
          );
        }
      } else {
        await submitVendorRequest({ 
          requestData: vendorRequestData, 
          isDraft 
        }).unwrap();
        
        if (isDraft) {
          showSuccessToast(
            '💾 Salon saved as draft! You can complete and submit it later.',
            { autoClose: 4000 }
          );
        } else {
          showSuccessToast(
            '✅ Salon submitted for approval! You will be notified once reviewed.',
            { autoClose: 4000 }
          );
        }
      }
      
      navigate(isEditMode ? '/hmr/drafts' : '/hmr/dashboard');
    } catch (error) {
      // Handle validation errors from backend (RTK Query error format)
      if (error.data?.detail) {
        const detail = error.data.detail;
        
        // If detail is an array of validation errors
        if (Array.isArray(detail)) {
          // Find which step the error belongs to and navigate there
          const fieldToStep = {
            'business_name': 1, 'business_type': 1, 'owner_name': 1, 'owner_email': 1,
            'owner_phone': 1, 'business_address': 1, 'address_line1': 1, 'city': 1, 
            'state': 1, 'pincode': 1, 'description': 1,
            'services': 2, 'services_offered': 2,
            'cover_image_url': 3, 'cover_image': 3
          };
          
          let firstErrorStep = 4;
          const errorMessages = detail.map(err => {
            const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Unknown field';
            const stepNum = fieldToStep[field];
            if (stepNum && stepNum < firstErrorStep) {
              firstErrorStep = stepNum;
            }
            
            // Make error messages more user-friendly
            let message = err.msg;
            if (message.includes('at least 10')) {
              message = 'Address must be at least 10 characters. Please provide a complete street address.';
            }
            
            return `• ${field}: ${message}`;
          }).join('\n');
          
          // Navigate to the step with the error
          if (firstErrorStep < 4) {
            setCurrentStep(firstErrorStep);
            showErrorToast(
              `Please fix the following errors in Step ${firstErrorStep}:\n${errorMessages}`,
              { autoClose: 10000 }
            );
          } else {
            showErrorToast(`Validation errors:\n${errorMessages}`, { autoClose: 8000 });
          }
        } else {
          showErrorToast(detail);
        }
      } else {
        showErrorToast(error.message || 'Failed to submit salon. Please check all fields and try again.');
      }
    }
  };


  const nextStep = () => {
    // Get all current form values from react-hook-form (no need for separate formData state)
    const allValues = watch();
    
    // Validation for step 1
    if (currentStep === 1) {
      const requiredFields = {
        'Business Name': allValues.name,
        'Business Type': allValues.business_type,
        'Owner Name': allValues.owner_name,
        'Owner Email': allValues.owner_email,
        'Owner Phone': allValues.owner_phone,
        'Salon Email': allValues.email,
        'Salon Phone': allValues.phone,
        'Address': allValues.address_line1,
        'City': allValues.city,
        'State': allValues.state,
        'Pincode': allValues.pincode,
        'Description': allValues.description
      };
      
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([field, _]) => field);
      
      if (missingFields.length > 0) {
        showErrorToast(`Please fill: ${missingFields.join(', ')}`);
        return;
      }
      
      if (!agreementDocument) {
        showErrorToast('Please upload the agreement document before proceeding');
        return;
      }
      
      if (allValues.description && allValues.description.length < 50) {
        showErrorToast('Description must be at least 50 characters');
        return;
      }
      
      // Validate address length
      if (allValues.address_line1 && allValues.address_line1.length < 10) {
        showErrorToast('Address Line 1 must be at least 10 characters. Please provide a complete address.');
        return;
      }
    }
    
    if (currentStep === 2 && services.length === 0) {
      showWarningToast('Please add at least one service before proceeding');
      return;
    }
    
    // FIX: Validate that all services have category_id
    if (currentStep === 2 && services.length > 0) {
      const servicesWithoutCategory = services.filter(s => s.name && !s.category_id);
      if (servicesWithoutCategory.length > 0) {
        const serviceNames = servicesWithoutCategory.map(s => s.name || 'Unnamed').slice(0, 3).join(', ');
        const moreCount = servicesWithoutCategory.length > 3 ? ` and ${servicesWithoutCategory.length - 3} more` : '';
        showErrorToast(
          `⚠️ Please select a category for all services! ` +
          `${servicesWithoutCategory.length} service(s) missing category: ${serviceNames}${moreCount}. ` +
          `Services without categories WILL NOT appear for the vendor!`
        );
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-2">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center flex-1 max-w-[80px]">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-body font-semibold transition-all text-sm sm:text-base ${
                currentStep >= step
                  ? 'bg-accent-orange text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step ? <FiCheck size={16} className="sm:w-5 sm:h-5" /> : step}
            </div>
            <span className="text-xs font-body mt-2 text-gray-600 text-center hidden sm:block">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Services'}
              {step === 3 && 'Photos'}
              {step === 4 && 'Review'}
            </span>
            <span className="text-xs font-body mt-1 text-gray-600 text-center sm:hidden">
              {step === 1 && 'Info'}
              {step === 2 && 'Services'}
              {step === 3 && 'Photos'}
              {step === 4 && 'Review'}
            </span>
          </div>
          {step < 4 && (
            <div
              className={`h-1 flex-1 mx-1 sm:mx-2 transition-all ${
                currentStep > step ? 'bg-accent-orange' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Show loading state while fetching draft
  if (loadingDraft) {
    return (
      <DashboardLayout role="hmr">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="animate-pulse mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          <Card>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonFormField key={i} />
              ))}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="hmr">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">
              {isEditMode ? (draftData?.status === 'rejected' ? 'Edit & Resubmit Rejected Salon' : 'Edit Draft Salon') : 'Add New Salon'}
            </h1>
            <p className="text-gray-600 font-body">
              {isEditMode ? (draftData?.status === 'rejected' ? 'Fix the issues and resubmit for approval' : 'Continue editing your draft or submit for approval') : 'Submit a new salon for approval'}
            </p>
          </div>
        </div>

        {/* Rejection Notice */}
        {draftData?.status === 'rejected' && draftData?.admin_notes && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Rejection Reason from Admin</h3>
                <p className="text-sm text-red-700">{draftData.admin_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {renderStepIndicator()}

        <form 
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            // Only submit if on last step and explicitly triggered
          }}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form
            if (e.key === 'Enter' && e.target.type !== 'textarea') {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card title="Basic Information">
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800 font-body">
                    <p className="font-semibold mb-1">Tips for filling this form:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Enter accurate salon information</li>
                      <li>Use valid 10-digit mobile numbers (starting with 6-9)</li>
                      <li>Provide complete address with at least 10 characters (include shop number, building, street)</li>
                      <li>Description should be detailed (minimum 50 characters)</li>
                      <li>All fields marked with <span className="text-red-500">*</span> are required</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Salon Name"
                  {...register('name', { required: 'Salon name is required' })}
                  error={errors.name?.message}
                  placeholder="e.g., Glamour Beauty Salon"
                  required
                />

                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('business_type', { required: 'Business type is required' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  >
                    <option value="">Select Business Type</option>
                    {BUSINESS_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.business_type && (
                    <p className="mt-1 text-sm text-red-600 font-body">{errors.business_type.message}</p>
                  )}
                </div>

                <InputField
                  label="Owner Name"
                  {...register('owner_name', { required: 'Owner name is required' })}
                  error={errors.owner_name?.message}
                  placeholder="e.g., John Doe"
                  required
                />

                <InputField
                  label="Owner Email"
                  type="email"
                  {...register('owner_email', { 
                    required: 'Owner email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.owner_email?.message}
                  placeholder="owner@example.com"
                  required
                />

                <InputField
                  label="Owner Phone"
                  type="tel"
                  {...register('owner_phone', { 
                    required: 'Owner phone is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter valid 10-digit mobile number'
                    }
                  })}
                  error={errors.owner_phone?.message}
                  placeholder="9876543210"
                  required
                />

                <InputField
                  label="Salon Email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.email?.message}
                  placeholder="salon@example.com"
                  helperText="This email will receive account creation and login credentials"
                  required
                />

                <InputField
                  label="Salon Phone"
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter valid 10-digit mobile number'
                    }
                  })}
                  error={errors.phone?.message}
                  placeholder="9876543210"
                  required
                />

                <InputField
                  label="City"
                  {...register('city', { required: 'City is required' })}
                  error={errors.city?.message}
                  placeholder="e.g., Mumbai"
                  required
                />

                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('state', { required: 'State is required' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 font-body">{errors.state.message}</p>
                  )}
                </div>

                <InputField
                  label="Pincode"
                  {...register('pincode', { 
                    required: 'Pincode is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Enter valid 6-digit pincode'
                    }
                  })}
                  error={errors.pincode?.message}
                  placeholder="400001"
                  required
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiMapPin />
                    </div>
                    <input
                      {...register('address_line1', { 
                        required: 'Address is required',
                        minLength: {
                          value: 10,
                          message: 'Address must be at least 10 characters for clarity'
                        }
                      })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                      placeholder="e.g., Shop No. 5, ABC Complex, Main Road"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {errors.address_line1 && (
                      <p className="text-sm text-red-600 font-body">{errors.address_line1.message}</p>
                    )}
                    <p className={`text-xs ml-auto ${
                      (watch('address_line1')?.length || 0) < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {watch('address_line1')?.length || 0}/10 characters
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="Address Line 2"
                    {...register('address_line2')}
                    placeholder="Near XYZ Mall (Optional)"
                  />
                </div>

                {/* Latitude and Longitude Section */}
                <div className="md:col-span-2">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-body font-semibold text-gray-900 flex items-center">
                        <FiMapPin className="mr-2 text-blue-600" />
                        Location Coordinates (Optional)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseMyLocation}
                        disabled={gettingLocation}
                        className="bg-white hover:bg-blue-50 border-blue-300"
                      >
                        {gettingLocation ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <FiMapPin className="mr-2" size={16} />
                            Use My Location
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Latitude"
                        type="text"
                        {...register('latitude', {
                          pattern: {
                            value: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})?$/,
                            message: 'Invalid latitude format'
                          }
                        })}
                        error={errors.latitude?.message}
                        placeholder="e.g., 19.076090"
                        helperText="Range: -90 to 90"
                      />
                      
                      <InputField
                        label="Longitude"
                        type="text"
                        {...register('longitude', {
                          pattern: {
                            value: /^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,10})?$/,
                            message: 'Invalid longitude format'
                          }
                        })}
                        error={errors.longitude?.message}
                        placeholder="e.g., 72.877426"
                        helperText="Range: -180 to 180"
                      />
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600 bg-white p-3 rounded border border-blue-100">
                      <p className="flex items-start">
                        <FiInfo className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" size={14} />
                        <span>
                          Click "Use My Location" to automatically capture your current coordinates, 
                          or enter them manually. Check browser console for detailed location data.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: {
                        value: 50,
                        message: 'Description must be at least 50 characters'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent min-h-[120px]"
                    placeholder="Describe your salon's services, ambiance, expertise, and what makes it special. Include information about trained staff, premium products used, and customer experience..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-600 font-body">{errors.description.message}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {watch('description')?.length || 0} / 500 characters
                    </p>
                  </div>
                </div>

                {/* Agreement Document Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                    Agreement Document <span className="text-red-500">*</span>
                  </label>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start mb-3">
                      <FiInfo className="text-purple-500 mt-1 mr-3 flex-shrink-0" size={18} />
                      <div className="text-xs text-purple-800 font-body">
                        <p className="font-semibold mb-1">Upload salon agreement document</p>
                        <p>Accepted formats: PDF, JPEG, PNG, WebP (Max 10MB)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="agreement-upload"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleImageUpload(e, 'agreement')}
                        disabled={uploading === 'agreement'}
                      />
                      
                      <label
                        htmlFor="agreement-upload"
                        className={`flex items-center px-4 py-2 bg-white border border-purple-300 rounded-lg font-body text-sm cursor-pointer hover:bg-purple-50 transition-colors ${
                          uploading === 'agreement' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading === 'agreement' ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUpload className="mr-2" size={16} />
                            Choose File
                          </>
                        )}
                      </label>
                      
                      {agreementDocument && (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <a
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const signedUrl = await getAgreementDocumentSignedUrl(agreementDocument);
                                window.open(signedUrl, '_blank', 'noopener,noreferrer');
                              } catch (error) {
                                console.error('Failed to get signed URL:', error);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors truncate cursor-pointer"
                          >
                            <FiCheck className="flex-shrink-0" size={16} />
                            <span className="truncate">Document Uploaded</span>
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAgreementDocument(null);
                              showInfoToast('Agreement document removed');
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-display font-semibold text-gray-900 mb-3">Business Hours</h3>
                  
                  {/* Preset Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                      Choose a schedule preset
                    </label>
                    <select
                      value={selectedHoursPreset}
                      onChange={(e) => {
                        const preset = e.target.value;
                        setSelectedHoursPreset(preset);
                        
                        // Auto-fill hours if not custom
                        if (preset !== 'custom' && BUSINESS_HOURS_PRESETS[preset].hours) {
                          Object.entries(BUSINESS_HOURS_PRESETS[preset].hours).forEach(([day, hours]) => {
                            setValue(day, hours);
                          });
                          showSuccessToast('Business hours applied!');
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    >
                      {Object.entries(BUSINESS_HOURS_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Manual Hours (show if custom selected) */}
                  {selectedHoursPreset === 'custom' && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-body mb-3">
                        Set custom hours for each day using the time picker
                      </p>
                      <div className="space-y-3">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                          const dayValue = watch(day) || '';
                          const isClosed = dayValue.toLowerCase() === 'closed' || dayValue === '';
                          
                          // Parse existing value if it exists (e.g., "9:00 AM - 8:00 PM")
                          let openTime = '09:00';
                          let closeTime = '18:00';
                          
                          if (dayValue && !isClosed) {
                            const match = dayValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                            if (match) {
                              let [, openHour, openMin, openAmPm, closeHour, closeMin, closeAmPm] = match;
                              
                              // Convert to 24-hour format
                              openHour = parseInt(openHour);
                              closeHour = parseInt(closeHour);
                              
                              if (openAmPm && openAmPm.toUpperCase() === 'PM' && openHour !== 12) openHour += 12;
                              if (openAmPm && openAmPm.toUpperCase() === 'AM' && openHour === 12) openHour = 0;
                              if (closeAmPm && closeAmPm.toUpperCase() === 'PM' && closeHour !== 12) closeHour += 12;
                              if (closeAmPm && closeAmPm.toUpperCase() === 'AM' && closeHour === 12) closeHour = 0;
                              
                              openTime = `${String(openHour).padStart(2, '0')}:${openMin}`;
                              closeTime = `${String(closeHour).padStart(2, '0')}:${closeMin}`;
                            }
                          }
                          
                          const updateDayHours = (open, close, closed) => {
                            if (closed) {
                              setValue(day, 'Closed');
                            } else {
                              // Convert 24-hour to 12-hour format for display
                              const formatTime = (time24) => {
                                const [hours, minutes] = time24.split(':').map(Number);
                                const period = hours >= 12 ? 'PM' : 'AM';
                                const hours12 = hours % 12 || 12;
                                return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
                              };
                              
                              setValue(day, `${formatTime(open)} - ${formatTime(close)}`);
                            }
                          };
                          
                          return (
                            <div key={day} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-sm font-body font-semibold text-gray-700 capitalize w-24">{day}</span>
                              
                              {!isClosed ? (
                                <>
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="time"
                                      value={openTime}
                                      onChange={(e) => updateDayHours(e.target.value, closeTime, false)}
                                      className="px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                      type="time"
                                      value={closeTime}
                                      onChange={(e) => updateDayHours(openTime, e.target.value, false)}
                                      className="px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => updateDayHours(openTime, closeTime, true)}
                                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                  >
                                    Closed
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 text-sm text-gray-500 italic">Closed</span>
                                  <button
                                    type="button"
                                    onClick={() => updateDayHours('09:00', '18:00', false)}
                                    className="px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                                  >
                                    Open
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Preview of selected hours */}
                  {selectedHoursPreset !== 'custom' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-body text-green-800">
                        ✓ <strong>Applied:</strong> {BUSINESS_HOURS_PRESETS[selectedHoursPreset].label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <Card title="Services Offered">
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800 font-body">
                    <p className="font-semibold mb-1">Add Salon Services</p>
                    <p className="text-xs mb-2">Add services offered by the salon. Make sure to select the correct category for each service from the dropdown.</p>
                    <p className="text-xs font-semibold text-red-700 bg-red-100 p-2 rounded mt-2">
                      ⚠️ IMPORTANT: Services without a selected category will NOT be transferred to the vendor account and will be LOST!
                    </p>
                  </div>
                </div>
              </div>

              {/* Added Services List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-body font-semibold text-gray-900">
                    Salon Services ({services.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addService}
                  >
                    <FiPlus className="mr-1" size={16} />
                    Add Custom Service
                  </Button>
                </div>

                {services.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FiPlus className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600 font-body mb-2">No services added yet</p>
                    <p className="text-sm text-gray-500 font-body">
                      Use quick add above or click "Add Custom Service"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-block px-3 py-1 bg-accent-orange/10 text-accent-orange text-xs font-semibold rounded-full">
                            Service #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Remove service"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-body font-medium text-gray-700 mb-1">
                              Service Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Haircut, Facial"
                              value={service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-body font-medium text-gray-700 mb-1">
                              Category <span className="text-red-500">*</span>
                              {!service.category_id && (
                                <span className="ml-2 text-xs text-red-600 font-semibold">⚠️ Required for migration!</span>
                              )}
                            </label>
                            <select
                              value={service.category_id || ''}
                              onChange={(e) => updateService(index, 'category_id', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                                !service.category_id ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            >
                              <option value="">⚠️ Select category (REQUIRED)</option>
                              {serviceCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            {!service.category_id && service.name && (
                              <p className="mt-1 text-xs text-red-600">
                                This service will be SKIPPED if no category is selected!
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs font-body font-medium text-gray-700 mb-1">
                              Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 500"
                              value={service.price}
                              onChange={(e) => updateService(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-body font-medium text-gray-700 mb-1">
                              Duration (minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              placeholder="e.g., 30"
                              value={service.duration_minutes}
                              onChange={(e) => updateService(index, 'duration_minutes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                              min="5"
                              step="5"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-body font-medium text-gray-700 mb-1">
                              Description (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Brief description of the service"
                              value={service.description || ''}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <Card title="Salon Photos">
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800 font-body">
                    <p className="font-semibold mb-1">Photo Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Cover image should showcase your salon's best features (Required)</li>
                      <li>Logo should be clear with transparent background (Optional)</li>
                      <li>Gallery images can include interiors, services, and ambiance (3-10 recommended)</li>
                      <li>Use high-quality images (min 800x600px, max 5MB each)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-base font-body font-semibold text-gray-900 mb-3">
                    <FiImage className="inline mr-2" />
                    Cover Image <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-gray-600 ml-2">(Main salon image)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-accent-orange transition-all">
                    {coverImage ? (
                      <div className="relative group">
                        <img 
                          src={coverImage} 
                          alt="Cover" 
                          className="w-full h-64 object-cover" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setCoverImage(null)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center"
                          >
                            <FiTrash2 className="mr-2" size={16} />
                            Remove
                          </button>
                        </div>
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Uploaded
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-white">
                        <FiUpload className="mx-auto text-gray-400 mb-4" size={56} />
                        <p className="text-base text-gray-700 mb-2 font-body font-semibold">
                          Click to upload cover image
                        </p>
                        <p className="text-sm text-gray-500 mb-4 font-body">
                          PNG, JPG or JPEG (max 5MB)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'cover')}
                          className="hidden"
                          id="cover-upload"
                          disabled={uploading}
                        />
                        <label htmlFor="cover-upload">
                          <Button 
                            type="button" 
                            variant="primary" 
                            onClick={() => document.getElementById('cover-upload').click()}
                            disabled={uploading}
                          >
                            {uploading ? 'Uploading...' : 'Choose File'}
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-base font-body font-semibold text-gray-900 mb-3">
                    <FiImage className="inline mr-2" />
                    Logo <span className="text-sm font-normal text-gray-600 ml-2">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-accent-orange transition-all">
                    {logo ? (
                      <div className="relative inline-block group">
                        <img 
                          src={logo} 
                          alt="Logo" 
                          className="w-40 h-40 object-contain rounded-lg border-2 border-gray-200" 
                        />
                        <button
                          type="button"
                          onClick={() => setLogo(null)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        <div className="mt-2 text-sm text-green-600 font-semibold">✓ Uploaded</div>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-sm text-gray-600 mb-3 font-body">
                          Upload your salon logo
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                          id="logo-upload"
                          disabled={uploading}
                        />
                        <label htmlFor="logo-upload">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('logo-upload').click()}
                            disabled={uploading}
                          >
                            {uploading ? 'Uploading...' : 'Choose File'}
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-base font-body font-semibold text-gray-900 mb-3">
                    <FiImage className="inline mr-2" />
                    Gallery Images <span className="text-sm font-normal text-gray-600 ml-2">(Multiple images)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent-orange transition-all">
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Gallery ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" 
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <FiTrash2 size={14} />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-center">
                      {uploadedImages.length === 0 ? (
                        <>
                          <FiImage className="mx-auto text-gray-400 mb-3" size={48} />
                          <p className="text-sm text-gray-600 mb-3 font-body">
                            No images uploaded yet
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700 mb-3 font-body font-semibold">
                          {uploadedImages.length} image(s) uploaded
                        </p>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                        className="hidden"
                        id="gallery-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="gallery-upload">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full md:w-auto" 
                          onClick={() => document.getElementById('gallery-upload').click()}
                          disabled={uploading}
                        >
                          <FiPlus className="mr-2" />
                          {uploading ? 'Uploading...' : uploadedImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                        </Button>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-body mt-2">
                    💡 Tip: Upload 5-10 high-quality images showing different areas and services of your salon
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card title="Review & Submit">
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-start">
                  <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                  <div className="text-sm text-green-800 font-body">
                    <p className="font-semibold mb-1">Almost Done!</p>
                    <p className="text-xs">Review all the information below. You can go back to edit or save as draft.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="border-l-4 border-accent-orange pl-4">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-accent-orange text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                    Basic Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3 font-body text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Salon Name</p>
                        <p className="font-semibold text-gray-900">{watch('name') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Business Type</p>
                        <p className="font-semibold text-gray-900">
                          {BUSINESS_TYPES.find(t => t.value === watch('business_type'))?.label || watch('business_type') || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Owner Name</p>
                        <p className="font-semibold text-gray-900">{watch('owner_name') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Owner Email</p>
                        <p className="font-semibold text-gray-900">{watch('owner_email') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Owner Phone</p>
                        <p className="font-semibold text-gray-900">{watch('owner_phone') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Salon Email</p>
                        <p className="font-semibold text-gray-900">{watch('email') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Salon Phone</p>
                        <p className="font-semibold text-gray-900">{watch('phone') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">City</p>
                        <p className="font-semibold text-gray-900">{watch('city') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">State</p>
                        <p className="font-semibold text-gray-900">{watch('state') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Pincode</p>
                        <p className="font-semibold text-gray-900">{watch('pincode') || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Full Address</p>
                      <p className="font-semibold text-gray-900">
                        {watch('address_line1')}{watch('address_line2') && `, ${watch('address_line2')}`}
                        {', '}{watch('city')}, {watch('state')} - {watch('pincode')}
                      </p>
                    </div>
                    {(watch('latitude') || watch('longitude')) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-gray-600 text-xs mb-1 flex items-center">
                            <FiMapPin className="mr-1" size={12} />
                            Latitude
                          </p>
                          <p className="font-semibold text-blue-600">{watch('latitude') || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1 flex items-center">
                            <FiMapPin className="mr-1" size={12} />
                            Longitude
                          </p>
                          <p className="font-semibold text-blue-600">{watch('longitude') || '-'}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Description</p>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {watch('description') || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">⏰</span>
                    Business Hours
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-body text-sm">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <span className="font-semibold text-gray-700 capitalize">{day}</span>
                          <span className="text-gray-900">{watch(day) || 'Closed'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                    Services ({services.filter(s => s.name && s.price).length})
                  </h3>
                  {services.filter(s => s.name && s.price).length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm font-body">
                      ⚠️ No services added. Please go back to add at least one service.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {services.filter(s => s.name && s.price).map((service, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900 font-body">{service.name}</span>
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  {service.category}
                                </span>
                              </div>
                              {service.description && (
                                <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                              )}
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span>💰 ₹{service.price}</span>
                                <span>⏱️ {service.duration_minutes || service.duration} mins</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photos */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-pink-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                    Photos
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-body text-sm">
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        {coverImage ? (
                          <div>
                            <FiCheck className="text-green-500 mx-auto mb-2" size={24} />
                            <p className="text-green-600 font-semibold">Cover Image</p>
                            <p className="text-xs text-gray-600 mt-1">✓ Uploaded</p>
                          </div>
                        ) : (
                          <div>
                            <FiImage className="text-red-400 mx-auto mb-2" size={24} />
                            <p className="text-red-600 font-semibold">Cover Image</p>
                            <p className="text-xs text-gray-600 mt-1">✗ Required</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        {logo ? (
                          <div>
                            <FiCheck className="text-green-500 mx-auto mb-2" size={24} />
                            <p className="text-green-600 font-semibold">Logo</p>
                            <p className="text-xs text-gray-600 mt-1">✓ Uploaded</p>
                          </div>
                        ) : (
                          <div>
                            <FiImage className="text-gray-400 mx-auto mb-2" size={24} />
                            <p className="text-gray-600 font-semibold">Logo</p>
                            <p className="text-xs text-gray-600 mt-1">Optional</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <FiImage className={`mx-auto mb-2 ${uploadedImages.length > 0 ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                        <p className={`font-semibold ${uploadedImages.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          Gallery
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {uploadedImages.length > 0 ? `${uploadedImages.length} image(s)` : 'No images'}
                        </p>
                      </div>
                    </div>

                    {/* Preview Images */}
                    {(coverImage || uploadedImages.length > 0) && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {coverImage && (
                            <div className="relative">
                              <img src={coverImage} alt="Cover" className="w-full h-20 object-cover rounded-lg border-2 border-accent-orange" />
                              <span className="absolute top-1 left-1 bg-accent-orange text-white px-2 py-0.5 rounded text-xs font-semibold">
                                Cover
                              </span>
                            </div>
                          )}
                          {uploadedImages.slice(0, 7).map((url, idx) => (
                            <img 
                              key={idx} 
                              src={url} 
                              alt={`Gallery ${idx + 1}`} 
                              className="w-full h-20 object-cover rounded-lg border border-gray-200" 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agreement Document */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">📄</span>
                    Agreement Document
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {agreementDocument ? (
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FiCheck className="text-green-600" size={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-green-700 text-sm">Document Uploaded</p>
                            <p className="text-xs text-gray-600 mt-1">Agreement document is attached</p>
                          </div>
                        </div>
                        <a
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              const signedUrl = await getAgreementDocumentSignedUrl(agreementDocument);
                              window.open(signedUrl, '_blank', 'noopener,noreferrer');
                            } catch (error) {
                              console.error('Failed to get signed URL:', error);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <FiImage size={16} />
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm font-body flex items-center gap-2">
                        <FiInfo className="flex-shrink-0" size={20} />
                        <span>⚠️ No agreement document uploaded. Please go back to Step 1 to upload the document.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Checklist */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-display font-bold text-gray-900 mb-4 flex items-center">
                    <FiCheck className="text-green-600 mr-2" size={20} />
                    Submission Checklist
                  </h4>
                  <div className="space-y-2 font-body text-sm">
                    <div className={`flex items-center gap-2 ${watch('name') && watch('business_type') && watch('owner_name') && watch('owner_email') && watch('owner_phone') && watch('email') && watch('phone') ? 'text-green-700' : 'text-gray-600'}`}>
                      {watch('name') && watch('business_type') && watch('owner_name') && watch('owner_email') && watch('owner_phone') && watch('email') && watch('phone') ? (
                        <FiCheck className="text-green-600" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      )}
                      <span>Basic information filled (including owner details)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${services.filter(s => s.name && s.price).length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                      {services.filter(s => s.name && s.price).length > 0 ? (
                        <FiCheck className="text-green-600" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      )}
                      <span>At least one service added ({services.filter(s => s.name && s.price).length} services)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${coverImage ? 'text-green-700' : 'text-gray-600'}`}>
                      {coverImage ? (
                        <FiCheck className="text-green-600" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      )}
                      <span>Cover image uploaded</span>
                    </div>
                    <div className={`flex items-center gap-2 ${agreementDocument ? 'text-green-700' : 'text-gray-600'}`}>
                      {agreementDocument ? (
                        <FiCheck className="text-green-600" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                      )}
                      <span>Agreement document uploaded</span>
                    </div>
                    <div className={`flex items-center gap-2 ${uploadedImages.length >= 3 ? 'text-green-700' : 'text-yellow-700'}`}>
                      {uploadedImages.length >= 3 ? (
                        <FiCheck className="text-green-600" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                      )}
                      <span>Gallery images ({uploadedImages.length}/3+ recommended)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-6 border-t border-gray-200">
            <div className="order-2 sm:order-1">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="w-full sm:w-auto justify-center">
                  <FiChevronLeft className="mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              {/* Save as Draft or Update Draft - Available on ALL steps */}
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit((data) => onSubmit(data, true, false))();
                }}
                disabled={isSubmitting || isUpdating}
                className="border border-gray-300 w-full sm:w-auto justify-center"
              >
                💾 {isEditMode ? 'Update Draft' : 'Save as Draft'}
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" variant="primary" onClick={nextStep} className="w-full sm:w-auto justify-center">
                  Next Step
                  <FiChevronRight className="ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit((data) => onSubmit(data, false, isEditMode))();
                  }}
                  disabled={isSubmitting || isUpdating || !coverImage}
                  className="bg-gradient-orange w-full sm:w-auto justify-center"
                >
                  {isSubmitting || isUpdating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      {isEditMode ? (draftData?.status === 'rejected' ? 'Resubmit for Approval' : 'Submit Draft for Approval') : 'Submit for Approval'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddSalonForm;
