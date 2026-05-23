/**
 * ServicesManagement Component
 * 
 * Purpose:
 * Comprehensive service management interface for vendors to create, edit, delete,
 * and toggle service availability. Central hub for managing salon service offerings.
 * 
 * Data Management:
 * - Fetches services via RTK Query (useGetVendorServicesQuery)
 * - Fetches categories via RTK Query (useGetServiceCategoriesQuery)
 * - CRUD operations via mutations (create, update, delete)
 * - Local state for form data, filters, and modal
 * 
 * Key Features:
 * - Service CRUD operations (Create, Read, Update, Delete)
 * - Real-time search filtering
 * - Status filtering (All, Active, Inactive)
 * - Quick toggle for service activation/deactivation
 * - Category assignment
 * - Responsive grid layout
 * - Empty state handling
 * 
 * Service Structure:
 * - name: Service name (required)
 * - description: Service details (optional)
 * - price: Cost in INR (0 for FREE)
 * - duration_minutes: Service duration (required)
 * - category_id: Associated category (optional)
 * - is_active: Availability status (boolean)
 * 
 * User Flow:
 * 1. View all services in grid layout
 * 2. Search/filter services by name, category, description
 * 3. Filter by active/inactive status
 * 4. Add new service via modal form
 * 5. Edit existing service (pre-fills form)
 * 6. Quick toggle service active status
 * 7. Delete service with confirmation
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VendorServiceCard from '../../components/vendor/services/VendorServiceCard';
import VendorConfigureService from '../../components/vendor/services/VendorConfigureService';
import VendorAddServiceWizard, {
  loadServiceWizardDraft,
} from '../../components/vendor/services/VendorAddServiceWizard';
import { clearServiceWizardDraft } from '../../components/vendor/services/serviceWizardDraft';
import {
  SERVICES_PAGE_BG,
  ServicesPageHeader,
  ServicesAddButton,
  ServicesSearchInput,
  ServicesGenderChip,
  ServicesStatusChip,
  ServicesCategoryHeading,
} from '../../components/vendor/services/ServicesManagementFigmaUI';
import {
  useGetVendorServicesQuery,
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useGetServiceCategoriesQuery,
} from '../../services/api/vendorApi';
import { FiShoppingBag } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';

const ServicesManagement = () => {
  // RTK Query hooks for fetching and mutating service data
  const { data: servicesData, isLoading: servicesLoading } = useGetVendorServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetServiceCategoriesQuery();
  const [createService, { isLoading: isCreating }] = useCreateVendorServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateVendorServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteVendorServiceMutation();
  
  const services = servicesData || [];
  const categories = categoriesData?.data || [];

  // Add wizard vs edit modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardDraft, setWizardDraft] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  /** Figma gender chips: all | male (Men) | female (Women) | both (Unisex) */
  const [genderFilter, setGenderFilter] = useState('all');

  // Form data state - represents service fields
  // Note: duration_minutes is the canonical field, but API may return 'duration' in some cases
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
    duration: '',
    category_id: '',
    subcategory_id: '',
    gender_category: 'both',
    is_active: true,
    image_url: '',
  });

  /**
   * handleOpenAdd - Opens 5-step wizard for new service (resumes local draft if present)
   */
  const handleOpenAdd = () => {
    const saved = loadServiceWizardDraft();
    if (saved) {
      const resume = window.confirm(
        'You have an unfinished service draft. Resume where you left off?'
      );
      if (resume) {
        setWizardDraft(saved);
        setIsWizardOpen(true);
        return;
      }
      clearServiceWizardDraft();
    }
    setWizardDraft(null);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setWizardDraft(null);
  };

  /**
   * handleOpenModal - Opens modal for editing a service (single-page configure)
   * @param {Object|null} service - Service to edit
   */
  const handleOpenModal = (service = null) => {
    if (service) {
      // Edit mode - pre-fill form with service data
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        discount_percentage:
          service.discount_percentage !== null && service.discount_percentage !== undefined
            ? service.discount_percentage
            : '',
        // Handle API inconsistency: duration_minutes is canonical, but may receive 'duration'
        duration: service.duration_minutes || service.duration || '',
        category_id: service.category_id || (categories.length > 0 ? categories[0].id : ''),
        subcategory_id: service.subcategory_id || '',
        gender_category: service.gender_category || 'both',
        is_active: service.is_active !== undefined ? service.is_active : true,
        image_url: service.image_url || '',
      });
      setIsModalOpen(true);
    }
  };

  /**
   * handleCloseModal - Closes modal and resets form state
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_percentage: '',
      duration: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      subcategory_id: '',
      gender_category: 'both',
      is_active: true,
      image_url: '',
    });
  };

  /**
   * handleChange - Updates form field values
   * Handles both regular inputs and checkboxes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'category_id') {
        updated.subcategory_id = '';
      }
      return updated;
    });
  };

  /**
   * handleSubmit - Validates and submits service data
   * Creates new service or updates existing one
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      showErrorToast('Service name is required');
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      showErrorToast('Duration must be greater than 0');
      return;
    }
    if (!formData.price || formData.price === '') {
      showErrorToast('Price is required (use 0 for FREE services)');
      return;
    }
    if (parseFloat(formData.price) < 0) {
      showErrorToast('Price cannot be negative');
      return;
    }

    if (formData.discount_percentage !== '' && formData.discount_percentage !== null) {
      const discountValue = parseFloat(formData.discount_percentage);
      if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        showErrorToast('Discount must be between 0 and 100');
        return;
      }
      if (parseFloat(formData.price) <= 0 && discountValue > 0) {
        showErrorToast('Discount can only be applied when price is greater than 0');
        return;
      }
    }

    try {
      // Prepare service data for API
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        discount_percentage:
          formData.discount_percentage === '' || parseFloat(formData.discount_percentage) === 0
            ? null
            : parseFloat(formData.discount_percentage),
        duration_minutes: parseInt(formData.duration),
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        gender_category: formData.gender_category,
        is_active: formData.is_active,
        image_url: formData.image_url || null,
      };

      if (editingService) {
        await updateService({ serviceId: editingService.id, ...serviceData }).unwrap();
        showSuccessToast('Service updated successfully!');
      } else {
        await createService(serviceData).unwrap();
        showSuccessToast('Service created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      showErrorToast(error?.message || 'Failed to save service');
    }
  };

  /**
   * handleToggleActive - Toggles service active/inactive status
   * Updates service with all existing data plus new is_active value
   */
  const handleToggleActive = async (service) => {
    try {
      await updateService({
        serviceId: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        discount_percentage: service.discount_percentage,
        // Handle API inconsistency: duration_minutes is canonical
        duration_minutes: service.duration_minutes || service.duration,
        category_id: service.category_id,
        subcategory_id: service.subcategory_id || null,
        gender_category: service.gender_category,
        is_active: !service.is_active,
        image_url: service.image_url || null,
      }).unwrap();
      showSuccessToast(`Service ${!service.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showErrorToast(error?.message || 'Failed to update service status');
    }
  };

  /**
   * handleDelete - Deletes service after confirmation
   * Uses window.confirm for now - TODO: Replace with Modal for better UX
   */
  const handleDelete = async (serviceId) => {
    // TODO: Replace window.confirm with custom Modal component for better accessibility
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(serviceId).unwrap();
      showSuccessToast('Service deleted successfully!');
    } catch (error) {
      showErrorToast(error?.message || 'Failed to delete service');
    }
  };

  /**
   * Filter services based on search term and active status
   * Memoized to prevent recalculation on every render
   */
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter - matches name, category, or description
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter - all, active only, or inactive only
      const matchesActive =
        filterActive === 'all' ||
        (filterActive === 'active' && service.is_active) ||
        (filterActive === 'inactive' && !service.is_active);

      const matchesGender =
        genderFilter === 'all' ||
        (service.gender_category || 'both') === genderFilter;

      return matchesSearch && matchesActive && matchesGender;
    });
  }, [services, searchTerm, filterActive, genderFilter]);

  const groupedServices = useMemo(() => {
    const resolveCategoryName = (service) => {
      if (service.category) return service.category;
      const cat = categories.find((c) => c.id === service.category_id);
      if (cat?.name) return cat.name;
      if (service.subcategory_id) {
        for (const c of categories) {
          const sub = c.subcategories?.find((s) => s.id === service.subcategory_id);
          if (sub?.name) return sub.name;
        }
      }
      return 'Other Services';
    };

    const groups = {};
    filteredServices.forEach((service) => {
      const key = resolveCategoryName(service);
      if (!groups[key]) groups[key] = [];
      groups[key].push(service);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredServices, categories]);

  return (
    <DashboardLayout role="vendor">
      <div className={`${SERVICES_PAGE_BG} px-4 py-6 lg:px-0 max-w-4xl mx-auto space-y-5`}>
        <ServicesPageHeader
          title="Services Management"
          subtitle="Manage your salon services and pricing"
        />

        <ServicesAddButton onClick={handleOpenAdd} />

        <div className="space-y-4 rounded-2xl bg-white/60 p-4 shadow-[0_2px_12px_rgba(34,26,17,0.04)]">
          <ServicesSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
            <ServicesGenderChip
              active={genderFilter === 'male'}
              onClick={() => setGenderFilter(genderFilter === 'male' ? 'all' : 'male')}
            >
              Men
            </ServicesGenderChip>
            <ServicesGenderChip
              active={genderFilter === 'female'}
              onClick={() => setGenderFilter(genderFilter === 'female' ? 'all' : 'female')}
            >
              Women
            </ServicesGenderChip>
            <ServicesGenderChip
              active={genderFilter === 'both'}
              onClick={() => setGenderFilter(genderFilter === 'both' ? 'all' : 'both')}
            >
              Unisex
            </ServicesGenderChip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ServicesStatusChip
              active={filterActive === 'all'}
              onClick={() => setFilterActive('all')}
            >
              All
            </ServicesStatusChip>
            <ServicesStatusChip
              active={filterActive === 'active'}
              onClick={() => setFilterActive('active')}
            >
              Active
            </ServicesStatusChip>
            <ServicesStatusChip
              active={filterActive === 'inactive'}
              onClick={() => setFilterActive('inactive')}
            >
              Inactive
            </ServicesStatusChip>
          </div>
        </div>

        {servicesLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F89E07] border-t-transparent" />
              <p className="font-vendor text-[#4B5563]">Loading services...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-[0_4px_24px_rgba(34,26,17,0.06)]">
            <FiShoppingBag className="mx-auto mb-4 text-6xl text-[#EAE0D3]" />
            <h3 className="mb-2 font-vendor text-xl font-bold text-[#111827]">
              {searchTerm || filterActive !== 'all' || genderFilter !== 'all'
                ? 'No services found'
                : 'No services yet'}
            </h3>
            <p className="mb-6 font-vendor text-sm text-[#4B5563]">
              {searchTerm || filterActive !== 'all' || genderFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first service'}
            </p>
            {!searchTerm && filterActive === 'all' && genderFilter === 'all' && (
              <ServicesAddButton onClick={handleOpenAdd} label="Add Your First Service" />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedServices.map(([categoryName, categoryServices]) => (
              <section key={categoryName} className="space-y-3">
                <ServicesCategoryHeading>
                  {categoryName.toUpperCase()}
                </ServicesCategoryHeading>
                <div className="space-y-4">
                  {categoryServices.map((service) => (
                    <VendorServiceCard
                      key={service.id}
                      service={service}
                      onEdit={handleOpenModal}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      isToggling={isUpdating}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <VendorAddServiceWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        categories={categories}
        categoriesLoading={categoriesLoading}
        initialDraft={wizardDraft}
      />

      <VendorConfigureService
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingService={editingService}
        formData={formData}
        handleChange={handleChange}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        categories={categories}
        categoriesLoading={categoriesLoading}
        isSaving={isCreating || isUpdating}
      />
    </DashboardLayout>
  );
};

export default ServicesManagement;
