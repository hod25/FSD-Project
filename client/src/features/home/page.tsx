'use client';

import { useSelector } from 'react-redux';
import { selectUser } from '@/shared/store/slices/userSlice';
import { selectAreas } from '@/shared/store/slices/areaSlice';
import { selectLocationName } from '@/shared/store/slices/locationSlice';
import { RootState } from '@/shared/store/store';
import { Box, Typography, Paper, Container, CircularProgress, Chip, Card } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import ShieldIcon from '@mui/icons-material/Shield';
import { fetchAllEvents, Event } from '@/shared/services/eventService';
import axios from 'axios';

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export default function HomePage() {
  const user = useSelector(selectUser);
  const areas = useSelector(selectAreas);
  const locationName = useSelector(selectLocationName);
  const siteId = useSelector((state: RootState) => state.user.site_location);
  const [weather, setWeather] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState({
    admin: 0,
    viewer: 0,
    total: 0,
  });

  // Fetch user analytics
  useEffect(() => {
    const loadUserAnalytics = async () => {
      try {
        const response = await axios.post(
          'http://pro-safe.cs.colman.ac.il:5000/api/stats/no-hardhat',
          {
            locationIds: siteId ? [siteId] : [],
          },
          { withCredentials: true }
        );
        if (response.data?.userAnalytics) {
          setUserAnalytics(response.data.userAnalytics);
        }
      } catch (error) {
        console.error('Failed to fetch user analytics:', error);
      }
    };

    if (siteId) {
      loadUserAnalytics();
    }
  }, [siteId]);

  // Fetch events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const eventsData = await fetchAllEvents();

        // Filter events by current site if siteId exists
        const filteredEvents = siteId
          ? eventsData.filter((event) => event.site_location === siteId)
          : eventsData;

        setEvents(filteredEvents);
        console.log('Loaded events:', filteredEvents.length, 'events for site:', siteId);
        console.log('Sample event:', filteredEvents[0]);

        // Debug: log all unique area_location values
        const uniqueAreas = [...new Set(filteredEvents.map((e) => e.area_location))];
        console.log('Unique area_location values in events:', uniqueAreas);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
  }, [siteId]);

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

  // Function to count events by area
  const getEventsCountByArea = (areaId: string, areaName: string) => {
    if (eventsLoading) return '...';

    // Try to match by both area ID and area name
    const count = events.filter(
      (event) => event.area_location === areaId || event.area_location === areaName
    ).length;

    console.log(`Area ${areaName} (${areaId}): ${count} events`);
    return count;
  };

  // Debug: log areas data
  useEffect(() => {
    if (areas && areas.length > 0) {
      console.log('Areas data:', areas);
    }
  }, [areas]);

  // Filter out "All Areas" from the display list
  const filteredAreas = areas.filter(
    (area) =>
      area.name !== 'All Areas' &&
      area.name !== 'all areas' &&
      area.name !== 'ALL AREAS' &&
      area.name.toLowerCase() !== 'all areas'
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 4,
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Image
                src="/pro-icon.png"
                alt="ProSafe Icon"
                width={48}
                height={48}
                priority
                style={{ borderRadius: '8px' }}
              />
              <Image src="/ProSafe_Logo.svg" alt="ProSafe Logo" width={120} height={60} priority />
            </Box>
            <Box sx={{ ml: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ color: '#ffc040' }} />
                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                  {locationName || 'No location selected'}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: '#111827' }}>
                {user?.name}
              </Typography>
              <Chip
                icon={<VpnKeyIcon fontSize="small" />}
                label={user?.access_level === 'admin' ? 'Admin' : 'User'}
                size="small"
                sx={{
                  fontWeight: 500,
                  backgroundColor: user?.access_level === 'admin' ? '#ffc040' : '#fff9e6',
                  color: user?.access_level === 'admin' ? '#ffffff' : '#b8860b',
                  border: user?.access_level === 'admin' ? 'none' : '1px solid #ffc040',
                  '& .MuiChip-icon': {
                    color: user?.access_level === 'admin' ? '#ffffff' : '#ffc040',
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              Last login: Today, 09:45 AM
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* SECURITY AREAS SECTION */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 4,
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          maxWidth: '1000px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Security Areas
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Monitor and manage security zones with real-time event tracking
          </Typography>
        </Box>

        {filteredAreas && filteredAreas.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 3,
              maxWidth: '800px',
              mx: 'auto',
              justifyContent: 'center',
            }}
          >
            {filteredAreas.map((area) => (
              <Card
                key={area.id}
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    borderColor: '#ffc040',
                  },
                }}
              >
                {/* Area Icon */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffc040 0%, #ff8f65 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    mx: 'auto',
                    boxShadow: '0 4px 12px rgba(255, 192, 64, 0.3)',
                  }}
                >
                  <ShieldIcon sx={{ color: '#ffffff', fontSize: 28 }} />
                </Box>

                {/* Area Name */}
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    color: '#111827',
                    mb: 2,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {area.name}
                </Typography>

                {/* Events Count */}
                <Box
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      color: '#111827',
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {getEventsCountByArea(area.id, area.name)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    Events
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: 3,
              border: '2px dashed #e2e8f0',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <ShieldIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
              No Security Areas Configured
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Set up security areas in the management console to start monitoring events and
              maintaining coverage
            </Typography>
          </Box>
        )}
      </Paper>

      {/* OVERVIEW SECTION */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 4,
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            System Overview
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          {/* Active Areas */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#ffc040',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <SecurityIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {filteredAreas.length}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Active Areas
            </Typography>
          </Paper>

          {/* Total Events */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#ffc040',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <EventIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {events.length}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Total Events
            </Typography>
          </Paper>

          {/* Total Users */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#ffc040',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <PeopleIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {userAnalytics.total}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Total Users
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* USER SUMMARY SECTION */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 4,
          mb: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            User Summary
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            maxWidth: '500px',
            mx: 'auto',
          }}
        >
          {/* Total Users */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <PeopleIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {userAnalytics.total}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Total Users
            </Typography>
          </Paper>

          {/* Administrators */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <SecurityIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {userAnalytics.admin}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Administrators
            </Typography>
          </Paper>

          {/* Viewers */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                mx: 'auto',
              }}
            >
              <EventIcon sx={{ color: '#ffffff', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: '#111827', mb: 0.5, fontSize: '1.5rem' }}
            >
              {userAnalytics.viewer}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}
            >
              Viewers
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* WEATHER SECTION */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 4,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.025em',
            }}
          >
            Weather Forecast
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} thickness={4} sx={{ color: '#111827' }} />
          </Box>
        ) : weather ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(5, 1fr)',
                lg: 'repeat(7, 1fr)',
              },
              gap: 2,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            {weather.time.map((date, index) => (
              <Card
                key={date}
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: index === 0 ? '#ffc040' : '#f9fafb',
                  color: index === 0 ? '#ffffff' : '#111827',
                  border: index === 0 ? '1px solid #ffc040' : '1px solid #e5e7eb',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: index === 0 ? '#ffffff' : '#6b7280',
                  }}
                >
                  {index === 0 ? 'Today' : formatDate(date)}
                </Typography>
                <Box
                  sx={{
                    fontSize: 32,
                    mb: 2,
                  }}
                >
                  {getWeatherIcon(weather.weathercode[index])}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {Math.round(weather.temperature_2m_max[index])}°
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: index === 0 ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af',
                    fontWeight: 500,
                  }}
                >
                  {Math.round(weather.temperature_2m_min[index])}°
                </Typography>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            <Typography sx={{ color: '#6b7280' }}>
              Unable to load weather data. Please try again later.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
