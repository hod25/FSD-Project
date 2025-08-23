// src/types/services.ts

export interface Alert {
  id: string;
  message: string;
  timestamp: string;
  site_location?: string;
  area_location?: string;
  details?: string;
  image_url?: string;
  no_hardhat_count?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isRead?: boolean;
  createdAt: Date;
}

export interface AlertServiceState {
  alerts: Alert[];
  unreadCount: number;
  isConnected: boolean;
  isMonitoring: boolean;
}

export interface CameraServiceState {
  streamUrl: string | null;
  isAvailable: boolean;
  isMonitoring: boolean;
  error: string | null;
  areaName: string | null;
}

export type ServiceListener<T> = (state: T) => void;
