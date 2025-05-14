import axios from 'axios';
import { Area } from '../store/slices/areaSlice';

const API_URL = 'http://localhost:5000/api/areas'; // Adjust this to your actual API endpoint

/**
 * Fetches all areas from the server
 */
export const fetchAreas = async (): Promise<Area[]> => {
  const response = await axios.get<Area[]>(API_URL);
  return response.data;
};

/**
 * Fetches areas for a specific location
 */
export const fetchAreasByLocation = async (locationId: string): Promise<Area[]> => {
  const response = await axios.get<Area[]>(`${API_URL}?locationId=${locationId}`);
  return response.data;
};

/**
 * Fetches a single area by ID
 */
export const fetchAreaById = async (id: string): Promise<Area> => {
  const response = await axios.get<Area>(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Creates a new area
 */
export const createArea = async (
  areaData: Omit<Area, 'id'>,
  locationId?: string
): Promise<Area> => {
  const url = locationId ? `${API_URL}?locationId=${locationId}` : API_URL;
  const response = await axios.post<Area>(url, areaData);
  return response.data;
};

/**
 * Updates an existing area
 */
export const updateArea = async (id: string, areaData: Partial<Area>): Promise<Area> => {
  const response = await axios.put<Area>(`${API_URL}/${id}`, areaData);
  return response.data;
};

/**
 * Deletes an area
 */
export const deleteArea = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
