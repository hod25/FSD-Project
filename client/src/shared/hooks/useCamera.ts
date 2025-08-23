// src/hooks/useCamera.ts
import { useState, useEffect } from 'react';
import { cameraService } from '@/shared/services/cameraService';
import { CameraServiceState } from '@/shared/types/services';

export const useCamera = () => {
  const [state, setState] = useState<CameraServiceState>(cameraService.getState());

  useEffect(() => {
    const unsubscribe = cameraService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    toggleMonitoring: cameraService.toggleMonitoring,
    setAreaAndSite: cameraService.setAreaAndSite,
  };
};
