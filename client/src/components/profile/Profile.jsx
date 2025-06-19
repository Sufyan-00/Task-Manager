import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data) {
          setFormData(prevData => ({
            ...prevData,
            name: response.data.name || '',
            email: response.data.email || ''
          }));
        }
      } catch (error) {
        showError('Failed to load profile.');
      }
    };

    fetchProfile();
  }, [showError]);

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

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

    try {
      const response = await api.put('/profile', {
        name: formData.name,
        email: formData.email
      });

      if (response && response.status === 200) {
        showSuccess('Profile updated successfully!');
      } else {
        showError('Failed to update profile');
      }
    } catch (error) {
      showError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      showError('Current password is required');
      return;
    }

    if (!formData.newPassword) {
      showError('New password is required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put('/profile/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.status === 200) {
        showSuccess('Password changed successfully! Please log in again with your new password.');
        setFormData(prevData => ({
          ...prevData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setTimeout(() => {
          logout();
        }, 3000);
      }
    } catch (error) {
      if (error.response?.status === 207 ||
        (error.response?.data?.passwordSaved && !error.response?.data?.authSuccess)) {
        showWarning('Password was changed successfully, but you need to log in again with your new password.');
        setFormData(prevData => ({
          ...prevData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setTimeout(() => {
          logout();
        }, 3000);
      } else if (error.response?.status === 400) {
        showError('Invalid input');
      } else if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
        setTimeout(() => logout(), 3000);
      } else {
        showError('An error occurred while changing password.');
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
        showWarning('Account deleted. Logging out...');
        logout();
      }
    } catch (error) {
      showError('Failed to delete account.');
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