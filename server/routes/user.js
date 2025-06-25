// server/routes/users.js - Complete ES6 Version with Admin Routes
import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  // Regular user functions
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteUserAccount,
  
  // Admin functions
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  unlockUserAccount,
  deleteUser,
  getUserActivity
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { adminOnly, adminOrModerator, preventSelfModification } from '../middleware/adminAuth.js';

const router = express.Router();

// ✨ VALIDATION MIDDLEWARE ✨
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

const profileUpdateValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('profile.phone')
    .optional()
    .matches(/^[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number')
];

// Admin validation middleware
const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const roleUpdateValidation = [
  body('role')
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator')
];

const statusUpdateValidation = [
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
];

const passwordResetValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),
  body('sendEmail')
    .optional()
    .isBoolean()
    .withMessage('sendEmail must be a boolean')
];

const adminQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['all', 'user', 'admin', 'moderator'])
    .withMessage('Invalid role filter'),
  query('status')
    .optional()
    .isIn(['all', 'active', 'inactive', 'verified', 'unverified'])
    .withMessage('Invalid status filter'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'lastLogin', 'username', 'email'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// ========================================
// 🔓 PUBLIC ROUTES
// ========================================
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

// ========================================
// 🔐 PROTECTED USER ROUTES
// ========================================
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, profileUpdateValidation, updateUserProfile);
router.put('/change-password', auth, passwordChangeValidation, changePassword);
router.delete('/delete-account', auth, deleteUserAccount);

// ========================================
// 👑 ADMIN ROUTES
// ========================================

// Get all users with filtering, pagination, and search
router.get('/admin/all', 
  auth, 
  adminOnly, 
  adminQueryValidation, 
  getAllUsers
);

// Get specific user by ID
router.get('/admin/:userId', 
  auth, 
  adminOnly, 
  userIdValidation, 
  getUserById
);

// Update user role
router.put('/admin/:userId/role', 
  auth, 
  adminOnly, 
  userIdValidation,
  roleUpdateValidation,
  preventSelfModification,
  updateUserRole
);

// Update user status (active/inactive, verified/unverified)
router.put('/admin/:userId/status', 
  auth, 
  adminOnly, 
  userIdValidation,
  statusUpdateValidation,
  preventSelfModification,
  updateUserStatus
);

// Reset user password
router.put('/admin/:userId/reset-password', 
  auth, 
  adminOnly, 
  userIdValidation,
  passwordResetValidation,
  resetUserPassword
);

// Unlock user account
router.put('/admin/:userId/unlock', 
  auth, 
  adminOnly, 
  userIdValidation,
  unlockUserAccount
);

// Get user activity logs
router.get('/admin/:userId/activity', 
  auth, 
  adminOrModerator, 
  userIdValidation,
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365')
  ],
  getUserActivity
);

// Permanently delete user (dangerous operation)
router.delete('/admin/:userId/delete', 
  auth, 
  adminOnly, 
  userIdValidation,
  [
    body('confirmDeletion')
      .equals('PERMANENTLY_DELETE')
      .withMessage('Must type "PERMANENTLY_DELETE" to confirm')
  ],
  preventSelfModification,
  deleteUser
);

// ========================================
// 📊 ADMIN DASHBOARD ROUTES
// ========================================

// Get user statistics (for admin dashboard)
router.get('/admin/stats/overview', auth, adminOrModerator, async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    // Get additional stats
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt role');

    const lockedUsers = await User.find({ 
      lockUntil: { $exists: true, $gt: new Date() }
    }).countDocuments();

    res.json({
      success: true,
      stats: {
        ...stats,
        lockedUsers,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

// Bulk operations endpoint
router.post('/admin/bulk-actions', 
  auth, 
  adminOnly,
  [
    body('action')
      .isIn(['activate', 'deactivate', 'verify', 'unverify', 'unlock'])
      .withMessage('Invalid bulk action'),
    body('userIds')
      .isArray({ min: 1 })
      .withMessage('User IDs array is required'),
    body('userIds.*')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],
  async (req, res) => {
    try {
      const { action, userIds } = req.body;
      const currentUserId = req.user._id.toString();

      // Prevent admin from affecting their own account in bulk operations
      if (userIds.includes(currentUserId)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot perform bulk operations on your own account'
        });
      }

      let updateQuery = {};
      let message = '';

      switch (action) {
        case 'activate':
          updateQuery = { isActive: true };
          message = 'Users activated';
          break;
        case 'deactivate':
          updateQuery = { isActive: false };
          message = 'Users deactivated';
          break;
        case 'verify':
          updateQuery = { isVerified: true };
          message = 'Users verified';
          break;
        case 'unverify':
          updateQuery = { isVerified: false };
          message = 'Users unverified';
          break;
        case 'unlock':
          updateQuery = { $unset: { lockUntil: 1 }, loginAttempts: 0 };
          message = 'Users unlocked';
          break;
      }

      const result = await User.updateMany(
        { _id: { $in: userIds } },
        updateQuery
      );

      res.json({
        success: true,
        message: `${message} (${result.modifiedCount} users affected)`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Bulk operation failed',
        error: error.message
      });
    }
  }
);

// ========================================
// 🔒 EXPORT ROUTER
// ========================================
export default router;