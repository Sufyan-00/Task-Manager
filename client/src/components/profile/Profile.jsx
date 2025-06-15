import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data) {
          // Update form data with user profile
          setFormData(prevData => ({
            ...prevData,
            name: response.data.name || '',
            email: response.data.email || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to load profile.' 
        });
      }
    };

    fetchProfile();
  }, []);

  // Load user data from context
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Sending profile update request with:', formData);
      const response = await api.put('/profile', {
        name: formData.name,
        email: formData.email
      });

      console.log('Profile update response:', response.data);

      if (response && response.status === 200) {
        // No need to update AuthContext - we'll refresh the page data on next visit
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // // Update handlePasswordChange function with better error handling and feedback
  // const handlePasswordChange = async (e) => {
  //   e.preventDefault();
    
  //   // Validate passwords
  //   if (!formData.currentPassword) {
  //     setMessage({ type: 'error', text: 'Current password is required' });
  //     return;
  //   }
    
  //   if (!formData.newPassword) {
  //     setMessage({ type: 'error', text: 'New password is required' });
  //     return;
  //   }
    
  //   if (formData.newPassword !== formData.confirmPassword) {
  //     setMessage({ type: 'error', text: 'New passwords do not match!' });
  //     return;
  //   }

  //   if (formData.newPassword.length < 6) {
  //     setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
  //     return;
  //   }

  //   setLoading(true);
  //   setMessage({ type: '', text: '' });

  //   try {
  //     console.log('Sending password change request with current and new passwords');
  //     const response = await api.put('/profile/password', {
  //       currentPassword: formData.currentPassword,
  //       newPassword: formData.newPassword
  //     });

  //     console.log('Password change response:', response.data);

  //     if (response.data.verified === true) {
  //       setMessage({ 
  //         type: 'success', 
  //         text: 'Password changed successfully! The system has verified your new password works. Please log in again with your new password.'
  //       });
        
  //       // Clear form fields
  //       setFormData(prevData => ({
  //         ...prevData,
  //         currentPassword: '',
  //         newPassword: '',
  //         confirmPassword: ''
  //       }));
        
  //       // Log out after successful password change
  //       setTimeout(() => {
  //         logout();
  //       }, 5000);
  //     } else {
  //       setMessage({ 
  //         type: 'warning', 
  //         text: 'Password was changed, but verification failed. You may have issues logging back in.'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Password change error:', error);
  //     setMessage({ 
  //       type: 'error', 
  //       text: error.response?.data?.message || 'Failed to change password.'
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Update the handlePasswordChange function

const handlePasswordChange = async (e) => {
  e.preventDefault();
  
  // Validation checks...
  if (!formData.currentPassword) {
    setMessage({ type: 'error', text: 'Current password is required' });
    return;
  }
  
  if (!formData.newPassword) {
    setMessage({ type: 'error', text: 'New password is required' });
    return;
  }
  
  if (formData.newPassword !== formData.confirmPassword) {
    setMessage({ type: 'error', text: 'New passwords do not match' });
    return;
  }

  if (formData.newPassword.length < 6) {
    setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
    return;
  }

  setLoading(true);
  setMessage({ type: '', text: '' });

  try {
    const response = await api.put('/profile/password', {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });

    console.log('Password change response:', response);
    
    // Check for specific response status
    if (response.status === 200) {
      // Success case - clear the form and show success message
      setMessage({ 
        type: 'success', 
        text: 'Password changed successfully! Please log in again with your new password.' 
      });
      
      setFormData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Optional: Log out user after successful password change
      setTimeout(() => {
        logout();
      }, 3000);
    }
  } catch (error) {
    console.error('Password change error:', error);
    
    // Special case for "password saved but auth failed"
    if (error.response?.status === 207 || 
        (error.response?.data?.passwordSaved && !error.response?.data?.authSuccess)) {
      setMessage({ 
        type: 'warning', 
        text: 'Password was changed successfully, but you need to log in again with your new password.' 
      });
      
      // Clear the form
      setFormData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Log out after a delay
      setTimeout(() => {
        logout();
      }, 3000);
    } else if (error.response?.status === 400) {
      // Handle validation errors
      setMessage({ 
        type: 'error', 
        text: error.response.data.message || 'Invalid input' 
      });
    } else if (error.response?.status === 401) {
      // Handle authentication errors
      setMessage({ 
        type: 'error', 
        text: 'Authentication failed. Please log in again.' 
      });
      setTimeout(() => logout(), 3000);
    } else {
      // Handle other errors
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while changing password.' 
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleAccountDelete = async () => {
    setLoading(true);
    try {
      const response = await api.delete('/profile');
      
      if (response.status === 200) {
        logout(); // Log the user out and redirect
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete account.' 
      });
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-initials">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="profile-title">
          <h1 className="profile-name">{user.name || 'User'}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-member-since">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="tab-content">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-form-container">
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-btn" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-form-container">
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-btn" 
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>

            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <p>Permanently delete your account and all your data.</p>
              {!showDeleteConfirm ? (
                <button 
                  className="delete-account-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirm">
                  <p className="confirm-text">Are you sure? This cannot be undone!</p>
                  <div className="confirm-actions">
                    <button 
                      className="confirm-delete-btn"
                      onClick={handleAccountDelete}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button 
                      className="cancel-delete-btn"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;