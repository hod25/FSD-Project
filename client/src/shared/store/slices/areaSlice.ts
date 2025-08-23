import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as areaService from '../../services/areaService';
import * as locationService from '../../services/locationService';

export interface Area {
  id: string;
  name: string;
  url: string;
}

export interface AreaState {
  list: Area[];
  currentArea: string | null;
  currentAreaId: string | null;
  currentAreaUrl: string | null; // Added currentUrl property
  loading: boolean;
  error: string | null;
}

const initialState: AreaState = {
  list: [],
  currentArea: null,
  currentAreaId: null,
  currentAreaUrl: null, // Initialize currentUrl as null
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchAreasByLocation = createAsyncThunk(
  'area/fetchByLocation',
  async (locationId: string, { rejectWithValue }) => {
    try {
      try {
        // First attempt to fetch areas using areaService
        return await areaService.fetchAreasByLocation(locationId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (areaError) {
        // If that fails, use locationService as fallback
        const areasData = await locationService.fetchAreaNamesByLocationId(locationId);

        // Transform the area data to match the expected Area interface
        return areasData.map((area) => ({
          id: area.id || area._id, // Use either id or _id depending on what's available
          name: area.name || area.areaName,
          url: area.url || '', // Provide default empty string if url is undefined
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return rejectWithValue('Failed to fetch areas');
    }
  }
);

export const createNewArea = createAsyncThunk(
  'area/createArea',
  async ({ name, locationId }: { name: string; locationId?: string }, { rejectWithValue }) => {
    try {
      return await areaService.createArea(
        {
          name,
          url: '',
        },
        locationId
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return rejectWithValue('Failed to create area');
    }
  }
);

export const deleteExistingArea = createAsyncThunk(
  'area/deleteArea',
  async (id: string, { rejectWithValue }) => {
    try {
      await areaService.deleteArea(id);
      return id;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return rejectWithValue('Failed to delete area');
    }
  }
);

const areaSlice = createSlice({
  name: 'area',
  initialState,
  reducers: {
    setAreaList: (state, action: PayloadAction<Area[]>) => {
      state.list = action.payload;
    },
    setCurrentArea: (state, action: PayloadAction<{ name: string; id: string }>) => {
      state.currentArea = action.payload.name;
      state.currentAreaId = action.payload.id;

      // Set currentUrl based on the area ID
      const area = state.list.find((a) => a.id === action.payload.id);
      state.currentAreaUrl = area?.url || null;
    },
    setCurrentAreaByName: (state, action: PayloadAction<string>) => {
      state.currentArea = action.payload;
      // Find the area that matches this name
      const area = state.list.find((a) => a.name === action.payload);
      if (area) {
        state.currentAreaId = area.id;
        state.currentAreaUrl = area.url || null; // Update currentUrl
      }
    },
    clearAreas: () => {
      return initialState;
    },
    addArea: (state, action: PayloadAction<Area>) => {
      state.list.push(action.payload);
    },
    removeArea: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((area) => area.id !== action.payload);
    },
    // Add a dedicated action to update the current URL
    setCurrentUrl: (state, action: PayloadAction<string | null>) => {
      state.currentAreaUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreasByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreasByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAreasByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createNewArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewArea.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createNewArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExistingArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingArea.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((area) => area.id !== action.payload);

        // Reset current area if it was deleted
        if (state.currentAreaId === action.payload) {
          state.currentArea = null;
          state.currentAreaId = null;
        }
      })
      .addCase(deleteExistingArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAreaList,
  setCurrentArea,
  setCurrentAreaByName,
  clearAreas,
  addArea,
  removeArea,
  setCurrentUrl, // Export the new action
} = areaSlice.actions;

// Safe selectors with fallbacks to prevent runtime errors
export const selectAreas = (state: { area?: AreaState }) => state.area?.list || [];
export const selectCurrentAreaName = (state: { area?: AreaState }) =>
  state.area?.currentArea || null;
export const selectCurrentAreaId = (state: { area?: AreaState }) =>
  state.area?.currentAreaId || null;
export const selectCurrentAreaUrl = (
  state: { area?: AreaState } // New selector
) => state.area?.currentAreaUrl || null;
export const selectAreasLoading = (state: { area?: AreaState }) => state.area?.loading || false;
export const selectAreasError = (state: { area?: AreaState }) => state.area?.error || null;

export default areaSlice.reducer;
