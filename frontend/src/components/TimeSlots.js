'use client';

import { useState } from 'react';

export default function TimeSlots({ slots, selectedDate, onSelectSlot, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelect = (slot) => {
    setSelectedSlot(slot);
    if (onSelectSlot) onSelectSlot(slot);
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="time-slots-panel">
        <div className="time-slots-date">{formatDisplayDate(selectedDate)}</div>
        <div className="empty-state" style={{ padding: '20px 0' }}>
          <div className="empty-state-icon">😔</div>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            No available times for this date
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-slots-panel">
      <div className="time-slots-date">{formatDisplayDate(selectedDate)}</div>
      {slots.map((slot, index) => (
        selectedSlot?.start === slot.start ? (
          <div key={index} className="time-slot-confirm">
            <div className="time-display">{slot.display}</div>
            <button 
              className="confirm-btn" 
              onClick={() => onConfirm(slot)}
            >
              Next
            </button>
          </div>
        ) : (
          <button
            key={index}
            className={`time-slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
            onClick={() => handleSelect(slot)}
          >
            {slot.display}
          </button>
        )
      ))}
    </div>
  );
}
