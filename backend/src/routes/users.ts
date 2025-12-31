import express, { Request, Response, NextFunction } from 'express';
import { db } from '../services/database.service';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Get user profile
router.get('/profile',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;
      const user = await db.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't return password
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  }
);

// Update user profile
router.put('/profile',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;
      const { name, email } = req.body;

      // Validate input
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      // Check if email is already taken by another user
      const existingUser = await db.findUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email is already taken' });
      }

      const success = await db.updateUserProfile(userId, { name: name.trim(), email });
      if (!success) {
        return res.status(400).json({ error: 'Failed to update profile' });
      }

      // Return updated profile
      const updatedUser = await db.findUserById(userId);
      const { password, ...userProfile } = updatedUser!;
      
      res.json({
        message: 'Profile updated successfully',
        user: userProfile
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put('/change-password',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const success = await db.changeUserPassword(userId, currentPassword, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);



export default router;