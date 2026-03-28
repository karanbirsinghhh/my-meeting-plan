'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Calendar({ onSelectDate, availableDates = [], selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const formatDate = (day) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const isAvailable = (day) => {
    const dateStr = formatDate(day);
    return availableDates.includes(dateStr);
  };

  const isToday = (day) => {
    return isCurrentMonth && today.getDate() === day;
  };

  const isSelected = (day) => {
    return selectedDate === formatDate(day);
  };

  const isPast = (day) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= thisMonth) {
      setCurrentMonth(prev);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const canGoPrev = () => {
    const prev = new Date(year, month - 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return prev >= thisMonth;
  };

  // Generate calendar grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<button key={`empty-${i}`} className="calendar-day empty" disabled />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const available = isAvailable(day);
    const past = isPast(day);
    const disabled = !available || past;
    
    days.push(
      <button
        key={day}
        className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onSelectDate(formatDate(day))}
        disabled={disabled}
      >
        {day}
      </button>
    );
  }

  // Return the month string for external use
  const getMonthString = useCallback(() => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }, [year, month]);

  useEffect(() => {
    if (onSelectDate.onMonthChange) {
      onSelectDate.onMonthChange(getMonthString());
    }
  }, [getMonthString, onSelectDate]);

  return (
    <div className="booking-calendar">
      <div className="calendar-header">
        <h3 className="calendar-month-title">{monthNames[month]} {year}</h3>
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth} disabled={!canGoPrev()}>
            ‹
          </button>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            ›
          </button>
        </div>
      </div>
      
      <div className="calendar-weekdays">
        {weekdays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {days}
      </div>
    </div>
  );
}
