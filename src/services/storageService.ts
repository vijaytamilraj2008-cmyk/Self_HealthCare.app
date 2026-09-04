import { A11ySettings } from '../types';

const A11Y_KEY = 'ahs_a11y_v1';

class StorageService {
  getA11ySettings(): A11ySettings {
    try {
      const data = typeof localStorage !== 'undefined' ? localStorage.getItem(A11Y_KEY) : null;
      return data ? JSON.parse(data) : { fontSize: 'md', highContrast: false, reduceAnimations: false };
    } catch {
      return { fontSize: 'md', highContrast: false, reduceAnimations: false };
    }
  }

  saveA11ySettings(settings: A11ySettings): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
      }
    } catch (error) {
      console.warn('Unable to save accessibility preferences locally.', error);
    }
  }
}

export const storageService = new StorageService();
