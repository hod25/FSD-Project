'use client';

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { fetchLocationById } from '@/shared/services/locationService';
import { fetchAreaById } from '@/shared/services/areaService';

const SOCKET_SERVER_URL = 'http://pro-safe.cs.colman.ac.il:5000';

export interface LiveAlert {
  message: string;
  timestamp: string;
  site_location?: string;
  area_location?: string;
  details?: string;
  image_url?: string;
  no_hardhat_count?: number;
  // Enhanced with names
  site_name?: string;
  area_name?: string;
}

interface LocationCache {
  [id: string]: string;
}

interface AreaCache {
  [id: string]: string;
}

export const useLiveAlerts = () => {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [locationCache, setLocationCache] = useState<LocationCache>({});
  const [areaCache, setAreaCache] = useState<AreaCache>({});

  // Function to get location name by ID
  const getLocationName = useCallback(
    async (locationId: string): Promise<string> => {
      if (locationCache[locationId]) {
        return locationCache[locationId];
      }

      try {
        const location = await fetchLocationById(locationId);
        const name = location.name || 'Unknown Location';
        setLocationCache((prev) => ({ ...prev, [locationId]: name }));
        return name;
      } catch (error) {
        console.error('Error fetching location:', error);
        return locationId; // Fallback to ID
      }
    },
    [locationCache]
  );

  // Function to get area name by ID
  const getAreaName = useCallback(
    async (areaId: string): Promise<string> => {
      if (areaCache[areaId]) {
        return areaCache[areaId];
      }

      try {
        const area = await fetchAreaById(areaId);
        const name = area.name || 'Unknown Area';
        setAreaCache((prev) => ({ ...prev, [areaId]: name }));
        return name;
      } catch (error) {
        console.error('Error fetching area:', error);
        return areaId; // Fallback to ID
      }
    },
    [areaCache]
  );

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to live alerts socket server');
      setIsConnected(true);
    });

    socketInstance.on('alert', async (data: LiveAlert) => {
      console.log('🚨 New live alert received:', data);

      // Enhance alert with names inline
      const enhancedAlert = { ...data };

      if (data.site_location) {
        enhancedAlert.site_name = await getLocationName(data.site_location);
      }

      if (data.area_location) {
        enhancedAlert.area_name = await getAreaName(data.area_location);
      }

      setAlerts((prev) => [enhancedAlert, ...prev]);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from live alerts socket server');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [getLocationName, getAreaName]);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const removeAlert = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const getRecentAlerts = (count: number = 5) => {
    return alerts.slice(0, count);
  };

  return {
    alerts,
    isConnected,
    clearAlerts,
    removeAlert,
    getRecentAlerts,
    alertCount: alerts.length,
  };
};
