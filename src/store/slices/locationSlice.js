import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userLocation: null, // { lat, lon }
  locationError: null,
  locationLoading: false,
  locationFetched: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationLoading: (state, action) => {
      state.locationLoading = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      state.locationError = null;
      state.locationLoading = false;
      state.locationFetched = true;
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload;
      state.locationLoading = false;
      state.locationFetched = true;
    },
    clearLocation: (state) => {
      state.userLocation = null;
      state.locationError = null;
    },
  },
});

export const {
  setLocationLoading,
  setUserLocation,
  setLocationError,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;

// Thunk to get user location
export const getUserLocation = () => (dispatch) => {
  dispatch(setLocationLoading(true));

  if (!navigator.geolocation) {
    dispatch(setLocationError("Geolocation is not supported by your browser"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      dispatch(setUserLocation(location));
    },
    (error) => {
      let errorMsg = "Unable to get your location";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "Location access denied. Please enable location permissions.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMsg = "Location request timed out.";
          break;
        default:
          errorMsg = "An unknown error occurred.";
      }
      dispatch(setLocationError(errorMsg));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
    }
  );
};
