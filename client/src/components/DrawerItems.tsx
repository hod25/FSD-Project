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

interface DrawerItemsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DrawerItems({ isCollapsed, onToggleCollapse }: DrawerItemsProps) {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    window.location.href = '/signin';
  };

  return (
    <>
      {/* Sidebar header (logo + collapse button) */}
      <Stack
        pt={1.5}
        pb={1.5}
        px={2}
        position="sticky"
        bgcolor="info.light"
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        borderBottom={1}
        borderColor="info.main"
        zIndex={1000}
      >
        {!isCollapsed && (
          <ButtonBase component="a" href="/" disableRipple>
            <Box>
              <Image src="/prosafe-black-logo.png" alt="Logo" height={70} width={210} />
            </Box>
          </ButtonBase>
        )}

        <IconButton
          onClick={onToggleCollapse}
          sx={{
            width: 36,
            height: 36,
            padding: 0,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {isCollapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        </IconButton>
      </Stack>

      {/* Sidebar menu list */}
      <List
        component="nav"
        sx={{
          mt: 2.5,
          mb: 10,
          px: isCollapsed ? 1 : 4.5, // Smaller padding when collapsed
        }}
      >
        {menuItems.map((item) => (
          <DrawerListItem key={item.id} {...item} isCollapsed={isCollapsed} />
        ))}
      </List>

      {/* Sidebar footer (logout button) */}
      {!isCollapsed && (
        <Box mt="auto" px={4.5} pb={6}>
          <Button
            variant="text"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
            sx={{
              py: 1.5,
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      )}
    </>
  );
}
