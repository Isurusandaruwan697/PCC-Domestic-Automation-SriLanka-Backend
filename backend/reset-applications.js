const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// Define the Applicant schema
const applicantSchema = new mongoose.Schema({
  nameWithInitials: String,
  fullNameEnglish: String,
  nicNumber: String,
  dateOfBirth: String,
  permanentAddress: String,
  policeDivision: String,
  gnDivision: String,
  mobileNumber: String,
  email: String,
  applications: [{
    applicationId: String,
    submissionDate: Date,
    reason: String,
    reasonText: String,
    fromDate: String,
    toDate: String,
    status: String,
    policeDivision: String,
    gnDivision: String,
    documents: Object,
    timeline: Array
  }]
});

async function resetApplications() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("Connected to MongoDB");
    
    // Create model
    const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");
    
    const user = await Applicant.findOne({ mobileNumber: "0783322864" });
    
    if (user) {
      console.log('User found:', user.nameWithInitials);
      console.log('Before reset - Applications count:', user.applications?.length || 0);
      
      if (user.applications && user.applications.length > 0) {
        console.log('Application IDs:', user.applications.map(app => app.applicationId));
      }
      
      // Reset applications array
      user.applications = [];
      await user.save();
      
      console.log('After reset - Applications count:', user.applications?.length || 0);
      console.log('Applications reset successfully!');
    } else {
      console.log('User not found with mobile number: 0783322864');
      
      // List all users in the database for debugging
      const allUsers = await Applicant.find({}, 'nameWithInitials mobileNumber');
      console.log('All users in database:');
      allUsers.forEach(u => {
        console.log(`- ${u.nameWithInitials} (${u.mobileNumber})`);
      });
    }
    
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (err) {
    console.error("Error:", err);
  }
}

resetApplications();