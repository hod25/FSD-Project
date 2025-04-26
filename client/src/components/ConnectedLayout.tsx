'use client';

import { useState, useEffect, PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 240;

export default function MainLayout({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const isNowMobile = window.innerWidth < 1200; // 1200px is Material-UI 'lg' breakpoint
        setIsMobile(isNowMobile);

        // Optional: Auto-close sidebar when entering mobile
        if (isNowMobile) {
          setMobileOpen(false);
        }
      }
    };

    handleResize(); // Run initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', margin: 0, padding: 0 }}>
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        setIsClosing={setIsClosing}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isMobile={isMobile} // pass down
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', lg: `calc(100% - ${drawerWidth}px)` },
          position: 'relative',
        }}
      >
        <Box sx={{ margin: 0, padding: 0, flex: 1 }}>
          <Navbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <Box
            sx={{
              flex: 1,
              width: '100%',
              margin: 0,
              padding: { xs: 2, lg: 3 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
