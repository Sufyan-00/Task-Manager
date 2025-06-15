import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validate';
import Message from '../UI/Message';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const { login, loading, error, clearError } = useContext(AuthContext);
  const [formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

  // Animation for form entrance
  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateEmail(credentials.email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(credentials.password)) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleChange = (e) => {
    setCredentials({ 
      ...credentials, 
      [e.target.name]: e.target.value 
    });
    if (localError) setLocalError('');
    if (error) clearError();
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${formVisible ? 'visible' : ''}`}>
        <div className="auth-card-inner">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to your dashboard</p>
          </div>
          
          {(localError || error) && (
            <Message type="error">{localError || error}</Message>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                disabled={loading}
                className={`form-input ${loading ? 'loading' : ''}`}
                placeholder="you@example.com"
              />
            </div>
            
            <div className="form-group">
              <div className="label-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="form-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
                className={`form-input ${loading ? 'loading' : ''}`}
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <span className="button-with-spinner">
                  <LoadingSpinner size="small" /> Signing in...
                </span>
              ) : (
                <>
                  <span className="btn-text">Sign in</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-footer-text">
              New to TaskManager? 
              <Link to="/register" className="auth-footer-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;