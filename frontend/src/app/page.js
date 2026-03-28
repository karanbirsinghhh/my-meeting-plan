'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { getEventTypes, createEventType, updateEventType, deleteEventType } from '@/lib/api';

const COLORS = ['#0069ff', '#7b2ff7', '#ff5722', '#00c853', '#e91e63', '#009688', '#ff9100', '#795548'];

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    duration: 30,
    description: '',
    location: 'Google Meet',
    color: '#0069ff'
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const data = await getEventTypes();
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      setEventTypes([]);
      console.error('Failed to load event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ name: '', slug: '', duration: 30, description: '', location: 'Google Meet', color: '#0069ff' });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      slug: event.slug,
      duration: event.duration,
      description: event.description || '',
      location: event.location || 'Google Meet',
      color: event.color || '#0069ff'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEventType(editingEvent.id, formData);
        showToast('Event type updated!');
      } else {
        await createEventType(formData);
        showToast('Event type created!');
      }
      setShowModal(false);
      fetchEventTypes();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteEventType(confirmDelete);
      showToast('Event type deleted');
      fetchEventTypes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const copyLink = (event) => {
    const link = `${window.location.origin}/karanbir/${event.slug}`;
    navigator.clipboard.writeText(link);
    showToast('Link copied to clipboard!');
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="page-header">
          <div>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="page-title">Event Types</h1>
            <p className="page-subtitle">Create and manage your scheduling links</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + New Event Type
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : eventTypes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3 className="empty-state-title">No event types yet</h3>
              <p className="empty-state-text">Create your first event type to start scheduling meetings</p>
              <button className="btn btn-primary" onClick={openCreateModal}>+ Create Event Type</button>
            </div>
          ) : (
            <div className="event-cards-grid">
              {eventTypes.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-card-accent" style={{ backgroundColor: event.color || '#0069ff' }} />
                  <div className="event-card-body">
                    <h3 className="event-card-name">{event.name}</h3>
                    <div className="event-card-duration">
                      🕐 {event.duration} min &nbsp;|&nbsp; {event.location || 'Google Meet'}
                    </div>
                    {event.description && (
                      <p className="event-card-description">{event.description}</p>
                    )}
                  </div>
                  <div className="event-card-footer">
                    <button className="event-card-link" onClick={() => copyLink(event)}>
                      🔗 Copy Link
                    </button>
                    <div className="event-card-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(event)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEvent ? 'Edit Event Type' : 'New Event Type'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 30 Minute Meeting"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name,
                        slug: editingEvent ? prev.slug : generateSlug(name)
                      }));
                    }}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">URL Slug *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="30min"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      required
                    />
                    <div className="form-helper">mymeetingplan.com/karanbir/{formData.slug || 'event-slug'}</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (minutes) *</label>
                    <select
                      className="form-select"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="In Person">In Person</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe what this meeting is about..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-options">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update' : 'Create'} Event Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this event type? This will also delete all associated bookings.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteAction}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
