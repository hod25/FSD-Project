'use client';

import { AppBar, Toolbar, Stack, Avatar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
// import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface NavbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// const pulse = keyframes`
//   0% { box-shadow: 0 0 0 0 rgba(142, 55, 215, 0.4); }
//   70% { box-shadow: 0 0 0 10px rgba(142, 55, 215, 0); }
//   100% { box-shadow: 0 0 0 0 rgba(142, 55, 215, 0); }
// `;

const WelcomeText = styled(Typography)`
  background: linear-gradient(135deg, #6b8dd6 0%, #8e37d7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
`;

export default function Navbar({ /*mobileOpen,*/ setMobileOpen }: NavbarProps) {
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev); // 🛠️ No more isClosing check!
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', py: 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 600 }}>
            ProSafe
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              G
            </Avatar>
            <WelcomeText variant="subtitle1">Guest</WelcomeText>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
