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
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
// import NotificationsIcon from '@mui/icons-material/Notifications'; // הסרנו את הייבוא של אייקון ההתראות המקורי
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LiveAlertBadge from './LiveAlertBadge'; // ייבוא של קומפוננטת ההתראות החדשה

interface NavbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const pathname = usePathname();

  // להוציא את החלק האחרון בנתיב
  const lastPathSegment = pathname?.split('/').filter(Boolean).pop() || 'Dashboard';
  const formattedPath = lastPathSegment.charAt(0).toUpperCase() + lastPathSegment.slice(1);

  // Sites data - would come from API/context in a real app
  const sites = [
    { id: 1, name: 'Construction Site A' },
    { id: 2, name: 'Industrial Zone B' },
    { id: 3, name: 'Downtown Project' },
    { id: 4, name: 'Highway Extension' },
  ];

  // Site selector state
  const [currentSite, setCurrentSite] = useState(sites[0].name);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSiteMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSiteMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSiteChange = (siteName: string) => {
    setCurrentSite(siteName);
    handleSiteMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#f9fafc',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        height: 56,
        justifyContent: 'center',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '56px !important',
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {/* צד שמאל - מיקום נוכחי */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* כפתור תפריט מופיע רק במסכים קטנים */}
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              color: 'text.secondary', // Return to original gray
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <HomeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />{' '}
          {/* Return to original gray */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              fontSize: '14px',
              color: 'text.secondary', // Return to original gray
            }}
          >
            / {formattedPath} {/* Return to original format without span */}
          </Typography>
        </Stack>

        {/* צד ימין - אייקונים */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Site Selector with Dropdown */}
          <Button
            variant="outlined"
            endIcon={<KeyboardArrowDownIcon />}
            size="small"
            onClick={handleSiteMenuClick}
            aria-controls={open ? 'site-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              height: '36px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#707070',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255, 180, 0, 0.05)',
                borderColor: '#ffb400',
              },
              '& .MuiButton-endIcon': {
                color: '#ffb400',
                marginLeft: 0.5,
              },
              px: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon
                fontSize="small"
                sx={{
                  color: '#d18700',
                  fontSize: 16,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                {currentSite}
              </Typography>
            </Stack>
          </Button>

          {/* Sites Dropdown Menu */}
          <Menu
            id="site-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleSiteMenuClose}
            MenuListProps={{
              'aria-labelledby': 'site-selector-button',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 220,
                maxWidth: 280,
                mt: 1,
                borderRadius: '8px',
                '& .MuiList-root': {
                  py: 1,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => handleSiteChange('All Sites')}
              sx={{
                py: 1,
                px: 2,
                mx: 1,
                borderRadius: '6px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 180, 0, 0.08)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                <DashboardIcon sx={{ color: '#ffb400', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#707070',
                  }}
                >
                  All Sites
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    ml: 'auto !important',
                    backgroundColor: 'rgba(255, 180, 0, 0.1)',
                    color: '#d18700',
                    fontWeight: 500,
                    py: 0.3,
                    px: 1,
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  Overview
                </Typography>
              </Stack>
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 0.5,
                display: 'block',
                color: '#909090',
                fontWeight: 500,
              }}
            >
              Select a site
            </Typography>

            {sites.map((site) => (
              <MenuItem
                key={site.id}
                onClick={() => handleSiteChange(site.name)}
                selected={currentSite === site.name}
                sx={{
                  py: 1,
                  px: 2,
                  mx: 1,
                  borderRadius: '6px',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 180, 0, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 180, 0, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <BusinessIcon sx={{ color: '#707070', fontSize: 18 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: currentSite === site.name ? 600 : 400,
                      fontSize: '14px',
                    }}
                  >
                    {site.name}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>

          <Tooltip title="Profile">
            <IconButton
              size="small"
              sx={{
                color: '#707070',
                '&:hover': {
                  bgcolor: 'rgba(209, 135, 0, 0.05)',
                  color: '#d18700',
                },
              }}
            >
              <PersonIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              size="small"
              sx={{
                color: '#707070',
                '&:hover': {
                  bgcolor: 'rgba(255, 180, 0, 0.08)',
                  color: '#ffb400',
                },
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* החלפת אייקון ההתראות המקורי בקומפוננטת LiveAlertBadge */}
          <LiveAlertBadge />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
