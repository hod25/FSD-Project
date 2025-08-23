import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import userReducer from './slices/userSlice';
import locationReducer from './slices/locationSlice';
import areaReducer from './slices/areaSlice'; // Make sure to include areaReducer

// Create a storage object that handles SSR properly
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Use dynamic import to avoid SSR issues
let storage: any;
if (typeof window !== 'undefined') {
  // Client-side: use localStorage
  storage = require('redux-persist/lib/storage').default;
} else {
  // Server-side: use noop storage
  storage = createNoopStorage();
}

// Redux Persist Configuration
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['name', 'email', 'access_level', 'site_location', '_id', 'isLoggedIn'], // Store user properties
};

const locationPersistConfig = {
  key: 'location',
  storage,
  whitelist: ['name', 'id', 'details'], // Store location data including areas
};

const areaPersistConfig = {
  key: 'area',
  storage,
  whitelist: ['list', 'currentArea', 'currentAreaId', 'currentAreaUrl'],
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedLocationReducer = persistReducer(locationPersistConfig, locationReducer);
const persistedAreaReducer = persistReducer(areaPersistConfig, areaReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    location: persistedLocationReducer,
    area: persistedAreaReducer, // Include area reducer in the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents Redux Persist warnings
    }),
});

export const persistor = persistStore(store);

// Type definitions for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;