'use client';

import { useEffect } from 'react';
import { Alert } from '@/shared/types/services';

interface NotificationServiceProps {
  alerts: Alert[];
}

export const useNotificationService = ({ alerts }: NotificationServiceProps) => {
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return;

    const latestAlert = alerts[0];

    // Show notification for new unread alerts
    if (!latestAlert.isRead && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('ProSafe Security Alert', {
        body: latestAlert.details || latestAlert.message,
        icon: '/prosafe-black-icon.png',
        badge: '/prosafe-black-icon.png',
        tag: latestAlert.id,
        requireInteraction: latestAlert.severity === 'critical' || latestAlert.severity === 'high',
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        window.location.href = '/connected/live-camera';
        notification.close();
      };

      // Auto-close for non-critical alerts
      if (latestAlert.severity !== 'critical') {
        setTimeout(() => notification.close(), 6000);
      }
    }

    // Play sound for critical alerts
    if (latestAlert.severity === 'critical' && !latestAlert.isRead) {
      playAlertSound();
    }
  }, [alerts]);
};

const playAlertSound = () => {
  try {
    // Create audio context for alert sound
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();

    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play alert sound:', error);
  }
};

// Component to be used in the layout
export default function NotificationService() {
  // This component doesn't render anything but provides the service
  return null;
}
