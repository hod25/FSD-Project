'use client';

import { createArea, deleteArea } from '@/shared/services/areaService';

import {
  addAreaToLocation,
  fetchLocationById,
  removeAreaFromLocation,
} from '@/shared/services/locationService';

import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAreas, selectCurrentAreaName } from '@/shared/store/slices/areaSlice';
import { selectUserLocationId } from '@/shared/store/slices/userSlice';
import Swal from 'sweetalert2';
import { FaMapMarkerAlt, FaVideo, FaPlus, FaTrash } from 'react-icons/fa';

import styles from './page.module.css';

// ----------- Types -----------
interface Area {
  id: string;
  name: string;
  url?: string;
}

type Camera = {
  id: string;
  location: string;
  url: string;
};

// ----------- Component -----------
export default function Page() {
  // ----------- Hooks (must be at the top) -----------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.user);
  const locationId = useSelector(selectUserLocationId) || '';
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const areasFromStore = useSelector(selectAreas);
  const areas = useMemo(() => areasFromStore || [], [areasFromStore]);
  const [editLocation, setEditLocation] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const currentAreaName = useSelector(selectCurrentAreaName);

  // ----------- Effects -----------
  useEffect(() => {
    if (areas.length > 0) {
      setCameras(() => {
        return areas
          .filter((area: Area) => area.name !== 'All Areas')
          .map((area: Area) => ({
            id: area.id,
            location: area.name,
            url: area.url || '',
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

  const accessLevel = user?.access_level;

  // חסימת צפייה למשתמשי viewer
  if (accessLevel === 'viewer') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view or edit cameras.</p>
      </div>
    );
  }

  const saveSettings = async () => {
    if (!selectedCameraId || !editLocation.trim()) {
      alert('Please enter a location name');
      return;
    }

    try {
      const selectedCamera = cameras.find((cam) => cam.id === selectedCameraId);
      
      if (!selectedCamera) {
        alert('No camera selected');
        return;
      }

      // רק יצירת מצלמה חדשה (אין עריכה)
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

      // עדכון המצלמה המקומית
      const updatedCamera: Camera = {
        ...selectedCamera,
        location: editLocation,
        url: editUrl,
      };

      setCameras((prev) =>
        prev.map((cam) => (cam.id === selectedCameraId ? updatedCamera : cam))
      );

      window.location.reload();
      alert('Camera added successfully!');
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
    setEditLocation('');
    setEditUrl('');
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
    <div className={styles.page}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Site Management</h1>
        </div>

        <div className={styles.mainContainer}>
          {/* Left Panel - Add New Camera */}
          <div className={styles.leftPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Add New Camera</h3>
              <button className={styles.addButton} onClick={addCamera}>
                <FaPlus /> Add
              </button>
            </div>

            <div className={styles.cameraList}>
              {cameras.filter((cam) => cam.location.trim() === '').length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Click &quot;Add&quot; to create a new camera</p>
                </div>
              ) : (
                cameras
                  .filter((cam) => cam.location.trim() === '')
                  .map((cam) => (
                    <div
                      key={cam.id}
                      className={`${styles.cameraItem} ${
                        selectedCameraId === cam.id ? styles.selected : ''
                      }`}
                    >
                      <div className={styles.cameraInfo}>
                        <div className={styles.cameraName}>New Camera</div>
                        <div className={styles.cameraUrl}>Enter details to save</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Middle Panel - Existing Cameras */}
          <div className={styles.middlePanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Existing Cameras</h3>
            </div>

            <div className={styles.cameraList}>
              {cameras.filter((cam) => cam.location.trim() !== '').length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No cameras saved yet</p>
                </div>
              ) : (
                cameras
                  .filter((cam) => cam.location.trim() !== '')
                  .map((cam) => (
                    <div key={cam.id} className={styles.existingCameraItem}>
                      <div className={styles.cameraInfo}>
                        <div className={styles.cameraName}>{cam.location}</div>
                        <div className={styles.cameraUrl}>{cam.url || 'No URL'}</div>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(cam.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Right Panel - Camera Form */}
          <div className={styles.rightPanel}>
            <div className={styles.formContainer}>
              <h3 className={styles.formTitle}>Camera Details</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaMapMarkerAlt className={styles.icon} />
                  Camera Location
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter location name"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={!selectedCameraId}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FaVideo className={styles.icon} />
                  Camera URL
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://camera.example.com/stream"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  disabled={!selectedCameraId}
                />
              </div>

              <button className={styles.saveButton} onClick={saveSettings} disabled={!selectedCameraId || !editLocation.trim()}>
                Add Camera
              </button>
              
              {!selectedCameraId && (
                <p className={styles.helpText}>
                  Click &quot;Add&quot; button to create a new camera first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
