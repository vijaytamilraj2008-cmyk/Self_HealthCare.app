import React from 'react';
import { Hospital } from '../../types';
import { Building2, Stethoscope, MapPin, Phone, Clock, Star, AlertCircle, Navigation, Calendar, X } from 'lucide-react';
import { locationService } from '../../services/locationService';

interface HospitalDetailModalProps {
  hospital: Hospital;
  onClose: () => void;
  onBookAppointment: (hospital: Hospital) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  onClose,
  onBookAppointment
}) => {
  const directionsUrl = locationService.getDirectionsUrl(hospital);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog glass-card-elevated"
        style={{ padding: '24px', maxWidth: '580px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald">{hospital.department}</span>
              {hospital.emergencyAvailable && (
                <span className="badge badge-rose">24/7 Emergency</span>
              )}
              {hospital.distance !== undefined && (
                <span className="badge badge-cyan">
                  <MapPin size={11} /> {hospital.distance} km away
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {hospital.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {hospital.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Doctor & Facility Highlights */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Senior Consultant</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={15} color="#10b981" />
                {hospital.doctor}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {hospital.specialty}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Consultation Fee</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
                ₹{hospital.consultationFee.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Direct clinic payment
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Clock size={14} color="var(--cyan)" />
              <span>{hospital.timing}</span>
            </div>
            {hospital.reviewCount !== undefined && hospital.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#fbbf24', fontWeight: '700' }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>{hospital.rating} / 5.0 ({hospital.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* GPS Coordinates Info */}
        <div style={{ padding: '10px 14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#7dd3fc' }}>
          <MapPin size={15} color="#38bdf8" />
          <span>Coordinates: {hospital.latitude.toFixed(4)}° N, {hospital.longitude.toFixed(4)}° E (Precise Haversine distance: {hospital.distance} km)</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <a
            href={`tel:${hospital.phone}`}
            className="btn btn-secondary"
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            <Phone size={15} /> Call
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            <Navigation size={15} /> Directions
          </a>

          <button
            onClick={() => {
              onClose();
              onBookAppointment(hospital);
            }}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <Calendar size={15} /> Book
          </button>
        </div>
      </div>
    </div>
  );
};
