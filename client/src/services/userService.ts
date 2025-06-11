import axios from 'axios';

// Base URLs for different API endpoints
const AUTH_API_URL = 'http://pro-safe.cs.colman.ac.il:5000/api/auth';
const USERS_API_URL = 'http://pro-safe.cs.colman.ac.il:5000/api/users';
const LOCATIONS_API_URL = 'http://pro-safe.cs.colman.ac.il:5000/api/locations';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  site_location?: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  access_level: string;
  site_location?: string;
}

export interface LoginResponse {
  user: UserData;
  site_location?: string;
}

/**
 * Authentication Functions
 */

// Login user
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${AUTH_API_URL}/login`, credentials, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Login request error:', error);
    throw error;
  }
};

// Register new user
export const register = async (userData: RegisterCredentials): Promise<{ user: UserData }> => {
  const response = await axios.post<{ user: UserData }>(`${AUTH_API_URL}/register`, userData, {
    withCredentials: true,
  });
  return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  await axios.post(`${AUTH_API_URL}/logout`, {}, { withCredentials: true });
};

/**
 * User Profile Functions
 */

// Get current user data
export const getCurrentUser = async (): Promise<UserData> => {
  const response = await axios.get<UserData>(`${AUTH_API_URL}/me`, { withCredentials: true });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  userData: Partial<UserData>
): Promise<UserData> => {
  const response = await axios.put<UserData>(`${USERS_API_URL}/${userId}`, userData, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Location-related Functions
 */

export interface LocationData {
  id: string;
  name: string;
  details?: Record<string, unknown>;
}

export interface AreaData {
  id: string;
  _id?: string;
  name: string;
  areaName?: string;
  url?: string;
}

// Get location name by ID
export const getLocationNameById = async (locationId: string): Promise<string> => {
  const response = await axios.get<{ name: string }>(`${LOCATIONS_API_URL}/${locationId}`);
  return response.data.name;
};

// Get location details by ID
export const getLocationById = async (locationId: string): Promise<LocationData> => {
  const response = await axios.get<LocationData>(`${LOCATIONS_API_URL}/${locationId}`);
  return response.data;
};

// Get all areas for a location
export const getAreasByLocationId = async (locationId: string): Promise<AreaData[]> => {
  const response = await axios.get<{ areas: AreaData[] }>(
    `${LOCATIONS_API_URL}/${locationId}/areas`
  );
  return response.data.areas;
};
