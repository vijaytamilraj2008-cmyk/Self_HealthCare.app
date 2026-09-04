import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { locationService, UserCoordinates } from '../services/locationService';
import { Hospital } from '../types';
import {
  PhoneCall,
  AlertTriangle,
  Share2,
  Building2,
  Navigation,
  Check
} from 'lucide-react';

interface EmergencyPageProps {
  onNavigate: (page: string) => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ onNavigate: _onNavigate }) => {
  const { user } = useAuth();
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [emergencyHospitals, setEmergencyHospitals] = useState<Hospital[]>([]);
  const [copiedLocation, setCopiedLocation] = useState(false);

  useEffect(() => {
    const loadEmergencyHospitals = async () => {
      try {
        const loc = await locationService.getCurrentLocation();

        setCoords(loc);

        const hospitals = await locationService.getEmergencyHospitals(loc);

        setEmergencyHospitals(hospitals);
      } catch {
        setCoords(null);
        setEmergencyHospitals([]);
      }
    };

    loadEmergencyHospitals();
  }, []);

  const handleShareLocation = () => {
    let locText = `🚨 EMERGENCY ASSISTANCE REQUEST:\nName: ${user?.username || 'Patient'}\nMobile: ${user?.mobile || 'N/A'}\n`;
    if (coords) {
      locText += `Live Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}\nGPS Coordinates: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}\n`;
    }
    if (user?.bloodGroup) locText += `Blood Group: ${user.bloodGroup}\n`;
    if (user?.allergies) locText += `Allergies: ${user.allergies}\n`;

    navigator.clipboard.writeText(locText);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 3000);
  };

  return (
    <div className="page-body" style={{ maxWidth: '800px' }}>
      {/* High-Visibility Emergency Hero */}
      <div
        className="glass-card-elevated pulse-emergency"
        style={{
          padding: '36px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.25) 0%, rgba(14, 20, 36, 0.95) 100%)',
          border: '2px solid #ef4444',
          borderRadius: '24px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '14px'
          }}
        >
          <AlertTriangle size={36} />
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Are you experiencing an emergency?
        </h1>
        <p style={{ fontSize: '15px', color: '#fca5a5', maxWidth: '520px', margin: '0 auto 24px auto' }}>
          For acute medical trauma, heart emergencies, severe breathing difficulty, or unconsciousness, trigger immediate response below.
        </p>

        {/* MAIN CRITICAL ACTION: CALL 112 */}
        <a
          href="tel:112"
          className="btn btn-emergency btn-lg"
          style={{
            display: 'inline-flex',
            padding: '18px 40px',
            fontSize: '22px',
            fontWeight: '900',
            borderRadius: '16px',
            textDecoration: 'none',
            gap: '12px'
          }}
        >
          <PhoneCall size={26} />
          CALL 112 NOW
        </a>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          National Toll-Free Emergency Helpline (Ambulance & Police)
        </div>
      </div>

      {/* QUICK EMERGENCY SUB-ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Contact Emergency Contact */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>
              Primary Emergency Contact
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {user?.emergencyContactName || 'No contact configured'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.emergencyContactNumber || 'Please add in Health Profile'}
            </div>
          </div>

          <a
            href={user?.emergencyContactNumber ? `tel:${user.emergencyContactNumber}` : '#'}
            className="btn btn-secondary"
            style={{ marginTop: '14px', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
          >
            <PhoneCall size={15} /> Call Emergency Contact
          </a>
        </div>

        {/* Share GPS Location */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Live GPS Location
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {coords ? `${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E` : 'Detecting GPS...'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Ready to send to emergency services & family
            </div>
          </div>

          <button
            onClick={handleShareLocation}
            className="btn btn-secondary"
            style={{ marginTop: '14px', justifyContent: 'center', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}
          >
            {copiedLocation ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
            {copiedLocation ? 'Emergency Info Copied!' : 'Copy / Share Location'}
          </button>
        </div>
      </div>

      {/* NEAREST 24/7 EMERGENCY HOSPITALS */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Nearest 24/7 Emergency & Trauma Centers</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sorted by nearest distance from current location</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {emergencyHospitals.map(hosp => (
            <div
              key={hosp.id}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge badge-rose">24/7 Emergency</span>
                  {hosp.distance !== undefined && (
                    <span className="badge badge-cyan">{hosp.distance} km away</span>
                  )}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {hosp.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hosp.specialty} • {hosp.address}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`tel:${hosp.phone}`}
                  className="btn btn-emergency btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <PhoneCall size={14} /> Call ER
                </a>
                <a
                  href={locationService.getDirectionsUrl(hosp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Navigation size={14} /> Navigate
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};