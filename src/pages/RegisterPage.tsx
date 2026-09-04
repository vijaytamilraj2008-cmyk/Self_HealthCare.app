import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Phone, Lock, User, MapPin, HeartPulse, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  // Required Fields
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');

  // Optional Clinical Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field validations
    if (!mobile.trim()) {
      setError('Mobile number is required.');
      return;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirm password does not match password.');
      return;
    }
    if (!location.trim()) {
      setError('Location / City is required.');
      return;
    }
    if (!emergencyContactName.trim()) {
      setError('Emergency contact name is required.');
      return;
    }
    if (!emergencyContactNumber.trim()) {
      setError('Emergency contact number is required.');
      return;
    }

    setIsSubmitting(true);

    // CRITICAL: ZERO OTP VERIFICATION.
    // Register -> Auto-authenticate -> DIRECT REDIRECT TO DASHBOARD
    const result = await register({
      mobile,
      username,
      password,
      confirmPassword,
      location,
      emergencyContactName,
      emergencyContactNumber,
      age: age ? Number(age) : undefined,
      gender,
      bloodGroup,
      allergies,
      existingConditions,
      currentMedications
    });

    if (result.success) {
      // Immediate direct redirect to Dashboard
      onNavigate('dashboard');
    } else {
      setError(result.error || 'Failed to create account. Please check your information.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '840px', margin: '20px auto' }}>
      <div className="glass-card-elevated" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            marginBottom: '12px'
          }}>
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Create Your Healthcare Command Center
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Instant Registration • No OTP Delays • Find Care & Understand Health
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: Account & Contact (Required) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <Shield size={16} color="#10b981" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                1. Required Account Credentials
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* Mobile Number */}
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
                  maxLength={15}
                  required
                />
              </div>

              {/* Username */}
              <div className="form-group">
                <label className="form-label">
                  <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Full Name / Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aarav Sharma"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* Password */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Password <span className="required">* (min 6 chars)</span>
                </label>
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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Your City / Location <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* SECTION 2: Emergency Contacts (Required) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <AlertCircle size={16} color="#ef4444" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                2. Emergency Contact Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Emergency Contact Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Priya Sharma (Spouse / Guardian)"
                  value={emergencyContactName}
                  onChange={e => setEmergencyContactName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Emergency Contact Phone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 01234"
                  value={emergencyContactNumber}
                  onChange={e => setEmergencyContactNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Clinical Snapshot (Optional) */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              <HeartPulse size={16} color="#06b6d4" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                3. Health Snapshot (Optional)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 34"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Penicillin, Peanuts, Dust"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Existing Medical Conditions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hypertension, Mild Asthma, Diabetes"
                  value={existingConditions}
                  onChange={e => setExistingConditions(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amlodipine 5mg (1-0-0), Inhaler as needed"
                value={currentMedications}
                onChange={e => setCurrentMedications(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', fontWeight: '700', letterSpacing: '0.02em' }}
          >
            <Sparkles size={18} />
            {isSubmitting ? 'Creating Account & Loading Dashboard...' : 'Create Account & Open Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer' }}
          >
            Log in to your account
          </button>
        </div>
      </div>
    </div>
  );
};
