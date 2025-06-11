'use client';

import { Home, CameraAlt, Assessment, Event, Business, Person } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '@/store/slices/userSlice';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType;
}

export const menuItems: MenuItem[] = [
  { id: 'home', label: 'Home', path: '/connected/home', icon: Home },
  { id: 'live-camera', label: 'Live Camera', path: '/connected/live-camera', icon: CameraAlt },
  { id: 'statistics', label: 'Statistics', path: '/connected/statistics', icon: Assessment },
  { id: 'events', label: 'Events', path: '/connected/events', icon: Event },
  {
    id: 'site-management',
    label: 'Site Management',
    path: '/connected/site-management',
    icon: Business,
  },
  { id: 'profile', label: 'Profile', path: '/connected/profile', icon: Person },
  // { id: 'user-management', label: 'User Management', path: '/connected/user-management', icon: Person }, // Hidden for now
];
