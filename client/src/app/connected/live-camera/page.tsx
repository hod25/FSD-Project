'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AlertCircle, RotateCcw, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

// Define the minimal RootState type needed for this component
interface RootState {
  area?: {
    currentAreaUrl?: string;
  };
}

const SOCKET_SERVER_URL = 'http://pro-safe.cs.colman.ac.il:5000';

interface Alert {
  message: string;
  timestamp: string;
}

export default function LiveCameraPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isStreamAvailable, setIsStreamAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Get the current camera URL from Redux
  const currentCameraUrl = useSelector((state: RootState) => state.area?.currentAreaUrl);
  // Fallback URL in case the Redux state doesn't have the URL
  const videoStreamUrl = currentCameraUrl || '';

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

  // Add a new useEffect to handle URL changes
  useEffect(() => {
    // When the URL changes from Redux, trigger a refresh of the stream
    setIsLoading(true);
    console.log('Camera URL changed, refreshing stream:', videoStreamUrl);
  }, [currentCameraUrl, videoStreamUrl]);

  useEffect(() => {
    // Check if stream is available
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

    // Set a timeout to handle very slow connections
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsStreamAvailable(false);
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, videoStreamUrl]); // Include videoStreamUrl in dependencies

  const handleRetryConnection = () => {
    setIsLoading(true);
  };

  const clearAlerts = () => {
    setAlerts([]);
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
      {/* Main Content - made to take full height */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexGrow: 1,
          height: '100%', // Changed from calc(100% - 80px) to 100% since header is removed
        }}
      >
        {/* Left: Live Camera Stream */}
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
          {/* Stream Header */}
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

          {/* Camera Feed */}
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
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

                  {/* Status indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ff4d4f',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                    AI Monitoring Active
                  </div>
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
                      <RotateCcw size={16} />
                      Retry Connection
                    </button>
                  </div>
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255, 77, 79, 0.15)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#ff9999',
                      maxWidth: '400px',
                      textAlign: 'center',
                    }}
                  >
                    Error: Unable to access video stream at
                    <br />
                    <span style={{ fontFamily: 'monospace', color: '#ffb8b8' }}>
                      {videoStreamUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Alerts - refined to match camera card style */}
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
          {/* Alerts Header - matching camera card header style */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Alert count label - same style as Live Feed label */}
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

              {/* Clear Alerts button - subtle design */}
              {alerts.length > 0 && (
                <button
                  onClick={clearAlerts}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 400,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                    e.currentTarget.style.color = '#333';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  <RotateCcw size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Alerts List - matching camera content style */}
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              flexGrow: 1,
              backgroundColor: '#fff',
            }}
          >
            {alerts.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                <Bell size={32} color="#ddd" />
                <h3
                  style={{
                    color: '#666',
                    fontWeight: 500,
                    marginTop: '16px',
                    marginBottom: '4px',
                    fontSize: '15px',
                  }}
                >
                  No Alerts Detected
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#999',
                    maxWidth: '240px',
                  }}
                >
                  When hazards are detected, they will appear here
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fafafa',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #eee',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      animation: 'slideIn 0.3s ease',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f7f7f7';
                      e.currentTarget.style.borderColor = '#e5e5e5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                      e.currentTarget.style.borderColor = '#eee';
                    }}
                  >
                    {/* Alert priority indicator - subtle design */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: '#ff4d4f',
                        borderRadius: '2px 0 0 2px',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        paddingLeft: '12px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#333',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          flex: '1 1 auto',
                        }}
                      >
                        {alert.message}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#ff4d4f',
                          backgroundColor: 'rgba(255, 77, 79, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 500,
                          marginLeft: '8px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Critical
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        paddingLeft: '12px',
                      }}
                    >
                      {alert.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {00% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
          }        .loading-spinner {
          100% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);;
          }olid rgba(255, 255, 255, 0.1);
        }

        .loading-spinner {linear infinite;
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.1);        @keyframes spin {
          border-left: 4px solid #ff4d4f;
          border-radius: 50%;ansform: rotate(360deg);
          animation: spin 1s linear infinite;
        }
/style>
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
