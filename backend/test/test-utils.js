const mongoose = require('mongoose');

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 
  "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/test_nic_demo?retryWrites=true&w=majority";

async function connectTestDB() {
  try {
    await mongoose.connect(TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Test MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Test MongoDB connection failed:', error);
    throw error;
  }
}

async function clearTestDB() {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
    console.log('✅ Test database cleared');
  } catch (error) {
    console.error('❌ Error clearing test database:', error);
    throw error;
  }
}

async function disconnectTestDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Test MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting test database:', error);
    throw error;
  }
}

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
  TEST_MONGODB_URI
};