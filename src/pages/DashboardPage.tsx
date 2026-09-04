import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { timelineService } from '../services/timelineService';
import { dataMigrationService } from '../services/dataMigrationService';
import { appointmentService } from '../services/appointmentService';
import { pdfService } from '../services/pdfService';
import {
  HeartPulse,
  Calendar,
  FileText,
  Bot,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  Download,
  QrCode,
  Activity,
  Droplet,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { BookAppointmentModal } from '../components/modals/BookAppointmentModal';
import { QRShareModal } from '../components/modals/QRShareModal';
import { Appointment, TimelineEvent } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setAppointments([]);
      return;
    }
    (async () => {
      try {
        await dataMigrationService.migrateForUser(user.id);
        const [appointmentData, timelineData] = await Promise.all([appointmentService.getAppointments(), timelineService.getEvents()]);
        if (mounted) { setAppointments(appointmentData); setTimelineEvents(timelineData.slice(0, 5)); }
      } catch (error) { console.error('Failed to load dashboard data:', error); }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');

  const nextAppointment = upcomingAppointments[0] || null;

  const handleDownloadPdf = () => {
    if (user) {
      pdfService.generateHealthSummaryPdf(user);
    }
  };

  const handleAppointmentCreated = (appointment: Appointment) => {
    setAppointments(current => [appointment, ...current]);
    setIsBookModalOpen(false);
  };

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div className="glass-card-elevated" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 20, 36, 0.95) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-emerald">Personal Command Center</span>
              <span className="badge badge-neutral">Active Session</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Welcome, {user?.username || 'Valued User'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Location: <strong style={{ color: 'var(--text-primary)' }}>{user?.location || 'Set your location'}</strong> • Emergency Contact: <strong style={{ color: '#f87171' }}>{user?.emergencyContactName} ({user?.emergencyContactNumber})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadPdf}
              className="btn btn-secondary btn-sm"
              title="Download Full Health Summary PDF"
              style={{ gap: '6px' }}
            >
              <Download size={15} color="#10b981" />
              <span>Download PDF (₹)</span>
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="btn btn-primary btn-sm"
              title="Generate 24-Hour Secure Share QR"
              style={{ gap: '6px' }}
            >
              <QrCode size={15} />
              <span>Share QR (24h)</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Quick Healthcare Actions
        </div>
        <div className="grid-cards-4">
          <button
            onClick={() => onNavigate('healthcare')}
            className="glass-card glass-card-interactive btn-ghost"
            style={{ padding: '16px', borderRadius: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Find Healthcare</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nearest hospitals with live GPS</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('documents')}
            className="glass-card glass-card-interactive btn-ghost"
            style={{ padding: '16px', borderRadius: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Upload Document</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Multi-page PDF & image analysis</div>
            </div>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="glass-card glass-card-interactive btn-ghost"
            style={{ padding: '16px', borderRadius: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Plus size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Add Appointment</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Schedule a new doctor visit</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="glass-card glass-card-interactive btn-ghost"
            style={{ padding: '16px', borderRadius: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Ask AI Health</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prescriptions & doctor questions</div>
            </div>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* COLUMN 1: HEALTH SNAPSHOT */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <HeartPulse size={20} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Health Snapshot</h2>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="btn btn-ghost btn-sm"
              style={{ color: '#10b981', gap: '4px' }}
            >
              Edit Profile <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* Blood Group */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                <Droplet size={14} /> Blood Group
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {user?.bloodGroup || 'Not set'}
              </div>
            </div>

            {/* Age & Gender */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Age / Gender
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {user?.age ? `${user.age} yrs` : 'N/A'} • {user?.gender || 'N/A'}
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div style={{ padding: '12px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#fbbf24', marginBottom: '2px' }}>
              <ShieldAlert size={14} /> Known Allergies
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {user?.allergies || 'No known drug or environmental allergies recorded.'}
            </div>
          </div>

          {/* Current Medications */}
          <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#34d399', marginBottom: '2px' }}>
              <Pill size={14} /> Current Medications
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {user?.currentMedications || 'No active routine medications.'}
            </div>
          </div>

          {/* Existing Conditions */}
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '2px' }}>
              Existing Medical Conditions
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {user?.existingConditions || 'None reported.'}
            </div>
          </div>
        </div>

        {/* COLUMN 2: UPCOMING APPOINTMENT & RECENT ACTIVITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Appointment */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Calendar size={20} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Upcoming Appointment</h2>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="btn btn-ghost btn-sm"
                style={{ color: '#38bdf8', gap: '4px' }}
              >
                View All <ArrowRight size={13} />
              </button>
            </div>

            {nextAppointment ? (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>{nextAppointment.department}</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {nextAppointment.doctorName}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {nextAppointment.hospitalName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>
                      ₹{nextAppointment.fee.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clinic fee</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#38bdf8" />
                    <span>{nextAppointment.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#fbbf24" />
                    <span>{nextAppointment.time}</span>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Purpose: {nextAppointment.purpose}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }}>
                <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>No Upcoming Appointments</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
                  Schedule a consultation with specialists near your location.
                </p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Schedule Now
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(148, 163, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <Activity size={20} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Activity</h2>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-muted)', gap: '4px' }}
              >
                Full Timeline <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {timelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(evt.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {evt.badgeText && (
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{evt.badgeText}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isBookModalOpen && (
        <BookAppointmentModal
          onClose={() => setIsBookModalOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      )}

      {isQrModalOpen && (
        <QRShareModal onClose={() => setIsQrModalOpen(false)} />
      )}
    </div>
  );
};
