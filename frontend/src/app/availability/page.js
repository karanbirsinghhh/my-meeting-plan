'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { getAvailability, updateAvailability } from '@/lib/api';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability();
      setTimezone(data.timezone || 'Asia/Kolkata');
      
      // Build full week schedule
      const fullSchedule = DAY_NAMES.map((_, index) => {
        const existing = data.schedule.find(s => s.day_of_week === index);
        return {
          day_of_week: index,
          start_time: existing ? existing.start_time.substring(0, 5) : '09:00',
          end_time: existing ? existing.end_time.substring(0, 5) : '17:00',
          is_active: existing ? Boolean(existing.is_active) : (index >= 1 && index <= 5)
        };
      });
      setSchedule(fullSchedule);
    } catch (error) {
      showToast('Failed to load availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDay = (index) => {
    setSchedule(prev => prev.map((day, i) => 
      i === index ? { ...day, is_active: !day.is_active } : day
    ));
  };

  const updateTime = (index, field, value) => {
    setSchedule(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvailability({ timezone, schedule });
      showToast('Availability saved!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="page-header">
          <div>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="page-title">Availability</h1>
            <p className="page-subtitle">Set when you&apos;re available for meetings</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : (
            <div className="availability-schedule">
              <div className="timezone-section">
                <label className="timezone-label">🌍 Timezone</label>
                <select
                  className="timezone-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="card">
                <div className="card-body">
                  {schedule.map((day, index) => (
                    <div
                      key={index}
                      className={`availability-day ${!day.is_active ? 'inactive' : ''}`}
                    >
                      <label className="availability-toggle">
                        <input
                          type="checkbox"
                          checked={day.is_active}
                          onChange={() => toggleDay(index)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      
                      <span className="availability-day-name">
                        {DAY_NAMES[index]}
                      </span>
                      
                      <div className="availability-times">
                        <input
                          type="time"
                          className="availability-time-input"
                          value={day.start_time}
                          onChange={(e) => updateTime(index, 'start_time', e.target.value)}
                        />
                        <span className="availability-time-separator">to</span>
                        <input
                          type="time"
                          className="availability-time-input"
                          value={day.end_time}
                          onChange={(e) => updateTime(index, 'end_time', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
