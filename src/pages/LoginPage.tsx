import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Phone, Lock, Eye, EyeOff, AlertCircle, KeyRound, CheckCircle2, X } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, resetPassword } = useAuth();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotEmergencyPhone, setForgotEmergencyPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobile.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ mobile, password });

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.error || 'Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotMobile.trim() || !forgotEmergencyPhone.trim() || !newPassword || !confirmNewPassword) {
      setForgotError('Please fill all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    const result = await resetPassword({
      mobile: forgotMobile,
      emergencyContactNumber: forgotEmergencyPhone,
      newPassword,
      confirmNewPassword
    });

    if (result.success) {
      setForgotSuccess('Password updated successfully! You can now log in with your new password.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess('');
        setForgotError('');
      }, 2000);
    } else {
      setForgotError(result.error || 'Password reset failed.');
    }
    setIsResetting(false);
  };

  return (
    <div className="page-body" style={{ maxWidth: '480px', margin: '40px auto' }}>
      <div className="glass-card-elevated" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            marginBottom: '12px'
          }}>
            <LogIn size={26} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Log in with your Mobile Number & Password
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Mobile Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Password <span className="required">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            <LogIn size={16} />
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer' }}
          >
            Create an Account (No OTP)
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div
            className="modal-dialog glass-card-elevated"
            style={{ padding: '24px', maxWidth: '440px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Reset Password</h3>
              </div>
              <button onClick={() => setShowForgotModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Verify with your registered Mobile Number and Emergency Contact Number to update your password securely without OTP.
            </p>

            {forgotError && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px', marginBottom: '14px' }}>
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Registered Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={forgotMobile}
                  onChange={e => setForgotMobile(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registered Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 01234"
                  value={forgotEmergencyPhone}
                  onChange={e => setForgotEmergencyPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={isResetting} className="btn btn-primary" style={{ flex: 1.5 }}>
                  {isResetting ? 'Verifying...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
