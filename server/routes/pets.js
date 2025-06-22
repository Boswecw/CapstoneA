// server/routes/pets.js

const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { auth } = require('../middleware/auth');
const {
  validatePet,
  validatePetUpdate,
  validateRating,
  validateVote,
  handleValidationErrors,
  sanitizeInput,
  generalRateLimit
} = require('../middleware/validation');

// ✅ Apply rate limiting and sanitization globally to pet routes
router.use(generalRateLimit);
router.use(sanitizeInput);

// 🟢 Public Routes
router.get('/', petController.getAllPets);
router.get('/featured', petController.getFeaturedPets);
router.get('/type/:type', petController.getPetsByType);
router.get('/:id', petController.getPetById);

// 🔒 Protected Routes (authentication required)
router.post(
  '/',
  auth,
  validatePet,
  handleValidationErrors,
  petController.createPet
);

router.put(
  '/:id',
  auth,
  validatePetUpdate,
  handleValidationErrors,
  petController.updatePet
);

router.delete(
  '/:id',
  auth,
  petController.deletePet
);

router.post(
  '/:id/vote',
  auth,
  validateVote,
  handleValidationErrors,
  petController.votePet
);

router.post(
  '/:id/rate',
  auth,
  validateRating,
  handleValidationErrors,
  petController.ratePet
);

module.exports = router;
