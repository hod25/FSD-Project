'use client';

import { AlertCircle } from 'lucide-react';

export default function LiveCameraPage() {
  // ********************************
  const isStreamAvailable = true; // בדיקות זמינות סטרים בהמשך
  // ********************************

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f8', padding: '24px' }}>
      {/* Left: Camera Streaming Area */}
      <div
        style={{
          flex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingRight: '12px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '900px',
            aspectRatio: '16/9',
            backgroundColor: '#111',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            position: 'relative',
            border: '2px solid #e0e0e0',
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
                  objectFit: 'cover',
                }}
              />
            </>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
              }}
            >
              <AlertCircle size={64} color="#ff4d4f" />
              <h2 style={{ marginTop: '16px', fontSize: '24px' }}>Stream Not Available</h2>
              <p style={{ marginTop: '8px', fontSize: '16px', color: '#999' }}>
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
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '24px',
            textAlign: 'center',
            color: '#333',
          }}
        >
          Live Alerts
        </h2>

        {[1, 2, 3].map((event) => (
          <div
            key={event}
            style={{
              background: '#fafafa',
              padding: '16px',
              marginBottom: '20px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#ff4d4f', fontSize: '18px', marginRight: '8px' }}>🔴</span>
              <strong style={{ fontSize: '16px' }}>Event ID: EV-00{event}</strong>
            </div>

            <div style={{ fontSize: '14px', color: '#555', marginBottom: '12px' }}>
              <div>Location: Zone {event}</div>
              <div>Time: 2024-12-21 10:4{event} AM</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Photo
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
