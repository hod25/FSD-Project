import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';
import { fetchLocation } from './locationSlice';

export interface UserState {
  name: string | null;
  email: string | null;
  phone: string | null;
  access_level: string | null;
  site_location: string | null;
  _id: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  phone: null,
  access_level: null,
  site_location: null,
  _id: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

// Async thunk for user login
export const loginUserAsync = createAsyncThunk(
  'user/login',
  async (credentials: userService.LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await userService.login(credentials);
      const userData = response.user;

      // If user has a site location, fetch that location (with areas)
      if (userData.site_location) {
        dispatch(fetchLocation(userData.site_location));
      }

      return userData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        phone?: string;
        access_level: string;
        site_location: string;
        _id: string;
      }>
    ) => {
      const { name, email, phone, access_level, site_location, _id } = action.payload;
      state.name = name;
      state.email = email;
      state.phone = phone || null;
      state.access_level = access_level;
      state.site_location = site_location;
      state._id = _id;
      state.isLoggedIn = true;
    },
    logoutUser: () => {
      // Reset to initial state on logout
      return initialState;
    },
    updateUserDetails: (state, action: PayloadAction<Partial<UserState>>) => {
      // Update user properties with the provided values
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        const { name, email, phone, access_level, site_location, _id } = action.payload;
        state.name = name;
        state.email = email;
        state.phone = phone || null;
        state.access_level = access_level;
        state.site_location = site_location || null;
        state._id = _id;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginUser, logoutUser, updateUserDetails } = userSlice.actions;

// Selectors are now simpler with the flattened state structure
export const selectUser = (state: { user: UserState }) => state.user;
export const selectIsLoggedIn = (state: { user: UserState }) => state.user.isLoggedIn;
export const selectIsAdmin = (state: { user: UserState }) => state.user.access_level === 'admin';
export const selectUserName = (state: { user: UserState }) => state.user.name;
export const selectID = (state: { user: UserState }) => state.user._id;
export const selectUserEmail = (state: { user: UserState }) => state.user.email;
export const selectUserPhone = (state: { user: UserState }) => state.user.phone;
export const selectUserLocationId = (state: { user: UserState }) => state.user.site_location;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;
