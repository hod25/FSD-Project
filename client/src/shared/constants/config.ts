export const API_BASE_URL = 'http://localhost:5000/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  AREAS: '/areas',
  LOCATIONS: '/locations',
  EVENTS: '/events',
  USERS: '/users',
  STATS: '/stats',
} as const;

export const DRAWER_WIDTH = 240;

export const THEME_COLORS = {
  primary: '#d18700',
  primaryLight: 'rgba(209, 135, 0, 0.1)',
  primaryDark: '#b37300',
  secondary: '#333333',
  textPrimary: '#333333',
  textSecondary: '#707070',
} as const;
