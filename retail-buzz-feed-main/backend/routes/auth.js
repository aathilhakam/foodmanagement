const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false 
  }),
  asyncHandler(async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Generate refresh token
      const refreshToken = generateRefreshToken(req.user._id);
      
      // Set HTTP-only cookie with refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
      });

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  })
);

// Get current user (protected route)
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('ownedCanteen', 'name isOpen')
    .select('-password');
    
  res.status(200).json({
    success: true,
    data: user
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (error) {
    // Clear invalid refresh token
    res.clearCookie('refreshToken');
    throw new AppError('Invalid refresh token', 401);
  }
}));

// Logout
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Update user profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (name) user.name = name;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };
  
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user
  });
}));

// Change user role (admin only)
router.put('/role/:userId', protect, asyncHandler(async (req, res) => {
  // Only admin can change roles
  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }

  const { role } = req.body;
  const { userId } = req.params;

  if (!['user', 'canteen_owner', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
}));

// Helper functions
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

module.exports = router;
