// server/middleware/validation.js
const { body, validationResult } = require("express-validator");

const validatePet = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("type")
    .isIn(["dog", "cat", "fish", "bird", "small-pet", "supply"])
    .withMessage("Invalid pet type"),
  body("price")
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("age")
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage("Age must be between 0 and 30"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("breed")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Breed must be less than 100 characters"),
  body("size")
    .optional()
    .isIn(["small", "medium", "large", "extra-large"])
    .withMessage("Size must be small, medium, large, or extra-large"),
  body("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false"),
];

const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
];

const validateContact = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("subject")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Subject must be less than 200 characters"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateRating = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment must be less than 500 characters"),
];

const validateVote = [
  body("voteType")
    .isIn(["up", "down"])
    .withMessage('Vote type must be either "up" or "down"'),
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }

  next();
};

// Rate limiting for sensitive operations
const rateLimit = require("express-rate-limit");

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limits for different endpoints
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  "Too many authentication attempts, please try again later",
);

const contactRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 messages
  "Too many contact form submissions, please try again later",
);

const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  "Too many requests, please try again later",
);

// File upload validation (for future image uploads)
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }

  next();
};

// Custom validation functions
const customValidators = {
  // Check if pet exists
  isPetExists: async (petId) => {
    const Pet = require("../models/Pet");
    const pet = await Pet.findById(petId);
    if (!pet) {
      throw new Error("Pet not found");
    }
    return true;
  },

  // Check if user exists
  isUserExists: async (userId) => {
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return true;
  },

  // Check if email is already taken
  isEmailUnique: async (email, { req }) => {
    const User = require("../models/User");
    const existingUser = await User.findOne({ email });

    // If updating user, allow same email for same user
    if (
      existingUser &&
      (!req.user || existingUser._id.toString() !== req.user.id)
    ) {
      throw new Error("Email already in use");
    }
    return true;
  },

  // Check if username is already taken
  isUsernameUnique: async (username, { req }) => {
    const User = require("../models/User");
    const existingUser = await User.findOne({ username });

    // If updating user, allow same username for same user
    if (
      existingUser &&
      (!req.user || existingUser._id.toString() !== req.user.id)
    ) {
      throw new Error("Username already taken");
    }
    return true;
  },
};

// Advanced validation for updates
const validatePetUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("type")
    .optional()
    .isIn(["dog", "cat", "fish", "bird", "small-pet", "supply"])
    .withMessage("Invalid pet type"),
  body("price")
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("age")
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage("Age must be between 0 and 30"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false"),
];

module.exports = {
  validatePet,
  validateUser,
  validateContact,
  validateLogin,
  validateRating,
  validateVote,
  validatePetUpdate,
  handleValidationErrors,
  sanitizeInput,
  authRateLimit,
  contactRateLimit,
  generalRateLimit,
  validateFileUpload,
  customValidators,
};
