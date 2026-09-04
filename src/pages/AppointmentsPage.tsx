import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { timelineService } from '../services/timelineService';
import { Appointment } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  Building2,
  XCircle,
  Edit2,
  Eye,
  X
} from 'lucide-react';
import { BookAppointmentModal } from '../components/modals/BookAppointmentModal';

interface AppointmentsPageProps {
  onNavigate: (page: string) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadAppointments = async () => {
      if (!user) {
        if (mounted) { setAllAppointments([]); setIsLoading(false); }
        return;
      }
      setIsLoading(true);
      try {
        const appointments = await appointmentService.getAppointments();
        if (mounted) { setAllAppointments(appointments); setPageError(''); }
      } catch (error: any) {
        if (mounted) setPageError(error?.message || 'Unable to load appointments.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadAppointments();
    return () => { mounted = false; };
  }, [user?.id]);

  const filteredAppointments = allAppointments.filter(a => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled consultation?')) return;
    setPageError('');
    const res = await appointmentService.cancelAppointment(id);
    if (res.success && res.appointment) {
      setAllAppointments(current => current.map(a => a.id === id ? res.appointment! : a));
      timelineService.addEvent({
        id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: user!.id,
        title: 'Appointment Cancelled',
        description: `Cancelled the appointment with ${res.appointment.doctorName} at ${res.appointment.hospitalName} scheduled for ${res.appointment.date} at ${res.appointment.time}.`,
        category: 'appointment',
        timestamp: new Date().toISOString(),
        badgeText: 'Cancelled'
      }).catch(error => console.warn('Could not record appointment cancellation timeline event:', error));
      setSelectedAppointment(null);
    } else {
      setPageError(res.error || 'Failed to cancel appointment.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    const res = await appointmentService.updateAppointment(editingAppointment);
    if (res.success && res.appointment) {
      setAllAppointments(current => current.map(a => a.id === res.appointment!.id ? res.appointment! : a));
      timelineService.addEvent({
        id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: user!.id,
        title: 'Appointment Rescheduled',
        description: `Updated the appointment with ${res.appointment.doctorName} at ${res.appointment.hospitalName} to ${res.appointment.date} at ${res.appointment.time}.`,
        category: 'appointment',
        timestamp: new Date().toISOString(),
        badgeText: 'Rescheduled'
      }).catch(error => console.warn('Could not record appointment reschedule timeline event:', error));
      setEditingAppointment(null);
    } else {
      setPageError(res.error || 'Failed to update appointment.');
    }
  };

  const handleBookingSuccess = (appointment: Appointment) => {
    setAllAppointments(current => [appointment, ...current]);
    setIsBookModalOpen(false);
    setActiveTab('upcoming');
  };

  const getEditTimeParts = (value: string) => {
    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { time: value.replace(/\s*(AM|PM)$/i, ''), period: 'AM' as const };
    return { time: `${match[1].padStart(2, '0')}:${match[2]}`, period: match[3].toUpperCase() as 'AM' | 'PM' };
  };

  const updateEditingTime = (value: string, period: 'AM' | 'PM') => {
    const cleaned = value.replace(/[^0-9:]/g, '').slice(0, 5);
    setEditingAppointment(current => current ? { ...current, time: `${cleaned} ${period}`.trim() } : current);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald">Consultation Manager</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>My Appointments</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Track, schedule, reschedule, and manage clinical visits across healthcare providers.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={18} /> Schedule New Appointment
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          Upcoming ({allAppointments.filter(a => a.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          Completed ({allAppointments.filter(a => a.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`btn ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          Cancelled ({allAppointments.filter(a => a.status === 'cancelled').length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        >
          All Records ({allAppointments.length})
        </button>
      </div>

      {pageError && (
        <div style={{ padding: '12px 14px', marginBottom: '16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px' }}>
          {pageError}
        </div>
      )}

      {/* APPOINTMENT CARDS LIST */}
      {isLoading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Calendar size={42} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>No {activeTab} appointments</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '18px' }}>
            Schedule a consultation or check other categories.
          </p>
          <button onClick={() => setIsBookModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Book an Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppointments.map(apt => (
            <div
              key={apt.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${apt.status === 'upcoming' ? '#10b981' : apt.status === 'completed' ? '#38bdf8' : '#ef4444'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                {/* Doctor & Facility */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-emerald">{apt.department}</span>
                    <span className={`badge ${apt.status === 'upcoming' ? 'badge-cyan' : apt.status === 'completed' ? 'badge-emerald' : 'badge-rose'}`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {apt.doctorName}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} /> {apt.hospitalName}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>
                    <strong>Purpose:</strong> {apt.purpose}
                  </div>
                  {apt.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <em>Note: {apt.notes}</em>
                    </div>
                  )}
                </div>

                {/* Date, Time & INR Fee */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                      <Calendar size={14} /> {apt.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#fbbf24', marginTop: '2px', justifyContent: 'flex-end' }}>
                      <Clock size={14} /> {apt.time}
                    </div>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>
                    ₹{apt.fee.toLocaleString('en-IN')}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="btn btn-secondary btn-sm"
                      title="View full details"
                    >
                      <Eye size={13} /> View
                    </button>

                    {apt.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => setEditingAppointment(apt)}
                          className="btn btn-secondary btn-sm"
                          title="Reschedule / Edit"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#f87171' }}
                          title="Cancel appointment"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book New Appointment Modal */}
      {isBookModalOpen && (
        <BookAppointmentModal
          onClose={() => setIsBookModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* View Appointment Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-dialog glass-card-elevated" style={{ padding: '24px', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Appointment Details</h3>
              <button onClick={() => setSelectedAppointment(null)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                {selectedAppointment.doctorName}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {selectedAppointment.hospitalName} ({selectedAppointment.department})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span> <strong>{selectedAppointment.date}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Time:</span> <strong>{selectedAppointment.time}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Fee:</span> <strong style={{ color: '#10b981' }}>₹{selectedAppointment.fee.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{selectedAppointment.status.toUpperCase()}</strong>
                </div>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', fontSize: '13px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Clinical Purpose:</div>
                <div style={{ color: 'var(--text-primary)' }}>{selectedAppointment.purpose}</div>
              </div>

              {selectedAppointment.notes && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Notes:</strong> {selectedAppointment.notes}
                </div>
              )}
            </div>

            <button onClick={() => setSelectedAppointment(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Modal */}
      {editingAppointment && (
        <div className="modal-overlay" onClick={() => setEditingAppointment(null)}>
          <div className="modal-dialog glass-card-elevated" style={{ padding: '24px', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Reschedule Appointment</h3>
              <button onClick={() => setEditingAppointment(null)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Doctor & Hospital</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${editingAppointment.doctorName} — ${editingAppointment.hospitalName}`}
                  disabled
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">New Date <span className="required">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={editingAppointment.date}
                    onChange={e => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Time Slot <span className="required">*</span></label>
                  {(() => {
                    const parts = getEditTimeParts(editingAppointment.time);
                    return (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="form-input"
                          value={parts.time}
                          onChange={e => updateEditingTime(e.target.value, parts.period)}
                          placeholder="09:30"
                          maxLength={5}
                          required
                          style={{ flex: 1 }}
                        />
                        <div style={{ display: 'flex', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '3px' }}>
                          {(['AM', 'PM'] as const).map(option => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateEditingTime(parts.time, option)}
                              className={`btn btn-sm ${parts.period === option ? 'btn-primary' : 'btn-ghost'}`}
                              style={{ minWidth: '46px', padding: '7px 8px' }}
                              aria-pressed={parts.period === option}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of Visit</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAppointment.purpose}
                  onChange={e => setEditingAppointment({ ...editingAppointment, purpose: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAppointment.notes || ''}
                  onChange={e => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingAppointment(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
