'use client';

import { useAlerts } from '@/shared/hooks/useAlerts';
import { Box, Typography, Fade } from '@mui/material';
import { Wifi, WifiOff } from '@mui/icons-material';

export default function ConnectionStatus() {
  const { isConnected } = useAlerts();

  return (
    <Fade in={!isConnected} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: isConnected ? 'none' : 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'rgba(255, 77, 79, 0.95)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '24px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(255, 77, 79, 0.3)',
          animation: 'pulse 2s infinite',
        }}
      >
        <WifiOff sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          Alert System Disconnected
        </Typography>
      </Box>
    </Fade>
  );
}

// Connected status indicator (optional, less intrusive)
export function ConnectedIndicator() {
  const { isConnected } = useAlerts();

  if (!isConnected) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '20px',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 12px rgba(76, 175, 80, 0.2)',
        opacity: 0.8,
        transition: 'opacity 0.3s ease',
        '&:hover': {
          opacity: 1,
        },
      }}
    >
      <Wifi sx={{ fontSize: 14 }} />
      <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 500 }}>
        Live Monitoring Active
      </Typography>
    </Box>
  );
}
