'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastProvider, ToastViewport, Toast, ToastProps } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (options: Omit<ToastProps, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((options: Omit<ToastProps, 'id'>) => {
    const id = Date.now().toString();
    const toast: ToastProps = {
      ...options,
      id,
      onClose: () => removeToast(id)
    };
    setToasts(prev => [...prev, toast]);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({ type: 'success', title, description });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({ type: 'error', title, description });
  }, [showToast]);

  const showWarning = useCallback((title: string, description?: string) => {
    showToast({ type: 'warning', title, description });
  }, [showToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({ type: 'info', title, description });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      <ToastProvider swipeDirection="right">
        {children}
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
        <ToastViewport className="fixed bottom-0 right-0 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }
  return context;
};
