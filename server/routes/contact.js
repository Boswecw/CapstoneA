// server/routes/contact.js (Updated with validation)
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { auth, adminAuth } = require("../middleware/auth");
const {
  validateContact,
  handleValidationErrors,
  sanitizeInput,
  contactRateLimit,
} = require("../middleware/validation");

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public routes with rate limiting
router.post(
  "/",
  contactRateLimit,
  validateContact,
  handleValidationErrors,
  contactController.submitContact,
);

// Admin routes
router.get("/", auth, adminAuth, contactController.getAllContacts);
router.get("/:id", auth, adminAuth, contactController.getContactById);
router.put("/:id/respond", auth, adminAuth, contactController.respondToContact);
router.put(
  "/:id/status",
  auth,
  adminAuth,
  contactController.updateContactStatus,
);

module.exports = router;
