// src/services/cameraService.ts
import { CameraServiceState, ServiceListener } from '@/shared/types/services';

const CAMERA_STREAM_BASE_URL = 'http://193.106.55.31:8000/video';

class CameraService {
  private static instance: CameraService;
  private state: CameraServiceState = {
    streamUrl: null,
    isAvailable: false,
    isMonitoring: true,
    error: null,
    areaName: null,
  };
  private listeners: Set<ServiceListener<CameraServiceState>> = new Set();
  private currentSiteId: string | null = null;
  private currentAreaId: string | null = null;
  private currentAreaName: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    console.log('📷 Initializing Camera Service...');
  }

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  private updateState(newState: Partial<CameraServiceState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: ServiceListener<CameraServiceState>): () => void {
    this.listeners.add(listener);
    listener(this.state); // Immediately notify with current state
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): CameraServiceState {
    return this.state;
  }

  public setAreaAndSite(siteId: string | null, areaId: string | null, areaName: string | null) {
    if (this.currentSiteId === siteId && this.currentAreaId === areaId) {
      return; // No change
    }

    this.currentSiteId = siteId;
    this.currentAreaId = areaId;
    this.currentAreaName = areaName;
    console.log('🎥 Camera Service: Site/Area set to', siteId, '/', areaId);

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (siteId && areaId) {
      this.updateState({ areaName: areaName });
      this.startMonitoring();
    } else {
      this.stopMonitoring('No site or area selected.');
    }
  }

  private startMonitoring() {
    if (!this.currentSiteId || !this.currentAreaId || !this.state.isMonitoring) {
      this.stopMonitoring(
        this.state.isMonitoring ? 'No site or area selected' : 'Monitoring is paused'
      );
      return;
    }

    // Build the dynamic URL using siteId and areaId
    const url = `${CAMERA_STREAM_BASE_URL}?site_id=${this.currentSiteId}&area_id=${
      this.currentAreaId
    }&test=${Date.now()}`;
    this.updateState({ streamUrl: url, error: null });
    this.checkStreamAvailability(); // Initial check

    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => this.checkStreamAvailability(), 15000); // Check every 15 seconds
    }
  }

  private stopMonitoring(reason: string) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.updateState({
      streamUrl: null,
      isAvailable: false,
      error: reason,
      areaName: this.currentAreaName || null,
    });
    console.log(`🎥 Camera monitoring stopped: ${reason}`);
  }

  public toggleMonitoring = () => {
    const wasMonitoring = this.state.isMonitoring;
    this.updateState({ isMonitoring: !wasMonitoring });
    console.log(`Camera monitoring ${!wasMonitoring ? 'enabled' : 'disabled'}`);

    if (!wasMonitoring) {
      this.startMonitoring();
    } else {
      this.stopMonitoring('Monitoring paused by user.');
    }
  };

  private async checkStreamAvailability() {
    if (!this.state.streamUrl || !this.state.isMonitoring) {
      this.updateState({ isAvailable: false });
      return;
    }

    try {
      // We use fetch with a timeout to check if the stream endpoint is responsive.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      await fetch(this.state.streamUrl, { signal: controller.signal, mode: 'no-cors' });
      clearTimeout(timeoutId);

      // no-cors means we can't inspect the response body or status code in detail,
      // but a successful fetch (not throwing an error) indicates the endpoint is likely up.
      if (!this.state.isAvailable) {
        console.log(`✅ Camera stream for ${this.state.areaName} is available.`);
        this.updateState({ isAvailable: true, error: null });
      }
    } catch (error) {
      if (this.state.isAvailable) {
        const errorMessage = `Stream for ${this.state.areaName} is not available.`;
        console.error(`❌ ${errorMessage}`, error);
        this.updateState({ isAvailable: false, error: errorMessage });
      }
    }
  }

  public cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
    this.state = {
      streamUrl: null,
      isAvailable: false,
      isMonitoring: true,
      error: null,
      areaName: null,
    };
    this.currentSiteId = null;
    this.currentAreaId = null;
    this.currentAreaName = null;
    console.log('🧹 Camera Service cleaned up');
  }
}

export const cameraService = CameraService.getInstance();
