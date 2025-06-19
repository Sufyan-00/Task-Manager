import React, { createContext, useState, useEffect, useContext } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // Check if token is expired
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (Date.now() >= payload.exp * 1000) {
              throw new Error('Token expired');
            }
            
            // Set user data
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            // Set auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token with server
            await api.get('/auth/getProfile');
          } catch (error) {
            console.log('Token validation failed:', error.message);
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        const userData = localStorage.getItem('user');
        
        if (newToken && userData) {
          // User logged in from another tab
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
          }
        } else {
          // User logged out from another tab
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Periodic token validation
  useEffect(() => {
    let intervalId;
    
    if (user) {
      intervalId = setInterval(async () => {
        try {
          await api.get('/auth/getProfile');
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }, 5 * 60 * 1000); // Check every 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  // Check auth when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user) {
        try {
          await api.get('/auth/getProfile');
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post('/auth/login', credentials);
      
      if (data.success && data.token && data.user) {
        // Store in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update state
        setUser(data.user);
        
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message); // --- Show error toast ---
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post('/auth/register', userData);
      
      if (data.success && data.token && data.user) {
        // Store in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update state
        setUser(data.user);
        
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message ='Registration failed. Please try again.';
      setError(message);
      toast.error(message); // --- Show error toast ---
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token'); // Clear both to be safe
    sessionStorage.removeItem('user');
    
    // Clear auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear state
    setUser(null);
    setError(null);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      oldValue: 'some-token',
      newValue: null,
      url: window.location.href
    }));
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };