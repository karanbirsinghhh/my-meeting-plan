'use client';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      {message}
    </div>
  );
}
