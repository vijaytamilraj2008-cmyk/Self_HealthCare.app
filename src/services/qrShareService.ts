import { ShareTokenData, User } from '../types';
import { documentService } from './documentService';
import { appointmentService } from './appointmentService';
import { api } from './api';

interface ShareApiResponse {
  token: string;
  snapshotJson: string;
  createdAt: number;
  expiresAt: number;
  status: 'valid' | 'expired';
}

class QrShareService {
  async generateShareToken(user: User): Promise<{ token: string; shareUrl: string; expiresAt: number }> {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const token = `ahs_${Date.now()}_${randomSuffix}`;
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;

    const appointments = await appointmentService.getAppointments();
    const documents = await documentService.getDocuments();

    const shareData: ShareTokenData = {
      token,
      userId: user.id,
      userName: user.username,
      userAge: user.age,
      userGender: user.gender,
      userBloodGroup: user.bloodGroup,
      userAllergies: user.allergies,
      userConditions: user.existingConditions,
      userMedications: user.currentMedications,
      emergencyContact: { name: user.emergencyContactName, phone: user.emergencyContactNumber },
      appointments: appointments.slice(0, 3).map(a => ({
        hospitalName: a.hospitalName, doctorName: a.doctorName, department: a.department,
        date: a.date, time: a.time, purpose: a.purpose
      })),
      documents: documents.slice(0, 3).map(d => ({
        title: d.fileName, documentType: d.documentType, date: d.uploadDate, summary: d.simpleSummary,
        findings: d.importantFindings, attentionLevel: d.attentionLevel, medicines: d.medicinesDetected
      })),
      createdAt: now,
      expiresAt
    };

    await api.post<ShareApiResponse>('/share', {
      token,
      snapshotJson: JSON.stringify(shareData),
      expiresAt
    });

    // Use a path-based public URL instead of a hash fragment. Mobile QR scanners and
    // external browsers handle normal paths more reliably than hash-only routes.
    // For local development, set VITE_PUBLIC_APP_URL to the laptop's LAN address
    // (for example http://10.112.57.79:5173) so another device can actually reach it.
    const configuredBaseUrl = (import.meta.env.VITE_PUBLIC_APP_URL || '').trim();
    const fallbackBaseUrl = window.location.origin;
    const baseUrl = (configuredBaseUrl || fallbackBaseUrl).replace(/\/$/, '');
    const shareUrl = `${baseUrl}/share/${encodeURIComponent(token)}`;
    return { token, shareUrl, expiresAt };
  }

  async validateToken(token: string): Promise<{ status: 'valid' | 'expired' | 'invalid'; data?: ShareTokenData; message?: string }> {
    if (!token || token.trim() === '') {
      return { status: 'invalid', message: 'This sharing link is invalid or no longer available.' };
    }
    try {
      const response = await api.get<ShareApiResponse>(`/share/${encodeURIComponent(token.trim())}`);
      if (response.data.status === 'expired') {
        return { status: 'expired', message: 'This healthcare sharing link has expired.' };
      }
      const data = JSON.parse(response.data.snapshotJson) as ShareTokenData;
      return { status: 'valid', data };
    } catch (error: any) {
      const message = error?.message || 'This sharing link is invalid or no longer available.';
      return { status: 'invalid', message };
    }
  }
}

export const qrShareService = new QrShareService();
