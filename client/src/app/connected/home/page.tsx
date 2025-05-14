'use client';

import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import { Box, Typography, Paper, Container } from '@mui/material';
import Image from 'next/image';

export default function HomePage() {
  const user = useSelector(selectUser);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            width: '100%',
            maxWidth: 800,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Image src="/ProSafe_Logo.svg" alt="ProSafe Logo" width={180} height={90} priority />
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Welcome, {user?.name}!
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Access Level: {user?.access_level === 'admin' ? 'Administrator' : 'Standard User'}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
