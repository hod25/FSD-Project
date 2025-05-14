import { SxProps, Theme } from '@mui/material';

// Animation for the loading spinner
export const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const navbarStyles = {
  appBar: {
    bgcolor: '#f9fafc',
    boxShadow: 'none',
    borderBottom: '1px solid #e0e0e0',
    height: 56,
    justifyContent: 'center',
  },
  toolbar: {
    minHeight: '56px !important',
    px: 2,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
  },
  leftStack: {
    minWidth: '180px',
  },
  menuButton: {
    display: { xs: 'flex', lg: 'none' },
    color: 'text.secondary',
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.04)',
    },
    mr: 0.5,
  },
  welcomeCaption: {
    fontWeight: 500,
    fontSize: '0.7rem',
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 1,
  },
  usernameText: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#555555',
    lineHeight: 1.2,
  },
  centerStack: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 180, 0, 0.07)',
    px: 2,
    py: 0.7,
    zIndex: 1,
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 180, 0, 0.2)',
  },
  businessIcon: {
    fontSize: 18,
    color: '#d18700',
  },
  locationNameText: {
    fontWeight: 600,
    fontSize: '15px',
    color: '#444444',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #f0f0f0',
    borderTopColor: '#ffb400',
    marginLeft: '8px',
    animation: 'spin 1s linear infinite',
  },
  rightStack: {
    minWidth: '180px',
    justifyContent: 'flex-end',
  },
  areaButton: {
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
  },
  locationIcon: {
    color: '#d18700',
    fontSize: 16,
  },
  areaButtonText: {
    fontWeight: 500,
    fontSize: '14px',
  },
  menuPaper: {
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
  },
  allAreasMenuItem: {
    py: 1,
    px: 2,
    mx: 1,
    borderRadius: '6px',
    mb: 1,
    '&:hover': {
      backgroundColor: 'rgba(255, 180, 0, 0.08)',
    },
  },
  dashboardIcon: {
    color: '#ffb400',
    fontSize: 20,
  },
  allAreasText: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#707070',
  },
  overviewBadge: {
    ml: 'auto !important',
    backgroundColor: 'rgba(255, 180, 0, 0.1)',
    color: '#d18700',
    fontWeight: 500,
    py: 0.3,
    px: 1,
    borderRadius: '4px',
    fontSize: '12px',
  },
  selectAreaText: {
    px: 2,
    py: 0.5,
    display: 'block',
    color: '#909090',
    fontWeight: 500,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  areaMenuItem: (isSelected: boolean): SxProps<Theme> => ({
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
  }),
  areaMenuItemIcon: {
    color: '#707070',
    fontSize: 18,
  },
  areaMenuItemText: (isSelected: boolean): SxProps<Theme> => ({
    fontWeight: isSelected ? 600 : 400,
    fontSize: '14px',
  }),
  iconButton: {
    color: '#707070',
    '&:hover': {
      bgcolor: 'rgba(209, 135, 0, 0.05)',
      color: '#d18700',
    },
  },
  settingsButton: {
    color: '#707070',
    '&:hover': {
      bgcolor: 'rgba(255, 180, 0, 0.08)',
      color: '#ffb400',
    },
  },
};
