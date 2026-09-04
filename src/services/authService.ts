import { User } from '../types';
import { timelineService } from './timelineService';
import { api, TOKEN_STORAGE_KEY } from './api';

export interface RegisterPayload {
  mobile: string;
  username: string;
  password: string;
  confirmPassword: string;
  location: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  existingConditions?: string;
  currentMedications?: string;
}

export interface LoginPayload {
  mobile: string;
  password: string;
}

export interface ForgotPasswordPayload {
  mobile: string;
  emergencyContactNumber: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface AuthApiResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

class AuthService {
  private currentUser: User | null = null;
  /**
   * Register with Spring Boot backend (persisted to MySQL)
   */
  async register(payload: RegisterPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 1. Client-side sanity checks
      if (!payload.mobile?.trim()) return { success: false, error: 'Mobile number is required.' };
      if (!payload.username?.trim()) return { success: false, error: 'Username is required.' };
      if (!payload.password) return { success: false, error: 'Password is required.' };
      if (!payload.confirmPassword) return { success: false, error: 'Confirm password is required.' };
      if (payload.password.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };
      if (payload.password !== payload.confirmPassword) return { success: false, error: 'Passwords do not match.' };
      if (!payload.location?.trim()) return { success: false, error: 'Location is required.' };
      if (!payload.emergencyContactName?.trim()) return { success: false, error: 'Emergency contact name is required.' };
      if (!payload.emergencyContactNumber?.trim()) return { success: false, error: 'Emergency contact number is required.' };

      const cleanMobile = payload.mobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
      }

      // 2. Call Spring Boot backend
      const response = await api.post<AuthApiResponse>('/auth/register', {
        ...payload,
        mobile: cleanMobile,
        age: payload.age ? Number(payload.age) : undefined
      });

      const data = response.data;
      if (data.token && data.user) {
        // Save JWT token in localStorage for multi-device session persistence
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        }

        this.currentUser = data.user;

        timelineService.addEvent({
          id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: data.user.id,
          title: 'Healthcare Profile Created',
          description: `Welcome ${data.user.username}! Your personal command center is ready.`,
          category: 'profile',
          timestamp: new Date().toISOString(),
          badgeText: 'Account'
        }).catch(error => console.warn('Could not record profile timeline event:', error));

        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Please check your details.' };
    }
  }

  /**
   * Login using Mobile Number + Password against Spring Boot backend
   */
  async login(payload: LoginPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!payload.mobile?.trim()) return { success: false, error: 'Mobile number is required.' };
      if (!payload.password) return { success: false, error: 'Password is required.' };

      const cleanMobile = payload.mobile.replace(/\D/g, '');

      const response = await api.post<AuthApiResponse>('/auth/login', {
        mobile: cleanMobile,
        password: payload.password
      });

      const data = response.data;
      if (data.token && data.user) {
        // Save JWT token
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        }

        // Cache session user
        this.currentUser = data.user;

        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
    }
  }

  /**
   * Secure Forgot Password without OTP:
   * Verifies account mobile + associated emergency contact number on Spring Boot backend.
   */
  async resetPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; error?: string }> {
    try {
      if (!payload.mobile?.trim()) return { success: false, error: 'Mobile number is required.' };
      if (!payload.emergencyContactNumber?.trim()) return { success: false, error: 'Emergency contact number is required for verification.' };
      if (!payload.newPassword) return { success: false, error: 'New password is required.' };
      if (payload.newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };
      if (payload.newPassword !== payload.confirmNewPassword) return { success: false, error: 'New passwords do not match.' };

      const cleanMobile = payload.mobile.replace(/\D/g, '');
      const cleanEmergency = payload.emergencyContactNumber.replace(/\D/g, '');

      await api.post('/auth/reset-password', {
        mobile: cleanMobile,
        emergencyContactNumber: cleanEmergency,
        newPassword: payload.newPassword,
        confirmNewPassword: payload.confirmNewPassword
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed.' };
    }
  }

  /**
   * Fetch current authenticated user profile from backend using JWT
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (!token) {
        return null;
      }

      const response = await api.get<User>('/auth/me');
      if (response.data && response.data.id) {
        this.currentUser = response.data;
        return response.data;
      }
      return null;
    } catch (err) {
      // If token is invalid or expired, clear local session
      this.logout();
      return null;
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    this.currentUser = null;
  }

  /**
   * Get synchronously cached user from storage
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Update profile on Spring Boot backend & persist to MySQL
   */
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    try {
      const response = await api.put<User>('/auth/profile', updates);
      const updated = response.data;

      if (updated) {
        this.currentUser = updated;

        timelineService.addEvent({
          id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: updated.id,
          title: 'Health Profile Updated',
          description: 'Your clinical snapshot and emergency contact information were updated.',
          category: 'profile',
          timestamp: new Date().toISOString(),
          badgeText: 'Profile'
        }).catch(error => console.warn('Could not record profile timeline event:', error));

        return updated;
      }
      return null;
    } catch (err) {
      console.error('Failed to update profile on backend', err);
      throw err;
    }
  }
}

export const authService = new AuthService();
