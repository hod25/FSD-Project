import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as locationService from '../../services/locationService';
import * as userService from '../../services/userService';

// Area interface definition moved entirely to areaSlice.ts

export interface LocationState {
  name: string | null;
  id: string | null;
  details: Record<string, unknown> | null;
  // areas array removed to avoid duplication
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  name: null,
  id: null,
  details: null,
  // areas: [], - removed
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchLocationDetails = createAsyncThunk(
  'location/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      return await locationService.fetchLocationDetails(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return rejectWithValue('Failed to fetch location details');
    }
  }
);

export const fetchLocation = createAsyncThunk(
  'location/fetchLocation',
  async (id: string, { rejectWithValue }) => {
    try {
      // Fetch only basic location data
      const locationData = await userService.getLocationById(id);
      return locationData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return rejectWithValue('Failed to fetch location');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ name: string; id: string }>) => {
      const { name, id } = action.payload;
      state.name = name;
      state.id = id;
    },
    setLocationName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setLocationId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setLocationDetails: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.details = action.payload;
    },
    // setLocationAreas, addArea, removeArea reducers removed as they should be in areaSlice
    clearLocation: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchLocationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        // Only update location data, not areas
        state.name = action.payload.name;
        state.id = action.payload.id;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLocation,
  setLocationName,
  setLocationId,
  setLocationDetails,
  // setLocationAreas, - removed
  // addArea, - removed
  // removeArea, - removed
  clearLocation,
} = locationSlice.actions;

// Simplified selectors
export const selectLocation = (state: { location: LocationState }) => state.location;
export const selectLocationName = (state: { location: LocationState }) => state.location.name;
export const selectLocationId = (state: { location: LocationState }) => state.location.id;
export const selectLocationDetails = (state: { location: LocationState }) => state.location.details;
// selectLocationAreas removed - use selectAreas from areaSlice instead
export const selectLocationLoading = (state: { location: LocationState }) => state.location.loading;
export const selectLocationError = (state: { location: LocationState }) => state.location.error;

export default locationSlice.reducer;
