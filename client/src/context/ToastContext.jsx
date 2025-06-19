import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef({});

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(id => clearTimeout(id));
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Clear the timeout for this toast if it exists
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    
    // Create the toast object
    const toast = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now()
    };
    
    // Add to state
    setToasts(prev => [...prev, toast]);
    
    // Set auto-dismiss timeout
    if (duration > 0) {
      timeoutsRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [removeToast]);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
    Object.values(timeoutsRef.current).forEach(id => clearTimeout(id));
    timeoutsRef.current = {};
  }, []);

  const showSuccess = useCallback((message, duration) => addToast('success', message, duration), [addToast]);
  const showError = useCallback((message, duration) => addToast('error', message, duration), [addToast]);
  const showWarning = useCallback((message, duration) => addToast('warning', message, duration), [addToast]);
  const showInfo = useCallback((message, duration) => addToast('info', message, duration), [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
    </ToastContext.Provider>
  );
};