/**
 * RMProfile Component
 * 
 * Purpose:
 * Displays and allows editing of Relationship Manager's profile information
 * and performance statistics including salon submissions and earnings.
 * 
 * Data Management:
 * - Fetches RM profile and stats via RTK Query (useGetRMProfileQuery)
 * - Updates profile via mutation (useUpdateRMProfileMutation)
 * - Syncs changes with Redux auth state
 * 
 * Key Features:
 * - Edit mode toggle for profile updates
 * - Personal information management (name, phone)
 * - Performance statistics display (total score, submissions, earnings)
 * - Status breakdown (approved, pending, rejected salons)
 * - Visual performance score indicator
 * 
 * Statistics Tracking:
 * - Total score and percentage (out of 1000)
 * - Total salon submissions count
 * - Approved, pending, and rejected counts
 * - Monthly earnings (commission-based)
 * 
 * User Flow:
 * 1. View profile with statistics in read-only mode
 * 2. Click "Edit Profile" to enable editing
 * 3. Modify name and phone fields
 * 4. Save changes (syncs with Redux auth state)
 * 5. Cancel to revert changes
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { useGetRMProfileQuery, useUpdateRMProfileMutation } from '../../services/api/rmApi';
import { setUser } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiAward, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';

const RMProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // RTK Query hooks
  const { data: profileData, isLoading: profileLoading } = useGetRMProfileQuery();
  const [updateRMProfile, { isLoading: isUpdating }] = useUpdateRMProfileMutation();
  
  // Extract data - backend returns { profile: {...}, statistics: {...}, recent_scores: [...] }
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
        full_name: profile.profiles?.full_name || profile.full_name || user?.full_name || '',
        phone: profile.profiles?.phone || profile.phone || user?.phone || '',
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
      dispatch(setUser({
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
      }));
      
      showSuccessToast('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showErrorToast(error?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.profiles?.full_name || profile?.full_name || user?.full_name || '',
      phone: profile?.profiles?.phone || profile?.phone || user?.phone || '',
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

  const scorePercentage = profile?.performance_score ? Math.min((profile.performance_score / 1000) * 100, 100) : 0;

  return (
    <DashboardLayout role="hmr">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">My Profile</h1>
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
                      loading={isUpdating}
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
                      {(profile?.profiles?.full_name || user?.full_name || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900">
                      {profile?.profiles?.full_name || user?.full_name || 'Relationship Manager'}
                    </h3>
                    <p className="text-gray-600 font-body text-sm">Employee ID: {profile?.employee_id || 'Not assigned'}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${profile?.profiles?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-body font-medium ${profile?.profiles?.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {profile?.profiles?.is_active ? 'Active' : 'Inactive'}
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
                    {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : profile?.profiles?.created_at ? new Date(profile.profiles.created_at).toLocaleDateString('en-US', {
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
                <h3 className="text-sm font-body font-medium opacity-90 mb-2">Performance Score</h3>
                <div className="text-5xl font-display font-bold mb-4">
                  {profile?.performance_score || 0}
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
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiCheckCircle className="text-blue-600" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 font-body mb-1">Total Submissions</p>
                  <p className="text-2xl font-display font-bold text-gray-900">{stats.total_salons_added || 0}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiCheckCircle className="text-green-600" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 font-body mb-1">Approved</p>
                  <p className="text-2xl font-display font-bold text-green-600">{stats.total_approved_salons || 0}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiClock className="text-yellow-600" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 font-body mb-1">Pending</p>
                  <p className="text-2xl font-display font-bold text-yellow-600">{stats.pending_requests || 0}</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiXCircle className="text-red-600" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 font-body mb-1">Rejected</p>
                  <p className="text-2xl font-display font-bold text-red-600">{stats.rejected_requests || 0}</p>
                </div>
              </div>

              {/* Approval Rate */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-body mb-1">Approval Rate</p>
                  <div className="text-3xl font-display font-bold text-accent-orange mb-1">
                    {stats.total_salons_added > 0
                      ? Math.round((stats.total_approved_salons / stats.total_salons_added) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-gray-500 font-body">
                    {stats.total_approved_salons || 0} out of {stats.total_salons_added || 0} approved
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RMProfile;
