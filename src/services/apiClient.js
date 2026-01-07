/**
 * Axios API Client with Token Refresh Interceptor
 * Handles automatic token refresh and request queuing
 */

import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// =====================================================
// CREATE AXIOS INSTANCE
// =====================================================

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// =====================================================
// TOKEN REFRESH STATE
// =====================================================

let isRefreshing = false;
let failedQueue = [];

/**
 * Process all queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Refresh the access token
 */
const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  
  if (!refresh_token) {
    throw new Error('No refresh token available');
  }

  try {
    // Use fetch for refresh to avoid interceptor recursion
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newToken = data.access_token;
    
    // Store new token
    localStorage.setItem('access_token', newToken);
    
    // Update default header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return newToken;
  } catch (error) {
    // Refresh failed - clear storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

// =====================================================
// REQUEST INTERCEPTOR (Add token to requests)
// =====================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR (Handle 401 & token refresh)
// =====================================================

apiClient.interceptors.response.use(
  (response) => {
    // Success - pass through
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if token was revoked (logged out elsewhere)
    const errorMessage = error.response?.data?.detail || '';
    if (errorMessage === 'Token has been revoked') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // ==========================================
    // CASE 1: Refresh already in progress
    // ==========================================
    if (isRefreshing) {
      // Queue this request and wait for refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          // Refresh succeeded - retry with new token
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          // Refresh failed - propagate error
          return Promise.reject(err);
        });
    }

    // ==========================================
    // CASE 2: Start new token refresh
    // ==========================================
    originalRequest._retry = true;
    isRefreshing = true;

    return new Promise((resolve, reject) => {
      refreshAccessToken()
        .then(newToken => {
          // Success! Update token in original request
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          
          // Process all queued requests
          processQueue(null, newToken);
          
          // Retry original request
          resolve(apiClient(originalRequest));
        })
        .catch(err => {
          // Refresh failed - reject all queued requests
          processQueue(err, null);
          
          // Logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Handle API errors consistently
 * Throws error with status property preserved
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
    const err = new Error(message);
    err.status = error.response.status;
    err.data = error.response.data;
    throw err;
  } else if (error.request) {
    // Request made but no response
    const err = new Error('Network error. Please check your connection.');
    err.status = 'FETCH_ERROR';
    throw err;
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

/**
 * GET request wrapper
 */
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * POST request wrapper
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * PUT request wrapper
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * DELETE request wrapper
 */
export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * PATCH request wrapper
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export default apiClient;
