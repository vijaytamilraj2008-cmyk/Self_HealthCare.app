import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataMigrationService } from '../services/dataMigrationService';
import { timelineService } from '../services/timelineService';
import { Activity, Calendar, FileText, User, AlertCircle, Clock, Pill } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelinePageProps { onNavigate: (page: string) => void; }

export const TimelinePage: React.FC<TimelinePageProps> = ({ onNavigate: _onNavigate }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!user) { setEvents([]); setLoading(false); return; }
    (async () => {
      try {
        await dataMigrationService.migrateForUser(user.id);
        const data = await timelineService.getEvents();
        if (mounted) setEvents(data);
      } catch (error) {
        console.error('Failed to load timeline:', error);
        if (mounted) setEvents([]);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return <Calendar size={16} color="#38bdf8" />;
      case 'document': return <FileText size={16} color="#10b981" />;
      case 'prescription': return <Pill size={16} color="#fbbf24" />;
      case 'profile': return <User size={16} color="#818cf8" />;
      case 'emergency': return <AlertCircle size={16} color="#ef4444" />;
      default: return <Activity size={16} color="#10b981" />;
    }
  };
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'appointment': return <span className="badge badge-cyan">Appointment</span>;
      case 'document': return <span className="badge badge-emerald">Document</span>;
      case 'prescription': return <span className="badge badge-amber">Prescription</span>;
      case 'profile': return <span className="badge badge-neutral">Profile</span>;
      case 'emergency': return <span className="badge badge-rose">Emergency</span>;
      default: return <span className="badge badge-emerald">{category}</span>;
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span className="badge badge-emerald">Chronological Health History</span></div>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Health Timeline</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>A unified, tamper-evident log of your consultations, uploaded prescriptions, and health profile events.</p>
      </div>
      {loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>Loading your health timeline…</div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Activity size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>No timeline events yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Actions like booking consultations or analyzing medical documents will appear here automatically.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          <div style={{ position: 'absolute', left: '11px', top: '12px', bottom: '12px', width: '2px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {events.map(evt => (
              <div key={evt.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-28px', top: '12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>{getCategoryIcon(evt.category)}</div>
                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{getCategoryBadge(evt.category)}<h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{evt.title}</h3></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}><Clock size={12} /><span>{new Date(evt.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
