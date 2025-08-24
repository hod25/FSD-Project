'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store/store';
import { useLiveAlerts } from '@/shared/hooks/useLiveAlerts';

export default function LiveCameraPage() {
  const { alerts } = useLiveAlerts();
  const [isStreamAvailable, setIsStreamAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const currentCameraUrl = useSelector((state: RootState) => state.area?.currentAreaUrl);
  const siteId = useSelector((state: RootState) => state.user.site_location);
  const areaId = useSelector((state: RootState) => state.area?.currentAreaId);

  const videoStreamUrl = currentCameraUrl
    ? `${currentCameraUrl}?site_id=${siteId}&area_id=${areaId}`
    : '';

  useEffect(() => {
    setIsLoading(true);
    console.log('Camera URL changed, refreshing stream:', videoStreamUrl);
  }, [currentCameraUrl, videoStreamUrl]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsStreamAvailable(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsStreamAvailable(false);
      setIsLoading(false);
    };
    img.src = videoStreamUrl;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsStreamAvailable(false);
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [isLoading, videoStreamUrl]);

  const handleRetryConnection = () => {
    setIsLoading(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        backgroundColor: '#ffffff',
        padding: '24px',
        gap: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: '24px', flexGrow: 1, height: '100%' }}>
        {/* Left: Live Camera */}
        <div
          style={{
            flex: 3,
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            border: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                margin: 0,
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#4CAF50',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)',
                }}
              />
              Main Entrance Camera
            </h2>
            <div
              style={{
                fontSize: '13px',
                color: '#888',
                backgroundColor: 'rgba(0,0,0,0.03)',
                padding: '4px 10px',
                borderRadius: '12px',
              }}
            >
              Live Feed
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '600px',
                backgroundColor: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #eee',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#111',
                    color: '#fff',
                  }}
                >
                  <div className="loading-spinner"></div>
                  <h3 style={{ marginTop: '20px', fontSize: '18px', fontWeight: 500 }}>
                    Connecting to camera...
                  </h3>
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#aaa' }}>
                    Please wait while we establish a connection
                  </p>
                </div>
              ) : isStreamAvailable ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={videoStreamUrl}
                  alt="Live Camera Stream"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000',
                  }}
                  onError={() => setIsStreamAvailable(false)}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#111',
                    color: '#fff',
                    padding: '20px',
                  }}
                >
                  <AlertCircle size={64} color="#ff4d4f" />
                  <h2 style={{ marginTop: '16px', fontSize: '22px', color: '#fff' }}>
                    Video Stream Unavailable
                  </h2>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '16px',
                      color: '#aaa',
                      textAlign: 'center',
                      maxWidth: '400px',
                    }}
                  >
                    Cannot connect to the camera feed. Check the camera server status and network
                    connection.
                  </p>
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleRetryConnection}
                      style={{
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 500,
                      }}
                    >
                      <RotateCcw size={16} /> Retry Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Alerts */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
            minWidth: '340px',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                margin: 0,
                fontWeight: 600,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#ff4d4f',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)',
                }}
              />
              Threat Alerts
            </h2>
            <div
              style={{
                fontSize: '13px',
                color: alerts.length ? '#ff4d4f' : '#888',
                backgroundColor: alerts.length ? 'rgba(255, 77, 79, 0.08)' : 'rgba(0,0,0,0.03)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: alerts.length ? 500 : 400,
              }}
            >
              {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
            </div>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#fff' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                <Bell size={32} color="#ddd" />
                <h3 style={{ marginTop: '16px' }}>No Alerts Detected</h3>
                <p style={{ fontSize: '13px' }}>When hazards are detected, they will appear here</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>
                    {alert.details || alert.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>
                    {alert.timestamp}
                  </div>
                  <div style={{ fontSize: '12px', color: '#555' }}>
                    <strong>Site:</strong> {alert.site_name || alert.site_location} |{' '}
                    <strong>Area:</strong> {alert.area_name || alert.area_location}
                  </div>
                  {alert.no_hardhat_count !== undefined && (
                    <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                      🚫 <strong>{alert.no_hardhat_count}</strong> workers without hardhats
                    </div>
                  )}
                  {alert.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={alert.image_url}
                      alt="Alert frame"
                      style={{ width: '100%', marginTop: '10px', borderRadius: '6px' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
