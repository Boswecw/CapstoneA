// server/scripts/debugLogin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const User = require('../models/User');

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging login system...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database name:', mongoose.connection.name);

    // Check if admin user exists
    console.log('\n👤 CHECKING ADMIN USER:');
    const adminUser = await User.findOne({ email: 'admin@furbabies.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user NOT found in database!');
      console.log('🔧 Creating admin user now...');
      
      // Create admin user
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@furbabies.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
      
      // Re-fetch the user
      const createdAdmin = await User.findOne({ email: 'admin@furbabies.com' });
      console.log('📝 Admin user details:');
      console.log('   Email:', createdAdmin.email);
      console.log('   Username:', createdAdmin.username);
      console.log('   Role:', createdAdmin.role);
      console.log('   ID:', createdAdmin._id);
      
      // Test password
      const passwordTest = await createdAdmin.comparePassword('admin123');
      console.log('🔐 Password test result:', passwordTest);
      
    } else {
      console.log('✅ Admin user found!');
      console.log('📝 Admin user details:');
      console.log('   Email:', adminUser.email);
      console.log('   Username:', adminUser.username);
      console.log('   Role:', adminUser.role);
      console.log('   ID:', adminUser._id);
      console.log('   Created:', adminUser.createdAt);
      
      // Test password
      console.log('\n🔐 TESTING PASSWORD:');
      const passwordTest = await adminUser.comparePassword('admin123');
      console.log('Password "admin123" is valid:', passwordTest);
      
      if (!passwordTest) {
        console.log('❌ Password verification failed!');
        console.log('🔧 Let\'s check the stored password hash...');
        console.log('Stored hash length:', adminUser.password.length);
        console.log('Hash starts with:', adminUser.password.substring(0, 10) + '...');
        
        // Try to manually verify
        console.log('\n🔧 Manual password verification:');
        const manualTest = await bcrypt.compare('admin123', adminUser.password);
        console.log('Manual bcrypt.compare result:', manualTest);
        
        if (!manualTest) {
          console.log('🔧 Updating admin password...');
          adminUser.password = 'admin123';
          await adminUser.save();
          console.log('✅ Password updated!');
          
          // Test again
          const newTest = await adminUser.comparePassword('admin123');
          console.log('New password test result:', newTest);
        }
      } else {
        console.log('✅ Password verification successful!');
      }
    }

    // List all users for debugging
    console.log('\n👥 ALL USERS IN DATABASE:');
    const allUsers = await User.find({});
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ID: ${user._id}`);
    });

    await mongoose.disconnect();
    console.log('\n👋 Database check complete!');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Try logging in with: admin@furbabies.com / admin123');
    console.log('2. Check browser console for any errors');
    console.log('3. Check server console for login attempts');
    console.log('4. Test API endpoint directly with curl');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error during debug:', error.message);
    console.error('Full error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

debugLogin();