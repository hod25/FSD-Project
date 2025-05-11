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
      selected={isActive}
      sx={{
        mb: 2.5,
        borderRadius: 1,
        minHeight: 48,
        justifyContent: isCollapsed ? 'center' : 'initial',
        '&:hover': {
          bgcolor: 'rgba(224, 149, 0, 0.05)',
          color: '#e09500',
          '& .MuiListItemIcon-root': {
            color: '#e09500',
          },
        },
        ...(isActive && {
          bgcolor: 'rgba(224, 149, 0, 0.1)', // More subtle background
          color: '#e09500', // Darker yellow
          fontWeight: 600,
          '& .MuiListItemIcon-root': {
            color: '#e09500',
          },
        }),
      }}
    >
      {Icon && (
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 0 : 48,
            justifyContent: 'center',
            transition: 'color 0.2s ease',
            color: isActive ? '#e09500' : 'inherit',
          }}
        >
          <Icon />
        </ListItemIcon>
      )}
      {!isCollapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );
}
