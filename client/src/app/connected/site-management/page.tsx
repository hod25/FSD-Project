/* eslint-disable react-hooks/rules-of-hooks */
'use client';

<<<<<<< HEAD
import SiteManagementPage from '@/features/management/page';

export default function SiteManagementRoute() {
  return <SiteManagementPage />;
}
=======
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Switch,
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

import { createArea, deleteArea } from '@/services/areaService';

import {
  addAreaToLocation,
  fetchLocationById,
  removeAreaFromLocation,
} from '@/services/locationService';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAreas, selectCurrentAreaName } from '../../../store/slices/areaSlice';
import { selectUserLocationId } from '../../../store/slices/userSlice';
import Swal from 'sweetalert2';

// ----------- Types -----------
type Camera = {
  id: string;
  location: string;
  url: string;

};

// ----------- Component -----------
export default function Page() {
  // שליפת המשתמש הנוכחי מ-Redux
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.user);
  const accessLevel = user?.access_level;

  // חסימת צפייה למשתמשי viewer
  if (accessLevel === 'viewer') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1">You do not have permission to view or edit cameras.</Typography>
      </Box>
    );
  }

  // ----------- State -----------
  const [isEditMode, setIsEditMode] = useState(false);
  const locationId = useSelector(selectUserLocationId) || '';
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const areas = useSelector(selectAreas) || [];
  const [editLocation, setEditLocation] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const currentAreaName = useSelector(selectCurrentAreaName);

  // ----------- Effects -----------
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (areas.length > 0) {
      setCameras(() => {
        return areas
          .filter((area) => area.name !== 'All Areas')
          .map((area) => ({
            id: area.id,
            location: area.name,
            url: area.url,
       
          }));
      });
    }
  }, [areas]);

  useEffect(() => {
    if (selectedCameraId) {
      const cam = cameras.find((c) => c.id === selectedCameraId);
      if (cam) {
        setEditLocation(cam.location);
        setEditUrl(cam.url);
     
      }
    } else {
      setEditLocation('');
      setEditUrl('');
  
    }
  }, [selectedCameraId, cameras]);

  const saveSettings = async () => {
    try {
      let areaExists = areas.some((area) => area.name === editLocation);
      if (!areaExists) {
        areaExists = false;
      }

      const existingCamera = cameras.find((cam) => cam.location === editLocation);

      if (existingCamera) {
        // עדכון מצלמה קיימת
        const updatedCamera: Camera = {
          ...existingCamera,
          location: editLocation,
          url: editUrl,
  
        };

        setCameras((prev) =>
          prev.map((cam) => (cam.id === existingCamera.id ? updatedCamera : cam))
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
    
        };

        // יצירת אזור חדש במסד הנתונים
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newAreaResponse: any = await createArea({
          name: editLocation,
          url: editUrl,
        });

        // שליפת ה-ID מהאובייקט הפנימי
        const newAreaId = newAreaResponse.area?._id;
        // חיבור האזור למיקום
        if (locationId) {
          console.log('🔗 Connecting area to location:', locationId, newAreaId);
          try {
            const locationData = await fetchLocationById(locationId);
            await addAreaToLocation(locationId, newAreaId);
            console.log('✅ Area added to location:', locationData.id);
          } catch (err) {
            console.error('❌ Failed to add area to location:', err);
            alert('Area created, but failed to connect it to the location.');
          }
        }

        // עדכון רשימת המצלמות
        setCameras((prev) => [...prev, newCamera]);
        setSelectedCameraId(newId);
        window.location.reload();
        alert('Camera added!');
      }
    } catch (error) {
      console.error('🔥 Error saving settings:', error);
      alert('Failed to save settings, please try again.');
    }
  };

  const addCamera = () => {
    const newId = Date.now().toString();
    const newCamera: Camera = {
      id: newId,
      location: '',
      url: '',
    
    };
    setCameras((prev) => [...prev, newCamera]);
    setSelectedCameraId(newId);
    setIsEditMode(false);
  };

  const handleDeleteClick = async (cameraId: string) => {
    const cameraToDelete = cameras.find((cam) => cam.id === cameraId);

    if (!cameraToDelete) return;

    if (cameraToDelete.location === currentAreaName) {
      Swal.fire({
        title: 'Cannot delete this camera',
        text: 'This camera belongs to the currently selected area.',
        icon: 'error',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the camera.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      await deleteCamera(cameraId);
      Swal.fire({
        title: 'Deleted!',
        text: 'The camera has been removed.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const deleteCamera = async (cameraId: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== cameraId));

    if (selectedCameraId === cameraId) {
      const remaining = cameras.filter((c) => c.id !== cameraId);
      setSelectedCameraId(remaining.length > 0 ? remaining[0].id : null);
    }

    const areaToDelete = areas.find((area) => area.id === cameraId);

    if (!areaToDelete) {
      console.warn('⚠️ No suitable area found for the camera:', areaToDelete);

      return;
    }

    try {
      await deleteArea(areaToDelete.id);
      await removeAreaFromLocation(locationId, areaToDelete.id);
      window.location.reload();
    } catch (error) {
      console.error('❌ Error deleting the area:', error);
    }
  };

  // ----------- JSX -----------
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
        {/* Left Panel - Camera List */}
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
                .filter((cam) => cam.location.trim() !== '' || cam.id === selectedCameraId)
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
                      secondary={cam.url || ''}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={() => handleDeleteClick(cam.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
            )}
          </List>
        </Box>

        {/* Right Panel - Camera Form */}
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
                disabled={isEditMode || !selectedCameraId}
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

            
            <Button variant="contained" color="primary" onClick={saveSettings}>
              {isEditMode ? 'Update' : 'Save'} {/* ✅ */}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
>>>>>>> f60cc7d (stablize system)
