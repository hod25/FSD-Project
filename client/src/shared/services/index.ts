// User services
export * from './userService';

// Area services
export * from './areaService';

// Location services
export {
  fetchLocations,
  fetchLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  fetchAreaNamesByLocationId,
} from './locationService';

export type { LocationData } from './locationService';

// Event services
export * from './eventService';

// Camera services
export * from './cameraService';

// Alert services
export * from './alertService';
