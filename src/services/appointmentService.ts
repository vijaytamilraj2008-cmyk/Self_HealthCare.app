import { Appointment } from '../types';
import { api } from './api';

export interface CreateAppointmentPayload {
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  purpose: string;
  notes?: string;
  fee?: number;
}

export interface UpdateAppointmentPayload extends CreateAppointmentPayload {}

class AppointmentService {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  }

  async createAppointment(payload: CreateAppointmentPayload): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      this.validate(payload);
      const response = await api.post<Appointment>('/appointments', {
        ...payload,
        fee: payload.fee ?? 800
      });
      return { success: true, appointment: response.data };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to schedule appointment.' };
    }
  }

  async updateAppointment(appointment: Appointment): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      this.validate(appointment);
      const response = await api.put<Appointment>(`/appointments/${appointment.id}`, {
        hospitalId: appointment.hospitalId,
        hospitalName: appointment.hospitalName,
        doctorName: appointment.doctorName,
        department: appointment.department,
        date: appointment.date,
        time: appointment.time,
        purpose: appointment.purpose,
        notes: appointment.notes || '',
        fee: appointment.fee
      });
      return { success: true, appointment: response.data };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to update appointment.' };
    }
  }

  async cancelAppointment(id: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      const response = await api.patch<Appointment>(`/appointments/${id}/cancel`);
      return { success: true, appointment: response.data };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Failed to cancel appointment.' };
    }
  }

  private validate(payload: CreateAppointmentPayload | Appointment) {
    if (!payload.hospitalName?.trim()) throw new Error('Hospital name is required.');
    if (!payload.doctorName?.trim()) throw new Error('Doctor name is required.');
    if (!payload.department?.trim()) throw new Error('Department is required.');
    if (!payload.date) throw new Error('Appointment date is required.');
    if (!payload.time?.trim()) throw new Error('Appointment time slot is required.');
    if (!payload.purpose?.trim()) throw new Error('Appointment purpose is required.');
  }
}

export const appointmentService = new AppointmentService();
