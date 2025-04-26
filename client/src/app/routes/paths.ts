'use client';

import { Dashboard, Feed, AddBox, Person, RateReview } from '@mui/icons-material';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType; // Notice: Now type is a COMPONENT, not a ReactNode
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/connected/dashboard', icon: Dashboard },
  { id: 'feed', label: 'Feed', path: '/connected/feed', icon: Feed },
  { id: 'addpost', label: 'Add Post', path: '/connected/addpost', icon: AddBox },
  { id: 'myprofile', label: 'My Profile', path: '/connected/myprofile', icon: Person },
  { id: 'myreviews', label: 'My Reviews', path: '/connected/myreviews', icon: RateReview },
];
