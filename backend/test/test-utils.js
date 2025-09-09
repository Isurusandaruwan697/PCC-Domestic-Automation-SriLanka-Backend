const mongoose = require('mongoose');

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo_test?retryWrites=true&w=majority";

async function connectTestDB() {
  try {
    // Always disconnect first to avoid conflicts
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Test MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Test MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearTestDB() {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('🧹 Test database cleared');
  } catch (error) {
    console.error('❌ Error clearing test database:', error);
  }
}

async function disconnectTestDB() {
  try {
    await mongoose.connection.close();
    console.log('✅ Test MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Test MongoDB disconnection error:', error);
  }
}

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB
};