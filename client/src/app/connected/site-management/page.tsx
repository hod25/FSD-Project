'use client';

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Switch,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AlarmIcon from '@mui/icons-material/Alarm';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VideocamIcon from '@mui/icons-material/Videocam';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';

type Camera = {
  id: number;
  location: string;
  url: string;
  workDays: string[];
  shiftStart: string;
  shiftEnd: string;
  violationTime: number;
  enableAlerts: boolean;
};

export default function Page() {
  const [cameras, setCameras] = useState<Camera[]>([
    {
      id: 1,
      location: 'Main Entrance',
      url: 'https://camera.example.com/stream1',
      workDays: ['Mon', 'Tue', 'Wed'],
      shiftStart: '08:00',
      shiftEnd: '17:00',
      violationTime: 5,
      enableAlerts: false,
    },
    {
      id: 2,
      location: 'Back Door',
      url: 'https://camera.example.com/stream2',
      workDays: ['Thu', 'Fri'],
      shiftStart: '09:00',
      shiftEnd: '18:00',
      violationTime: 10,
      enableAlerts: true,
    },
  ]);

  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);

  const [editLocation, setEditLocation] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [violationTime, setViolationTime] = useState(5);
  const [enableAlerts, setEnableAlerts] = useState(false);

  useEffect(() => {
    if (selectedCameraId !== null) {
      const cam = cameras.find((c) => c.id === selectedCameraId);
      if (cam) {
        setEditLocation(cam.location);
        setEditUrl(cam.url);
        setWorkDays(cam.workDays);
        setShiftStart(cam.shiftStart);
        setShiftEnd(cam.shiftEnd);
        setViolationTime(cam.violationTime);
        setEnableAlerts(cam.enableAlerts);
      }
    } else {
      setEditLocation('');
      setEditUrl('');
      setWorkDays([]);
      setShiftStart('08:00');
      setShiftEnd('17:00');
      setViolationTime(5);
      setEnableAlerts(false);
    }
  }, [selectedCameraId, cameras]);

  const saveSettings = () => {
    if (selectedCameraId === null) return;

    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === selectedCameraId
          ? {
              ...cam,
              location: editLocation,
              url: editUrl,
              workDays,
              shiftStart,
              shiftEnd,
              violationTime,
              enableAlerts,
            }
          : cam
      )
    );
    alert('Camera settings saved!');
  };

  const addCamera = () => {
    const newId = cameras.length ? Math.max(...cameras.map((c) => c.id)) + 1 : 1;
    const newCamera: Camera = {
      id: newId,
      location: '',
      url: '',
      workDays: [],
      shiftStart: '08:00',
      shiftEnd: '17:00',
      violationTime: 5,
      enableAlerts: false,
    };
    setCameras((prev) => [...prev, newCamera]);
    setSelectedCameraId(newId);
  };

  const deleteCamera = (id: number) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
    if (selectedCameraId === id) {
      setSelectedCameraId(null);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        p: { xs: 3, md: 4 },
        maxWidth: 1100,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Stack direction="row" spacing={4} alignItems="flex-start">
        {/* צד שמאל - רשימת מצלמות */}
        <Box sx={{ width: '40%', borderRight: '1px solid #ddd', pr: 3, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Cameras
            </Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addCamera}>
              Add
            </Button>
          </Stack>

          <List>
            {cameras.map((cam) => (
<ListItem
  key={cam.id}
  component="div" // הוסף את השורה הזו
  onClick={() => setSelectedCameraId(cam.id)}
  divider
  sx={{
    cursor: 'pointer',
    bgcolor: cam.id === selectedCameraId ? 'rgba(25,118,210,0.1)' : 'inherit', // מחליף selected
  }}
>
  <ListItemText primary={cam.location || '(No Location)'} secondary={cam.url} />
  <ListItemSecondaryAction>
    <Tooltip title="Delete">
      <IconButton edge="end" onClick={() => deleteCamera(cam.id)}>
        <DeleteIcon color="error" />
      </IconButton>
    </Tooltip>
  </ListItemSecondaryAction>
</ListItem>

            ))}
            {cameras.length === 0 && <Typography>No cameras added yet.</Typography>}
          </List>
        </Box>

        {/* צד ימין - פרטי המצלמה לעריכה */}
        <Box sx={{ width: '60%', pl: 3 }}>
          <Stack spacing={3} component="form" onSubmit={(e) => e.preventDefault()}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <NotificationsActiveIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Site Management
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOnIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Camera Location
                </Typography>
              </Stack>
              <TextField
                size="medium"
                fullWidth
                placeholder="Location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                disabled={selectedCameraId === null}
              />
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VideocamIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Camera URL
                </Typography>
              </Stack>
              <TextField
                size="medium"
                fullWidth
                placeholder="https://camera.example.com/stream"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                disabled={selectedCameraId === null}
              />
            </Stack>
    <Stack direction="row" alignItems="center" spacing={1}>
            
            <Typography variant="subtitle2" color="text.secondary">
              Work Days
            </Typography>
          </Stack>
         <ToggleButtonGroup
  value={workDays}
  onChange={(_, newDays) => {
    if (newDays !== null) setWorkDays(newDays);
  }}
  aria-label="work days"
  size="medium"
  fullWidth
  disabled={selectedCameraId === null}
>
  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
    <ToggleButton
      key={day}
      value={day}
      sx={{
        backgroundColor: workDays.includes(day) ? '#FFA726 !important' : 'transparent',
        color: workDays.includes(day) ? '#fff' : '#000',
        '&:hover': {
          backgroundColor: workDays.includes(day) ? '#FB8C00 !important' : '#eee',
        },
      }}
    >
      {day}
    </ToggleButton>
  ))}
</ToggleButtonGroup>


            <Stack direction="row" spacing={4} justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Shift Start
                </Typography>
                <TextField
                  size="medium"
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  fullWidth
                  disabled={selectedCameraId === null}
                />
              </Box>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Shift End
                </Typography>
                <TextField
                  size="medium"
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  fullWidth
                  disabled={selectedCameraId === null}
                />
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Violation Time (minutes)
              </Typography>
              <TextField
                size="medium"
                type="number"
                inputProps={{ min: 0 }}
                value={violationTime}
                onChange={(e) => setViolationTime(Number(e.target.value))}
                disabled={selectedCameraId === null}
              />
            </Stack>

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

            <Divider />

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
      </Stack>
    </Box>
  );
}
