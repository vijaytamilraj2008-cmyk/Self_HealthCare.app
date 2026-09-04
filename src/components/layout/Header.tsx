import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ShieldAlert, Eye, User as UserIcon, LogOut, PhoneCall } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { setA11yModalOpen, fontSize, highContrast } = useAccessibility();

  return (
    <header className="top-header">
      {/* Brand & Mobile Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: 0, textAlign: 'left' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              Accessible Healthcare
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Find care. Understand health. Stay prepared.
            </span>
          </div>
        </button>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Emergency Fast Trigger */}
        <button
          onClick={() => onNavigate('emergency')}
          className={`btn ${currentPage === 'emergency' ? 'btn-emergency' : 'btn-secondary'}`}
          style={{
            borderColor: 'rgba(239, 68, 68, 0.4)',
            color: currentPage === 'emergency' ? '#fff' : '#f87171',
            background: currentPage === 'emergency' ? undefined : 'rgba(239, 68, 68, 0.12)',
            padding: '7px 14px',
            fontSize: '13px'
          }}
          title="Emergency Help Center & Call 112"
        >
          <PhoneCall size={15} />
          <span className="emergency-label">112 Emergency</span>
        </button>

        {/* Accessibility Modal Toggle */}
        <button
          onClick={() => setA11yModalOpen(true)}
          className="btn btn-secondary btn-sm"
          title="Accessibility Settings (Font Size, Contrast, Motion)"
          style={{ gap: '6px' }}
        >
          <Eye size={16} color="var(--cyan)" />
          <span style={{ fontSize: '12px', fontWeight: '600' }}>
            {fontSize.toUpperCase()}{highContrast ? ' • HC' : ''}
          </span>
        </button>

        {/* User Account / Auth Actions */}
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onNavigate('profile')}
              className={`btn ${currentPage === 'profile' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ gap: '6px' }}
              title="My Health Profile"
            >
              <UserIcon size={15} />
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={() => {
                logout();
                onNavigate('login');
              }}
              className="btn btn-ghost btn-sm"
              title="Logout"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => onNavigate('login')} className="btn btn-secondary btn-sm">
              Log In
            </button>
            <button onClick={() => onNavigate('register')} className="btn btn-primary btn-sm">
              Create Account
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
