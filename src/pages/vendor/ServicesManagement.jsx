import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Modal from '../../components/shared/Modal';
import {
  useGetVendorServicesQuery,
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useDeleteVendorServiceMutation,
  useGetServiceCategoriesQuery,
} from '../../services/api/vendorApi';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiShoppingBag,
  FiSearch,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ServicesManagement = () => {
  // RTK Query hooks
  const { data: servicesData, isLoading: servicesLoading } = useGetVendorServicesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetServiceCategoriesQuery();
  const [createService] = useCreateVendorServiceMutation();
  const [updateService] = useUpdateVendorServiceMutation();
  const [deleteService] = useDeleteVendorServiceMutation();
  
  const services = servicesData || [];
  const categories = categoriesData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category_id: '',
    is_active: true,
  });

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        duration: service.duration_minutes || service.duration || '',
        category_id: service.category_id || (categories.length > 0 ? categories[0].id : ''),
        is_active: service.is_active !== undefined ? service.is_active : true,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      is_active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        duration_minutes: parseInt(formData.duration),
        category_id: formData.category_id || null,
        is_active: formData.is_active,
      };

      if (editingService) {
        await updateService({ serviceId: editingService.id, ...serviceData }).unwrap();
        toast.success('Service updated successfully!');
      } else {
        await createService(serviceData).unwrap();
        toast.success('Service created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error(error?.message || 'Failed to save service');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await updateService({
        serviceId: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration_minutes: service.duration_minutes || service.duration,
        category_id: service.category_id,
        is_active: !service.is_active,
      }).unwrap();
      toast.success(`Service ${!service.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(error?.message || 'Failed to update service status');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(serviceId).unwrap();
      toast.success('Service deleted successfully!');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete service');
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && service.is_active) ||
      (filterActive === 'inactive' && !service.is_active);
    return matchesSearch && matchesActive;
  });

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600 font-body mt-1">
              Manage your salon services and pricing
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <FiPlus />
            Add Service
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('all')}
              >
                All
              </Button>
              <Button
                variant={filterActive === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('active')}
              >
                Active
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </Card>

        {/* Services List */}
        {servicesLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">Loading services...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                {searchTerm ? 'No services found' : 'No services yet'}
              </h3>
              <p className="text-gray-600 font-body mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first service'}
              </p>
              {!searchTerm && (
                <Button variant="primary" onClick={() => handleOpenModal()}>
                  <FiPlus className="mr-2" />
                  Add Your First Service
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-gray-900">
                        {service.name}
                      </h3>
                      {service.category && (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-body rounded-full mt-1">
                          {service.category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(service)}
                      className="text-2xl focus:outline-none"
                      title={service.is_active ? 'Active' : 'Inactive'}
                    >
                      {service.is_active ? (
                        <FiToggleRight className="text-green-600" />
                      ) : (
                        <FiToggleLeft className="text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 font-body line-clamp-2">
                    {service.description || 'No description'}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center text-purple-600">
                      <FiDollarSign className="mr-1" />
                      <span className="font-body font-semibold">
                        {service.price === 0 ? 'FREE' : `₹${service.price}`}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-1" />
                      <span className="font-body">{service.duration_minutes || service.duration} min</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-body font-semibold ${
                        service.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(service)}
                      className="flex-1"
                    >
                      <FiEdit2 className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Haircut, Facial, Manicure"
          />

          <div>
            <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body"
              disabled={categoriesLoading}
            >
              {categoriesLoading ? (
                <option>Loading categories...</option>
              ) : categories.length === 0 ? (
                <option>No categories available</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body"
              placeholder="Describe the service..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Price (₹)"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0 for FREE"
              icon={<FiDollarSign />}
            />

            <InputField
              label="Duration (minutes)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g., 30"
              icon={<FiClock />}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_active" className="text-sm font-body text-gray-700">
              Service is active and available for booking
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={servicesLoading}>
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ServicesManagement;
