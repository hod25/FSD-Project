'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AlertCircle } from 'lucide-react';

const SOCKET_SERVER_URL = 'http://localhost:5000';

interface Alert {
  message: string;
  timestamp: string;
}

export default function LiveCameraPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isStreamAvailable] = useState(true);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to socket server');
    });

    socket.on('alert', (data: Alert) => {
      console.log('🚨 New alert received:', data);
      setAlerts((prev) => [data, ...prev]);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        backgroundColor: '#ffffff',
        padding: '20px',
        gap: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left: Live Camera Stream */}
      <div
        style={{
          flex: 3,
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          height: '100%', // שומר על גובה קבוע
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            aspectRatio: '16 / 9',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid #ddd',
          }}
        >
          {isStreamAvailable ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="http://localhost:8000/video"
                alt="Live Camera Stream"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000',
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <AlertCircle size={64} color="#ff4d4f" />
              <h2 style={{ marginTop: '16px', fontSize: '22px', color: '#333' }}>
                Stream Not Available
              </h2>
              <p style={{ marginTop: '8px', fontSize: '16px', color: '#888' }}>
                Unable to load live camera feed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Live Alerts */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          overflowY: 'auto', // מאפשר גלילה רק בתוך האזור הזה
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%', // שומר על גובה קבוע
          boxSizing: 'border-box', // מונע התרחבות
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>Live Alerts</h2>
          <p style={{ fontSize: '14px', color: '#777' }}>{alerts.length} alerts</p>
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              style={{
                marginTop: '10px',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: '16px', marginTop: '50px' }}>
            No alerts yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#fafafa',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  animation: 'fadeIn 0.5s ease',
                }}
              >
                <div style={{ fontWeight: 600, color: '#ff4d4f', fontSize: '16px' }}>
                  🔴 {alert.message}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>{alert.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
