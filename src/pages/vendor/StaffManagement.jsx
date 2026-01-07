/**
 * StaffManagement Component
 * 
 * Purpose:
 * Enables vendors to manage their salon staff members including creating, editing,
 * and managing staff availability and service assignments.
 * 
 * Data Management:
 * - Fetches staff data via RTK Query (useGetVendorStaffQuery)
 * - CRUD operations via mutations (create/update/delete)
 * - Modal-based forms for add/edit operations
 * 
 * Key Features:
 * - Staff CRUD operations (Create, Read, Update, Delete)
 * - Weekly availability schedule management
 * - Service assignments (which services each staff member provides)
 * - Active/inactive status toggle
 * - Search and filter functionality
 * - Validation for required fields (name, phone)
 * 
 * Staff Availability:
 * - Per-day schedule configuration (Monday-Sunday)
 * - Available/unavailable toggle for each day
 * - Custom start/end times in 24-hour format
 * - Default hours: 09:00 - 18:00
 * 
 * User Flow:
 * 1. View staff list with search/filter options
 * 2. Click "Add Staff" to open modal with blank form
 * 3. Fill in staff details and availability
 * 4. Assign services staff member can provide
 * 5. Save to create new staff member
 * 6. Edit/delete existing staff as needed
 */

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Modal from '../../components/shared/Modal';
import {
  useGetVendorStaffQuery,
  useCreateVendorStaffMutation,
  useUpdateVendorStaffMutation,
  useDeleteVendorStaffMutation,
} from '../../services/api/vendorApi';
import { SkeletonTable } from '../../components/shared/Skeleton';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiToggleLeft,
  FiToggleRight,
  FiUsers,
  FiSearch,
  FiCalendar,
} from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';

