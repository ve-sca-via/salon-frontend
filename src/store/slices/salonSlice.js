import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  salons: [],
  selectedSalon: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    status: 'approved',
  },
};

const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    fetchSalonsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSalonsSuccess: (state, action) => {
      state.loading = false;
      state.salons = action.payload;
      state.error = null;
    },
    fetchSalonsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedSalon: (state, action) => {
      state.selectedSalon = action.payload;
    },
    updateSalonInList: (state, action) => {
      const index = state.salons.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.salons[index] = action.payload;
      }
    },
    addSalon: (state, action) => {
      state.salons.push(action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  fetchSalonsStart,
  fetchSalonsSuccess,
  fetchSalonsFailure,
  setSelectedSalon,
  updateSalonInList,
  addSalon,
  setFilters,
  clearFilters,
} = salonSlice.actions;

export default salonSlice.reducer;
