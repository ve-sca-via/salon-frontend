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
 * - Real-time search filtering (matches name, description and catalog path)
 * - Status filtering (All, Active, Inactive)
 * - Quick toggle for service activation/deactivation
 * - Catalog-aware browsing: category chips, dependent subcategory chips, and
 *   collapsible Category → Subcategory sections
 * - Responsive grid layout
 * - Empty state handling
 *
 * Taxonomy note:
 * A service stores `category_id` plus a single `subcategory_id` that holds the
 * DEEPEST node picked (level-2 subcategory OR level-3 sub-type). The names are
 * not returned by the services endpoint, so every label here is resolved
 * client-side against the cached category tree — see ./serviceTaxonomy.
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
import VendorPageShell from '../../components/vendor/VendorPageShell';
import {
  SERVICES_PAGE_BG,
  ServicesPageHeader,
  ServicesAddButton,
  ServicesSearchInput,
  ServicesSegmentedControl,
  ServicesTaxonomyChip,
  ServicesCategorySectionHeader,
  ServicesSubcategoryHeading,
} from '../../components/vendor/services/ServicesManagementFigmaUI';
import {
  buildTaxonomyIndex,
  resolveServiceTaxonomy,
  groupServicesByTaxonomy,
  taxonomySearchText,
} from '../../components/vendor/services/serviceTaxonomy';
import {
  useGetVendorServicesQuery,
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useGetServiceCategoriesQuery,
} from '../../services/api/vendorApi';
import { FiShoppingBag } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';

