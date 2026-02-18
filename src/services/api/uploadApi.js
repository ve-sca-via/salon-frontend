import apiClient from '../apiClient';

/**
 * Upload salon image to backend storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in storage (e.g., 'covers', 'gallery', 'documents')
 * @returns {Promise<string>} The uploaded file URL
 */
export const uploadSalonImage = async (file, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(
    `/api/v1/upload/salon-image?folder=${folder}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.url;
};

/**
 * Upload salon agreement document (PDF or image) to backend storage
 * @param {File} file - The document file to upload
 * @returns {Promise<string>} The storage path (not URL - use getAgreementDocumentSignedUrl to view)
 */
export const uploadAgreementDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(
    `/api/v1/upload/agreement-document`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  // Return the storage path (not the URL) so we can generate signed URLs later
  return response.data.path;
};

/**
 * Extract storage path from URL or return path as-is
 * Handles both old full URLs and new storage paths
 * @param {string} urlOrPath - Either full URL or storage path
 * @returns {string} Storage path (e.g., 'agreements/abc123.pdf')
 */
export const extractStoragePath = (urlOrPath) => {
  if (!urlOrPath) return null;
  
  // If it's already a path (doesn't start with http), return as-is
  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }
  
  // Extract path from URL
  // Format: http://127.0.0.1:54321/storage/v1/object/public/salon-agreement/agreements/abc123.pdf
  // or: http://127.0.0.1:54321/storage/v1/object/sign/salon-agreement/agreements/abc123.pdf?token=...
  try {
    const url = new URL(urlOrPath);
    const pathParts = url.pathname.split('/');
    // Find the bucket name index and get everything after it
    const bucketIndex = pathParts.findIndex(part => part === 'salon-agreement');
    if (bucketIndex !== -1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
  } catch (e) {
    console.error('Failed to parse URL:', e);
  }
  
  // Fallback: return original string
  return urlOrPath;
};

/**
 * Get signed URL for viewing private agreement document
 * @param {string} pathOrUrl - Storage path or full URL
 * @returns {Promise<string>} Signed URL valid for 1 hour
 */
export const getAgreementDocumentSignedUrl = async (pathOrUrl) => {
  // Extract storage path from URL if needed
  const path = extractStoragePath(pathOrUrl);
  
  const response = await apiClient.get('/api/v1/upload/agreement-document/signed-url', {
    params: { path }
  });
  
  return response.data.signedUrl;
};
