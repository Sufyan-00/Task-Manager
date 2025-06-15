import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="not-found">
    <div className="not-found-content">
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">Page Not Found</h2>
      <p className="not-found-text">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="not-found-btn">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;