import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import userReducer from './slices/userSlice';
import locationReducer from './slices/locationSlice';
import areaReducer from './slices/areaSlice';
import type { WebStorage } from 'redux-persist/es/types';

// ---- Create a storage object that handles SSR properly ----
const createNoopStorage = (): WebStorage => {
  return {
    getItem(): Promise<string | null> {
      return Promise.resolve(null);
    },
    setItem(): Promise<void> {
      return Promise.resolve();
    },
    removeItem(): Promise<void> {
      return Promise.resolve();
    },
  };
};

// ---- Use storage that works for both SSR and client ----
const persistStorage = typeof window !== 'undefined' ? storage : createNoopStorage();

// ---- Redux Persist Configuration ----
const userPersistConfig = {
  key: 'user',
  storage: persistStorage,
  whitelist: ['name', 'email', 'access_level', 'site_location', '_id', 'isLoggedIn'],
};

const locationPersistConfig = {
  key: 'location',
  storage: persistStorage,
  whitelist: ['name', 'id', 'details'],
};

const areaPersistConfig = {
  key: 'area',
  storage: persistStorage,
  whitelist: ['list', 'currentArea', 'currentAreaId', 'currentAreaUrl'],
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedLocationReducer = persistReducer(locationPersistConfig, locationReducer);
const persistedAreaReducer = persistReducer(areaPersistConfig, areaReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    location: persistedLocationReducer,
    area: persistedAreaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// ---- Types ----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
