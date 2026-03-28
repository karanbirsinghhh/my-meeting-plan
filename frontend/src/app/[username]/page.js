'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getUser, getUserEventTypes } from '@/lib/api';

export default function PublicUserPage() {
  const params = useParams();
  const username = params.username;
  const [user, setUser] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [userData, eventsData] = await Promise.all([
          getUser(username),
          getUserEventTypes(username)
        ]);
        if (!cancelled) {
          setUser(userData);
          setEventTypes(eventsData);
        }
      } catch (err) {
        if (!cancelled) setError('User not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [username]);

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
          <h3 className="empty-state-title">User not found</h3>
          <p className="empty-state-text">The scheduling page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="public-header">
        <div className="public-avatar">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <h1 className="public-name">{user.name}</h1>
        <p className="public-subtitle">Welcome! Pick an event type to get started.</p>
      </div>

      <div className="public-events">
        {eventTypes.map((event) => (
          <Link
            key={event.id}
            href={`/${username}/${event.slug}`}
            className="public-event-card"
          >
            <div
              className="public-event-accent"
              style={{ backgroundColor: event.color || '#0069ff' }}
            />
            <div className="public-event-info">
              <div className="public-event-name">{event.name}</div>
              <div className="public-event-duration">
                🕐 {event.duration} min &nbsp;|&nbsp; 📍 {event.location || 'Google Meet'}
              </div>
            </div>
            <div className="public-event-arrow">→</div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px', fontSize: '13px', color: 'var(--gray-400)' }}>
        Powered by <strong style={{ color: 'var(--primary)' }}>My Meeting Plan</strong>
      </div>
    </div>
  );
}
