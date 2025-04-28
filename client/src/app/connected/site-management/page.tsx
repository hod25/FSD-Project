'use client';

import { Box, Button, Stack, TextField, Typography, Switch, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AlarmIcon from '@mui/icons-material/Alarm';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useState } from 'react';

export default function Page() {
  const [enableAlerts, setEnableAlerts] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        p: { xs: 3, md: 4 },
        maxWidth: 800,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        {/* כותרת */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Site Management
          </Typography>
        </Stack>

        {/* מיקום מצלמה */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationOnIcon color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Camera Location
            </Typography>
          </Stack>
          <TextField size="small" fullWidth placeholder="Main Entrance" />
        </Stack>

        {/* ימי עבודה */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Work Days
            </Typography>
          </Stack>
          <TextField size="small" fullWidth placeholder="Monday - Friday" />
        </Stack>


        {/* חלוקת משמרות */}
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mt={1}>
            SHIFT TIMINGS
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              size="small"
              type="time"
              label="Shift Start"
              fullWidth
              defaultValue="08:00"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="time"
              label="Shift End"
              fullWidth
              defaultValue="17:00"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>

        {/* זמן הפרה */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AlarmIcon color="error" />
            <Typography variant="subtitle2" color="text.secondary">
              Violation Time (seconds)
            </Typography>
          </Stack>
          <TextField
            size="small"
            fullWidth
            type="number"
            placeholder="5"
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Stack>

        {/* אפשרות התראות */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NotificationsActiveIcon color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Enable Alerts
            </Typography>
          </Stack>
          <Switch
            checked={enableAlerts}
            onChange={(e) => setEnableAlerts(e.target.checked)}
            color="primary"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />

        {/* כפתור שמירה */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, fontWeight: 'bold', textTransform: 'none' }}
        >
          Save Settings
        </Button>
      </Stack>
    </Box>
  );
}