/** Each segmented control owns one filter dimension and always has a value. */
const GENDER_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'both', label: 'Unisex' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ServicesManagement = () => {
  // RTK Query hooks for fetching and mutating service data
  const { data: servicesData, isLoading: servicesLoading } = useGetVendorServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetServiceCategoriesQuery();
  const [createService, { isLoading: isCreating }] = useCreateVendorServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateVendorServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteVendorServiceMutation();
  
  // Stable identities: the `|| []` fallbacks would otherwise be a fresh array on
  // every render and invalidate the taxonomy/grouping memos below.
  const services = useMemo(() => servicesData || [], [servicesData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);

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
  /** Taxonomy filters: 'all' or a category id / subcategory id from the catalog tree */
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  /** Category ids whose section is collapsed in the list */
  const [collapsedCategories, setCollapsedCategories] = useState(() => new Set());

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
    sub_subcategory_id: '',
    custom_sub_subcategory_name: '',
    gender_category: 'both',
    is_active: true,
    image_url: '',
  });

  /**
   * Flattened catalog tree — category / subcategory / sub-type lookups by id.
   * Services only store the deepest node id, so every label on this page is
   * resolved through this index.
   */
  const taxonomyIndex = useMemo(() => buildTaxonomyIndex(categories), [categories]);

  /** Each service paired with its resolved taxonomy path, resolved once. */
  const servicesWithTaxonomy = useMemo(
    () =>
      services.map((service) => ({
        service,
        taxonomy: resolveServiceTaxonomy(service, taxonomyIndex),
      })),
    [services, taxonomyIndex]
  );

  /**
   * handleOpenAdd - Opens the 4-step add-services wizard.
   *
   * Services are saved as they are added, so a stored draft only remembers which
   * category/subcategory the vendor was working through — offer to jump back there.
   */
  const handleOpenAdd = () => {
    const saved = loadServiceWizardDraft();
    if (saved) {
      const resume = window.confirm(
        saved.contextLabel
          ? `Continue adding services under "${saved.contextLabel}"?`
          : 'Continue adding services where you left off?'
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
      // The edit form needs level-2 and level-3 as separate dropdown values.
      const taxonomy = resolveServiceTaxonomy(service, taxonomyIndex);
      const subcategory_id = taxonomy.subcategoryId || '';
      const sub_subcategory_id = taxonomy.subSubcategoryId || '';
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
        // Prefer the category that actually owns the stored subcategory, so the
        // subcategory dropdown has the right options to pre-select from.
        category_id:
          taxonomy.categoryId || service.category_id || (categories.length > 0 ? categories[0].id : ''),
        subcategory_id,
        sub_subcategory_id,
        custom_sub_subcategory_name: '',
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
      sub_subcategory_id: '',
      custom_sub_subcategory_name: '',
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
        sub_subcategory_id: formData.sub_subcategory_id || null,
        // A typed sub-type name is get-or-created under the chosen subcategory.
        sub_subcategory_name: formData.custom_sub_subcategory_name?.trim() || undefined,
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
   * Services matching everything EXCEPT the taxonomy filters. The category and
   * subcategory chips are counted against this set so their counts reflect the
   * search/status/gender filters without a chip zeroing out its own count.
   */
  const searchableServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return servicesWithTaxonomy.filter(({ service, taxonomy }) => {
      // Search matches name, description, and the full catalog path
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query)) ||
        taxonomySearchText(taxonomy).includes(query);

      // Status filter - all, active only, or inactive only
      const matchesActive =
        filterActive === 'all' ||
        (filterActive === 'active' && service.is_active) ||
        (filterActive === 'inactive' && !service.is_active);

      const matchesGender =
        genderFilter === 'all' || (service.gender_category || 'both') === genderFilter;

      return matchesSearch && matchesActive && matchesGender;
    });
  }, [servicesWithTaxonomy, searchTerm, filterActive, genderFilter]);

  /** Category chips, in catalog order, limited to categories the vendor actually uses. */
  const categoryFilterOptions = useMemo(() => {
    const counts = new Map();
    searchableServices.forEach(({ taxonomy }) => {
      const id = taxonomy.categoryId || '__uncategorised__';
      const existing = counts.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(id, {
          id,
          name: taxonomy.categoryName || 'Other Services',
          count: 1,
        });
      }
    });

    const orderOf = (id) =>
      taxonomyIndex.categoryOrder.has(id)
        ? taxonomyIndex.categoryOrder.get(id)
        : Number.MAX_SAFE_INTEGER;

    return Array.from(counts.values()).sort(
      (a, b) => orderOf(a.id) - orderOf(b.id) || a.name.localeCompare(b.name)
    );
  }, [searchableServices, taxonomyIndex]);

  /** Subcategory chips for the selected category — hidden while "All" is active. */
  const subcategoryFilterOptions = useMemo(() => {
    if (categoryFilter === 'all') return [];

    const counts = new Map();
    searchableServices.forEach(({ taxonomy }) => {
      const categoryId = taxonomy.categoryId || '__uncategorised__';
      if (categoryId !== categoryFilter) return;

      const id = taxonomy.subcategoryId || '__none__';
      const existing = counts.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(id, { id, name: taxonomy.subcategoryName || 'General', count: 1 });
      }
    });

    return Array.from(counts.values()).sort((a, b) => {
      if (a.id === '__none__') return 1;
      if (b.id === '__none__') return -1;
      return a.name.localeCompare(b.name);
    });
  }, [searchableServices, categoryFilter]);

  const filteredEntries = useMemo(
    () =>
      searchableServices.filter(({ taxonomy }) => {
        const categoryId = taxonomy.categoryId || '__uncategorised__';
        if (categoryFilter !== 'all' && categoryId !== categoryFilter) return false;
        if (subcategoryFilter !== 'all') {
          const subcategoryId = taxonomy.subcategoryId || '__none__';
          if (subcategoryId !== subcategoryFilter) return false;
        }
        return true;
      }),
    [searchableServices, categoryFilter, subcategoryFilter]
  );

  const groupedServices = useMemo(
    () => groupServicesByTaxonomy(filteredEntries, taxonomyIndex),
    [filteredEntries, taxonomyIndex]
  );

  const hasActiveFilters =
    Boolean(searchTerm) ||
    filterActive !== 'all' ||
    genderFilter !== 'all' ||
    categoryFilter !== 'all';

  /** Selecting a category resets the dependent subcategory chip row. */
  const handleSelectCategory = (categoryId) => {
    setCategoryFilter((prev) => (prev === categoryId ? 'all' : categoryId));
    setSubcategoryFilter('all');
  };

  const toggleCategoryCollapsed = (categoryId) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterActive('all');
    setGenderFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
  };

  return (
    <DashboardLayout role="vendor">
      <VendorPageShell bgClass={SERVICES_PAGE_BG}>
      <div className={`${SERVICES_PAGE_BG} space-y-5 px-4 py-6 max-lg:min-h-[calc(100dvh-4rem)] lg:space-y-6`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ServicesPageHeader
            title="Services Management"
            subtitle="Manage your salon services and pricing"
          />
          <ServicesAddButton onClick={handleOpenAdd} />
        </div>

        {/* One compact toolbar. Search + both segmented controls share a single
            wrapping row (all three sit on one line from lg up), with the catalog
            chips below. The subcategory row only appears once a category is
            picked, so the resting height stays two rows. */}
        <div className="space-y-2.5 rounded-2xl bg-white/60 p-3 shadow-[0_2px_12px_rgba(34,26,17,0.04)] lg:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[180px] flex-1 basis-full lg:basis-0">
              <ServicesSearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ServicesSegmentedControl
              label="Filter by gender"
              options={GENDER_FILTER_OPTIONS}
              value={genderFilter}
              onChange={setGenderFilter}
            />
            <ServicesSegmentedControl
              label="Filter by status"
              options={STATUS_FILTER_OPTIONS}
              value={filterActive}
              onChange={setFilterActive}
            />
          </div>

          {categoryFilterOptions.length > 0 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
              <ServicesTaxonomyChip
                active={categoryFilter === 'all'}
                onClick={() => handleSelectCategory('all')}
                count={searchableServices.length}
              >
                All categories
              </ServicesTaxonomyChip>
              {categoryFilterOptions.map((option) => (
                <ServicesTaxonomyChip
                  key={option.id}
                  active={categoryFilter === option.id}
                  onClick={() => handleSelectCategory(option.id)}
                  count={option.count}
                >
                  {option.name}
                </ServicesTaxonomyChip>
              ))}
            </div>
          )}

          {subcategoryFilterOptions.length > 0 && (
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-0.5">
              <span className="shrink-0 pl-1 font-vendor text-sm text-[#C0A788]" aria-hidden>
                ↳
              </span>
              <ServicesTaxonomyChip
                active={subcategoryFilter === 'all'}
                onClick={() => setSubcategoryFilter('all')}
                subtle
              >
                All
              </ServicesTaxonomyChip>
              {subcategoryFilterOptions.map((option) => (
                <ServicesTaxonomyChip
                  key={option.id}
                  active={subcategoryFilter === option.id}
                  onClick={() =>
                    setSubcategoryFilter((prev) => (prev === option.id ? 'all' : option.id))
                  }
                  count={option.count}
                  subtle
                >
                  {option.name}
                </ServicesTaxonomyChip>
              ))}
            </div>
          )}
        </div>

        {/* Result count doubles as the home for "clear" — keeps the toolbar from
            growing a row whenever a filter is on. */}
        {!servicesLoading && services.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="font-vendor text-xs text-[#867461]">
              Showing <span className="font-bold text-[#534433]">{filteredEntries.length}</span> of{' '}
              {services.length} services
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="shrink-0 font-vendor text-xs font-semibold text-[#F89E07] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {servicesLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F89E07] border-t-transparent" />
              <p className="font-vendor text-[#4B5563]">Loading services...</p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-[0_4px_24px_rgba(34,26,17,0.06)]">
            <FiShoppingBag className="mx-auto mb-4 text-6xl text-[#EAE0D3]" />
            <h3 className="mb-2 font-vendor text-xl font-bold text-[#111827]">
              {hasActiveFilters ? 'No services found' : 'No services yet'}
            </h3>
            <p className="mb-6 font-vendor text-sm text-[#4B5563]">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first service'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="font-vendor text-sm font-semibold text-[#F89E07] hover:underline"
              >
                Clear all filters
              </button>
            ) : (
              <ServicesAddButton onClick={handleOpenAdd} label="Add Your First Service" />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedServices.map((group) => {
              const collapsed = collapsedCategories.has(group.categoryId);
              return (
                <section key={group.categoryId} className="space-y-3">
                  <ServicesCategorySectionHeader
                    name={group.categoryName.toUpperCase()}
                    count={group.count}
                    collapsed={collapsed}
                    onToggle={() => toggleCategoryCollapsed(group.categoryId)}
                  />

                  {!collapsed &&
                    group.subgroups.map((subgroup) => (
                      <div key={subgroup.subcategoryId} className="space-y-3">
                        {/* A single "General" bucket needs no band — the category
                            heading above already says everything. */}
                        {!(
                          group.subgroups.length === 1 && subgroup.subcategoryId === '__none__'
                        ) && (
                          <ServicesSubcategoryHeading
                            name={subgroup.subcategoryName}
                            count={subgroup.services.length}
                          />
                        )}
                        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
                          {subgroup.services.map(({ service, taxonomy }) => (
                            <VendorServiceCard
                              key={service.id}
                              service={service}
                              taxonomy={taxonomy}
                              onEdit={handleOpenModal}
                              onToggleActive={handleToggleActive}
                              onDelete={handleDelete}
                              isToggling={isUpdating}
                              isDeleting={isDeleting}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </section>
              );
            })}
          </div>
        )}
      </div>
      </VendorPageShell>

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
