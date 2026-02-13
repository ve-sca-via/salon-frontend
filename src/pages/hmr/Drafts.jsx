import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useGetOwnVendorRequestsQuery, useDeleteVendorRequestMutation } from '../../services/api/rmApi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';
import { FiEdit2, FiTrash2, FiSend, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

/**
 * Drafts
 *
 * Lists Relationship Manager draft salon submissions and provides actions to
 * continue editing or delete a draft. Uses RTK Query to fetch drafts and
 * performs delete via mutation. Notifications are shown using the
 * centralized toast utilities to keep UX consistent.
 *
 * Inputs: none (reads RM-owned drafts from server)
 * Outputs: navigates to edit flow or triggers server-side delete
 * Error modes: shows user-facing error toasts when delete fails
 */
const Drafts = () => {
  const navigate = useNavigate();
  
  // RTK Query hooks - Fix: use status_filter (snake_case) to match backend
  const { data: submissionsData, isLoading: submissionsLoading, refetch, isFetching } = useGetOwnVendorRequestsQuery({ status_filter: 'draft' });
  // Include mutation loading state so we can disable UI while deleting
  const [deleteVendorRequest, { isLoading: deleteLoading }] = useDeleteVendorRequestMutation();

  // Backend returns array directly, not wrapped
  const submissions = submissionsData?.data || [];

  // Filter only draft status
  const drafts = submissions?.filter(sub => sub.status === 'draft') || [];

  // Debug logging
  React.useEffect(() => {
    console.log('=== DRAFTS PAGE DEBUG ===');
    console.log('Submissions Data:', submissionsData);
    console.log('Submissions:', submissions);
    console.log('Drafts Count:', drafts.length);
    console.log('Loading:', submissionsLoading);
    console.log('Is Fetching:', isFetching);
    if (drafts.length > 0) {
      console.log('First Draft Services Offered:', drafts[0].services_offered);
      console.log('First Draft Documents Services:', drafts[0].documents?.services);
    }
    console.log('========================');
  }, [submissionsData, submissions, drafts, submissionsLoading, isFetching]);

  const handleEdit = (draftId) => {
    // Navigate to edit page (we'll create this next)
    navigate(`/hmr/edit-salon/${draftId}`);
  };

  const handleDelete = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await deleteVendorRequest(draftId).unwrap();
      // basic shape validation: if unwrap didn't throw, consider it success
      if (res) {
        showSuccessToast('Draft deleted successfully!');
      } else {
        // defensively handle unexpected empty response
        showSuccessToast('Draft deleted — refresh to update the list.');
      }
    } catch (error) {
      // Prefer a friendly message if backend provides one
      const errMsg = error?.data?.message || error?.message || 'Failed to delete draft';
      showErrorToast(errMsg);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (submissionsLoading) {
    return (
      <DashboardLayout role="hmr">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-accent-orange border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="hmr">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Draft Submissions</h1>
            <p className="text-gray-600 font-body mt-1">
              Incomplete salon submissions that you can continue editing
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="whitespace-nowrap"
            title="Refresh drafts list"
          >
            <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} size={16} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
                No Drafts Found
              </h3>
              <p className="text-gray-600 font-body">
                You haven't saved any salon submissions as drafts yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {drafts.map((draft) => {
              const documents = draft.documents || {};
              
              // Count services from both locations
              let servicesCount = 0;
              
              // Check documents.services (array format)
              if (documents.services && Array.isArray(documents.services)) {
                servicesCount = documents.services.length;
              }
              
              // Check draft.services_offered (grouped by category)
              if (!servicesCount && draft.services_offered && typeof draft.services_offered === 'object') {
                // Count all services across all categories
                servicesCount = Object.values(draft.services_offered).reduce((total, categoryServices) => {
                  return total + (Array.isArray(categoryServices) ? categoryServices.length : 0);
                }, 0);
              }
              
              return (
                <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-display font-bold text-gray-900">
                          {draft.business_name}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <FiClock className="mr-1" size={12} />
                          Draft
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 font-body">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Location:</span>
                          <span>{draft.city}, {draft.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Contact:</span>
                          <span>{draft.owner_phone} • {draft.owner_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Services:</span>
                          <span>
                            {servicesCount} service(s) added
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Last Updated:</span>
                          <span>{formatDate(draft.updated_at)}</span>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-xs">
                          <div className={`flex items-center gap-1 ${draft.business_name ? 'text-green-600' : 'text-gray-400'}`}>
                            {draft.business_name ? '✓' : '○'} Basic Info
                          </div>
                          <div className={`flex items-center gap-1 ${servicesCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {servicesCount > 0 ? '✓' : '○'} Services ({servicesCount})
                          </div>
                          <div className={`flex items-center gap-1 ${draft.cover_image_url || documents.cover_image ? 'text-green-600' : 'text-gray-400'}`}>
                            {draft.cover_image_url || documents.cover_image ? '✓' : '○'} Cover Image
                          </div>
                          <div className={`flex items-center gap-1 ${draft.gallery_images?.length > 0 || documents.images?.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {draft.gallery_images?.length > 0 || documents.images?.length > 0 ? '✓' : '○'} Gallery ({draft.gallery_images?.length || documents.images?.length || 0})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:ml-6">
                      <Button
                        variant="primary"
                        onClick={() => handleEdit(draft.id)}
                        className="bg-gradient-orange whitespace-nowrap flex-1 lg:flex-none justify-center"
                        disabled={deleteLoading}
                        aria-label={`Continue editing ${draft.business_name || 'draft'}`}
                      >
                        <FiEdit2 className="mr-2" size={16} />
                        <span className="hidden sm:inline">Continue Editing</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(draft.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 whitespace-nowrap flex-1 lg:flex-none justify-center"
                        disabled={deleteLoading}
                        aria-label={`Delete draft ${draft.business_name || 'draft'}`}
                      >
                        <FiTrash2 className="mr-2" size={16} />
                        <span className="hidden sm:inline">Delete Draft</span>
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-blue-600 mt-1" size={20} />
            <div className="text-sm text-blue-800 font-body">
              <p className="font-semibold mb-1">About Drafts</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Drafts are saved automatically when you click "Save as Draft"</li>
                <li>You can continue editing drafts at any time</li>
                <li>Drafts don't count towards your submission statistics</li>
                <li>Submit drafts for approval when you're ready</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Drafts;
