// src/services/alertService.ts
import { io, Socket } from 'socket.io-client';
import { Alert, AlertServiceState, ServiceListener } from '@/shared/types/services';

const SOCKET_SERVER_URL = 'http://pro-safe.cs.colman.ac.il:5000';

class AlertService {
  private static instance: AlertService;
  private socket: Socket | null = null;
  private state: AlertServiceState = {
    alerts: [],
    unreadCount: 0,
    isConnected: false,
    isMonitoring: true,
  };
  private listeners: Set<ServiceListener<AlertServiceState>> = new Set();

  private constructor() {
    this.init();
  }

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  private init() {
    console.log('🔌 Initializing Alert Service...');
    this.socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on('connect', this.handleConnect);
    this.socket.on('disconnect', this.handleDisconnect);
    this.socket.on('alert', this.handleAlert);
  }

  private handleConnect = () => {
    console.log('✅ Alert Service connected to socket server');
    this.updateState({ isConnected: true });
  };

  private handleDisconnect = () => {
    console.log('❌ Alert Service disconnected from socket server');
    this.updateState({ isConnected: false });
  };

  private handleAlert = (data: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => {
    if (!this.state.isMonitoring) {
      console.log('⏸️ Alert monitoring is paused, ignoring alert');
      return;
    }
    console.log('🚨 New alert received:', data);

    const newAlert: Alert = {
      ...data,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isRead: false,
      severity: this.determineSeverity(data),
    };

    const newAlerts = [newAlert, ...this.state.alerts].slice(0, 100);
    this.updateState({
      alerts: newAlerts,
      unreadCount: this.state.unreadCount + 1,
    });
  };

  private determineSeverity = (
    alert: Omit<Alert, 'id' | 'createdAt' | 'isRead' | 'severity'>
  ): Alert['severity'] => {
    const message = alert.message?.toLowerCase() || '';
    const details = alert.details?.toLowerCase() || '';
    const noHardhatCount = alert.no_hardhat_count || 0;

    if (noHardhatCount >= 5 || message.includes('critical') || details.includes('critical'))
      return 'critical';
    if (noHardhatCount >= 3 || message.includes('high') || details.includes('high')) return 'high';
    if (noHardhatCount >= 1 || message.includes('medium') || details.includes('medium'))
      return 'medium';
    return 'low';
  };

  private updateState(newState: Partial<AlertServiceState>) {
    // Ensure current state is initialized
    if (!this.state) {
      this.state = {
        alerts: [],
        unreadCount: 0,
        isConnected: false,
        isMonitoring: true,
      };
    }
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    if (!this.state) return; // Safety check
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: ServiceListener<AlertServiceState>): () => void {
    this.listeners.add(listener);
    listener(this.getState()); // Use getState to ensure state is initialized
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AlertServiceState {
    // Ensure state is always initialized
    if (!this.state) {
      this.state = {
        alerts: [],
        unreadCount: 0,
        isConnected: false,
        isMonitoring: true,
      };
    }
    return this.state;
  }

  public toggleMonitoring = () => {
    if (!this.state) {
      console.warn('AlertService: Cannot toggle monitoring - state not initialized');
      return;
    }
    this.updateState({ isMonitoring: !this.state.isMonitoring });
    console.log(`Alert monitoring ${this.state.isMonitoring ? 'enabled' : 'disabled'}`);
  };

  public markAsRead(alertId: string) {
    if (!this.state || !this.state.alerts) {
      console.warn('AlertService: Cannot mark alert as read - state not initialized');
      return;
    }
    const alerts = this.state.alerts.map((alert) =>
      alert.id === alertId && !alert.isRead ? { ...alert, isRead: true } : alert
    );
    const changed = alerts.some((a, i) => a.isRead !== this.state.alerts[i].isRead);
    if (changed) {
      this.updateState({
        alerts,
        unreadCount: this.state.unreadCount - 1,
      });
    }
  }

  public markAllAsRead() {
    if (!this.state || !this.state.alerts) {
      console.warn('AlertService: Cannot mark alerts as read - state not initialized');
      return;
    }
    const alerts = this.state.alerts.map((alert) => ({ ...alert, isRead: true }));
    this.updateState({ alerts, unreadCount: 0 });
  }

  public clearAllAlerts() {
    if (!this.state) {
      console.warn('AlertService: Cannot clear alerts - state not initialized');
      return;
    }
    this.updateState({ alerts: [], unreadCount: 0 });
  }

  public cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.off('connect', this.handleConnect);
      this.socket.off('disconnect', this.handleDisconnect);
      this.socket.off('alert', this.handleAlert);
      this.socket = null;
    }
    this.listeners.clear();
    this.state = {
      alerts: [],
      unreadCount: 0,
      isConnected: false,
      isMonitoring: true,
    };
    console.log('🧹 Alert Service cleaned up');
  }
}

export const alertService = AlertService.getInstance();
