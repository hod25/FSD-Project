'use client';

import { useDispatch } from 'react-redux';
import { logoutUser } from '@/store/slices/userSlice';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DrawerListItem from './DrawerListItem';
import { menuItems } from '../app/routes/paths';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DrawerItemsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DrawerItems({ isCollapsed, onToggleCollapse }: DrawerItemsProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Call logout API if needed
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // Clear Redux state
    dispatch(logoutUser());

    // Navigate to login page
    router.push('/auth/signin');
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fb',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      {/* Sidebar Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
        {!isCollapsed && (
          <ButtonBase
            component="a"
            href="/"
            sx={{ display: 'flex', alignItems: 'center', ml: 4, mt: 2 }}
          >
            <Image src="/ProSafe_Logo.svg" alt="ProSafe Logo" width={160} height={45} priority />
          </ButtonBase>
        )}

        <IconButton
          onClick={onToggleCollapse}
          sx={{
            backgroundColor: 'rgba(255, 180, 0, 0.05)',
            width: 36,
            height: 36,
            color: '#e09500', // Darker shade of yellow
            '&:hover': {
              backgroundColor: 'rgba(255, 180, 0, 0.1)',
              color: '#cc8800', // Even darker when hovering
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isCollapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        </IconButton>
      </Stack>

      {/* Sidebar Menu List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
        <List
          component="nav"
          sx={{
            px: isCollapsed ? 1 : 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {menuItems.map((item) => (
            <DrawerListItem key={item.id} {...item} isCollapsed={isCollapsed} />
          ))}
        </List>
      </Box>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: isCollapsed ? 1 : 3,
          pb: 4,
          mt: 'auto',
        }}
      >
        {!isCollapsed ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: '#d18700',
              borderColor: 'rgba(209, 135, 0, 0.5)',
              backgroundColor: 'transparent',
              textTransform: 'none',
              fontSize: '14px',
              borderRadius: '6px',
              padding: '8px 0',
              '&:hover': {
                backgroundColor: 'rgba(209, 135, 0, 0.04)',
                borderColor: '#d18700',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Log Out
          </Button>
        ) : (
          <IconButton
            onClick={handleLogout}
            sx={{
              width: '36px',
              height: '36px',
              color: '#d18700',
              backgroundColor: 'transparent',
              border: '1px solid rgba(209, 135, 0, 0.5)',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'rgba(209, 135, 0, 0.04)',
                borderColor: '#d18700',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
