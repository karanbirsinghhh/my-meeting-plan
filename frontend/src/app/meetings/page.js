'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { getMeetings, cancelMeeting } from '@/lib/api';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [tab]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await getMeetings(tab);
      setMeetings(data);
    } catch (error) {
      showToast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async (id) => {
    setConfirmCancel(id);
  };

  const confirmCancelAction = async () => {
    try {
      await cancelMeeting(confirmCancel);
      showToast('Meeting cancelled');
      fetchMeetings();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setConfirmCancel(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="page-header">
          <div>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="page-title">Meetings</h1>
            <p className="page-subtitle">View and manage your scheduled meetings</p>
          </div>
        </div>

        <div className="page-body">
          <div className="tabs">
            <button
              className={`tab ${tab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`tab ${tab === 'past' ? 'active' : ''}`}
              onClick={() => setTab('past')}
            >
              Past
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : meetings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{tab === 'upcoming' ? '📅' : '📋'}</div>
              <h3 className="empty-state-title">No {tab} meetings</h3>
              <p className="empty-state-text">
                {tab === 'upcoming'
                  ? 'When someone books a meeting with you, it will appear here.'
                  : 'Your past meetings will appear here.'}
              </p>
            </div>
          ) : (
            <div>
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`meeting-card ${meeting.status === 'cancelled' ? 'cancelled' : ''}`}
                >
                  <div
                    className="meeting-card-accent"
                    style={{ backgroundColor: meeting.color || '#0069ff' }}
                  />
                  <div className="meeting-card-content">
                    <div className="meeting-card-title">
                      {meeting.event_name}
                      {meeting.status === 'cancelled' && (
                        <span className="status-badge cancelled" style={{ marginLeft: 8 }}>Cancelled</span>
                      )}
                    </div>
                    <div className="meeting-card-meta">
                      <span>📅 {formatDate(meeting.start_time)}</span>
                      <span>🕐 {formatTime(meeting.start_time, meeting.end_time)}</span>
                      <span>📍 {meeting.location || 'Google Meet'}</span>
                    </div>
                    <div className="meeting-card-invitee">
                      👤 {meeting.invitee_name} ({meeting.invitee_email})
                    </div>
                  </div>
                  {tab === 'upcoming' && meeting.status !== 'cancelled' && (
                    <div className="meeting-card-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(meeting.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Cancellation</h2>
              <button className="modal-close" onClick={() => setConfirmCancel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this meeting? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmCancel(null)}>Keep Meeting</button>
              <button className="btn btn-danger" onClick={confirmCancelAction}>Cancel Meeting</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
