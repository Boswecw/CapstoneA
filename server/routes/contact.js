// server/routes/contact.js - ES6 Module Version (Updated with validation)
import express from "express";
import contactController from "../controllers/contactController.js";
import { auth, adminAuth } from "../middleware/auth.js";
import {
  validateContact,
  handleValidationErrors,
  sanitizeInput,
  contactRateLimit,
} from "../middleware/validation.js";

const router = express.Router();

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

export default router;