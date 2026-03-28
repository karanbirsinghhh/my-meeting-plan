const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Event Types
export const getEventTypes = () => fetchAPI('/event-types');
export const getEventType = (id) => fetchAPI(`/event-types/${id}`);
export const createEventType = (data) => fetchAPI('/event-types', { method: 'POST', body: JSON.stringify(data) });
export const updateEventType = (id, data) => fetchAPI(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEventType = (id) => fetchAPI(`/event-types/${id}`, { method: 'DELETE' });

// Availability
export const getAvailability = () => fetchAPI('/availability');
export const updateAvailability = (data) => fetchAPI('/availability', { method: 'PUT', body: JSON.stringify(data) });

// Bookings
export const getAvailableSlots = (username, slug, date) => fetchAPI(`/bookings/slots/${username}/${slug}?date=${date}`);
export const getAvailableDates = (username, slug, month) => fetchAPI(`/bookings/available-dates/${username}/${slug}?month=${month}`);
export const createBooking = (data) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const getBooking = (id) => fetchAPI(`/bookings/${id}`);

// Meetings
export const getMeetings = (type = 'upcoming') => fetchAPI(`/meetings?type=${type}`);
export const cancelMeeting = (id) => fetchAPI(`/meetings/${id}/cancel`, { method: 'PUT' });

// Users (public)
export const getUser = (username) => fetchAPI(`/users/${username}`);
export const getUserEventTypes = (username) => fetchAPI(`/users/${username}/event-types`);
