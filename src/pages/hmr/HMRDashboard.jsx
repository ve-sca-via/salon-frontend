import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useGetRMProfileQuery, useGetOwnVendorRequestsQuery } from '../../services/api/rmApi';
import { showErrorToast, showSuccessToast } from '../../utils/toastConfig';
import { FiCheckCircle, FiClock, FiXCircle, FiPlusCircle, FiAward } from 'react-icons/fi';

/**
 * HMR Dashboard
 *
 * Displays Relationship Manager statistics and recent salon submissions.
 * Uses RTK Query to fetch RM profile and submissions. Notifications should
 * be shown via centralized toast utilities for consistency.
 *
 * Notes: Defensive checks are applied to avoid runtime errors when the
 * API returns unexpected shapes.
 */
const HMRDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // RTK Query hooks
  const { data: profileData } = useGetRMProfileQuery();
  const { data: submissionsData, isLoading: submissionsLoading } = useGetOwnVendorRequestsQuery();

  // Extract data - handle both wrapped and direct responses
  const profile = profileData?.profile;
  const stats = profileData?.statistics || {};
  const submissions = submissionsData?.data || [];

  // Safety check: ensure submissions is an array
  const submissionsArray = Array.isArray(submissions) ? submissions : [];
  const recentSubmissions = submissionsArray.slice(0, 5);
  
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Minor defensive UI: if fetching profile failed, show a console message and allow the page to render minimal data
  if (profileData === undefined && submissionsData === undefined) {
    // don't flood users with toasts on initial load; use console.debug for developers
    console.debug('HMRDashboard: profile and submissions data not available yet');
  }

  return (
    <DashboardLayout role="hmr">
      <div className="space-y-6">
        <div className="bg-gradient-orange rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome, {user?.full_name || user?.name || 'Agent'}!
          </h1>
          <p className="text-white/90 mb-6">Track your salon submissions and help grow our network</p>
          <div className="flex gap-4">
            <Link to="/hmr/add-salon">
              <Button variant="secondary" className="bg-neutral-black hover:bg-neutral-gray-400" aria-label="Add new salon">
                <FiPlusCircle className="mr-2" />Add New Salon
              </Button>
            </Link>
            <Link to="/hmr/leaderboard">
              <Button variant="secondary" className="bg-white text-accent-orange hover:bg-gray-100" aria-label="View leaderboard">
                <FiAward className="mr-2" />View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-blue-600 font-body font-medium">Total</p><p className="text-3xl font-display font-bold text-blue-900">{stats?.total_salons_added || 0}</p></div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center shadow"><FiCheckCircle className="text-white" size={24} /></div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-green-600 font-body font-medium">Approved</p><p className="text-3xl font-display font-bold text-green-900">{stats?.approved_requests || 0}</p></div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center shadow"><FiCheckCircle className="text-white" size={24} /></div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-none shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-yellow-600 font-body font-medium">Pending</p><p className="text-3xl font-display font-bold text-yellow-900">{stats?.pending_requests || 0}</p></div>
              <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow"><FiClock className="text-white" size={24} /></div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-none shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-red-600 font-body font-medium">Rejected</p><p className="text-3xl font-display font-bold text-red-900">{stats?.rejected_requests || 0}</p></div>
              <div className="h-12 w-12 bg-red-500 rounded-lg flex items-center justify-center shadow"><FiXCircle className="text-white" size={24} /></div>
            </div>
          </Card>
        </div>
        <Card title="Recent Submissions" headerAction={<Link to="/hmr/submissions"><Button variant="ghost" size="sm" aria-label="View all submissions">View All</Button></Link>}>
          {submissionsLoading ? (<div className="text-center py-12"><div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto"></div><p className="text-gray-600 mt-4">Loading...</p></div>) : recentSubmissions.length === 0 ? (<div className="text-center py-12"><FiPlusCircle size={64} className="mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-display font-semibold text-gray-900 mb-2">No submissions yet</h3><p className="text-gray-600 mb-4 font-body">Use the "Add New Salon" button above to start submitting salons</p></div>) : (<div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Salon Name</th><th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Location</th><th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Submitted</th><th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Status</th><th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Admin Notes</th></tr></thead><tbody>{recentSubmissions.map((s) => (<tr key={s.id} className="border-b border-gray-100 hover:bg-bg-secondary transition-colors"><td className="py-3 px-4 font-body font-medium text-gray-900">{s.business_name}</td><td className="py-3 px-4 font-body text-gray-600 text-sm">{s.city}, {s.state}</td><td className="py-3 px-4 font-body text-gray-600">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={'inline-block px-3 py-1 rounded-full text-xs font-body font-medium ' + getStatusColor(s.status)}>{s.status}</span></td><td className="py-3 px-4 font-body text-gray-600 text-sm">{s.admin_notes || (s.status === 'rejected' ? 'See rejection details' : '-')}</td></tr>))}</tbody></table></div>)}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HMRDashboard;
