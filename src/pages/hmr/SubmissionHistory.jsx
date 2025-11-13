import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useGetOwnVendorRequestsQuery } from '../../services/api/rmApi';
import { FiSearch, FiEye, FiPlusCircle } from 'react-icons/fi';

const SubmissionHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // RTK Query hook
  const { data: submissionsData, isLoading: submissionsLoading } = useGetOwnVendorRequestsQuery();
  
  // Backend returns array directly, not wrapped in { data: [...] }
  const submissions = submissionsData?.data || [];

  // TODO: we will use this later
  const count = submissionsData?.count || 0;  // we also retrieve the total count of submissions

  // Safety check: ensure submissions is an array
  const submissionsArray = Array.isArray(submissions) ? submissions : [];

  // Debug log to check admin_notes
  React.useEffect(() => {
    if (submissionsArray.length > 0) {
      console.log('Submission History - Sample submission:', submissionsArray[0]);
      console.log('Admin notes field:', submissionsArray[0]?.admin_notes);
      console.log('Reviewed at:', submissionsArray[0]?.reviewed_at);
      console.log('Reviewed by:', submissionsArray[0]?.reviewed_by);
    }
  }, [submissionsArray]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubmissions = submissionsArray.filter((submission) => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch = submission.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          submission.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: submissionsArray.length,
    pending: submissionsArray.filter(s => s.status === 'pending').length,
    approved: submissionsArray.filter(s => s.status === 'approved').length,
    rejected: submissionsArray.filter(s => s.status === 'rejected').length,
  };

  return (
    <DashboardLayout role="hmr">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Submission History</h1>
            <p className="text-gray-600 font-body mt-1">View and track all your salon submissions</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-4 py-2 rounded-lg font-body font-medium transition-all ${
                  filterStatus === key
                    ? 'bg-accent-orange text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                <span className="ml-2 text-sm">({statusCounts[key]})</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by salon name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            />
          </div>
        </Card>

        {/* Submissions Table */}
        <Card>
          {submissionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4 font-body">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FiPlusCircle size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No matching submissions' : 'No submissions yet'}
              </h3>
              <p className="text-gray-600 mb-4 font-body">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Start by adding your first salon'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Link to="/hmr/add-salon">
                  <Button variant="primary">Add Salon</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Salon Name</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Submitted</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Reviewed By</th>
                    <th className="text-left py-3 px-4 text-sm font-body font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-bg-secondary transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-body font-medium text-gray-900">{submission.business_name}</p>
                          {submission.business_description && (
                            <p className="text-xs text-gray-500 font-body mt-1 truncate max-w-xs">
                              {submission.business_description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-body text-gray-600 text-sm">
                        {submission.city}, {submission.state}
                        {submission.pincode && <span className="block text-xs text-gray-500">{submission.pincode}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-body text-gray-600">
                          {submission.owner_phone && <p>{submission.owner_phone}</p>}
                          {submission.owner_email && <p className="text-xs text-gray-500">{submission.owner_email}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-body text-gray-600">
                        {submission.created_at ? (
                          <div>
                            <p>{new Date(submission.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-body font-medium capitalize ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        {submission.status === 'rejected' && submission.admin_notes && (
                          <p className="text-xs text-red-600 font-body mt-1 max-w-xs truncate" title={submission.admin_notes}>
                            {submission.admin_notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-body text-gray-600 text-sm">
                        {submission.admin_notes || '-'}
                        {submission.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(submission.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <FiEye className="mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
        {filteredSubmissions.length > 0 && (
          <div className="text-sm text-gray-600 font-body text-center">
            Showing {filteredSubmissions.length} of {submissionsArray.length} submissions
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubmissionHistory;
