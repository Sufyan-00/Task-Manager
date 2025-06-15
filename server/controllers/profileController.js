import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { hashPassword } from '../utils/passwordUtils.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    // Use either _id or id property from the user object
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password && password.length >= 6) {
      user.password = await hashPassword(password);
    } else if (password) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Update the updatePassword function

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // Get user from request
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Changing password for user:', user.email);
    
    // Verify current password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({ message: 'Error verifying current password' });
    }
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password with new hash - USING DIRECT UPDATE
    try {
      // Generate hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update directly in database to avoid middleware issues
      const updateResult = await User.updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Password update result:', updateResult);
      
      // Check if update was successful
      if (updateResult.modifiedCount !== 1) {
        return res.status(500).json({ 
          message: 'Failed to update password in database',
          passwordSaved: false
        });
      }
      
      console.log('Password updated successfully in database');
      
      // Return clear success message
      return res.status(200).json({ 
        message: 'Password changed successfully. Please log in again with your new password.',
        passwordSaved: true
      });
      
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ message: 'Error updating password' });
    }
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete account
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};