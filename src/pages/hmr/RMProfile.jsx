import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { useGetRMProfileQuery, useUpdateRMProfileMutation } from '../../services/api/rmApi';
import { updateUser } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiAward, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RMProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // RTK Query hooks
  const { data: profileData, isLoading: profileLoading } = useGetRMProfileQuery();
  const [updateRMProfile] = useUpdateRMProfileMutation();
  
  // Extract data - backend returns { profile: {...}, statistics: {...} }
  const profile = profileData?.profile;
  const stats = profileData?.statistics || {};
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || user?.full_name || '',
        phone: profile.phone || user?.phone || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateRMProfile(formData).unwrap();
      
      // Update auth state with new user data
      dispatch(updateUser({
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
      }));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || user?.full_name || '',
      phone: profile?.phone || user?.phone || '',
    });
    setIsEditing(false);
  };

  if (profileLoading && !profile) {
    return (
      <DashboardLayout role="hmr">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-accent-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const scorePercentage = profile?.total_score ? Math.min((profile.total_score / 1000) * 100, 100) : 0;

  return (
    <DashboardLayout role="hmr">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 font-body mt-1">Manage your account and track performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-gray-900">Personal Information</h2>
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
                {/* Avatar Section */}
                <div className="flex items-center space-x-4 pb-5 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-display font-bold">
                      {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900">
                      {profile?.full_name || user?.full_name || 'Relationship Manager'}
                    </h3>
                    <p className="text-gray-600 font-body text-sm">RM ID: {profile?.id || user?.id}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${profile?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-body font-medium ${profile?.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {profile?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <InputField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  icon={<FiUser />}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />

                <InputField
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  icon={<FiMail />}
                  disabled
                  readOnly
                  className="bg-gray-50"
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={<FiPhone />}
                  disabled={!isEditing}
                  placeholder="+91 XXXXXXXXXX"
                />

                <div className="pt-4">
                  <label className="text-sm font-body font-semibold text-gray-700 mb-2 block">
                    Member Since
                  </label>
                  <p className="text-gray-900 font-body">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Score Card */}
            <Card className="bg-gradient-to-br from-accent-orange to-orange-600 text-white border-none shadow-xl">
              <div className="text-center">
                <FiAward className="text-white text-5xl mx-auto mb-3" />
                <h3 className="text-sm font-body font-medium opacity-90 mb-2">Current Score</h3>
                <div className="text-5xl font-display font-bold mb-4">
                  {profile?.total_score || 0}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-90">Target: 1000 points</p>
              </div>
            </Card>

            {/* Performance Stats */}
            <Card>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center">
                <FiTrendingUp className="mr-2 text-accent-orange" />
                Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FiCheckCircle className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-body">Total Submissions</p>
                      <p className="text-2xl font-display font-bold text-gray-900">{stats.totalSubmissions}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <FiCheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-body">Approved</p>
                      <p className="text-2xl font-display font-bold text-green-600">{stats.approvedSubmissions}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <FiClock className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-body">Pending</p>
                      <p className="text-2xl font-display font-bold text-yellow-600">{stats.pendingSubmissions}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <FiXCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-body">Rejected</p>
                      <p className="text-2xl font-display font-bold text-red-600">{stats.rejectedSubmissions}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Approval Rate */}
            <Card>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-4">Approval Rate</h3>
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-accent-orange mb-2">
                  {stats.totalSubmissions > 0
                    ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-gray-600 font-body">
                  {stats.approvedSubmissions} out of {stats.totalSubmissions} submissions approved
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RMProfile;
