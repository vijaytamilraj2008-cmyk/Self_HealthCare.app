import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { timelineService } from '../../services/timelineService';
import { Hospital, Appointment } from '../../types';
import { Calendar, Clock, User, Building, Stethoscope, FileText, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookAppointmentModalProps {
  hospital?: Hospital | null;
  initialDepartment?: string;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  hospital,
  initialDepartment,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [hospitalName, setHospitalName] = useState(
    hospital?.name || 'Apollo Specialty Hospital'
  );

  const [doctorName, setDoctorName] = useState(
    hospital?.doctor || 'Dr. Ramesh Sundaram'
  );

  const [department, setDepartment] = useState(
    hospital?.department || initialDepartment || 'Orthopedics'
  );

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);

  // Time is entered manually by the user
  const [time, setTime] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const [purpose, setPurpose] = useState(
    'Consultation & clinical evaluation'
  );

  const [notes, setNotes] = useState('');

  const [fee] = useState(
    hospital?.consultationFee || 850
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const normalizeTime = (value: string): string | null => {
    const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2] ?? '00');
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please log in or register to book an appointment.');
      return;
    }

    if (
      !hospitalName.trim() ||
      !doctorName.trim() ||
      !date ||
      !time.trim() ||
      !purpose.trim()
    ) {
      setError('Please fill in all required appointment fields.');
      return;
    }

    const normalizedTime = normalizeTime(time);
    if (!normalizedTime) {
      setError('Enter a valid time such as 09:30 or 4:00.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await appointmentService.createAppointment({
      hospitalId: hospital?.id || `hosp_${Date.now()}`,
      hospitalName,
      doctorName,
      department,
      date,
      time: `${normalizedTime} ${period}`,
      purpose,
      notes,
      fee
    });

    if (res.success && res.appointment) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {
        // Ignore if confetti fails in some envs
      }

      timelineService.addEvent({
        id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: user.id,
        title: 'Appointment Scheduled',
        description: `Booked ${res.appointment.doctorName} at ${res.appointment.hospitalName} for ${res.appointment.date} at ${res.appointment.time}.`,
        category: 'appointment',
        timestamp: new Date().toISOString(),
        badgeText: 'Appointment'
      }).catch(error => console.warn('Could not record appointment timeline event:', error));

      onSuccess(res.appointment);
    } else {
      setError(res.error || 'Failed to schedule appointment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog glass-card-elevated"
        style={{ padding: '24px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <Calendar size={20} />
            </div>

            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700'
                }}
              >
                Schedule Appointment
              </h3>

              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}
              >
                Consultation Fee:{' '}
                <strong style={{ color: '#10b981' }}>
                  ₹{fee.toLocaleString('en-IN')}
                </strong>{' '}
                (Pay at clinic)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              padding: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hospital & Doctor */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px'
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: 0 }}
            >
              <label className="form-label">
                <Building
                  size={13}
                  style={{
                    display: 'inline',
                    marginRight: '4px'
                  }}
                />
                Hospital / Clinic{' '}
                <span className="required">*</span>
              </label>

              <input
                type="text"
                className="form-input"
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                required
              />
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0 }}
            >
              <label className="form-label">
                <Stethoscope
                  size={13}
                  style={{
                    display: 'inline',
                    marginRight: '4px'
                  }}
                />
                Doctor Name{' '}
                <span className="required">*</span>
              </label>

              <input
                type="text"
                className="form-input"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="form-label">
              Department / Specialty{' '}
              <span className="required">*</span>
            </label>

            <input
              type="text"
              className="form-input"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Orthopedics, Cardiology, General Medicine"
              required
            />
          </div>

          {/* Date & Time Slot */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px'
            }}
          >
            <div
              className="form-group"
              style={{ marginBottom: 0 }}
            >
              <label className="form-label">
                <Calendar
                  size={13}
                  style={{
                    display: 'inline',
                    marginRight: '4px'
                  }}
                />
                Appointment Date{' '}
                <span className="required">*</span>
              </label>

              <input
                type="date"
                className="form-input"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div
              className="form-group"
              style={{ marginBottom: 0 }}
            >
              <label className="form-label">
                <Clock
                  size={13}
                  style={{
                    display: 'inline',
                    marginRight: '4px'
                  }}
                />
                Time Slot{' '}
                <span className="required">*</span>
              </label>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={time}
                  onChange={e => setTime(e.target.value.replace(/[^0-9:]/g, ''))}
                  placeholder="09:30"
                  maxLength={5}
                  aria-label="Appointment time"
                  required
                  style={{ flex: 1 }}
                />
                <div style={{ display: 'flex', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '3px', background: 'rgba(255,255,255,0.03)' }}>
                  {(['AM', 'PM'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPeriod(option)}
                      className={`btn btn-sm ${period === option ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ minWidth: '48px', padding: '7px 10px' }}
                      aria-pressed={period === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                Type the time manually. Example: 09:30 {period}.
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label">
              Purpose of Visit{' '}
              <span className="required">*</span>
            </label>

            <input
              type="text"
              className="form-input"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="e.g. Joint pain follow up, prescription review"
              required
            />
          </div>

          {/* Clinical Notes */}
          <div className="form-group">
            <label className="form-label">
              Additional Notes (Optional)
            </label>

            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Mention any existing allergies or previous reports to bring..."
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {isSubmitting
                ? 'Confirming...'
                : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};