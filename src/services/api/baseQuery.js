/**
 * Axios Base Query for RTK Query
 * 
 * This adapter allows RTK Query to use our existing axios client
 * with all its interceptors (token refresh, error handling, etc.)
 */

import { get, post, put, del, patch } from '../apiClient';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';

/**
 * Base query function for RTK Query
 * Wraps our axios client to work with RTK Query's interface
 */
export const axiosBaseQuery = () => async ({ url, method = 'get', data, params }) => {
  try {
    let result;

    switch (method.toLowerCase()) {
      case 'get':
        result = await get(url, { params });
        break;
      case 'post':
        result = await post(url, data, { params });
        break;
      case 'put':
        result = await put(url, data, { params });
        break;
      case 'delete':
        result = await del(url, { params });
        break;
      case 'patch':
        result = await patch(url, data, { params });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // RTK Query expects { data: ... } format
    return { data: result };
  } catch (axiosError) {
    const status = axiosError.status || axiosError.response?.status;
    const rawData = axiosError.data || axiosError.response?.data || axiosError.message;
    const message = getApiErrorMessage({ status, data: rawData }, 'An error occurred');
    const data =
      rawData && typeof rawData === 'object' && !Array.isArray(rawData)
        ? { ...rawData, detail: message }
        : typeof rawData === 'string'
          ? { detail: message }
          : { detail: message };

    return { error: { status, data } };
  }
};

export default axiosBaseQuery;
