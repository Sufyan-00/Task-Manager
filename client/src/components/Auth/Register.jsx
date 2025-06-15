import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validate';
import Message from '../UI/Message';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register, loading } = useContext(AuthContext);
  const [formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

  // Animation for form entrance
  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!validateEmail(credentials.email)) {
      setError('Invalid email');
      return;
    }
    if (!validatePassword(credentials.password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register(credentials);
      navigate('/dashboard');
    } catch {
      setError('Registration failed');
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${formVisible ? 'visible' : ''}`}>
        <div className="auth-card-inner">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start managing your tasks efficiently</p>
          </div>
          
          {error && <Message type="error">{error}</Message>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={credentials.name}
                onChange={handleChange}
                required
                disabled={loading}
                className={`form-input ${loading ? 'loading' : ''}`}
                placeholder="John Doe"
              />
            </div>
            
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
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
                className={`form-input ${loading ? 'loading' : ''}`}
                placeholder="Minimum 6 characters"
              />
              <p className="form-hint">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="auth-submit-btn register-btn"
            >
              {loading ? (
                <span className="button-with-spinner">
                  <LoadingSpinner size="small" /> Creating account...
                </span>
              ) : (
                <>
                  <span className="btn-text">Create account</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?
              <Link to="/login" className="auth-footer-link">
                Sign in
              </Link>
            </p>
            <div className="auth-terms">
              By creating an account, you agree to our 
              <a href="#" className="terms-link">Terms and Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;