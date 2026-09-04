import React, { createContext, useContext, useState, useEffect } from 'react';
import { FontSizeOption, A11ySettings } from '../types';
import { storageService } from '../services/storageService';

interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reduceAnimations: boolean;
  setReduceAnimations: (val: boolean) => void;
  isA11yModalOpen: boolean;
  setA11yModalOpen: (open: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSettings = storageService.getA11ySettings();
  const [fontSize, setFontSizeState] = useState<FontSizeOption>(initialSettings.fontSize || 'md');
  const [highContrast, setHighContrastState] = useState<boolean>(initialSettings.highContrast || false);
  const [reduceAnimations, setReduceAnimationsState] = useState<boolean>(initialSettings.reduceAnimations || false);
  const [isA11yModalOpen, setA11yModalOpen] = useState<boolean>(false);

  // Sync to HTML root element classes
  useEffect(() => {
    const root = document.documentElement;

    // Font size class
    root.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    root.classList.add(`font-${fontSize}`);

    // High Contrast class
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced Motion class
    if (reduceAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Persist
    const settings: A11ySettings = { fontSize, highContrast, reduceAnimations };
    storageService.saveA11ySettings(settings);
  }, [fontSize, highContrast, reduceAnimations]);

  const setFontSize = (size: FontSizeOption) => setFontSizeState(size);
  const setHighContrast = (val: boolean) => setHighContrastState(val);
  const setReduceAnimations = (val: boolean) => setReduceAnimationsState(val);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        reduceAnimations,
        setReduceAnimations,
        isA11yModalOpen,
        setA11yModalOpen
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
