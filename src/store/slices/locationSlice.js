import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userLocation: null, // { lat, lon }
  locationName: null, // Human-readable location name (e.g., "Koramangala, Bengaluru")
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
    setLocationName: (state, action) => {
      state.locationName = action.payload;
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload;
      state.locationLoading = false;
      state.locationFetched = true;
    },
    clearLocation: (state) => {
      state.userLocation = null;
      state.locationName = null;
      state.locationError = null;
    },
  },
});

export const {
  setLocationLoading,
  setUserLocation,
  setLocationName,
  setLocationError,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;

// Thunk to get user location
export const getUserLocation = () => async (dispatch) => {
  dispatch(setLocationLoading(true));

  if (!navigator.geolocation) {
    dispatch(setLocationError("Geolocation is not supported by your browser"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      dispatch(setUserLocation(location));
      
      // Fetch human-readable location name via reverse geocoding
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const reverseGeocodeUrl = `${BACKEND_URL}/api/v1/location/reverse-geocode?lat=${location.lat}&lon=${location.lon}`;
        
        const response = await fetch(reverseGeocodeUrl);
        
        if (response.ok) {
          const data = await response.json();
          const { address } = data;
          
          if (address && address.components) {
            // Extract area and city from components
            // Priority: suburb > neighbourhood > road > hamlet
            const components = address.components;
            const area = components.suburb || 
                        components.neighbourhood || 
                        components.road || 
                        components.hamlet;
            const city = components.city || 
                        components.town || 
                        components.village || 
                        components.state;
            
            // Build location name
            if (area && city && area !== city) {
              dispatch(setLocationName(`${area}, ${city}`));
            } else if (city) {
              dispatch(setLocationName(city));
            }
            // Else: locationName stays null, falls back to "your location" in UI
          }
        }
        // Silently fail - location coordinates still work
      } catch (error) {
        // Silently fail - location coordinates still work
        if (import.meta.env.DEV) {
          console.warn('[Location] Reverse geocoding failed:', error);
        }
      }
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
