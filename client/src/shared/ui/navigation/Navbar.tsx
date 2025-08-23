'use client';

import {
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Typography,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import LiveAlertBadge from '../components/LiveAlertBadge';
import {
  setCurrentAreaByName,
  setAreaList,
  selectCurrentAreaName,
  selectAreas,
} from '../../store/slices/areaSlice';
import {
  setLocationName,
  setLocationId,
  selectLocationName,
} from '../../store/slices/locationSlice';
import { selectUserName, selectUserLocationId } from '../../store/slices/userSlice';
import { fetchLocationById, fetchAreaNamesByLocationId } from '../../services/locationService';
import { navbarStyles, spinnerStyle } from './styles/NavbarStyles';

interface NavbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const dispatch = useDispatch();

  // Redux Selectors
  const username = useSelector(selectUserName) || 'Guest';
  const locationId = useSelector(selectUserLocationId) || '';
  const currentSiteName = useSelector(selectLocationName);
  const areas = useSelector(selectAreas) || [];
  const currentArea = useSelector(selectCurrentAreaName) || 'All Areas';

  // Local State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  const openMenu = Boolean(anchorEl);

  // Handlers
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleAreaMenuClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleAreaMenuClose = () => setAnchorEl(null);
  const handleAreaChange = (areaName: string) => {
    dispatch(setCurrentAreaByName(areaName));
    handleAreaMenuClose();
  };

  const displayedLocationName = isLoading
    ? 'Loading location...'
    : currentSiteName || 'Select Location';

  // Load location and area data
  useEffect(() => {
    if (locationId && !isLoading && !loadAttempted) {
      const fetchLocationData = async () => {
        setIsLoading(true);
        try {
          dispatch(setLocationId(locationId));

          const locationData = await fetchLocationById(locationId);
          dispatch(setLocationName(locationData?.name || 'Location Unavailable'));

          const areasData = await fetchAreaNamesByLocationId(locationId);
          const parsedAreas =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            areasData?.map((area: any) => ({
              id: area._id || area.id || `area-${Math.random().toString(36).substring(2, 9)}`,
              name: area.name || area.areaName || 'Unnamed Area',
              url: area.url || '',
            })) || [];

          parsedAreas.unshift({ id: 'all', name: 'All Areas', url: '' });
          dispatch(setAreaList(parsedAreas));

          if (!currentArea || currentArea === 'All Areas') {
            dispatch(setCurrentAreaByName('All Areas'));
          }
        } catch (error) {
          console.error('Error fetching location data:', error);
          dispatch(setLocationName('Location Unavailable'));
        } finally {
          setIsLoading(false);
          setLoadAttempted(true);
        }
      };

      fetchLocationData();
    }
  }, [locationId, isLoading, loadAttempted, dispatch, currentArea]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyle }} />

      <AppBar position="sticky" elevation={0} sx={navbarStyles.appBar}>
        <Toolbar sx={navbarStyles.toolbar}>
          {/* Left Section */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={navbarStyles.leftStack}>
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={navbarStyles.menuButton}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <Stack spacing={0} direction="column">
              <Typography variant="caption" sx={navbarStyles.welcomeCaption}>
                Welcome
              </Typography>
              <Typography variant="body2" sx={navbarStyles.usernameText}>
                {username}
              </Typography>
            </Stack>
          </Stack>

          {/* Center Section */}
          <Stack direction="row" alignItems="center" spacing={1} sx={navbarStyles.centerStack}>
            <BusinessIcon sx={navbarStyles.businessIcon} />
            <Typography variant="subtitle1" sx={navbarStyles.locationNameText}>
              {displayedLocationName}
              {isLoading && <span style={navbarStyles.loadingSpinner} />}
            </Typography>
          </Stack>

          {/* Right Section */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={navbarStyles.rightStack}>
            <Button
              variant="outlined"
              endIcon={<KeyboardArrowDownIcon />}
              size="small"
              onClick={handleAreaMenuClick}
              aria-controls={openMenu ? 'area-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              sx={navbarStyles.areaButton}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOnIcon fontSize="small" sx={navbarStyles.locationIcon} />
                <Typography variant="body2" sx={navbarStyles.areaButtonText}>
                  {currentArea}
                </Typography>
              </Stack>
            </Button>

            <Menu
              id="area-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleAreaMenuClose}
              MenuListProps={{ 'aria-labelledby': 'area-selector-button' }}
              PaperProps={navbarStyles.menuPaper}
            >
              {/* All Areas */}
              <MenuItem
                onClick={() => handleAreaChange('All Areas')}
                sx={navbarStyles.allAreasMenuItem}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                  <DashboardIcon sx={navbarStyles.dashboardIcon} />
                  <Typography variant="body2" sx={navbarStyles.allAreasText}>
                    All Areas
                  </Typography>
                  <Typography variant="caption" sx={navbarStyles.overviewBadge}>
                    Overview
                  </Typography>
                </Stack>
              </MenuItem>

              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={navbarStyles.selectAreaText}>
                Select an area
              </Typography>

              {/* Area List */}
              {areas
                .filter((area) => area.id !== 'all')
                .map((area) => (
                  <MenuItem
                    key={area.id}
                    onClick={() => handleAreaChange(area.name)}
                    selected={currentArea === area.name}
                    sx={navbarStyles.areaMenuItem(currentArea === area.name)}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <LocationOnIcon sx={navbarStyles.areaMenuItemIcon} />
                      <Typography
                        variant="body2"
                        sx={navbarStyles.areaMenuItemText(currentArea === area.name)}
                      >
                        {area.name}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
            </Menu>

            {/* Icons */}
            <Tooltip title="Profile">
              <IconButton size="small" sx={navbarStyles.iconButton}>
                <PersonIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton size="small" sx={navbarStyles.settingsButton}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <LiveAlertBadge />
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
}
