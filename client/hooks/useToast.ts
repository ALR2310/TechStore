import { useContext } from 'react';
import { ToastContext, ToastProps } from '~/providers/ToastProvider';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

// Export Global Toast Function
let showToastFunction: ((toast: Omit<ToastProps, 'id'>, callback?: () => Promise<void>) => void) | null = null;

export const setToastFunction = (fn: typeof showToastFunction) => {
  showToastFunction = fn;
};

export const toast = (toast: Omit<ToastProps, 'id'>, callback?: () => Promise<void>) => {
  if (showToastFunction) {
    showToastFunction(toast, callback);
  } else {
    console.warn('showToast is not initialized yet.');
  }
};
