import React from 'react';
import { LayoutDashboard, MapPin, FileText, Bot, AlertCircle } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'healthcare', label: 'Healthcare', icon: MapPin },
    { id: 'documents', label: 'Reports', icon: FileText },
    { id: 'ai-assistant', label: 'AI Health', icon: Bot },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle, isEmergency: true }
  ];

  return (
    <nav className="mobile-nav-bar" aria-label="Mobile Navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.isEmergency ? 'emergency-nav' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive
                ? item.isEmergency
                  ? '#ef4444'
                  : '#10b981'
                : item.isEmergency
                ? '#f87171'
                : 'var(--text-muted)'
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
