'use client';

import { useState, useEffect, useCallback } from 'react';
import { ViewMode } from '@/components/logs/PipelineLogs/components/ViewToggle';

export interface UserPreferences {
  // View preferences
  defaultView: ViewMode;
  autoScroll: boolean;
  showAnalytics: boolean;
  expandedGroups: boolean;
  
  // Notification preferences
  notificationSound: boolean;
  toastDuration: number;
  showSuccessToasts: boolean;
  showFailureToasts: boolean;
  showInfoToasts: boolean;
  
  // Display preferences
  colorTheme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showRelativeTime: boolean;
  showBuildNumbers: boolean;
  
  // Filter preferences
  defaultFilters: {
    showErrors: boolean;
    showWarnings: boolean;
    showInfo: boolean;
    showDebug: boolean;
  };
  
  // Performance preferences
  logRetention: '1h' | '24h' | '7d' | '30d';
  maxLogsInView: number;
  enableVirtualScrolling: boolean;
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean;
  customShortcuts: {
    search: string;
    refresh: string;
    toggleLive: string;
    toggleView: string;
    escape: string;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // View preferences
  defaultView: 'cards',
  autoScroll: true,
  showAnalytics: false,
  expandedGroups: true,
  
  // Notification preferences
  notificationSound: false,
  toastDuration: 5000,
  showSuccessToasts: true,
  showFailureToasts: true,
  showInfoToasts: true,
  
  // Display preferences
  colorTheme: 'auto',
  compactMode: false,
  showRelativeTime: true,
  showBuildNumbers: true,
  
  // Filter preferences
  defaultFilters: {
    showErrors: true,
    showWarnings: true,
    showInfo: true,
    showDebug: false,
  },
  
  // Performance preferences
  logRetention: '24h',
  maxLogsInView: 100,
  enableVirtualScrolling: true,
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: true,
  customShortcuts: {
    search: '/',
    refresh: 'r',
    toggleLive: 'l',
    toggleView: 'v',
    escape: 'Escape',
  },
};

export const useUserPreferences = (userId?: string) => {
  const storageKey = `pipelineLogs:preferences:${userId || 'default'}`;
  
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    
    return DEFAULT_PREFERENCES;
  });

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(newPreferences));
      }
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, [storageKey]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferencesState(prev => {
      const newPreferences = { ...prev, ...updates };
      savePreferences(newPreferences);
      return newPreferences;
    });
  }, [savePreferences]);

  // Update nested preferences
  const updateNestedPreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    updates: Partial<UserPreferences[K]>
  ) => {
    setPreferencesState(prev => {
      const newPreferences = {
        ...prev,
        [key]: { ...prev[key] as any, ...updates }
      };
      savePreferences(newPreferences);
      return newPreferences;
    });
  }, [savePreferences]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  // Export preferences
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pipeline-logs-preferences-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [preferences]);

  // Import preferences
  const importPreferences = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const merged = { ...DEFAULT_PREFERENCES, ...imported };
        setPreferencesState(merged);
        savePreferences(merged);
      } catch (error) {
        console.error('Failed to import preferences:', error);
      }
    };
    reader.readAsText(file);
  }, [savePreferences]);

  // Apply theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const applyTheme = () => {
      const root = document.documentElement;
      let theme = preferences.colorTheme;
      
      if (theme === 'auto') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.classList.toggle('dark', theme === 'dark');
    };
    
    applyTheme();
    
    if (preferences.colorTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [preferences.colorTheme]);

  return {
    preferences,
    updatePreferences,
    updateNestedPreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };
};