// server/routes/users.js (Updated with validation)
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const {
  validateUser,
  validateLogin,
  handleValidationErrors,
  sanitizeInput,
  authRateLimit,
  customValidators
} = require('../middleware/validation');
const { body } = require('express-validator');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes with rate limiting
router.post('/register', 
  authRateLimit,
  validateUser,
  body('email').custom(customValidators.isEmailUnique),
  body('username').custom(customValidators.isUsernameUnique),
  handleValidationErrors,
  userController.register
);

router.post('/login', 
  authRateLimit,
  validateLogin,
  handleValidationErrors,
  userController.login
);

// Protected routes
router.get('/profile', auth, userController.getProfile);

router.put('/profile', 
  auth,
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('profile.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors,
  userController.updateProfile
);

router.get('/favorites', auth, userController.getFavorites);
router.post('/favorites/:petId', auth, userController.addToFavorites);
router.delete('/favorites/:petId', auth, userController.removeFromFavorites);

module.exports = router;