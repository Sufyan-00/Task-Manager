import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail } from '../../utils/validate';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { login, loading, user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(credentials.email)) {
      showError('Please enter a valid email address');
      return;
    }
    if (!credentials.password || credentials.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      await login(credentials);
      showSuccess(`Welcome back, ${credentials.email}!`);
      navigate('/dashboard');
    } catch (err) {
      showError('Login failed');
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
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to your dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="auth-submit-btn">
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
              <Link to="/register" className="auth-footer-link">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;