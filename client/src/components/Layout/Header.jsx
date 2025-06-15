import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <nav className="header-nav">
        <Link to="/" className="header-logo">
          <span className="logo-text-main">Task</span>
          <span className="logo-text-alt">Manager</span>
        </Link>
        
        <div className="header-links">
          {isAuthenticated ? (
            <>
              <span className="welcome-text">
                <span className="welcome-prefix">Welcome, </span>
                <span className="user-name">{user.name || user.email}</span>
              </span>
              
              <Link 
                to="/dashboard" 
                className={`header-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
                <span className="link-underline"></span>
              </Link><Link 
                to="/profile" 
                className={`header-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
                <span className="link-underline"></span>
              </Link>
              
              <button onClick={handleLogout} className="header-logout-btn">
                <span className="btn-text">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                className={`header-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
                <span className="link-underline"></span>
              </Link>
              
              <Link 
                to="/login" 
                className={`header-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Sign In
                <span className="link-underline"></span>
              </Link>
              
              <Link 
                to="/register" 
                className="header-link header-cta"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;