import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabase';

// Fetch agent's submission statistics
export const fetchAgentStats = createAsyncThunk(
  'agent/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      // Get all submissions by this agent
      const { data: submissions, error } = await supabase
        .from('salons')
        .select('id, status')
        .eq('submitted_by', userId);

      if (error) throw error;

      const stats = {
        totalSubmissions: submissions?.length || 0,
        approvedSubmissions: submissions?.filter(s => s.status === 'approved').length || 0,
        pendingSubmissions: submissions?.filter(s => s.status === 'pending').length || 0,
        rejectedSubmissions: submissions?.filter(s => s.status === 'rejected').length || 0,
      };

      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch agent's submissions with details
export const fetchAgentSubmissions = createAsyncThunk(
  'agent/fetchSubmissions',
  async (userId, { rejectWithValue }) => {
    try {
      const { data: submissions, error } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          status,
          submitted_at,
          reviewed_at,
          rejection_reason,
          address_line1,
          city,
          state,
          phone,
          email
        `)
        .eq('submitted_by', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer names for reviewed submissions
      const reviewedSubmissions = submissions?.filter(s => s.reviewed_at) || [];
      if (reviewedSubmissions.length > 0) {
        const reviewerIds = reviewedSubmissions
          .map(s => s.reviewed_by)
          .filter(id => id);

        if (reviewerIds.length > 0) {
          const { data: reviewers } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', reviewerIds);

          // Map reviewer names to submissions
          submissions?.forEach(submission => {
            if (submission.reviewed_by) {
              const reviewer = reviewers?.find(r => r.id === submission.reviewed_by);
              submission.reviewerName = reviewer?.full_name || 'Admin';
            }
          });
        }
      }

      return submissions || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Submit new salon
export const submitSalon = createAsyncThunk(
  'agent/submitSalon',
  async (salonData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Prepare salon data
      const salonPayload = {
        // Basic Info
        name: salonData.name,
        description: salonData.description,
        email: salonData.email,
        phone: salonData.phone,
        
        // Address
        address_line1: salonData.address_line1,
        address_line2: salonData.address_line2 || null,
        city: salonData.city,
        state: salonData.state,
        pincode: salonData.pincode,
        
        // Business Hours
        business_hours: salonData.business_hours || {},
        
        // Media
        cover_image: salonData.cover_image || null,
        logo: salonData.logo || null,
        images: salonData.images || [],
        
        // Features
        amenities: salonData.amenities || [],
        specialties: salonData.specialties || [],
        
        // Submission Info
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
        status: 'pending',
        
        // Initialize ratings
        rating: 0,
        total_reviews: 0,
        total_bookings: 0,
      };

      const { data: salon, error } = await supabase
        .from('salons')
        .insert([salonPayload])
        .select()
        .single();

      if (error) throw error;

      // Insert services if provided
      if (salonData.services && salonData.services.length > 0) {
        const servicesPayload = salonData.services.map(service => ({
          salon_id: salon.id,
          name: service.name,
          description: service.description || null,
          category: service.category,
          price: service.price,
          discounted_price: service.discounted_price || null,
          duration_minutes: service.duration_minutes,
          is_available: true,
          image: service.image || null,
        }));

        const { error: servicesError } = await supabase
          .from('salon_services')
          .insert(servicesPayload);

        if (servicesError) {
          console.error('Error inserting services:', servicesError);
          // Don't fail the whole submission if services fail
        }
      }

      return salon;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update draft salon
export const updateSalonDraft = createAsyncThunk(
  'agent/updateSalonDraft',
  async ({ salonId, salonData }, { rejectWithValue }) => {
    try {
      const { data: salon, error } = await supabase
        .from('salons')
        .update({
          name: salonData.name,
          description: salonData.description,
          email: salonData.email,
          phone: salonData.phone,
          address_line1: salonData.address_line1,
          address_line2: salonData.address_line2,
          city: salonData.city,
          state: salonData.state,
          pincode: salonData.pincode,
          business_hours: salonData.business_hours,
          cover_image: salonData.cover_image,
          logo: salonData.logo,
          images: salonData.images,
          amenities: salonData.amenities,
          specialties: salonData.specialties,
        })
        .eq('id', salonId)
        .eq('status', 'draft') // Only allow updating drafts
        .select()
        .single();

      if (error) throw error;
      return salon;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete draft salon
export const deleteSalonDraft = createAsyncThunk(
  'agent/deleteSalonDraft',
  async (salonId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', salonId)
        .eq('status', 'draft'); // Only allow deleting drafts

      if (error) throw error;
      return salonId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  stats: {
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
  },
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchAgentStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAgentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Submissions
      .addCase(fetchAgentSubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAgentSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAgentSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit Salon
      .addCase(submitSalon.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(submitSalon.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentSubmission = action.payload;
      })
      .addCase(submitSalon.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // Update Draft
      .addCase(updateSalonDraft.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateSalonDraft.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentSubmission = action.payload;
      })
      .addCase(updateSalonDraft.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // Delete Draft
      .addCase(deleteSalonDraft.fulfilled, (state, action) => {
        state.submissions = state.submissions.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentSubmission } = agentSlice.actions;
export default agentSlice.reducer;
