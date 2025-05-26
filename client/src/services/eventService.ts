import axios from 'axios';

const EVENTS_API_URL = 'http://pro-safe.cs.colman.ac.il:5000/api/events';

export interface Event {
  _id: string;
  site_location: string;
  area_location: string;
  status: string;
  details: string;
  image_url: string;
  time_: string;
}

export const fetchAllEvents = async (): Promise<Event[]> => {
  try {
    const response = await axios.get<Event[]>(EVENTS_API_URL);

    // Add logging to check what's being returned
    console.log(`API returned ${response.data?.length || 0} events`);

    // Ensure we always return an array, even if the response is null or undefined
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching all events:', error);
    return []; // Return empty array on error instead of throwing
  }
};

export const fetchEventsByArea = async (areaId: string): Promise<Event[]> => {
  const response = await axios.get<Event[]>(`${EVENTS_API_URL}/area/${areaId}`);
  return response.data;
};

export const updateEventStatus = async (eventId: string): Promise<Event> => {
  const response = await axios.patch<Event>(`${EVENTS_API_URL}/status/${eventId}`);
  return response.data;
};
