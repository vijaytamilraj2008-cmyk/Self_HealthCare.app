import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { qrShareService } from '../../services/qrShareService';
import { QrCode, Copy, Check, ExternalLink, ShieldCheck, Clock, X } from 'lucide-react';

interface QRShareModalProps {
  onClose: () => void;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const generate = async () => {
      if (!user) return;
      try {
        setError('');
        const generated = await qrShareService.generateShareToken(user);
        if (mounted) {
          setShareUrl(generated.shareUrl);
          setToken(generated.token);
          setExpiresAt(generated.expiresAt);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to generate secure share QR.');
      }
    };
    generate();
    return () => { mounted = false; };
  }, [user]);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPage = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog glass-card-elevated"
        style={{ padding: '24px', maxWidth: '480px', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Secure Healthcare QR</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Temporary 24-Hour Clinical Sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', marginBottom: '14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '12px', textAlign: 'left' }}>
            {error}
          </div>
        )}

        {/* QR Code Container (Pure tokenized URL inside - NO sensitive data directly in QR) */}
        <div style={{
          background: '#ffffff',
          padding: '18px',
          borderRadius: '16px',
          display: 'inline-block',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          {shareUrl ? (
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Generating secure token...
            </div>
          )}
        </div>

        {/* Security & Expiration Banner */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          fontSize: '12px',
          color: '#34d399',
          textAlign: 'left',
          marginBottom: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>End-to-End Secure Token:</strong> The QR contains only a verified temporary token. No raw clinical data is embedded in the barcode image.
            <div style={{ marginTop: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="#fbbf24" />
              <span>Valid for <strong>24 hours</strong> from generation.</span>
            </div>
            <div style={{ marginTop: '5px', color: 'var(--text-secondary)', fontSize: '11px' }}>
              For local testing, scan while the phone is on the same Wi-Fi network as this computer.
            </div>
          </div>
        </div>

        {/* Share Link Field */}
        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            Direct Share URL
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="form-input"
              style={{ fontSize: '12px', fontFamily: 'var(--font-family-mono)', color: '#38bdf8' }}
            />
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ flexShrink: 0 }}
              title="Copy share link"
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={handleOpenPage}
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
          >
            <ExternalLink size={15} /> Open Share Page
          </button>
          <button onClick={onClose} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
