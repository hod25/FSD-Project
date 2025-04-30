'use client';

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
import { useRouter } from 'next/navigation'; // ✅ שימוש נכון ב-router

interface DrawerItemsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DrawerItems({ isCollapsed, onToggleCollapse }: DrawerItemsProps) {
  const router = useRouter(); // ✅ מוכן לניווט חלק

  const handleLogout = () => {
    // מחיקת מידע מהדפדפן
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    router.push('/auth/signin'); // ✅ מעבר חלק בלי לרענן את הדף
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={2}>
        {!isCollapsed && (
          <ButtonBase component="a" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/prosafe-black-logo.png" alt="ProSafe Logo" width={200} height={75} />
          </ButtonBase>
        )}

        <IconButton
          onClick={onToggleCollapse}
          sx={{
            backgroundColor: '#e0e0e0',
            width: 36,
            height: 36,
            '&:hover': { backgroundColor: '#d5d5d5' },
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
              color: 'text.primary',
              borderColor: '#d0d0d0',
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#c0c0c0',
              },
            }}
          >
            Log Out
          </Button>
        ) : (
          <IconButton
            onClick={handleLogout}
            sx={{
              width: '100%',
              color: 'text.secondary',
              justifyContent: 'center',
            }}
          >
            <LogoutIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
