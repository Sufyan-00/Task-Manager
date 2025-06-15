import React, { createContext, useReducer, useEffect } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Verify token isn't expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() >= payload.exp * 1000) {
          sessionStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        // Fetch user profile
        await fetchUserProfile();
      } catch (error) {
        sessionStorage.removeItem('token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Use the auth endpoint specifically for authentication
      const { data } = await api.get('/auth/getProfile');
      // Ensure we have all required user fields
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: {
          _id: data._id || data.userId,
          name: data.name || '',
          email: data.email
        }
      });
    } catch (error) {
      sessionStorage.removeItem('token');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add updateUser function
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Update the login function
  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { data } = await api.post('/auth/login', credentials);
      if (data.success && data.token) {
        sessionStorage.setItem('token', data.token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Check your credentials.';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.success && data.token) {
        sessionStorage.setItem('token', data.token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  if (state.loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };