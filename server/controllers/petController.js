// server/controllers/petController.js

const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const Pet = require("../models/Pet");
const User = require("../models/User");

// Rate limiter for voting/ratings
const votingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many voting attempts, please try again later.",
  },
});

const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pet ID format" });
    }

    const pet = await Pet.findById(id)
      .populate("createdBy", "username email")
      .populate("ratings.user", "username");

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    res.json({ success: true, data: pet });
  } catch (error) {
    console.error("Error fetching pet:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching pet",
        error: error.message,
      });
  }
};

const ratePet = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const petId = req.params.id;

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Rating must be an integer between 1 and 5",
        });
    }

    if (comment && comment.length > 500) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Comment cannot exceed 500 characters",
        });
    }

    const [user, pet] = await Promise.all([
      User.findById(userId),
      Pet.findById(petId),
    ]);

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existingRatingIndex = pet.ratings.findIndex(
      (r) => r.user.toString() === userId,
    );

    if (existingRatingIndex !== -1) {
      pet.ratings[existingRatingIndex].rating = rating;
      pet.ratings[existingRatingIndex].comment = comment || "";
      pet.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      pet.ratings.push({
        user: userId,
        rating,
        comment: comment || "",
        createdAt: new Date(),
      });
    }

    await pet.save();

    const updatedPet = await Pet.findById(petId).populate(
      "ratings.user",
      "username",
    );

    res.json({
      success: true,
      message:
        existingRatingIndex !== -1
          ? "Rating updated successfully"
          : "Rating submitted successfully",
      data: {
        averageRating: updatedPet.averageRating,
        totalRatings: updatedPet.ratings.length,
        userRating: rating,
        ratings: updatedPet.ratings.slice(-5),
      },
    });
  } catch (error) {
    console.error("Error rating pet:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Error submitting rating",
        error: error.message,
      });
  }
};

const bulkUpdatePets = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const { petIds, updateData } = req.body;

    if (!Array.isArray(petIds) || petIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pet IDs array is required" });
    }

    const result = await Pet.updateMany({ _id: { $in: petIds } }, updateData, {
      runValidators: true,
    });

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} pets`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error bulk updating pets:", error);
    res
      .status(400)
      .json({
        success: false,
        message: "Error updating pets",
        error: error.message,
      });
  }
};

const getPetStats = async (req, res) => {
  try {
    const stats = await Pet.aggregate([
      {
        $group: {
          _id: null,
          totalPets: { $sum: 1 },
          availablePets: {
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
          },
          avgPrice: { $avg: "$price" },
          totalVotes: { $sum: { $add: ["$votes.up", "$votes.down"] } },
          avgRating: { $avg: "$averageRating" },
        },
      },
      {
        $addFields: {
          adoptedPets: { $subtract: ["$totalPets", "$availablePets"] },
        },
      },
    ]);

    const typeStats = await Pet.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: { overview: stats[0] || {}, byType: typeStats },
    });
  } catch (error) {
    console.error("Error fetching pet stats:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching statistics",
        error: error.message,
      });
  }
};

const getFeaturedPets = async (req, res) => {
  try {
    const featuredPets = await Pet.find({ featured: true }).limit(10);
    res.json({ success: true, data: featuredPets });
  } catch (error) {
    console.error("Error fetching featured pets:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching featured pets",
        error: error.message,
      });
  }
};

// Placeholder functions to preserve exports
const getAllPets = async (req, res) => {
  try {
    const sortOption = req.query.sort;
    let sortCriteria = {};

    if (sortOption === "newest") {
      sortCriteria = { createdAt: -1 };
    } else if (sortOption === "oldest") {
      sortCriteria = { createdAt: 1 };
    } else if (sortOption === "priceHigh") {
      sortCriteria = { price: -1 };
    } else if (sortOption === "priceLow") {
      sortCriteria = { price: 1 };
    }

    const pets = await Pet.find().sort(sortCriteria);

    res.json({ success: true, data: pets });
  } catch (error) {
    console.error("Error fetching all pets:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching pets",
        error: error.message,
      });
  }
};

const getPetsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const pets = await Pet.find({ type: type.toLowerCase() });

    if (!pets.length) {
      return res
        .status(404)
        .json({ success: false, message: `No pets found for type: ${type}` });
    }

    res.json({ success: true, data: pets });
  } catch (error) {
    console.error(`Error fetching pets of type ${req.params.type}:`, error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const createPet = async (req, res) => {
  res
    .status(501)
    .json({ success: false, message: "createPet not implemented yet" });
};

const updatePet = async (req, res) => {
  res
    .status(501)
    .json({ success: false, message: "updatePet not implemented yet" });
};

const deletePet = async (req, res) => {
  res
    .status(501)
    .json({ success: false, message: "deletePet not implemented yet" });
};

const votePet = async (req, res) => {
  res
    .status(501)
    .json({ success: false, message: "votePet not implemented yet" });
};

// Export all controllers
module.exports = {
  getAllPets,
  getFeaturedPets,
  getPetsByType,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  votePet,
  ratePet,
};
