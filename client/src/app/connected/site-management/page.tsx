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
  MenuItem,
} from '@mui/material';

import {
  LocationOn as LocationOnIcon,
  NotificationsActive as NotificationsActiveIcon,
  Videocam as VideocamIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { createArea, deleteArea, updateArea } from '@/services/areaService';

import { addAreaToLocation, fetchLocationById, removeAreaFromLocation } from '@/services/locationService';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAreas } from '../../../store/slices/areaSlice';
import { selectUserLocationId } from '../../../store/slices/userSlice';

import { selectLocationName , setLocationId } from '../../../store/slices/locationSlice';
// ----------- Types -----------
type Camera = {
  id: string;
  location: string;
  url: string;
  workDays: string[];
  shiftStart: string;
  shiftEnd: string;
  violationTime: number;
  enableAlerts: boolean;
};

// ----------- Component -----------
export default function Page() {
  const [isEditMode, setIsEditMode] = useState(false);
  const locationId = useSelector(selectUserLocationId) || '';
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const areas = useSelector(selectAreas) || [];
  const [editLocation, setEditLocation] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [workDays, setWorkDays] = useState<string[]>([]);
  const [shiftStart, setShiftStart] = useState('08:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [violationTime, setViolationTime] = useState(5);
  const [enableAlerts, setEnableAlerts] = useState(false);

  useEffect(() => {
    if (areas.length > 0) {
      setCameras((prev) => {
        const areaCameras: Camera[] = areas
          .filter(area => area.name !== "All Areas")
          .map((area) => ({
            id: area.id,
            location: area.name,
            url: area.url,
            workDays: [],
            shiftStart: '08:00',
            shiftEnd: '17:00',
            violationTime: 5,
            enableAlerts: false,
          }));
        return [...areaCameras];
      });
    }
  }, [areas]);

  useEffect(() => {
    if (selectedCameraId) {
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


const saveSettings = async () => {
  try {
  let areaExists = areas.some(area => area.name === editLocation);
    if (!areaExists) {
      areaExists = false;
    }

    const existingCamera = cameras.find(cam => cam.location === editLocation);

    if (existingCamera) {

      // עדכון מצלמה קיימת
      const updatedCamera: Camera = {
        ...existingCamera,
        location: editLocation,
        url: editUrl,
        workDays,
        shiftStart,
        shiftEnd,
        violationTime,
        enableAlerts,
      };

      // עדכון האזור במסד הנתונים
      const updatedArea = await updateArea(existingCamera.id, {
        name: editLocation,
        url: editUrl,
      });

      setCameras(prev =>
        prev.map(cam =>
          cam.id === existingCamera.id ? updatedCamera : cam
        )
      );

      setSelectedCameraId(existingCamera.id);
      alert('Camera updated!');



    } else {
      // יצירת מצלמה חדשה
      const newId = Date.now().toString();
      const newCamera: Camera = {
        id: newId,
        location: editLocation,
        url: editUrl,
        workDays,
        shiftStart,
        shiftEnd,
        violationTime,
        enableAlerts,
      };

      // יצירת אזור חדש במסד הנתונים
const newAreaResponse: any = await createArea({
  name: editLocation,
  url: editUrl,
});

// שליפת ה-ID מהאובייקט הפנימי
const newAreaId = newAreaResponse.area?._id;
      // חיבור האזור למיקום
      if (locationId) {
        console.log("🔗 Connecting area to location:", locationId, newAreaId);
        try {
          const locationData = await fetchLocationById(locationId);
          await addAreaToLocation(locationId, newAreaId);
          console.log("✅ Area added to location:", locationData.id);
        } catch (err) {
          console.error("❌ Failed to add area to location:", err);
          alert("Area created, but failed to connect it to the location.");
        }
      }

      // עדכון רשימת המצלמות
      setCameras(prev => [...prev, newCamera]);
      setSelectedCameraId(newId);
      alert("Camera added!");
    }
  } catch (error) {
    console.error("🔥 Error saving settings:", error);
    alert("Failed to save settings, please try again.");
  }
};

const addCamera = () => {
  const newId = Date.now().toString();
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
  setIsEditMode(false); 
};


const deleteCamera = async (cameraId: string) => {

  setCameras(prev => prev.filter(c => c.id !== cameraId));

  if (selectedCameraId === cameraId) {
    const remaining = cameras.filter(c => c.id !== cameraId);
    setSelectedCameraId(remaining.length > 0 ? remaining[0].id : null);
  }

  const areaToDelete = areas.find(area => area.id === cameraId);

  if (!areaToDelete) {
   console.warn("⚠️ No suitable area found for the camera:", areaToDelete);

    return;
  }

  try {
    await deleteArea(areaToDelete.id); 
    await removeAreaFromLocation(locationId, areaToDelete.id);
  } catch (error) {
    console.error("❌ Error deleting the area:", error);

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
        <Box
          sx={{
            width: '40%',
            borderRight: '1px solid #ddd',
            pr: 3,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Cameras
            </Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addCamera}>
              Add
            </Button>
          </Stack>

          <List>
            {cameras.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No Cameras available
              </Typography>
            ) : (
              cameras
                .filter(cam => cam.location.trim() !== '' || cam.id === selectedCameraId) 
                .map((cam) => (
                  <ListItem
                    key={cam.id}
                    onClick={() => {
    setSelectedCameraId(cam.id);
    setIsEditMode(true); 
  }}
                    divider
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedCameraId === cam.id ? '#FB9C00' : 'transparent',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <ListItemText
                      primary={cam.location || '(No Location)'}
                      secondary={cam.url || ('')}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={() => deleteCamera(cam.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
            )}
          </List>
        </Box>

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
                fullWidth
                placeholder="Location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                 disabled={isEditMode|| !selectedCameraId} 
              >
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.name}>
                    {area.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VideocamIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Camera URL
                </Typography>
              </Stack>
              <TextField
                fullWidth
                type="url"
                placeholder="https://camera.example.com/stream"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                disabled={!selectedCameraId}
              />
            </Stack>

            <Stack spacing={1}>
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

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Shift Start"
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                disabled={!selectedCameraId}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="Shift End"
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                disabled={!selectedCameraId}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Violation Time (minutes)
              </Typography>
              <TextField
                type="number"
                value={violationTime}
                onChange={(e) => setViolationTime(Number(e.target.value))}
                disabled={!selectedCameraId}
                inputProps={{ min: 1, max: 60 }}
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
                disabled={!selectedCameraId}
                color="primary"
              />
              <Typography variant="subtitle2" color="text.secondary">
                Enable Alerts
              </Typography>
            </Stack>

          <Button
  variant="contained"
  color="primary"
  onClick={saveSettings}
>
  {isEditMode ? 'Update' : 'Save'} {/* ✅ */}
</Button>

          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}


