// server/scripts/checkUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Import models
const User = require("../models/User");
const Pet = require("../models/Pet");

const checkDatabase = async () => {
  try {
    console.log("🔍 Checking database contents...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    console.log("📊 Database name:", mongoose.connection.name);

    // Check users
    console.log("\n👥 USERS IN DATABASE:");
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("   ---");
    });

    // Check pets
    console.log("\n🐾 PETS IN DATABASE:");
    const pets = await Pet.find({});
    console.log(`Found ${pets.length} pets:`);

    pets.slice(0, 3).forEach((pet, index) => {
      console.log(`${index + 1}. ${pet.name} (${pet.type}) - $${pet.price}`);
    });

    if (pets.length > 3) {
      console.log(`   ... and ${pets.length - 3} more pets`);
    }

    // Test password verification for admin
    const adminUser = await User.findOne({ email: "admin@furbabies.com" });
    if (adminUser) {
      console.log("\n🔐 TESTING ADMIN PASSWORD:");
      console.log("Admin user found:", adminUser.email);

      // Test password comparison
      const isValidPassword = await adminUser.comparePassword("admin123");
      console.log('Password "admin123" is valid:', isValidPassword);

      if (!isValidPassword) {
        console.log("❌ Password verification failed!");
        console.log("This might be why login is not working.");
      } else {
        console.log("✅ Password verification successful!");
      }
    } else {
      console.log("❌ Admin user not found in database!");
    }

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from database");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error checking database:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkDatabase();
