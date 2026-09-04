import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  FileText,
  Bot,
  User,
  Activity,
  AlertCircle,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: undefined },
    { id: 'healthcare', label: 'Find Healthcare', icon: MapPin, badge: 'GPS' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: undefined },
    { id: 'documents', label: 'Medical Documents', icon: FileText, badge: 'OCR' },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'Safe' },
    { id: 'profile', label: 'Health Profile', icon: User, badge: undefined },
    { id: 'timeline', label: 'Health Timeline', icon: Activity, badge: undefined },
    { id: 'emergency', label: 'Emergency Center', icon: AlertCircle, badge: '112', isEmergency: true }
  ];

  return (
    <aside className="sidebar-desktop">
      {/* Brand area */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Accessible Care
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Command Center
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px' }}>
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="btn btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                background: isActive
                  ? item.isEmergency
                    ? 'rgba(239, 68, 68, 0.16)'
                    : 'rgba(16, 185, 129, 0.14)'
                  : 'transparent',
                color: isActive
                  ? item.isEmergency
                    ? '#f87171'
                    : '#10b981'
                  : item.isEmergency
                  ? '#f87171'
                  : 'var(--text-secondary)',
                border: isActive
                  ? `1px solid ${item.isEmergency ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  : '1px solid transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${item.isEmergency ? 'badge-rose' : item.badge === 'GPS' ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Emergency status */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Emergency Toll-Free</span>
          <span className="badge badge-rose" style={{ fontSize: '10px' }}>24/7 Live</span>
        </div>
        <a
          href="tel:112"
          className="btn btn-emergency btn-sm"
          style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
        >
          Call 112
        </a>
      </div>
    </aside>
  );
};
