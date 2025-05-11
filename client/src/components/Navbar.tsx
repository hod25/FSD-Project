'use client';

import { AppBar, Toolbar, Stack, IconButton, Typography, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import { usePathname } from 'next/navigation';

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#f9fafc', // רקע אפור מאוד בהיר
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        height: 56, // גובה דק ועדין
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

          <Tooltip title="Notifications">
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
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
