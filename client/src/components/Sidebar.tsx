'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean; // 🆕
}

const drawerWidth = 300;
const collapsedWidth = 70;

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  setIsClosing,
  isCollapsed,
  setIsCollapsed,
  isMobile,
}: SidebarProps) {
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  // const handleDrawerTransitionEnd = () => {
  //   setIsClosing(false);
  // };

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: isCollapsed ? collapsedWidth : drawerWidth },
        flexShrink: { lg: 0 },
      }}
    >
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {/* 🛠 Pass the real close function */}
          <DrawerItems isCollapsed={false} onToggleCollapse={handleDrawerClose} />
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: isCollapsed ? collapsedWidth : drawerWidth,
              transition: 'width 0.3s',
              boxSizing: 'border-box',
            },
          }}
          open
        >
          <DrawerItems
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </Drawer>
      )}
    </Box>
  );
}
