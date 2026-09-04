export interface User {
  id: string;
  mobile: string;
  username: string;
  password?: string;
  location: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  existingConditions?: string;
  currentMedications?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  doctor: string;
  department: string;
  specialty: string;
  latitude: number;
  longitude: number;
  distance?: number; // in km
  rating: number;
  reviewCount?: number;
  isDemoRating?: boolean;
isDemoFee?: boolean;
  consultationFee: number; // in INR ₹
  timing: string;
  emergencyAvailable: boolean;
  address: string;
  phone: string;
  availableSlots: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  purpose: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  fee: number; // in INR ₹
  createdAt: string;
}

export interface DetectedMedicine {
  name: string;
  strength: string;
  instructions: string;
  duration: string;
  purpose: string;
  frequency?: string;
  route?: string;
}

export interface MedicalDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  documentType: string;
  doctorName?: string;
  hospitalName?: string;
  patientName?: string;
  simpleSummary: string;
  importantFindings: string[];
  medicalTerms: { term: string; explanation: string }[];
  medicinesDetected: DetectedMedicine[];
  explicitDiagnosis?: string;
  attentionLevel: 'routine' | 'discuss' | 'prompt';
  pageCount?: number;
  rawExtractedText?: string;
}

export interface TimelineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'appointment' | 'document' | 'prescription' | 'profile' | 'emergency';
  timestamp: string;
  badgeText?: string;
}

export interface ShareTokenData {
  token: string;
  userId: string;
  userName: string;
  userAge?: string | number;
  userGender?: string;
  userBloodGroup?: string;
  userAllergies?: string;
  userConditions?: string;
  userMedications?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  appointments: {
    hospitalName: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    purpose: string;
  }[];
  documents: {
    title: string;
    documentType: string;
    date: string;
    summary: string;
    findings: string[];
    attentionLevel: 'routine' | 'discuss' | 'prompt';
    medicines: DetectedMedicine[];
  }[];
  createdAt: number;
  expiresAt: number; // 24 hours from createdAt
}

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';

export interface A11ySettings {
  fontSize: FontSizeOption;
  highContrast: boolean;
  reduceAnimations: boolean;
}

export interface SymptomMatch {
  query: string;
  recommendedDepartment: string;
  explanation: string;
  disclaimer: string;
}
