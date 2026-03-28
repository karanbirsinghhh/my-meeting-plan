'use client';

import { useState } from 'react';

export default function BookingForm({ eventType, selectedSlot, onSubmit, onBack, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const formatDateTime = () => {
    if (!selectedSlot) return '';
    const start = new Date(selectedSlot.start);
    const end = new Date(selectedSlot.end);
    const dateStr = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <div className="booking-form-panel">
      <div className="booking-form-header">
        <button className="booking-form-back" onClick={onBack}>
          ←
        </button>
        <h3 className="booking-form-title">Enter Details</h3>
      </div>

      <div style={{ 
        background: 'var(--gray-50)', 
        padding: '12px 16px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        fontSize: '13px',
        color: 'var(--gray-600)'
      }}>
        <span style={{ marginRight: '8px' }}>📅</span>
        {formatDateTime()}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Share anything that will help prepare for our meeting"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg btn-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
              Scheduling...
            </>
          ) : (
            'Schedule Event'
          )}
        </button>
      </form>
    </div>
  );
}
