import React from 'react';
import { FaUsers, FaUserShield, FaUser } from 'react-icons/fa';
import { Box, Typography, Card, Avatar } from '@mui/material';

interface UserSummaryProps {
  userAnalytics: {
    admin: number;
    viewer: number;
    total: number;
  };
}

const UserSummary: React.FC<UserSummaryProps> = ({ userAnalytics }) => {
  const safeUserAnalytics = {
    admin: userAnalytics?.admin || 0,
    viewer: userAnalytics?.viewer || 0,
    total: userAnalytics?.total || 0,
  };

  const userTypes = [
    {
      label: 'Total Users',
      count: safeUserAnalytics.total,
      icon: <FaUsers />,
      color: '#ffc040', // Primary orange
      bgColor: '#fff9e6',
    },
    {
      label: 'Admins',
      count: safeUserAnalytics.admin,
      icon: <FaUserShield />,
      color: '#ffb020', // Darker orange
      bgColor: '#fff6e6',
    },
    {
      label: 'Viewers',
      count: safeUserAnalytics.viewer,
      icon: <FaUser />,
      color: '#ffd060', // Lighter orange
      bgColor: '#fffcf0',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        p: 4,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        height: 'fit-content',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: '#111827',
          letterSpacing: '-0.025em',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            fontSize: 20,
            color: '#ffc040',
          }}
        >
          👥
        </Box>
        User Summary
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 2,
        }}
      >
        {userTypes.map((userType, index) => (
          <Card
            key={index}
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: userType.bgColor,
              border: `1px solid ${userType.color}20`,
              borderRadius: 2,
              textAlign: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 20px ${userType.color}20`,
                borderColor: userType.color,
              },
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: userType.color,
                mb: 2,
                mx: 'auto',
                fontSize: 20,
              }}
            >
              {userType.icon}
            </Avatar>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: userType.color,
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {userType.count}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              {userType.label}
            </Typography>
          </Card>
        ))}
      </Box>
    </Card>
  );
};

export default UserSummary;
