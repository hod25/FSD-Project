'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAllEvents, Event } from '@/services/eventService';
import { fetchLocationById } from '@/services/locationService';
import { fetchAreaById } from '@/services/areaService';
import { updateEventStatus } from '@/services/eventService';

import Swal from 'sweetalert2';

export default function EventsPage() {
  const siteId = useSelector((state: RootState) => state.user.site_location);
  const areaId = useSelector((state: RootState) => state.area?.currentAreaId);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>('');
  const [areaName, setAreaName] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // פילטרים - תאריך התחלה ותאריך סיום
  const [filterStartDate, setFilterStartDate] = useState<string>(''); // פורמט yyyy-mm-dd
  const [filterEndDate, setFilterEndDate] = useState<string>(''); // פורמט yyyy-mm-dd
  const [filterStatus, setFilterStatus] = useState<'all' | 'Handled' | 'Not Handled'>('all');

  useEffect(() => {
    setEvents([]);
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (!siteId || !areaId) {
          console.log('Missing site or area ID, cannot load events');
          setLoading(false);
          return;
        }

        const allEvents = await fetchAllEvents();

        // סינון לפי אתר ואז אזור
        let filtered = allEvents.filter(
          (event) => event.site_location === siteId && event.area_location === areaId
        );

        // סינון לפי סטטוס
        if (filterStatus !== 'all') {
          filtered = filtered.filter((event) => event.status === filterStatus);
        }

        // סינון לפי טווח תאריכים (אם קיים)
        if (filterStartDate) {
          const start = new Date(filterStartDate);
          filtered = filtered.filter((event) => new Date(event.time_) >= start);
        }
        if (filterEndDate) {
          const end = new Date(filterEndDate);
          // כדי לכלול את כל היום, נשים 23:59:59 בסוף היום
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter((event) => new Date(event.time_) <= end);
        }

        setEvents(filtered);

        if (siteId) {
          const location = await fetchLocationById(siteId);
          setSiteName(location?.name || 'Unknown Site');
        }

        if (areaId) {
          const area = await fetchAreaById(areaId);
          setAreaName(area?.name || 'Unknown Area');
        }
      } catch (err) {
        console.error('❌ Failed to load events:', err);
        setError('Failed to load events, Please select an area.');
      } finally {
        setLoading(false);
      }
    };

    if (siteId && areaId) {
      load();
    } else {
      setLoading(false);
    }
  }, [siteId, areaId, filterStartDate, filterEndDate, filterStatus]);

  const handleStatusChange = async (eventId: string) => {
    const eventToChange = events.find((event) => event._id === eventId);
    if (!eventToChange) return;

    if (eventToChange.status === 'Not Handled') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, close it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
      });

      if (result.isConfirmed) {
        try {
          const updatedEvent = await updateEventStatus(eventToChange._id, 'Handled');
          setEvents((prevEvents) =>
            prevEvents.map((event) => (event._id === eventToChange._id ? updatedEvent : event))
          );
          Swal.fire({
            title: 'Closed!',
            text: 'The event was successfully closed.',
            icon: 'success',
            confirmButtonColor: '#28a745',
          });
        } catch (error) {
          console.error('Error updating event:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while updating the event.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        }
      }
    } else {
      Swal.fire({
        title: 'Info',
        text: 'This event is already closed and cannot be reopened.',
        icon: 'warning',
        confirmButtonColor: '#28a745',
      });
    }
  };

  const openImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  return (
    <div
      className="events-container"
      style={{
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'transparent',
        borderRadius: '12px',
        boxShadow: 'none',
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#2c3e50',
            margin: 0,
          }}
        >
          Safety Events
        </h1>
        <div
          style={{
            backgroundColor: '#e9f7fe',
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#0f6cbd',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {siteName} / {areaName}
        </div>
      </header>

      {/* FILTERS - כולל טווח תאריכים */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* תאריך התחלה */}
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label
            htmlFor="filter-start-date"
            style={{
              display: 'block',
              fontWeight: '700',
              fontSize: '18px',
              color: '#1e293b',
              marginBottom: '8px',
            }}
          >
            Start Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-start-date"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px', // הוספתי paddingRight של 40px
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1.5px solid #94a3b8',
                color: '#334155',
                cursor: 'pointer',
              }}
            />
            {filterStartDate && (
              <button
                onClick={() => setFilterStartDate('')}
                aria-label="Clear start date filter"
                title="Clear start date filter"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#e11d48',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.6)',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* תאריך סיום */}
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label
            htmlFor="filter-end-date"
            style={{
              display: 'block',
              fontWeight: '700',
              fontSize: '18px',
              color: '#1e293b',
              marginBottom: '8px',
            }}
          >
            End Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-end-date"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px', // גם פה paddingRight של 40px
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1.5px solid #94a3b8',
                color: '#334155',
                cursor: 'pointer',
              }}
            />
            {filterEndDate && (
              <button
                onClick={() => setFilterEndDate('')}
                aria-label="Clear end date filter"
                title="Clear end date filter"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#e11d48',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.6)',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* סטטוס */}
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label
            htmlFor="filter-status"
            style={{
              display: 'block',
              fontWeight: '700',
              fontSize: '18px',
              color: '#1e293b',
              marginBottom: '8px',
            }}
          >
            Filter by Status
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1.5px solid #94a3b8',
              color: '#334155',
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All</option>
            <option value="Handled">Handled</option>
            <option value="Not Handled">Not Handled</option>
          </select>
        </div>
      </section>

      {/* תוכן האירועים */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
            color: '#5c6ac4',
          }}
        >
          <div
            className="loader"
            style={{
              width: '48px',
              height: '48px',
              border: '5px solid #e9f7fe',
              borderRadius: '50%',
              borderTop: '5px solid #0f6cbd',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : error ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fff5f5',
            borderRadius: '8px',
            color: '#c53030',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontSize: '16px', marginBottom: '0' }}>{error}</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#6c757d',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '16px', marginBottom: '0' }}>No events found for this area</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event, index) => (
            <div
              key={event._id}
              className="event-item"
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
                marginBottom: '20px',
                display: 'flex',
                position: 'relative',
                borderLeft: `4px solid ${event.status === 'Handled' ? '#10b981' : '#dc2626'}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)';
              }}
            >
              <div
                style={{
                  width: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  padding: '15px 0',
                  borderRight: '1px solid #eaedf0',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #edf2f7 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '14px 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      color: '#334155',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {new Date(event.time_).getDate()}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '500',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginTop: '2px',
                    }}
                  >
                    {new Date(event.time_).toLocaleString('en-US', { month: 'short' })}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontWeight: '400',
                      marginTop: '4px',
                      letterSpacing: '0.2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 6v6l4 2"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    {new Date(event.time_).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '20px 24px',
                  display: 'flex',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: 0,
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      {event.details}
                      {/* פרטים מלאים של האירוע */}
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          fontWeight: '500',
                        }}
                      ></span>
                    </h2>

                    <button
                      onClick={() => handleStatusChange(event._id)}
                      style={{
                        backgroundColor: event.status === 'Handled' ? '#059669' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginLeft: '12px',
                        marginTop: '-4px',
                        boxShadow:
                          event.status === 'Handled'
                            ? '0 2px 10px rgba(16, 185, 129, 0.2)'
                            : '0 2px 10px rgba(148, 163, 184, 0.15)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow =
                          event.status === 'Handled'
                            ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                            : '0 4px 12px rgba(148, 163, 184, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          event.status === 'Handled'
                            ? '0 2px 10px rgba(16, 185, 129, 0.2)'
                            : '0 2px 10px rgba(148, 163, 184, 0.15)';
                      }}
                    >
                      {event.status === 'Handled' ? (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Resolved
                        </>
                      ) : (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L2 20h20L12 2z"
                              fill="red"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 8v5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <circle cx="12" cy="17" r="1" fill="white" />
                          </svg>
                          Unresolved
                        </>
                      )}
                    </button>
                  </div>

                  {/* הוספת המיקום (אתר + אזור) מתחת לכותרת */}
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                      marginBottom: '10px',
                    }}
                  >
                    Location: {siteName} / {areaName}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '12px',
                    }}
                  >
                    <div
                      style={{
                        padding: '5px 12px',
                        borderRadius: '30px',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.3px',
                        backgroundColor:
                          event.status === 'Handled'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(153, 34, 7, 0.08)',
                        color: event.status === 'Handled' ? '#10b981' : '#ef4444',
                        border: `1px solid ${
                          event.status === 'Handled'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)'
                        }`,
                      }}
                    >
                      {event.status}
                    </div>

                    <div
                      style={{
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        backgroundColor: '#cbd5e1',
                        margin: '0 12px',
                      }}
                    ></div>

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 4h-4V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v1H5a1 1 0 00-1 1v16a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1zm-3 12H8v-2h8v2zm0-4H8v-2h8v2z"
                          fill="#64748b"
                        />
                      </svg>
                      Event #{index + 1}
                    </span>
                  </div>
                </div>

                {event.image_url && (
                  <div
                    style={{
                      width: '120px',
                      height: '80px',
                      marginLeft: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => openImagePreview(event.image_url)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt="alert"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15 3l2 2h4v13H3V5h4l2-2h6zm-4 5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                            fill="#475569"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            overflow: 'hidden',
          }}
          onClick={closeImagePreview}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '95%',
              maxHeight: '95%',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '95vh',
                objectFit: 'contain',
                borderRadius: '4px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                backgroundColor: 'white',
                color: '#333',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                fontSize: '22px',
                fontWeight: 'bold',
                zIndex: 10000,
              }}
              onClick={(e) => {
                e.stopPropagation();
                closeImagePreview();
              }}
            >
              ×
            </button>
          </div>
          <style jsx global>{`
            body {
              overflow: ${selectedImage ? 'hidden' : 'auto'};
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
