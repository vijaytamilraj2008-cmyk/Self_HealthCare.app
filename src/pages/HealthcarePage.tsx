import React, { useState, useEffect } from 'react';
import { locationService, UserCoordinates } from '../services/locationService';
import { Hospital, SymptomMatch } from '../types';
import {
  Search,
  MapPin,
  Navigation,
  Phone,
  Calendar,
  Star,
  Clock,
  AlertCircle,
  Stethoscope,
  Building2,
  CheckCircle,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { HospitalDetailModal } from '../components/modals/HospitalDetailModal';
import { BookAppointmentModal } from '../components/modals/BookAppointmentModal';

interface HealthcarePageProps {
  initialFilter?: string;
  onNavigate: (page: string) => void;
}

export const HealthcarePage: React.FC<HealthcarePageProps> = ({
  initialFilter,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilter || '');
  const [symptomResult, setSymptomResult] = useState<SymptomMatch | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'prompt' | 'loading' | 'granted' | 'denied'
  >('prompt');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState(
    initialFilter || 'All'
  );

  // Modals
  const [selectedHospitalForDetail, setSelectedHospitalForDetail] =
    useState<Hospital | null>(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] =
    useState<Hospital | null>(null);

  // Auto-request location on mount
  useEffect(() => {
    requestDeviceLocation();
  }, []);

  // Symptom search analysis whenever searchQuery changes
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const match = locationService.analyzeSymptom(searchQuery.trim());
      setSymptomResult(match);

      if (
        match &&
        match.recommendedDepartment !== 'General Medicine'
      ) {
        setSelectedDepartment(match.recommendedDepartment);
      }
    } else {
      setSymptomResult(null);
    }
  }, [searchQuery]);

  // Recalculate hospital distances whenever coordinates or department filter changes
  useEffect(() => {
    if (userCoords) {
      const loadNearbyHospitals = async () => {
        try {
          const filterDept =
            selectedDepartment === 'All'
              ? undefined
              : selectedDepartment;

          const list = await locationService.getNearbyHospitals(
            userCoords,
            filterDept
          );

          setHospitals(list);
        } catch (err: any) {
          console.error(
            'Failed to load nearby healthcare facilities:',
            err
          );
          setHospitals([]);
        }
      };

      loadNearbyHospitals();
    }
  }, [userCoords, selectedDepartment]);

  const requestDeviceLocation = async () => {
    setLocationStatus('loading');
    setLocationErrorMsg('');

    try {
      const coords = await locationService.getCurrentLocation();

      setUserCoords(coords);
      setLocationStatus('granted');

      const filterDept =
        selectedDepartment === 'All'
          ? undefined
          : selectedDepartment;

      const list = await locationService.getNearbyHospitals(
        coords,
        filterDept
      );

      setHospitals(list);
    } catch (err: any) {
      setLocationStatus('denied');
      setLocationErrorMsg(
        err?.message ||
          'Location access is required to find healthcare services near you.'
      );
      setHospitals([]);
    }
  };

  const departmentsList = [
    'All',
    'Orthopedics',
    'Cardiology',
    'Emergency & Critical Care',
    'Gastroenterology',
    'Dermatology',
    'ENT & Pulmonology',
    'Neurology',
    'General Medicine'
  ];

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}
        >
          <span className="badge badge-emerald">
            Live Geolocation Engine
          </span>
          <span className="badge badge-cyan">
            Haversine Calculated
          </span>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>
          Find Healthcare Services Near You
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}
        >
          Search symptoms, discover recommended medical departments,
          and connect with nearby specialists sorted nearest first.
        </p>
      </div>

      {/* Geolocation Status Bar */}
      {locationStatus === 'loading' && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <RefreshCw size={18} color="#38bdf8" />

          <span
            style={{
              fontSize: '13px',
              color: '#7dd3fc'
            }}
          >
            Detecting your device's actual GPS coordinates...
          </span>
        </div>
      )}

      {locationStatus === 'denied' && (
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle
              size={20}
              color="#ef4444"
              style={{ flexShrink: 0 }}
            />

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#fca5a5'
                }}
              >
                Location access is required to find healthcare services near you.
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}
              >
                {locationErrorMsg}
              </div>
            </div>
          </div>

          <button
            onClick={requestDeviceLocation}
            className="btn btn-primary btn-sm"
          >
            <MapPin size={14} />
            Enable Location
          </button>
        </div>
      )}

      {locationStatus === 'granted' && userCoords && (
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#34d399'
            }}
          >
            <CheckCircle size={16} />

            <span>
              Using actual device location:{' '}
              <strong>
                {userCoords.latitude.toFixed(4)}° N,{' '}
                {userCoords.longitude.toFixed(4)}° E
              </strong>{' '}
              (Sorted: Nearest → Farthest)
            </span>
          </div>

          <button
            onClick={requestDeviceLocation}
            className="btn btn-ghost btn-sm"
            style={{
              color: '#10b981',
              gap: '4px'
            }}
          >
            <RefreshCw size={13} />
            Refresh GPS
          </button>
        </div>
      )}

      {/* SYMPTOM SEARCH BAR */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <label
          className="form-label"
          style={{
            marginBottom: '8px',
            display: 'block'
          }}
        >
          Search by Symptom or Condition (e.g. "Bone Pain", "Chest Pain", "Skin Rash", "Acid Reflux")
        </label>

        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '40px',
                fontSize: '15px'
              }}
              placeholder="Type symptom e.g. Bone pain in knee, persistent cough..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>

        {/* EDUCATIONAL DEPARTMENT RECOMMENDATION BOX (NEVER DIAGNOSING) */}
        {symptomResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              display: 'flex',
              gap: '12px'
            }}
          >
            <Sparkles
              size={22}
              color="#10b981"
              style={{
                flexShrink: 0,
                marginTop: '2px'
              }}
            />

            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '2px'
                }}
              >
                Recommended Department for symptom:{' '}
                <strong>
                  "{symptomResult.query}"
                </strong>
              </div>

              <div
                style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#10b981',
                  marginBottom: '4px'
                }}
              >
                Recommended Department:{' '}
                {symptomResult.recommendedDepartment}
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}
              >
                "{symptomResult.explanation}"
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}
              >
                ⚠️ {symptomResult.disclaimer}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEPARTMENT FILTER PILLS */}
      <div
        style={{
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '6px'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            minWidth: 'max-content'
          }}
        >
          {departmentsList.map(dept => {
            const isSelected =
              selectedDepartment === dept;

            return (
              <button
                key={dept}
                onClick={() =>
                  setSelectedDepartment(dept)
                }
                className={`btn ${
                  isSelected
                    ? 'btn-primary'
                    : 'btn-secondary'
                } btn-sm`}
                style={{
                  borderRadius: '20px'
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS LIST: NEAREST → FARTHEST */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--text-secondary)'
            }}
          >
            Showing {hospitals.length} Healthcare Facilities
            (Sorted: Nearest to Farthest)
          </div>
        </div>

        {hospitals.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <Building2
              size={36}
              color="var(--text-muted)"
              style={{
                margin: '0 auto 12px auto'
              }}
            />

            <h3
              style={{
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              No facilities found for this filter
            </h3>

            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                marginBottom: '16px'
              }}
            >
              Try selecting "All" departments or adjusting your symptom query.
            </p>

            <button
              onClick={() =>
                setSelectedDepartment('All')
              }
              className="btn btn-secondary btn-sm"
            >
              Show All Facilities
            </button>
          </div>
        ) : (
          <div className="grid-cards-2">
            {hospitals.map(hosp => (
              <div
                key={hosp.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px'
                        }}
                      >
                        <span className="badge badge-emerald">
                          {hosp.department}
                        </span>

                        {hosp.emergencyAvailable && (
                          <span className="badge badge-rose">
                            24/7 Emergency
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: '700',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {hosp.name}
                      </h3>

                      <div
                        style={{
                          fontSize: '13px',
                          color: '#10b981',
                          fontWeight: '600',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Stethoscope size={14} />
                        {hosp.doctor}
                      </div>
                    </div>

                    {/* Distance Badge (Haversine calculated) */}
                    <div
                      style={{
                        textAlign: 'right',
                        flexShrink: 0
                      }}
                    >
                      {hosp.distance !== undefined && (
                        <div
                          className="badge badge-cyan"
                          style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                          }}
                        >
                          <MapPin size={12} />
                          {hosp.distance} km
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginTop: '4px'
                        }}
                      >
                        Nearest first
                      </div>
                    </div>
                  </div>

                  {/* Specialty & Timing */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px'
                    }}
                  >
                    Specialty: {hosp.specialty}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <Clock
                        size={13}
                        color="var(--cyan)"
                      />

                      <span>{hosp.timing}</span>
                    </div>

                    {/* Rating + Reviews: only display when real review data exists */}
                    {hosp.reviewCount !== undefined && hosp.reviewCount > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#fbbf24',
                          fontWeight: '700'
                        }}
                      >
                        <Star size={13} fill="#fbbf24" color="#fbbf24" />
                        <span>{Number(hosp.rating || 0).toFixed(1)}</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                          ({hosp.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Consultation Fee */}
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#10b981'
                      }}
                    >
                      ₹
                      {Number(
                        hosp.consultationFee || 0
                      ).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(4, 1fr)',
                    gap: '6px'
                  }}
                >
                  <button
                    onClick={() =>
                      setSelectedHospitalForDetail(hosp)
                    }
                    className="btn btn-secondary btn-sm"
                    title="View facility details"
                    style={{
                      padding: '6px 4px',
                      fontSize: '12px'
                    }}
                  >
                    <Eye size={13} />
                    View
                  </button>

                  <a
                    href={`tel:${hosp.phone}`}
                    className="btn btn-secondary btn-sm"
                    title="Call clinic"
                    style={{
                      textDecoration: 'none',
                      padding: '6px 4px',
                      fontSize: '12px',
                      justifyContent: 'center'
                    }}
                  >
                    <Phone size={13} />
                    Call
                  </a>

                  <a
                    href={locationService.getDirectionsUrl(
                      hosp
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Open Google Maps directions with exact lat/lng"
                    style={{
                      textDecoration: 'none',
                      padding: '6px 4px',
                      fontSize: '12px',
                      justifyContent: 'center'
                    }}
                  >
                    <Navigation size={13} />
                    Map
                  </a>

                  <button
                    onClick={() =>
                      setSelectedHospitalForBooking(hosp)
                    }
                    className="btn btn-primary btn-sm"
                    title="Book consultation"
                    style={{
                      padding: '6px 4px',
                      fontSize: '12px'
                    }}
                  >
                    <Calendar size={13} />
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedHospitalForDetail && (
        <HospitalDetailModal
          hospital={selectedHospitalForDetail}
          onClose={() =>
            setSelectedHospitalForDetail(null)
          }
          onBookAppointment={(h: Hospital) =>
            setSelectedHospitalForBooking(h)
          }
        />
      )}

      {selectedHospitalForBooking && (
        <BookAppointmentModal
          hospital={selectedHospitalForBooking}
          initialDepartment={
            selectedHospitalForBooking.department
          }
          onClose={() =>
            setSelectedHospitalForBooking(null)
          }
          onSuccess={() => {
            setSelectedHospitalForBooking(null);
            onNavigate('appointments');
          }}
        />
      )}
    </div>
  );
};