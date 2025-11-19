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
