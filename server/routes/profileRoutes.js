import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updatePassword, 
  deleteUserAccount 
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js'; // Make sure this matches your actual middleware name
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Adjust the path as necessary

const router = express.Router();

// Profile management routes
router.get('/', protect, getUserProfile);
router.put('/', protect, updateUserProfile);
router.put('/password', protect, updatePassword);
router.delete('/', protect, deleteUserAccount);

// Add this test route for direct password updates

// Add this TEST ROUTE (remove in production)
router.post('/test-password-update', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Valid new password is required (min 6 chars)' });
    }
    
    const userId = req.user._id || req.user.id;
    console.log('Test update for user ID:', userId);
    
    // Generate hash directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update directly in database
    const result = await User.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Update result:', result);
    
    // Verify it worked
    const updatedUser = await User.findById(userId);
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    res.json({
      success: result.modifiedCount === 1,
      verification: isMatch,
      message: isMatch 
        ? 'Password updated and verified successfully' 
        : 'Password updated but verification failed'
    });
  } catch (error) {
    console.error('Test password update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;