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

// Helper to check if coordinates are approximately equal (within ~11m)
const coordsEqual = (coord1, coord2) => {
  if (!coord1 || !coord2) return false;
  return Math.abs(coord1.lat - coord2.lat) < 0.0001 && 
         Math.abs(coord1.lon - coord2.lon) < 0.0001;
};

// Helper to get cached reverse geocode result from localStorage
const getCachedReverseGeocode = (lat, lon) => {
  try {
    const cacheKey = `reverseGeocode_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { locationName, timestamp } = JSON.parse(cached);
      // Cache valid for 1 hour
      if (Date.now() - timestamp < 3600000) {
        return locationName;
      }
      // Expired - remove it
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    // Silently fail localStorage errors
  }
  return null;
};

// Helper to cache reverse geocode result in localStorage
const setCachedReverseGeocode = (lat, lon, locationName) => {
  try {
    const cacheKey = `reverseGeocode_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      locationName,
      timestamp: Date.now()
    }));
  } catch (error) {
    // Silently fail localStorage errors
  }
};

// Thunk to get user location
export const getUserLocation = () => async (dispatch, getState) => {
  const currentState = getState().location;
  
  // If we already have this exact location with a name, don't refetch
  if (currentState.userLocation && currentState.locationName && !currentState.locationLoading) {
    console.log('[Location] Already have location with name, skipping');
    return;
  }

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
      
      // Check if this is the same location we already have
      if (coordsEqual(location, currentState.userLocation)) {
        console.log('[Location] Same coordinates as before, skipping reverse geocode');
        dispatch(setLocationLoading(false));
        return;
      }
      
      dispatch(setUserLocation(location));
      
      // Check localStorage cache first
      const cachedName = getCachedReverseGeocode(location.lat, location.lon);
      if (cachedName) {
        console.log('[Location] Using cached location name:', cachedName);
        dispatch(setLocationName(cachedName));
        return;
      }
      
      // Fetch human-readable location name via reverse geocoding
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const reverseGeocodeUrl = `${BACKEND_URL}/api/v1/location/reverse-geocode?lat=${location.lat}&lon=${location.lon}`;
        
        console.log('[Location] Fetching reverse geocode from backend');
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
            let locationName = null;
            if (area && city && area !== city) {
              locationName = `${area}, ${city}`;
            } else if (city) {
              locationName = city;
            }
            
            if (locationName) {
              dispatch(setLocationName(locationName));
              // Cache the result
              setCachedReverseGeocode(location.lat, location.lon, locationName);
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
