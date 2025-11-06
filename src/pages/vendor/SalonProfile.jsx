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
import { toast } from 'react-toastify';

const SalonProfile = () => {
  // RTK Query hooks
  const { data: salonData, isLoading: profileLoading } = useGetVendorSalonQuery();
  const [updateSalonProfile] = useUpdateVendorSalonMutation();
  
  const salonProfile = salonData?.salon || salonData;
  
  const [isEditing, setIsEditing] = useState(false);
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
    cover_image_url: '',
    images: [],
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
        cover_image_url: salonProfile.cover_image_url || '',
        images: salonProfile.images || [],
        business_hours: salonProfile.business_hours || {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: '',
        },
      });
    }
  }, [salonProfile]);

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h) => {
    if (!time12h || time12h === 'Closed') return '';
    
    const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    
    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24h) => {
    if (!time24h) return '';
    
    const [hours24, minutes] = time24h.split(':').map(Number);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBusinessHoursChange = (day, value) => {
    setFormData({
      ...formData,
      business_hours: {
        ...formData.business_hours,
        [day]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      await updateSalonProfile(formData).unwrap();
      toast.success('Salon profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

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
        cover_image_url: salonProfile.cover_image_url || '',
        images: salonProfile.images || [],
        business_hours: salonProfile.business_hours || {},
      });
    }
    setIsEditing(false);
  };

  if (profileLoading && !salonProfile) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading salon profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Salon Profile</h1>
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
                    className="text-purple-600 hover:bg-purple-50"
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
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={profileLoading}
                    >
                      <FiSave className="mr-2" />
                      Save Changes
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-body"
                    placeholder="Tell customers about your salon..."
                  />
                </div>
              </div>
            </Card>

            {/* Business Hours Card */}
            <Card className="mt-6">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <FiClock className="mr-2 text-purple-600" />
                Business Hours
              </h2>
              <div className="space-y-3">
                {days.map((day) => {
                  const dayHours = formData.business_hours[day.key] || '';
                  const isClosed = dayHours === 'Closed';
                  const [startTime12, endTime12] = !isClosed && dayHours ? dayHours.split(' - ') : ['9:00 AM', '6:00 PM'];
                  
                  return (
                    <div key={day.key} className="flex items-center gap-4">
                      <div className="w-28">
                        <span className="text-sm font-body font-semibold text-gray-700">
                          {day.label}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        {isClosed ? (
                          <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-body">Closed</span>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, '9:00 AM - 6:00 PM')}
                                className="text-xs text-purple-600 hover:text-purple-700 font-body"
                              >
                                Set Hours
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <input
                              type="time"
                              value={convertTo24Hour(startTime12)}
                              onChange={(e) => {
                                const newStartTime = convertTo12Hour(e.target.value);
                                handleBusinessHoursChange(day.key, `${newStartTime} - ${endTime12}`);
                              }}
                              disabled={!isEditing}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-body text-sm"
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
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 font-body text-sm"
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBusinessHoursChange(day.key, 'Closed')}
                                className="px-3 py-2 text-sm font-body text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Closed
                              </button>
                            )}
                          </>
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
                <FiImage className="mr-2 text-purple-600" />
                Salon Images
              </h3>
              
              {/* Cover Image */}
              <div className="mb-4">
                <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                  Cover Image
                </label>
                {salonProfile?.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={salonProfile.cover_image_url}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {isEditing && (
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
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
                    {isEditing && (
                      <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100">
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
                  Salon Gallery ({salonProfile?.images?.length || 0} images)
                </label>
                {salonProfile?.images && salonProfile.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {salonProfile.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600">
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
                      ? new Date(salonProfile.created_at).toLocaleDateString()
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
