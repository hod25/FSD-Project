// Common types for the application

export interface LocationData {
  _id: string;
  name: string;
  address?: string;
  description?: string;
}

export interface AreaData {
  _id: string;
  name: string;
  locationId: string;
  url?: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  access_level: string;
  site_location?: string;
}

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

export interface LoginResponse {
  user: UserData;
  site_location?: string;
}