const StaffManagement = () => {
  // RTK Query hooks
  const { data: staffData, isLoading: staffLoading } = useGetVendorStaffQuery();
  const [createStaff] = useCreateVendorStaffMutation();
  const [updateStaff] = useUpdateVendorStaffMutation();
  const [deleteStaff] = useDeleteVendorStaffMutation();
  
  const staff = staffData || [];
  const services = []; // Services would come from another query if needed

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    service_ids: [],
    is_active: true,
    availability: {
      monday: { available: true, start: '09:00', end: '18:00' },
      tuesday: { available: true, start: '09:00', end: '18:00' },
      wednesday: { available: true, start: '09:00', end: '18:00' },
      thursday: { available: true, start: '09:00', end: '18:00' },
      friday: { available: true, start: '09:00', end: '18:00' },
      saturday: { available: true, start: '09:00', end: '18:00' },
      sunday: { available: false, start: '09:00', end: '18:00' },
    },
  });

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        specialization: staffMember.specialization || '',
        service_ids: staffMember.service_ids || [],
        is_active: staffMember.is_active !== undefined ? staffMember.is_active : true,
        availability: staffMember.availability || {
          monday: { available: true, start: '09:00', end: '18:00' },
          tuesday: { available: true, start: '09:00', end: '18:00' },
          wednesday: { available: true, start: '09:00', end: '18:00' },
          thursday: { available: true, start: '09:00', end: '18:00' },
          friday: { available: true, start: '09:00', end: '18:00' },
          saturday: { available: true, start: '09:00', end: '18:00' },
          sunday: { available: false, start: '09:00', end: '18:00' },
        },
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        service_ids: [],
        is_active: true,
        availability: {
          monday: { available: true, start: '09:00', end: '18:00' },
          tuesday: { available: true, start: '09:00', end: '18:00' },
          wednesday: { available: true, start: '09:00', end: '18:00' },
          thursday: { available: true, start: '09:00', end: '18:00' },
          friday: { available: true, start: '09:00', end: '18:00' },
          saturday: { available: true, start: '09:00', end: '18:00' },
          sunday: { available: false, start: '09:00', end: '18:00' },
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleServiceToggle = (serviceId) => {
    const currentServices = formData.service_ids || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId];
    setFormData({ ...formData, service_ids: newServices });
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showErrorToast('Staff name is required');
      return;
    }
    if (!formData.phone.trim()) {
      showErrorToast('Phone number is required');
      return;
    }

    try {
      const staffData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        service_ids: formData.service_ids,
        is_active: formData.is_active,
        availability: formData.availability,
      };

      if (editingStaff) {
        await updateStaff({ staffId: editingStaff.id, ...staffData }).unwrap();
        showSuccessToast('Staff member updated successfully!');
      } else {
        await createStaff(staffData).unwrap();
        showSuccessToast('Staff member added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      showErrorToast(error?.message || 'Failed to save staff member');
    }
  };

  const handleToggleActive = async (staffMember) => {
    try {
      await updateStaff({
        staffId: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        specialization: staffMember.specialization,
        service_ids: staffMember.service_ids,
        availability: staffMember.availability,
        is_active: !staffMember.is_active,
      }).unwrap();
      showSuccessToast(`Staff member ${!staffMember.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showErrorToast(error?.message || 'Failed to update staff status');
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await deleteStaff(staffId).unwrap();
      showSuccessToast('Staff member deleted successfully!');
    } catch (error) {
      showErrorToast(error?.message || 'Failed to delete staff member');
    }
  };

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && member.is_active) ||
      (filterActive === 'inactive' && !member.is_active);
    return matchesSearch && matchesActive;
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <DashboardLayout role="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 font-body mt-1">
              Manage your salon staff and their schedules
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <FiPlus />
            Add Staff Member
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
                  placeholder="Search staff..."
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

        {/* Staff List */}
        {staffLoading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : filteredStaff.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiUsers className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                {searchTerm ? 'No staff found' : 'No staff members yet'}
              </h3>
              <p className="text-gray-600 font-body mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first staff member'}
              </p>
              {!searchTerm && (
                <div className="flex justify-center">
                  <Button variant="primary" onClick={() => handleOpenModal()}>
                    <FiPlus className="mr-2" />
                    Add Your First Staff Member
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold text-gray-900">
                          {member.name}
                        </h3>
                        {member.specialization && (
                          <p className="text-sm text-gray-600 font-body">
                            {member.specialization}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(member)}
                      className="text-2xl focus:outline-none"
                      title={member.is_active ? 'Active' : 'Inactive'}
                    >
                      {member.is_active ? (
                        <FiToggleRight className="text-green-600" />
                      ) : (
                        <FiToggleLeft className="text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {member.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="mr-2 text-gray-400" />
                        <span className="font-body truncate">{member.email}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPhone className="mr-2 text-gray-400" />
                      <span className="font-body">{member.phone}</span>
                    </div>
                  </div>

                  {/* Services */}
                  {member.service_ids && member.service_ids.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-body mb-1">Assigned Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.service_ids.slice(0, 3).map((serviceId) => {
                          const service = services.find((s) => s.id === serviceId);
                          return service ? (
                            <span
                              key={serviceId}
                              className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full font-body"
                            >
                              {service.name}
                            </span>
                          ) : null;
                        })}
                        {member.service_ids.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-body">
                            +{member.service_ids.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-body font-semibold ${
                        member.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(member)}
                      className="flex-1"
                    >
                      <FiEdit2 className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
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

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-gray-900">Basic Information</h3>
            
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., John Doe"
              icon={<FiUser />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                icon={<FiMail />}
              />

              <InputField
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 XXXXXXXXXX"
                icon={<FiPhone />}
              />
            </div>

            <InputField
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Hair Stylist, Makeup Artist"
            />
          </div>

          {/* Service Assignment */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-display font-bold text-gray-900">Assigned Services</h3>
            <p className="text-sm text-gray-600 font-body">
              Select services this staff member can provide
            </p>
            <div className="grid grid-cols-2 gap-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.service_ids.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-body">{service.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-display font-bold text-gray-900 flex items-center">
              <FiCalendar className="mr-2" />
              Weekly Schedule
            </h3>
            <div className="space-y-2">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.availability[day]?.available}
                    onChange={(e) =>
                      handleAvailabilityChange(day, 'available', e.target.checked)
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="w-24 text-sm font-body font-semibold text-gray-700 capitalize">
                    {day}
                  </span>
                  {formData.availability[day]?.available ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={formData.availability[day]?.start || '09:00'}
                        onChange={(e) =>
                          handleAvailabilityChange(day, 'start', e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-body"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.availability[day]?.end || '18:00'}
                        onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm font-body"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 font-body">Not available</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_active" className="text-sm font-body text-gray-700">
              Staff member is active and can accept bookings
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={staffLoading}>
              {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
