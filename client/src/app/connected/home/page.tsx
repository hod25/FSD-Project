'use client';

import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/userSlice';
import { selectAreas } from '@/store/slices/areaSlice';
import { selectLocationName } from '@/store/slices/locationSlice';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Chip,
  Divider,
  Card,
} from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VideocamIcon from '@mui/icons-material/Videocam';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export default function HomePage() {
  const user = useSelector(selectUser);
  const areas = useSelector(selectAreas);
  const locationName = useSelector(selectLocationName); // Get location name from Redux
  const [weather, setWeather] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(true);

  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=32.08&longitude=34.78&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto'
        );
        const data = await response.json();
        setWeather(data.daily);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if ([0].includes(code)) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 61, 63, 65].includes(code)) return '🌦️';
    if ([71, 73, 75, 77].includes(code)) return '❄️';
    if ([80, 81, 82].includes(code)) return '🌧️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '❔';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });

  // Filter out "All Areas" from the display list
  const filteredAreas = areas.filter(
    (area) =>
      area.name !== 'All Areas' &&
      area.name !== 'all areas' &&
      area.name !== 'ALL AREAS' &&
      area.name.toLowerCase() !== 'all areas'
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            pb: 3,
            borderBottom: '1px solid rgba(0,77,122,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
            <Image
              src="/ProSafe_Logo.svg"
              alt="ProSafe Logo"
              width={120}
              height={60}
              priority
              style={{ filter: 'drop-shadow(0 0 5px rgba(0,77,122,0.2))' }}
            />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, height: 50, display: { xs: 'none', md: 'block' } }}
            />
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  background: 'linear-gradient(135deg, #004d7a 0%, #008793 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Safety Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Current Site: <strong>{locationName || 'No location selected'}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-end' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Chip
                icon={<VpnKeyIcon fontSize="small" />}
                label={user?.access_level === 'admin' ? 'Administrator' : 'Standard User'}
                size="small"
                sx={{
                  fontWeight: 500,
                  background:
                    user?.access_level === 'admin'
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #474747 100%)'
                      : 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                  color: user?.access_level === 'admin' ? '#ffffff' : '#666666',
                  border: user?.access_level === 'admin' ? '1px solid #000' : '1px solid #ccc',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Last login: Today, 09:45 AM
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
        >
          <SecurityIcon color="primary" />
          Safety Areas
        </Typography>

        {filteredAreas && filteredAreas.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 4,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            {filteredAreas.map((area) => (
              <Box
                key={area.id}
                sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', sm: '45%', md: '23%' } }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 24px rgba(0,36,75,0.08)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 28px rgba(0,36,75,0.15)',
                      background:
                        'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                    },
                  }}
                >
                  <Box sx={{ p: 2, position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      <FiberManualRecordIcon
                        sx={{
                          fontSize: '0.7rem',
                          color: blink ? '#f44336' : 'rgba(244, 67, 54, 0.6)',
                          animation: blink ? 'pulse 1s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 },
                          },
                        }}
                      />
                      LIVE
                    </Box>

                    {/* Camera icon */}
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2d2d2d 0%, #474747 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <VideocamIcon sx={{ color: '#ffffff', fontSize: 28 }} />

                      {/* Lens reflection effect */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background:
                            'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
                          top: '20px',
                          left: '25px',
                        }}
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {area.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          background: 'rgba(76,175,80,0.1)',
                          color: '#388e3c',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              // Increased opacity for better visibility on transparent background
              background: 'rgba(0,97,167,0.07)',
              border: '1px solid rgba(0,97,167,0.2)',
            }}
          >
            <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No security zones available. Please set up zones in the management console.
            </Typography>
          </Paper>
        )}

        {/* WEATHER */}
        <Typography
          variant="h6"
          sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
        >
          <Box component="span" role="img" aria-label="Weather" sx={{ fontSize: 24 }}>
            🌤️
          </Box>
          Weather Forecast {locationName && `- ${locationName}`}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} thickness={4} sx={{ color: '#0061a7' }} />
          </Box>
        ) : weather ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 24px rgba(0,36,75,0.08)',
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                justifyContent: { xs: 'flex-start', md: 'space-between' },
                minWidth: { xs: 700, md: 'auto' },
              }}
            >
              {weather.time.map((date, index) => (
                <Box
                  key={date}
                  sx={{
                    flex: 1,
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    background:
                      index === 0
                        ? 'linear-gradient(135deg, rgba(0,97,167,0.08) 0%, rgba(0,121,146,0.15) 100%)'
                        : 'transparent',
                    border: index === 0 ? '1px solid rgba(0,97,167,0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, rgba(0,97,167,0.05) 0%, rgba(0,121,146,0.1) 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={index === 0 ? 700 : 500}
                    sx={{ color: index === 0 ? '#0061a7' : 'text.primary', mb: 1 }}
                  >
                    {index === 0 ? 'Today' : formatDate(date)}
                  </Typography>
                  <Box
                    sx={{
                      fontSize: { xs: 28, md: 36 },
                      my: { xs: 0.5, md: 1 },
                      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))',
                    }}
                  >
                    {getWeatherIcon(weather.weathercode[index])}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                    {Math.round(weather.temperature_2m_max[index])}°
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(weather.temperature_2m_min[index])}°
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'rgba(244,67,54,0.08)',
              border: '1px solid rgba(244,67,54,0.2)',
            }}
          >
            <Typography
              color="error"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Failed to load weather data. Please try again later.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
