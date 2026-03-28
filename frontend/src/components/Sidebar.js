'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Event Types', icon: '📅' },
    { href: '/availability', label: 'Availability', icon: '🕐' },
    { href: '/meetings', label: 'Meetings', icon: '👥' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">M</div>
            My Meeting Plan
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--gray-200)', margin: '12px 24px' }} />
          <Link
            href="/karanbir"
            className="sidebar-nav-item"
            onClick={onClose}
          >
            <span className="nav-icon">🔗</span>
            My Booking Page
          </Link>
        </nav>
        
        <div className="sidebar-user">
          <div className="sidebar-avatar">KS</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Karanbir Singh</div>
            <div className="sidebar-user-link">mymeetingplan.com/karanbir</div>
          </div>
        </div>
      </aside>
      <style jsx>{`
        .sidebar-backdrop {
          display: none;
        }
        @media (max-width: 768px) {
          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
}
