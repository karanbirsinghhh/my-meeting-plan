'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TimeSlots from '@/components/TimeSlots';
import BookingForm from '@/components/BookingForm';
import { getUser, getAvailableSlots, getAvailableDates, createBooking } from '@/lib/api';

export default function BookingPage() {
  const params = useParams();
  const { username, slug } = params;

  const [user, setUser] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Slots state
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Booking state
  const [step, setStep] = useState('calendar'); // calendar, form, confirmation
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch user and event type info
  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUser(username);
        setUser(userData);
        
        // Get available dates for current month
        const datesData = await getAvailableDates(username, slug, currentMonth);
        setAvailableDates(datesData.availableDates);
        
        // Get event type info from first slot request
        try {
          const today = new Date().toISOString().split('T')[0];
          const slotsData = await getAvailableSlots(username, slug, today);
          setEventType(slotsData.eventType);
        } catch (e) {
          // Try to get event type info from available dates if today has no slots
          if (datesData.availableDates.length > 0) {
            const firstDate = datesData.availableDates[0];
            const slotsData = await getAvailableSlots(username, slug, firstDate);
            setEventType(slotsData.eventType);
          }
        }
      } catch (err) {
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username, slug, currentMonth]);

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    
    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const data = await getAvailableSlots(username, slug, selectedDate);
        setSlots(data.slots);
        if (data.eventType) setEventType(data.eventType);
      } catch (err) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [selectedDate, username, slug]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotConfirm = (slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleBookingSubmit = async (formData) => {
    setBookingLoading(true);
    try {
      const result = await createBooking({
        event_type_id: eventType.id,
        invitee_name: formData.name,
        invitee_email: formData.email,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: formData.notes
      });
      setBookingResult(result);
      setStep('confirmation');
    } catch (err) {
      alert(err.message || 'Failed to book. This slot may no longer be available.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-layout">
        <div className="loading-center"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-layout">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">Event not found</h3>
          <p className="empty-state-text">The scheduling link you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-layout">
      <div className="booking-widget" style={{ maxWidth: step === 'calendar' && selectedDate ? '960px' : step === 'form' ? '860px' : '860px' }}>
        {/* Left Info Panel */}
        <div className="booking-info">
          <div className="booking-info-host">{user?.name}</div>
          <h1 className="booking-info-title">{eventType?.name}</h1>
          <div className="booking-info-detail">
            <span className="detail-icon">🕐</span>
            {eventType?.duration} min
          </div>
          <div className="booking-info-detail">
            <span className="detail-icon">📍</span>
            {eventType?.location || 'Google Meet'}
          </div>
          {selectedSlot && (
            <div className="booking-info-detail">
              <span className="detail-icon">📅</span>
              <div>
                {new Date(selectedSlot.start).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                <br />
                {new Date(selectedSlot.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' - '}
                {new Date(selectedSlot.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          )}
          {eventType?.description && (
            <div className="booking-info-description">
              {eventType.description}
            </div>
          )}
        </div>

        {/* Right Content Panel */}
        {step === 'calendar' && (
          <>
            <Calendar
              onSelectDate={handleDateSelect}
              availableDates={availableDates}
              selectedDate={selectedDate}
            />
            {selectedDate && (
              slotsLoading ? (
                <div className="time-slots-panel">
                  <div className="loading-center" style={{ padding: '40px 0' }}>
                    <div className="spinner"></div>
                  </div>
                </div>
              ) : (
                <TimeSlots
                  slots={slots}
                  selectedDate={selectedDate}
                  onConfirm={handleSlotConfirm}
                />
              )
            )}
          </>
        )}

        {step === 'form' && (
          <BookingForm
            eventType={eventType}
            selectedSlot={selectedSlot}
            onSubmit={handleBookingSubmit}
            onBack={() => setStep('calendar')}
            loading={bookingLoading}
          />
        )}

        {step === 'confirmation' && (
          <div className="booking-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2 className="confirmation-title">You are scheduled!</h2>
            <p className="confirmation-subtitle">
              A calendar invitation has been sent to your email address.
            </p>
            <div className="confirmation-details">
              <div className="confirmation-detail">
                <span className="detail-icon">📅</span>
                <span>
                  {bookingResult && new Date(bookingResult.start_time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="detail-icon">🕐</span>
                <span>
                  {bookingResult && `${new Date(bookingResult.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(bookingResult.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="detail-icon">📍</span>
                <span>{bookingResult?.location || eventType?.location || 'Google Meet'}</span>
              </div>
              <div className="confirmation-detail">
                <span className="detail-icon">👤</span>
                <span>{bookingResult?.host_name}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--gray-400)' }}>
        Powered by <strong style={{ color: 'var(--primary)' }}>My Meeting Plan</strong>
      </div>
    </div>
  );
}
