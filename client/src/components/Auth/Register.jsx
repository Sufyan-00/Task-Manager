import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword } from '../../utils/validate';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const { register, loading } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.name.trim()) {
      showError('Name is required');
      return;
    }
    if (!validateEmail(credentials.email)) {
      showError('Invalid email');
      return;
    }
    if (!validatePassword(credentials.password)) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(credentials);
      showSuccess('Registration successful!');
      navigate('/dashboard');
    } catch {
      showError('Registration failed');
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-card visible">
        <div className="auth-card-inner">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start managing your tasks efficiently</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
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
              <label className="form-label" htmlFor="email">Email Address</label>
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
              <label className="form-label" htmlFor="password">Password</label>
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
            <button type="submit" disabled={loading} className="auth-submit-btn register-btn">
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
              <Link to="/login" className="auth-footer-link">Sign in</Link>
            </p>
            <div className="auth-terms">
              By creating an account, you agree to our
              <a
                href="/terms"
                className="terms-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;