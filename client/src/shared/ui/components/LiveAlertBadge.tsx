'use client';

import { useState } from 'react';
import { Badge, IconButton, Tooltip, Popover, Typography, Box, Stack, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import { useLiveAlerts } from '@/shared/hooks/useLiveAlerts';

export default function LiveAlertBadge() {
  const { clearAlerts, getRecentAlerts } = useLiveAlerts();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const router = useRouter();

  const recentAlerts = getRecentAlerts(5); // Get only 5 most recent alerts for the badge

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearAlerts = () => {
    clearAlerts();
    handleClose();
  };

  const viewAllAlerts = () => {
    router.push('/connected/live-camera');
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'alerts-popover' : undefined;

  return (
    <>
      <Tooltip
        title={recentAlerts.length > 0 ? `${recentAlerts.length} new alerts` : 'No new alerts'}
      >
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color: recentAlerts.length > 0 ? '#ff4d4f' : '#707070',
            '&:hover': {
              bgcolor:
                recentAlerts.length > 0 ? 'rgba(255, 77, 79, 0.08)' : 'rgba(255, 180, 0, 0.08)',
              color: recentAlerts.length > 0 ? '#ff4d4f' : '#ffb400',
            },
            animation: recentAlerts.length > 0 ? 'pulse 2s infinite' : 'none',
          }}
        >
          <Badge
            badgeContent={recentAlerts.length}
            color="error"
            overlap="circular"
            variant={recentAlerts.length > 0 ? 'standard' : 'dot'}
          >
            <NotificationsIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Live Alerts
            </Typography>
            <Stack direction="row" spacing={1}>
              {recentAlerts.length > 0 && (
                <Button
                  size="small"
                  onClick={handleClearAlerts}
                  sx={{
                    fontSize: '12px',
                    color: '#ff4d4f',
                    '&:hover': { bgcolor: 'rgba(255,77,79,0.05)' },
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                size="small"
                onClick={viewAllAlerts}
                sx={{
                  fontSize: '12px',
                  color: '#d18700',
                  '&:hover': { bgcolor: 'rgba(209,135,0,0.05)' },
                }}
              >
                View All
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
            {recentAlerts.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No new alerts</Typography>
              </Box>
            ) : (
              recentAlerts.map((alert, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: '8px',
                    bgcolor: 'rgba(255,77,79,0.05)',
                    border: '1px solid rgba(255,77,79,0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#ff4d4f' }}>
                    {alert.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                  >
                    {alert.timestamp}
                  </Typography>
                  {alert.site_location && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
                    >
                      Site: {alert.site_name || alert.site_location} | Area:{' '}
                      {alert.area_name || alert.area_location}
                    </Typography>
                  )}
                  {alert.no_hardhat_count && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#ff4d4f', display: 'block', mt: 0.25, fontWeight: 500 }}
                    >
                      Violations: {alert.no_hardhat_count}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Popover>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
        }
      `}</style>
    </>
  );
}
