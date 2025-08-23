// src/hooks/useAlerts.ts
import { useState, useEffect } from 'react';
import { alertService } from '@/shared/services/alertService';
import { AlertServiceState } from '@/shared/types/services';

export const useAlerts = () => {
  const [state, setState] = useState<AlertServiceState>(alertService.getState());

  useEffect(() => {
    const unsubscribe = alertService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    toggleMonitoring: alertService.toggleMonitoring,
    markAsRead: alertService.markAsRead,
    markAllAsRead: alertService.markAllAsRead,
    clearAllAlerts: alertService.clearAllAlerts,
  };
};
