// server/routes/products.js - Complete Products Routes
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { auth, adminAuth } = require("../middleware/auth");

// Public routes
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);

// Protected routes (require authentication)
router.post("/", auth, productController.createProduct);
router.put("/:id", auth, productController.updateProduct);
router.delete("/:id", auth, productController.deleteProduct);
router.post("/:id/vote", auth, productController.voteProduct);
router.post("/:id/rate", auth, productController.rateProduct);

module.exports = router;
