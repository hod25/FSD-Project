import axios from 'axios';

const API_URL = 'http://pro-safe.cs.colman.ac.il:5000/api/locations';

export interface LocationData {
  id: string;
  name: string;
  details?: Record<string, unknown>;
}

export interface AreaData {
  id: string;
  areaName: string;
  _id: string;
  name: string;
  url?: string;
}

export interface AreasResponse {
  areas: AreaData[];
}

/**
 * Fetches all locations from the server
 */
export const fetchLocations = async (): Promise<LocationData[]> => {
  const response = await axios.get<LocationData[]>(API_URL);
  return response.data;
};

/**
 * Fetches a single location by ID
 */
export const fetchLocationById = async (id: string): Promise<LocationData> => {
  const response = await axios.get<LocationData>(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Fetches location details by ID
 */
export const fetchLocationDetails = async (id: string): Promise<Record<string, unknown>> => {
  const response = await axios.get<Record<string, unknown>>(`${API_URL}/${id}/details`);
  return response.data;
};

/**
 * Fetches all areas for a specific location by ID
 */
export const fetchAreaNamesByLocationId = async (id: string): Promise<AreaData[]> => {
  const response = await axios.get<AreasResponse>(`${API_URL}/${id}/areas`);
  return response.data.areas;
};

/**
 * Creates a new location
 */
export const createLocation = async (
  locationData: Omit<LocationData, 'id'>
): Promise<LocationData> => {
  const response = await axios.post<LocationData>(API_URL, locationData);
  return response.data;
};

/**
 * Updates an existing location
 */
export const updateLocation = async (
  id: string,
  locationData: Partial<LocationData>
): Promise<LocationData> => {
  const response = await axios.put<LocationData>(`${API_URL}/${id}`, locationData);
  return response.data;
};

/**
 * Deletes a location
 */
export const deleteLocation = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
export const addAreaToLocation = async (locationId: string, areaId: string) => {
  const response = await axios.post(`${API_URL}/add-area`, {
    locationId,
    areaId,
  });
  return response.data;
};
/**
 * Removes an area from a location
 */
export const removeAreaFromLocation = async (
  locationId: string,
  areaId: string
): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(`${API_URL}/remove-area`, {
    locationId,
    areaId,
  });
  return response.data;
};


