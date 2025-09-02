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

async function debugApplications() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create model
    const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");
    
    const user = await Applicant.findOne({ mobileNumber: "0783322864" });
    
    console.log('\n=== USER DATA ===');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('Name:', user.nameWithInitials);
      console.log('Mobile:', user.mobileNumber);
      console.log('Total applications:', user.applications?.length || 0);
      
      if (user.applications && user.applications.length > 0) {
        console.log('Applications:');
        user.applications.forEach(app => {
          console.log(`- ID: ${app.applicationId}, Date: ${app.submissionDate}, Status: ${app.status}`);
        });
      }
    } else {
      console.log('User not found with mobile number: 0783322864');
    }
    
    // Check current month applications
    const now = new Date();
    console.log('\n=== CURRENT MONTH ANALYSIS ===');
    console.log('Current month:', now.getMonth() + 1, 'Year:', now.getFullYear());
    
    if (user && user.applications) {
      const currentMonthApps = user.applications.filter(app => {
        if (!app.submissionDate) return false;
        const appDate = new Date(app.submissionDate);
        return appDate.getMonth() === now.getMonth() && 
               appDate.getFullYear() === now.getFullYear();
      });
      
      console.log('Current month applications count:', currentMonthApps.length);
      
      if (currentMonthApps.length > 0) {
        console.log('Current month application IDs:');
        currentMonthApps.forEach(app => {
          console.log(`- ${app.applicationId} (${app.submissionDate})`);
        });
      }
    }
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (err) {
    console.error("Error:", err);
  }
}

debugApplications();