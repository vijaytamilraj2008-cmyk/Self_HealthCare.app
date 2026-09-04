import { Hospital, SymptomMatch } from '../types';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Haversine Formula to calculate geographic distance in Kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return Number(distance.toFixed(1));
}

// Symptom Dictionary with Safe Educational Recommendations
const SYMPTOM_DATABASE: {
  [key: string]: {
    dept: string;
    explanation: string;
  };
} = {
  bone: {
    dept: 'Orthopedics',
    explanation:
      'Orthopedics may be an appropriate department for this type of symptom involving bones, joints, or musculoskeletal discomfort.'
  },

  joint: {
    dept: 'Orthopedics',
    explanation:
      'Orthopedics may be an appropriate department for this type of symptom involving joints and movement pain.'
  },

  knee: {
    dept: 'Orthopedics',
    explanation:
      'Orthopedics may be an appropriate department for this type of symptom involving knee stability or discomfort.'
  },

  fracture: {
    dept: 'Orthopedics & Trauma',
    explanation:
      'Orthopedics & Trauma may be an appropriate department for suspected bone trauma or severe pain.'
  },

  'back pain': {
    dept: 'Orthopedics / Spine Care',
    explanation:
      'Orthopedics / Spine Care may be an appropriate department for persistent spinal or lumbar discomfort.'
  },

  chest: {
    dept: 'Cardiology',
    explanation:
      'Cardiology may be an appropriate department for cardiovascular evaluation. For acute pressure, call emergency services immediately.'
  },

  heart: {
    dept: 'Cardiology',
    explanation:
      'Cardiology may be an appropriate department for cardiac rhythm or circulation concerns.'
  },

  skin: {
    dept: 'Dermatology',
    explanation:
      'Dermatology may be an appropriate department for rashes, lesions, or epidermal symptoms.'
  },

  rash: {
    dept: 'Dermatology',
    explanation:
      'Dermatology may be an appropriate department for allergic dermatological reactions or skin irritation.'
  },

  eye: {
    dept: 'Ophthalmology',
    explanation:
      'Ophthalmology may be an appropriate department for vision changes, irritation, or ocular discomfort.'
  },

  vision: {
    dept: 'Ophthalmology',
    explanation:
      'Ophthalmology may be an appropriate department for visual acuity testing and eye health.'
  },

  stomach: {
    dept: 'Gastroenterology',
    explanation:
      'Gastroenterology may be an appropriate department for abdominal pain, indigestion, or gastrointestinal issues.'
  },

  digest: {
    dept: 'Gastroenterology',
    explanation:
      'Gastroenterology may be an appropriate department for persistent digestive or gastric concerns.'
  },

  acid: {
    dept: 'Gastroenterology',
    explanation:
      'Gastroenterology may be an appropriate department for acid reflux or upper GI discomfort.'
  },

  cough: {
    dept: 'Pulmonology',
    explanation:
      'Pulmonology may be an appropriate department for respiratory symptoms or chronic coughing.'
  },

  breath: {
    dept: 'Pulmonology',
    explanation:
      'Pulmonology may be an appropriate department for airway management and shortness of breath.'
  },

  headache: {
    dept: 'Neurology / General Medicine',
    explanation:
      'Neurology or General Medicine may be an appropriate department for recurring headaches or neurological signs.'
  },

  ear: {
    dept: 'ENT (Otolaryngology)',
    explanation:
      'ENT may be an appropriate department for ear, nose, throat, or balance concerns.'
  },

  throat: {
    dept: 'ENT (Otolaryngology)',
    explanation:
      'ENT may be an appropriate department for throat pain, difficulty swallowing, or voice hoarseness.'
  },

  tooth: {
    dept: 'Dental / Maxillofacial',
    explanation:
      'Dental care may be an appropriate department for oral hygiene, tooth pain, or gum inflammation.'
  },

  fever: {
    dept: 'General Medicine',
    explanation:
      'General Medicine may be an appropriate department for systemic symptoms, fever, and general health review.'
  },

  child: {
    dept: 'Pediatrics',
    explanation:
      'Pediatrics may be an appropriate department for infants, children, and adolescent healthcare.'
  },

  pediatric: {
    dept: 'Pediatrics',
    explanation:
      'Pediatrics may be an appropriate department for specialized child wellness and developmental care.'
  }
};

