import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const TOKEN_STORAGE_KEY = 'ahs_auth_token_v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve auth token from localStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (!error.response) {
      // Backend is unavailable or CORS network error
      return Promise.reject(new Error('Unable to connect to backend server. Please ensure the Spring Boot backend is running on port 8080.'));
    }

    const serverMessage = error.response.data?.error || error.response.data?.message;
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage));
    }

    if (error.response.status === 401) {
      return Promise.reject(new Error('Invalid mobile number or password.'));
    }

    if (error.response.status === 403) {
      return Promise.reject(new Error('Access denied. Please log in again.'));
    }

    if (error.response.status === 404) {
      return Promise.reject(new Error('Requested resource was not found.'));
    }

    return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
  }
);
