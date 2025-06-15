import React, { useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const titleRef = useRef(null);
  const sloganRef = useRef(null);
  const paragraphRef = useRef(null);
  const buttonContainerRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Animate elements when component mounts
    const title = titleRef.current;
    const slogan = sloganRef.current;
    const paragraph = paragraphRef.current;
    const buttonContainer = buttonContainerRef.current;
    const features = featuresRef.current;

    title.classList.add('animate-in');
    
    setTimeout(() => {
      slogan.classList.add('animate-in');
    }, 300);
    
    setTimeout(() => {
      paragraph.classList.add('animate-in');
    }, 600);
    
    setTimeout(() => {
      buttonContainer.classList.add('animate-in');
    }, 900);
    
    setTimeout(() => {
      features.classList.add('animate-in');
      
      // Start feature animations
      const featureItems = features.querySelectorAll('.feature-item');
      featureItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('feature-animate');
        }, index * 120);
      });
    }, 1200);
    
    return () => {
      // Cleanup animations if needed
    };
  }, []);

  return (
    <div className="home-container">
      <div className="home">
        <h1 ref={titleRef} className="home-title">
          <span className="title-focus">Task</span>Manager
        </h1>
        
        <h2 ref={sloganRef} className="home-slogan">
          Simplicity meets productivity
        </h2>
        
        {isAuthenticated ? (
          <p ref={paragraphRef} className="home-description welcome-message">
            Welcome back, <span className="user-name-highlight">{user?.name || 'there'}</span>! 
            Continue managing your tasks and boost your productivity today.
          </p>
        ) : (
          <p ref={paragraphRef} className="home-description">
            Stay organized, focused, and in control of your tasks. 
            Our intelligent task management system helps you 
            <span className="highlight-text"> prioritize what matters most</span> and 
            achieve your goals with confidence.
          </p>
        )}
        
        <div ref={buttonContainerRef} className="home-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="home-btn home-btn-primary">
                <div className="btn-content">
                  <span>My Dashboard</span>
                </div>
                <div className="btn-line"></div>
              </Link>
              <Link to="/profile" className="home-btn home-btn-secondary">
                <div className="btn-content">
                  <span>My Profile</span>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="home-btn home-btn-primary">
                <div className="btn-content">
                  <span>Sign In</span>
                </div>
                <div className="btn-line"></div>
              </Link>
              <Link to="/register" className="home-btn home-btn-secondary">
                <div className="btn-content">
                  <span>Get Started</span>
                </div>
              </Link>
            </>
          )}
        </div>
        
        <div ref={featuresRef} className="feature-grid">
          <div className="feature-item priority-high">
            <span className="feature-title">Prioritize</span>
            <span className="feature-text">Focus on what matters most</span>
          </div>
          <div className="feature-item priority-medium">
            <span className="feature-title">Organize</span>
            <span className="feature-text">Structure your workflow</span>
          </div>
          <div className="feature-item priority-low">
            <span className="feature-title">Schedule</span>
            <span className="feature-text">Never miss a deadline</span>
          </div>
          <div className="feature-item completed">
            <span className="feature-title">Track</span>
            <span className="feature-text">Monitor your progress</span>
          </div>
          <div className="feature-item shared">
            <span className="feature-title">Collaborate</span>
            <span className="feature-text">Work together seamlessly</span>
          </div>
        </div>
      </div>
      
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default Home;