class LocationService {
  // Cache nearby facilities for the current location.
  // This prevents another backend/Overpass request
  // whenever the user changes department filters.
  private nearbyFacilitiesCache: {
    latitude: number;
    longitude: number;
    facilities: Hospital[];
  } | null = null;

  async getCurrentLocation(): Promise<UserCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            'Geolocation is not supported by your browser.'
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },

        error => {
          let message =
            'Location access is required to find healthcare services near you.';

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            message =
              'Location access is required to find healthcare services near you. Please enable location permission in your browser.';
          } else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            message =
              'Current location is unavailable. Please check your network or device GPS.';
          } else if (
            error.code === error.TIMEOUT
          ) {
            message =
              'Location request timed out. Please try again.';
          }

          reject(new Error(message));
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  analyzeSymptom(
    query: string
  ): SymptomMatch | null {
    if (!query || query.trim().length < 2) {
      return null;
    }

    const lower = query.toLowerCase();

    for (const [
      symptomKey,
      data
    ] of Object.entries(SYMPTOM_DATABASE)) {
      if (lower.includes(symptomKey)) {
        return {
          query,
          recommendedDepartment: data.dept,
          explanation: data.explanation,
          disclaimer:
            'This recommendation is educational and does not constitute a medical diagnosis. Please consult a qualified doctor.'
        };
      }
    }

    return {
      query,
      recommendedDepartment:
        'General Medicine',
      explanation:
        'General Medicine may be an appropriate starting department for broad clinical evaluation of these symptoms.',
      disclaimer:
        'This recommendation is educational and does not constitute a medical diagnosis. Please consult a qualified doctor.'
    };
  }

  private getFacilityCoordinates(
    element: any
  ): {
    latitude: number;
    longitude: number;
  } | null {
    if (
      typeof element.lat === 'number' &&
      typeof element.lon === 'number'
    ) {
      return {
        latitude: element.lat,
        longitude: element.lon
      };
    }

    if (
      element.center &&
      typeof element.center.lat === 'number' &&
      typeof element.center.lon === 'number'
    ) {
      return {
        latitude: element.center.lat,
        longitude: element.center.lon
      };
    }

    return null;
  }

  private getDepartment(
    tags: Record<string, string> = {}
  ): string {
    const speciality = (
      tags['healthcare:speciality'] ||
      tags['healthcare:specialty'] ||
      ''
    ).toLowerCase();

    const name = (
      tags.name || ''
    ).toLowerCase();

    const combined =
      `${speciality} ${name}`;

    if (
      combined.includes('orthop') ||
      combined.includes('bone') ||
      combined.includes('joint') ||
      combined.includes('trauma')
    ) {
      return 'Orthopedics';
    }

    if (
      combined.includes('cardio') ||
      combined.includes('heart')
    ) {
      return 'Cardiology';
    }

    if (
      combined.includes('dermat') ||
      combined.includes('skin')
    ) {
      return 'Dermatology';
    }

    if (
      combined.includes('ophthalm') ||
      combined.includes('eye')
    ) {
      return 'Ophthalmology';
    }

    if (
      combined.includes('gastro') ||
      combined.includes('digest')
    ) {
      return 'Gastroenterology';
    }

    if (
      combined.includes('pulmon') ||
      combined.includes('respirat') ||
      combined.includes('lung')
    ) {
      return 'Pulmonology';
    }

    if (
      combined.includes('neurolog') ||
      combined.includes('brain') ||
      combined.includes('spine')
    ) {
      return 'Neurology';
    }

    if (
      combined.includes('ent') ||
      combined.includes('ear') ||
      combined.includes('throat')
    ) {
      return 'ENT';
    }

    if (
      combined.includes('dent') ||
      tags.amenity === 'dentist'
    ) {
      return 'Dental';
    }

    if (
      combined.includes('pediatric') ||
      combined.includes('paediatric') ||
      combined.includes('child')
    ) {
      return 'Pediatrics';
    }

    if (
      tags.amenity === 'hospital'
    ) {
      return 'General Medicine';
    }

    if (
      tags.amenity === 'clinic' ||
      tags.amenity === 'doctors'
    ) {
      return 'General Medicine';
    }

    return 'General Medicine';
  }

  private getSpecialty(
    tags: Record<string, string> = {}
  ): string {
    return (
      tags['healthcare:speciality'] ||
      tags['healthcare:specialty'] ||
      tags.healthcare ||
      tags.amenity ||
      'General Healthcare'
    );
  }

  private getAddress(
    tags: Record<string, string> = {}
  ): string {
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean);

    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }

    return 'Address not available';
  }

  private getPhone(
    tags: Record<string, string> = {}
  ): string {
    return (
      tags['contact:phone'] ||
      tags.phone ||
      'Phone not available'
    );
  }

  private getTiming(
    tags: Record<string, string> = {}
  ): string {
    return (
      tags.opening_hours ||
      'Opening hours not available'
    );
  }

  // Get rating from OpenStreetMap tags when available.
  // Otherwise use a clearly marked demo value.
  private getRating(
    tags: Record<string, string> = {}
  ): number {
    const possibleRating =
      tags.rating ||
      tags['review:rating'] ||
      tags.stars;

    const rating =
      Number(possibleRating);

    if (
      Number.isFinite(rating) &&
      rating >= 0 &&
      rating <= 5
    ) {
      return Number(
        rating.toFixed(1)
      );
    }

    return 4.2;
  }

  // Get review count from OpenStreetMap tags when available.
  private getReviewCount(
    tags: Record<string, string> = {}
  ): number {
    const possibleCount =
      tags['review:count'] ||
      tags['rating:count'] ||
      tags.reviews;

    const reviewCount =
      Number(possibleCount);

    if (
      Number.isFinite(reviewCount) &&
      reviewCount >= 0
    ) {
      return Math.round(reviewCount);
    }

    return 0;
  }

  // Get consultation fee from OpenStreetMap tags when available.
  // Otherwise use a clearly marked demo value.
  private getConsultationFee(
    tags: Record<string, string> = {}
  ): number {
    const possibleFee =
      tags['fee:amount'] ||
      tags['consultation:fee'] ||
      tags['healthcare:fee'];

    if (possibleFee) {
      const numericFee =
        Number(
          possibleFee.replace(
            /[^\d.]/g,
            ''
          )
        );

      if (
        Number.isFinite(numericFee) &&
        numericFee > 0
      ) {
        return Math.round(
          numericFee
        );
      }
    }

    return 500;
  }

  private filterAndSortFacilities(
    facilities: Hospital[],
    filterDepartment?: string
  ): Hospital[] {
    let result = facilities;

    if (
      filterDepartment &&
      filterDepartment.trim() !== ''
    ) {
      const term =
        filterDepartment
          .toLowerCase()
          .trim();

      result = facilities.filter(
        hospital =>
          hospital.department
            .toLowerCase()
            .includes(term) ||
          hospital.specialty
            .toLowerCase()
            .includes(term) ||
          hospital.name
            .toLowerCase()
            .includes(term)
      );
    }

    return [...result].sort(
      (a, b) =>
        (a.distance || 0) -
        (b.distance || 0)
    );
  }

  async getNearbyHospitals(
    userCoords: UserCoordinates,
    filterDepartment?: string
  ): Promise<Hospital[]> {
    // Use cached facilities when the location is the same.
    if (
      this.nearbyFacilitiesCache &&
      this.nearbyFacilitiesCache.latitude ===
      userCoords.latitude &&
      this.nearbyFacilitiesCache.longitude ===
      userCoords.longitude
    ) {
      return this.filterAndSortFacilities(
        this.nearbyFacilitiesCache.facilities,
        filterDepartment
      );
    }

    const radius = 10000;

    try {
      /*
       * IMPORTANT:
       * The browser must NOT call Overpass directly.
       *
       * Browser
       *   ↓
       * Render Spring Boot backend
       *   ↓
       * Overpass API
       *
       * This avoids the Overpass CORS problem.
       */

      const backendUrl =
        import.meta.env.VITE_API_BASE_URL ||
        'https://self-healthcare-backend.onrender.com/api';

      const url =
        `${backendUrl}/healthcare/nearby` +
        `?latitude=${encodeURIComponent(
          userCoords.latitude
        )}` +
        `&longitude=${encodeURIComponent(
          userCoords.longitude
        )}` +
        `&radius=${radius}`;

      console.log(
        'Loading nearby healthcare facilities from backend:',
        url
      );

      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Healthcare data request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      const facilities: Hospital[] = [];
      const seen = new Set<string>();

      for (
        const element of
        data.elements || []
      ) {
        const coordinates =
          this.getFacilityCoordinates(
            element
          );

        if (!coordinates) {
          continue;
        }

        const tags: Record<string, string> =
          element.tags || {};

        const name =
          tags.name?.trim();

        if (!name) {
          continue;
        }

        const uniqueKey =
          `${element.type}_${element.id}`;

        if (seen.has(uniqueKey)) {
          continue;
        }

        seen.add(uniqueKey);

        const distance =
          calculateHaversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            coordinates.latitude,
            coordinates.longitude
          );

        const department =
          this.getDepartment(tags);

        const specialty =
          this.getSpecialty(tags);

        const emergencyAvailable =
          tags.emergency === 'yes';

        facilities.push({
          id:
            `osm_${element.type}_${element.id}`,

          name,

          doctor:
            'Specialist details available at facility',

          department,

          specialty,

          latitude:
            coordinates.latitude,

          longitude:
            coordinates.longitude,

          distance,

          rating:
            this.getRating(tags),

          reviewCount:
            this.getReviewCount(tags),

          isDemoRating:
            !tags.rating &&
            !tags['review:rating'] &&
            !tags.stars,

          isDemoFee:
            !tags['fee:amount'] &&
            !tags['consultation:fee'] &&
            !tags['healthcare:fee'],

          consultationFee:
            this.getConsultationFee(tags),

          timing:
            this.getTiming(tags),

          emergencyAvailable,

          address:
            this.getAddress(tags),

          phone:
            this.getPhone(tags),

          availableSlots: []
        });
      }

      // Save real nearby facilities.
      // Department filters use this cached data.
      this.nearbyFacilitiesCache = {
        latitude:
          userCoords.latitude,

        longitude:
          userCoords.longitude,

        facilities
      };

      console.log(
        `Loaded ${facilities.length} nearby healthcare facilities.`
      );

      return this.filterAndSortFacilities(
        facilities,
        filterDepartment
      );
    } catch (error) {
      console.error(
        'Failed to load nearby healthcare facilities:',
        error
      );

      return [];
    }
  }

  async getEmergencyHospitals(
    userCoords: UserCoordinates
  ): Promise<Hospital[]> {
    const all =
      await this.getNearbyHospitals(
        userCoords
      );

    return all
      .filter(
        hospital =>
          hospital.emergencyAvailable
      )
      .sort(
        (a, b) =>
          (a.distance || 0) -
          (b.distance || 0)
      );
  }

  getDirectionsUrl(
    hospital: Hospital
  ): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
  }
}

export const locationService =
  new LocationService();