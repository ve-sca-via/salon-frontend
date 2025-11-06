import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  submitVendorRequest, 
  getOwnVendorRequests, 
  getVendorRequestById,
  updateVendorRequest,
  deleteVendorRequest,
  getRMProfile,
  updateRMProfile,
  getRMScoreHistory 
} from '../../services/backendApi';

// =====================================================
// ASYNC THUNKS
// =====================================================

/**
 * Fetch RM's own profile with statistics
 */
export const fetchRMProfile = createAsyncThunk(
  'rmAgent/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await getRMProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update RM profile
 */
export const updateRMProfileThunk = createAsyncThunk(
  'rmAgent/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const updated = await updateRMProfile(profileData);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch RM's vendor requests (submissions)
 */
export const fetchRMSubmissions = createAsyncThunk(
  'rmAgent/fetchSubmissions',
  async ({ statusFilter = null, limit = 50, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const submissions = await getOwnVendorRequests(statusFilter, limit, offset);
      return submissions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch specific vendor request details
 */
export const fetchVendorRequestDetails = createAsyncThunk(
  'rmAgent/fetchRequestDetails',
  async (requestId, { rejectWithValue }) => {
    try {
      const request = await getVendorRequestById(requestId);
      return request;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Submit new vendor join request
 */
export const createVendorRequestThunk = createAsyncThunk(
  'rmAgent/createRequest',
  async ({ requestData, isDraft = false }, { rejectWithValue }) => {
    try {
      const newRequest = await submitVendorRequest(requestData, isDraft);
      return newRequest;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update existing vendor request (draft)
 */
export const updateVendorRequestThunk = createAsyncThunk(
  'rmAgent/updateRequest',
  async ({ requestId, requestData, submitForApproval = false }, { rejectWithValue }) => {
    try {
      const updated = await updateVendorRequest(requestId, requestData, submitForApproval);
      return { requestId, data: updated, submitForApproval };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete vendor request (draft only)
 */
export const deleteVendorRequestThunk = createAsyncThunk(
  'rmAgent/deleteRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await deleteVendorRequest(requestId);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch RM's score history
 */
export const fetchRMScoreHistory = createAsyncThunk(
  'rmAgent/fetchScoreHistory',
  async ({ limit = 50, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      const history = await getRMScoreHistory(limit, offset);
      return history;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const rmAgentSlice = createSlice({
  name: 'rmAgent',
  initialState: {
    // Profile
    profile: null,
    profileLoading: false,
    profileError: null,
    
    // Submissions
    submissions: [],
    submissionsLoading: false,
    submissionsError: null,
    
    // Stats (computed from profile)
    stats: {
      totalSubmissions: 0,
      approvedSubmissions: 0,
      pendingSubmissions: 0,
      rejectedSubmissions: 0,
      currentScore: 0,
    },
    
    // Score History
    scoreHistory: [],
    scoreHistoryLoading: false,
    scoreHistoryError: null,
    
    // Selected Request
    selectedRequest: null,
    requestLoading: false,
    requestError: null,
    
    // Create Request
    createLoading: false,
    createError: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.profileError = null;
      state.submissionsError = null;
      state.scoreHistoryError = null;
      state.requestError = null;
      state.createError = null;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
      state.requestError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchRMProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchRMProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload.profile || action.payload;
        
        // Update stats from dashboard statistics
        const stats = action.payload.statistics || {};
        state.stats = {
          totalSubmissions: stats.total_salons_added || 0,
          approvedSubmissions: stats.total_approved_salons || stats.approved_requests || 0,
          pendingSubmissions: stats.pending_requests || 0,
          rejectedSubmissions: stats.rejected_requests || 0,
          currentScore: stats.total_score || 0,
        };
      })
      .addCase(fetchRMProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateRMProfileThunk.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateRMProfileThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        // Backend returns { success, message, data }
        state.profile = action.payload.data || action.payload;
      })
      .addCase(updateRMProfileThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });

    // Fetch Submissions
    builder
      .addCase(fetchRMSubmissions.pending, (state) => {
        state.submissionsLoading = true;
        state.submissionsError = null;
      })
      .addCase(fetchRMSubmissions.fulfilled, (state, action) => {
        state.submissionsLoading = false;
        state.submissions = action.payload;
        
        // Update stats from submissions if profile not loaded
        if (!state.profile) {
          state.stats = {
            totalSubmissions: action.payload.length,
            approvedSubmissions: action.payload.filter(s => s.status === 'approved').length,
            pendingSubmissions: action.payload.filter(s => s.status === 'pending').length,
            rejectedSubmissions: action.payload.filter(s => s.status === 'rejected').length,
            currentScore: state.stats.currentScore,
          };
        }
      })
      .addCase(fetchRMSubmissions.rejected, (state, action) => {
        state.submissionsLoading = false;
        state.submissionsError = action.payload;
      });

    // Fetch Request Details
    builder
      .addCase(fetchVendorRequestDetails.pending, (state) => {
        state.requestLoading = true;
        state.requestError = null;
      })
      .addCase(fetchVendorRequestDetails.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.selectedRequest = action.payload;
      })
      .addCase(fetchVendorRequestDetails.rejected, (state, action) => {
        state.requestLoading = false;
        state.requestError = action.payload;
      });

    // Create Request
    builder
      .addCase(createVendorRequestThunk.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVendorRequestThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        // Add new request to submissions
        state.submissions.unshift(action.payload);
        // Update stats
        state.stats.totalSubmissions += 1;
        state.stats.pendingSubmissions += 1;
      })
      .addCase(createVendorRequestThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });

    // Update Request
    builder
      .addCase(updateVendorRequestThunk.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(updateVendorRequestThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        const { requestId, data, submitForApproval } = action.payload;
        
        // Update the request in submissions array
        const index = state.submissions.findIndex(s => s.id === requestId);
        if (index !== -1) {
          state.submissions[index] = data;
          
          // If submitted for approval, update stats
          if (submitForApproval) {
            state.stats.pendingSubmissions += 1;
          }
        }
        
        // Update selectedRequest if it's the same one
        if (state.selectedRequest?.id === requestId) {
          state.selectedRequest = data;
        }
      })
      .addCase(updateVendorRequestThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });

    // Delete Request
    builder
      .addCase(deleteVendorRequestThunk.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(deleteVendorRequestThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        const requestId = action.payload;
        
        // Remove from submissions array
        state.submissions = state.submissions.filter(s => s.id !== requestId);
        
        // Clear selectedRequest if it was deleted
        if (state.selectedRequest?.id === requestId) {
          state.selectedRequest = null;
        }
      })
      .addCase(deleteVendorRequestThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });

    // Fetch Score History
    builder
      .addCase(fetchRMScoreHistory.pending, (state) => {
        state.scoreHistoryLoading = true;
        state.scoreHistoryError = null;
      })
      .addCase(fetchRMScoreHistory.fulfilled, (state, action) => {
        state.scoreHistoryLoading = false;
        state.scoreHistory = action.payload;
      })
      .addCase(fetchRMScoreHistory.rejected, (state, action) => {
        state.scoreHistoryLoading = false;
        state.scoreHistoryError = action.payload;
      });
  },
});

export const { clearErrors, clearSelectedRequest } = rmAgentSlice.actions;
export default rmAgentSlice.reducer;
