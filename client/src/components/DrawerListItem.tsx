'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { MenuItem } from '../app/routes/paths';

interface DrawerListItemProps extends MenuItem {
  isCollapsed: boolean;
}

export default function DrawerListItem({
  label,
  path,
  icon: Icon,
  isCollapsed,
}: DrawerListItemProps) {
  const pathname = usePathname(); // 🧠 get the current URL

  const isActive = pathname === path; // 🧠 check if this item matches current page

  return (
    <ListItemButton
      component={Link}
      href={path}
      selected={isActive} // 🧠 highlight if active
      sx={{
        mb: 2.5,
        borderRadius: 1,
        minHeight: 48,
        justifyContent: isCollapsed ? 'center' : 'initial',
        '&:hover': {
          bgcolor: 'grey.100',
        },
        ...(isActive && {
          bgcolor: 'primary.light', // 🧠 Different background for selected item
          color: 'primary.main',
          fontWeight: 600,
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
          },
        }),
      }}
    >
      {Icon && (
        <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 48, justifyContent: 'center' }}>
          <Icon />
        </ListItemIcon>
      )}
      {!isCollapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );
}
