'use client';

import React from 'react';
import { Box, Switch, Typography, Chip, Stack, Tooltip, IconButton } from '@mui/material';
import {
  Pause,
  Refresh,
  VideoCall,
  VideocamOff,
  SignalWifiOff,
  SignalWifi4Bar,
} from '@mui/icons-material';
import { useAlerts } from '@/shared/hooks/useAlerts';
import { useCamera } from '@/shared/hooks/useCamera';

interface MonitoringControlPanelProps {
  showCameraStatus?: boolean;
  compact?: boolean;
  className?: string;
}

const MonitoringControlPanel: React.FC<MonitoringControlPanelProps> = ({
  showCameraStatus = true,
  compact = false,
  className = '',
}) => {
  const { isConnected, isMonitoring, toggleMonitoring } = useAlerts();
  const {
    isAvailable: isCameraAvailable,
    isMonitoring: isCameraMonitoring,
    toggleMonitoring: toggleCameraMonitoring,
    error: cameraError,
    streamUrl,
  } = useCamera();

  const getConnectionStatus = () => {
    if (!isConnected) return { color: '#f44336', text: 'Disconnected', icon: <SignalWifiOff /> };
    if (!isMonitoring) return { color: '#ff9800', text: 'Paused', icon: <Pause /> };
    return { color: '#4caf50', text: 'Live', icon: <SignalWifi4Bar /> };
  };

  const getCameraStatus = () => {
    if (!streamUrl) return { color: '#9e9e9e', text: 'No Camera', icon: <VideocamOff /> };
    if (!isCameraAvailable) return { color: '#f44336', text: 'Offline', icon: <VideocamOff /> };
    if (!isCameraMonitoring) return { color: '#ff9800', text: 'Paused', icon: <Pause /> };
    return { color: '#4caf50', text: 'Live', icon: <VideoCall /> };
  };

  const connectionStatus = getConnectionStatus();
  const camStatus = getCameraStatus();

  if (compact) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Alert System: ${connectionStatus.text}`}>
          <Chip
            icon={connectionStatus.icon}
            label={connectionStatus.text}
            size="small"
            sx={{
              backgroundColor: `${connectionStatus.color}15`,
              color: connectionStatus.color,
              border: `1px solid ${connectionStatus.color}30`,
              '& .MuiChip-icon': { color: connectionStatus.color },
            }}
          />
        </Tooltip>

        {showCameraStatus && (
          <Tooltip title={`Camera: ${camStatus.text}`}>
            <Chip
              icon={camStatus.icon}
              label={camStatus.text}
              size="small"
              sx={{
                backgroundColor: `${camStatus.color}15`,
                color: camStatus.color,
                border: `1px solid ${camStatus.color}30`,
                '& .MuiChip-icon': { color: camStatus.color },
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
        Monitoring Control
      </Typography>

      {/* Alert System Control */}
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 1,
            backgroundColor: `${connectionStatus.color}08`,
            border: `1px solid ${connectionStatus.color}20`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {connectionStatus.icon}
            <Box>
              <Typography variant="body2" fontWeight={600} color={connectionStatus.color}>
                Alert System
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Real-time threat detection
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={connectionStatus.text}
              size="small"
              sx={{
                backgroundColor: connectionStatus.color,
                color: '#fff',
                fontWeight: 500,
              }}
            />
            <Switch
              checked={isMonitoring && isConnected}
              onChange={toggleMonitoring}
              disabled={!isConnected}
              color="primary"
            />
          </Stack>
        </Box>

        {/* Camera System Control */}
        {showCameraStatus && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              backgroundColor: `${camStatus.color}08`,
              border: `1px solid ${camStatus.color}20`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {camStatus.icon}
              <Box>
                <Typography variant="body2" fontWeight={600} color={camStatus.color}>
                  Camera Feed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cameraError || 'Live video monitoring'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={camStatus.text}
                size="small"
                sx={{
                  backgroundColor: camStatus.color,
                  color: '#fff',
                  fontWeight: 500,
                }}
              />

              <Tooltip title="Refresh camera">
                <IconButton
                  size="small"
                  onClick={() => console.log('Refresh clicked')} // Refresh logic is now internal to the service
                  disabled={!streamUrl}
                  sx={{ color: camStatus.color }}
                >
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Switch
                checked={isCameraMonitoring && isCameraAvailable}
                onChange={toggleCameraMonitoring}
                disabled={!streamUrl}
                color="primary"
              />
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Status Summary */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Last updated: {new Date().toLocaleTimeString()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isConnected && isMonitoring
            ? '🟢 System active and monitoring'
            : '🟡 Monitoring paused or disconnected'}
        </Typography>
      </Box>
    </Box>
  );
};

export default MonitoringControlPanel;
