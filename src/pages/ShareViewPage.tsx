import React, { useState, useEffect } from 'react';
import { qrShareService } from '../services/qrShareService';
import { ShareTokenData, DetectedMedicine } from '../types';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  User,
  Phone,
  Droplet,
  ShieldAlert,
  Pill,
  Calendar,
  FileText,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface ShareViewPageProps {
  token: string;
  onNavigateHome: () => void;
}

export const ShareViewPage: React.FC<ShareViewPageProps> = ({ token, onNavigateHome }) => {
  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid'>('loading');
  const [shareData, setShareData] = useState<ShareTokenData | null>(null);

  useEffect(() => {
    let mounted = true;
    const validate = async () => {
      const result = await qrShareService.validateToken(token);
      if (!mounted) return;
      setStatus(result.status);
      if (result.status === 'valid' && result.data) {
        setShareData(result.data);
      }
    };
    validate();
    return () => { mounted = false; };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="page-body" style={{ maxWidth: '640px', textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Validating Secure Healthcare Token...</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Checking the secure sharing record stored by the healthcare backend.
          </p>
        </div>
      </div>
    );
  }

  // EXPIRED STATE
  if (status === 'expired') {
    return (
      <div className="page-body" style={{ maxWidth: '640px', textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-card-elevated" style={{ padding: '40px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '16px' }}>
            <Clock size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}>
            This healthcare sharing link has expired.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', margin: '8px auto 24px auto' }}>
            For patient confidentiality and safety, temporary QR sharing links are valid for strictly 24 hours. Please request a newly generated QR code from the patient.
          </p>
          <button onClick={onNavigateHome} className="btn btn-secondary">
            <ArrowLeft size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  // INVALID STATE (NO 404!)
  if (status === 'invalid' || !shareData) {
    return (
      <div className="page-body" style={{ maxWidth: '640px', textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-card-elevated" style={{ padding: '40px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
            <AlertCircle size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fca5a5' }}>
            This sharing link is invalid or no longer available.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '440px', margin: '8px auto 24px auto' }}>
            The requested healthcare token could not be verified. Please verify the URL or request the patient to regenerate a fresh QR share link.
          </p>
          <button onClick={onNavigateHome} className="btn btn-secondary">
            <ArrowLeft size={16} /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate remaining time
  const remainingHours = Math.max(0, Math.round((shareData.expiresAt - Date.now()) / (1000 * 60 * 60)));

  return (
    <div className="page-body" style={{ maxWidth: '840px', margin: '20px auto' }}>
      {/* Verification Header Badge */}
      <div
        className="glass-card-elevated"
        style={{
          padding: '24px 28px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 20, 36, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-emerald">
                <ShieldCheck size={12} /> Verified Temporary Share
              </span>
              <span className="badge badge-amber">
                <Clock size={12} /> Expires in ~{remainingHours} Hours
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Shared Health Record: {shareData.userName}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Read-only clinical snapshot provided via Accessible Healthcare Support
            </p>
          </div>

          <button onClick={onNavigateHome} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <ArrowLeft size={14} /> Open App
          </button>
        </div>
      </div>

      {/* 1. PATIENT HEALTH SNAPSHOT */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          <User size={20} color="#10b981" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Patient Clinical Baseline</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {/* Blood Group */}
          <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '2px' }}>
              <Droplet size={14} /> Blood Group
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {shareData.userBloodGroup || 'Not specified'}
            </div>
          </div>

          {/* Age & Gender */}
          <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Age & Gender</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {shareData.userAge ? `${shareData.userAge} yrs` : 'N/A'} • {shareData.userGender || 'N/A'}
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{ padding: '12px 14px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: '600', marginBottom: '2px' }}>
              <Phone size={14} /> Emergency Contact
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {shareData.emergencyContact.name}
            </div>
            <a href={`tel:${shareData.emergencyContact.phone}`} style={{ fontSize: '12px', color: '#38bdf8', textDecoration: 'none' }}>
              {shareData.emergencyContact.phone}
            </a>
          </div>
        </div>

        {/* Allergies & Medications */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#fbbf24', marginBottom: '2px' }}>
              <ShieldAlert size={14} /> Known Allergies
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {shareData.userAllergies || 'No known allergies reported.'}
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#34d399', marginBottom: '2px' }}>
              <Pill size={14} /> Active Medications
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {shareData.userMedications || 'No routine medications recorded.'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT MEDICAL DOCUMENTS & PRESCRIBED MEDICINES */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          <FileText size={20} color="#38bdf8" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Medical Records & Verified Prescriptions</h2>
        </div>

        {shareData.documents.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medical documents attached to this share.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {shareData.documents.map((doc, idx: number) => (
              <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {doc.title}
                  </div>
                  <span className="badge badge-emerald">{doc.documentType}</span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {doc.summary}
                </div>

                {doc.medicines && doc.medicines.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Prescribed Medications:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {doc.medicines.map((m: DetectedMedicine, mIdx: number) => (
                        <div key={mIdx} style={{ fontSize: '13px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px' }}>
                          <strong>• {m.name}</strong> ({m.strength}) — {m.instructions} ({m.duration})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SCHEDULED APPOINTMENTS (INR ₹) */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          <Calendar size={20} color="#fbbf24" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Scheduled Consultations</h2>
        </div>

        {shareData.appointments.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming consultations recorded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shareData.appointments.map((apt, idx: number) => (
              <div key={idx} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {apt.doctorName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {apt.hospitalName} ({apt.department})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                    {apt.date} at {apt.time}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{apt.purpose}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        ⚠️ <strong>Confidentiality Notice:</strong> This clinical summary is generated for personal sharing and emergency reference. It does not substitute official hospital discharge summaries or formal diagnostic reports.
      </div>
    </div>
  );
};
