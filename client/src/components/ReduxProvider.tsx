'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store'; // adjust the path if needed

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
