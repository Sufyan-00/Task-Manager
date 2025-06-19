import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import './Toast.css';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  // Handle auto-dismiss and progress bar
  useEffect(() => {
    setVisible(true);
    
    if (toast.duration > 0) {
      // Handle progress bar animation
      const startTime = Date.now();
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
        setProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(intervalId);
          // Start dismissal animation
          setVisible(false);
          setTimeout(() => removeToast(toast.id), 300);
        }
      }, 50);

      return () => clearInterval(intervalId);
    }
  }, [toast.id, toast.duration, removeToast]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={`toast toast-${toast.type} ${visible ? 'toast-visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      {toast.duration > 0 && (
        <div className="toast-timer">
          <div className="toast-timer-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="toast-content">
        <div className="toast-icon">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✕'}
          {toast.type === 'warning' && '⚠'}
          {toast.type === 'info' && 'ℹ'}
        </div>
        <div className="toast-message">{toast.message}</div>
        <button
          className="toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();
  
  if (!toasts.length) return null;
  
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;