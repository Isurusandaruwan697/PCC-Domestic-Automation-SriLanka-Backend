const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/";

async function migrateDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    // Update nic_demo database
    const nicDemoDb = client.db('nic_demo');
    await nicDemoDb.collection('applicants').updateMany(
      { "applications": { $exists: true } },
      { 
        $set: { 
          "applications.$[].permanentAddress": "",
          "applications.$[].deliveryMethod": "digital"
        } 
      }
    );
    console.log("Updated applicants collection in nic_demo");
    
    // Update pcc_system database
    const pccSystemDb = client.db('pcc_system');
    await pccSystemDb.collection('applications').updateMany(
      {},
      { 
        $set: { 
          "permanentAddress": "",
          "deliveryMethod": "digital"
        } 
      }
    );
    console.log("Updated applications collection in pcc_system");
    
    await pccSystemDb.collection('policedivisions').updateMany(
      { "applications": { $exists: true } },
      { 
        $set: { 
          "applications.$[].permanentAddress": "",
          "applications.$[].deliveryMethod": "digital"
        } 
      }
    );
    console.log("Updated policedivisions collection in pcc_system");
    
    console.log("✅ Database migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
  }
}

migrateDatabase();