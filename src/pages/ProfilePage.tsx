import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [mobile] = useState(user?.mobile || '');
  const [location, setLocation] = useState(user?.location || '');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || '');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(user?.emergencyContactNumber || '');

  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [existingConditions, setExistingConditions] = useState(user?.existingConditions || '');
  const [currentMedications, setCurrentMedications] = useState(user?.currentMedications || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactNumber.trim()) {
      setError('Emergency contact name and phone number are required.');
      return;
    }

    setError('');
    setIsSaving(true);

    const result = await updateProfile({
      username: username.trim(),
      location: location.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactNumber: emergencyContactNumber.trim(),
      age: age ? Number(age) : undefined,
      gender,
      bloodGroup,
      allergies: allergies.trim(),
      existingConditions: existingConditions.trim(),
      currentMedications: currentMedications.trim()
    });

    setIsSaving(false);

    if (result.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-emerald">Patient Profile & Clinical Baseline</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>My Health Profile</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Maintain your core clinical snapshot, emergency contacts, and medical preferences. Persists securely across sessions.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', color: '#34d399', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Health Profile updated successfully! All changes have been saved to your command center.</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#fca5a5', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Personal & Contact */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            1. Identity & Contact Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name / Username <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Mobile Number (Read-only)</label>
              <input
                type="tel"
                className="form-input"
                value={mobile}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / City <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        {/* SECTION 2: Emergency Contact */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            2. Emergency Contact
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Emergency Contact Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                className="form-input"
                value={emergencyContactNumber}
                onChange={e => setEmergencyContactNumber(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Clinical Health Snapshot */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            3. Clinical Baseline & Snapshot
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
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

          <div className="form-group">
            <label className="form-label">Known Allergies</label>
            <input
              type="text"
              className="form-input"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Pollen"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Existing Medical Conditions</label>
            <input
              type="text"
              className="form-input"
              value={existingConditions}
              onChange={e => setExistingConditions(e.target.value)}
              placeholder="e.g. Hypertension, Type 2 Diabetes, Mild Asthma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Medications</label>
            <input
              type="text"
              className="form-input"
              value={currentMedications}
              onChange={e => setCurrentMedications(e.target.value)}
              placeholder="e.g. Amlodipine 5mg (1-0-0), Metformin 500mg (0-1-0)"
            />
          </div>
        </div>

        {/* Save Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Health Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
