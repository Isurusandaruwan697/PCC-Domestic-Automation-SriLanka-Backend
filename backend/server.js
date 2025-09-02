// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Applicant Schema
// const applicantSchema = new mongoose.Schema({
//   nameWithInitials: String,
//   fullNameEnglish: String,
//   nicNumber: String,
//   dateOfBirth: String,
//   permanentAddress: String,
//   policeDivision: String,
//   gnDivision: String,
//   mobileNumber: String,
//   email: String
// });

// const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// let otpStore = {};

// // Connect to MongoDB
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("✅ MongoDB connected successfully"))
// .catch(err => {
//   console.error("❌ MongoDB connection error:", err);
//   process.exit(1);
// });

// // Login API
// app.post("/api/login", async (req, res) => {
//   try {
//     let { id, mobile } = req.body;
    
//     if (!id || !mobile) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "NIC and mobile number are required" 
//       });
//     }
    
//     // Normalize NIC to uppercase for comparison
//     id = id.toUpperCase();
    
//     console.log("Looking for user:", { nicNumber: id, mobileNumber: mobile });
    
//     // Find user with case-insensitive NIC search
//     const user = await Applicant.findOne({ 
//       nicNumber: { $regex: new RegExp(`^${id}$`, 'i') },
//       mobileNumber: mobile
//     });
    
//     console.log("User found:", user ? "Yes" : "No");
    
//     if (user) {
//       // Generate OTP (6 digits)
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Store OTP with expiration (5 minutes)
//       otpStore[mobile] = {
//         otp,
//         expires: Date.now() + 5 * 60 * 1000
//       };
      
//       console.log(`📩 OTP for ${mobile}: ${otp}`);
      
//       return res.json({ 
//         success: true, 
//         message: "OTP sent to your mobile number",
//         user: {
//           nameWithInitials: user.nameWithInitials,
//           fullNameEnglish: user.fullNameEnglish,
//           nicNumber: user.nicNumber,
//           mobileNumber: user.mobileNumber
//         }
//       });
//     } else {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Invalid NIC or mobile number. Please check your credentials." 
//       });
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again." 
//     });
//   }
// });

// // Verify OTP API
// app.post("/api/verify-otp", (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
    
//     if (!mobile || !otp) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Mobile number and OTP are required" 
//       });
//     }
    
//     const storedOtpData = otpStore[mobile];
    
//     if (storedOtpData && storedOtpData.expires > Date.now()) {
//       if (storedOtpData.otp === otp) {
//         delete otpStore[mobile];
//         return res.json({ 
//           success: true, 
//           message: "OTP verified successfully"
//         });
//       } else {
//         return res.status(401).json({ 
//           success: false, 
//           message: "Invalid OTP" 
//         });
//       }
//     } else {
//       return res.status(401).json({ 
//         success: false, 
//         message: "OTP has expired or is invalid" 
//       });
//     }
//   } catch (err) {
//     console.error("OTP verification error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user profile
// app.get("/api/profile/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await Applicant.findOne({ mobileNumber: mobile });
    
//     if (user) {
//       res.json({ success: true, user });
//     } else {
//       res.status(404).json({ success: false, message: "User not found" });
//     }
//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user applications
// app.get("/api/applications/:mobile", (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     // Mock data - replace with actual database queries
//     const applications = [
//       {
//         id: "PCC001235",
//         date: "2025-08-27",
//         reason: "Local Job",
//         status: "pending"
//       },
//       {
//         id: "PCC001234",
//         date: "2024-05-15",
//         reason: "Higher Education",
//         status: "approved"
//       }
//     ];
    
//     res.json({ success: true, applications });
//   } catch (err) {
//     console.error("Applications fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Submit new application
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData } = req.body;
    
//     // In a real app, save to database
//     const appId = 'PCC' + Math.floor(100000 + Math.random() * 900000);
    
//     res.json({ 
//       success: true, 
//       message: "Application submitted successfully",
//       applicationId: appId
//     });
//   } catch (err) {
//     console.error("Application submission error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ 
//     success: true, 
//     message: "Server is running", 
//     timestamp: new Date().toISOString() 
//   });
// });

// // Clean up expired OTPs
// setInterval(() => {
//   const now = Date.now();
//   for (const mobile in otpStore) {
//     if (otpStore[mobile].expires < now) {
//       delete otpStore[mobile];
//     }
//   }
// }, 60 * 60 * 1000);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
//----------------

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Applicant Schema
// const applicantSchema = new mongoose.Schema({
//   nameWithInitials: String,
//   fullNameEnglish: String,
//   nicNumber: String,
//   dateOfBirth: String,
//   permanentAddress: String,
//   policeDivision: String,
//   gnDivision: String,
//   mobileNumber: String,
//   email: String,
//   applications: [{
//     applicationId: String,
//     submissionDate: Date,
//     reason: String,
//     fromDate: String,
//     toDate: String,
//     status: String,
//     policeDivision: String,
//     gnDivision: String,
//     documents: Object,
//     timeline: Array
//   }]
// });

// const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// // Application Schema for PCC System
// const applicationSchema = new mongoose.Schema({
//   applicationId: String,
//   applicantId: String,
//   nicNumber: String,
//   mobileNumber: String,
//   nameWithInitials: String,
//   fullNameEnglish: String,
//   submissionDate: Date,
//   reason: String,
//   fromDate: String,
//   toDate: String,
//   status: String,
//   policeDivision: String,
//   gnDivision: String,
//   documents: Object,
//   timeline: Array
// });

// // Police Division Schema
// const policeDivisionSchema = new mongoose.Schema({
//   divisionName: String,
//   applications: [applicationSchema]
// });

// // Create connections to different databases
// const nicDemoConn = mongoose.createConnection(MONGODB_URI);
// const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));

// const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
// const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
// const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");

// let otpStore = {};

// // Connect to MongoDB
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("✅ MongoDB connected successfully"))
// .catch(err => {
//   console.error("❌ MongoDB connection error:", err);
//   process.exit(1);
// });

// // Login API
// app.post("/api/login", async (req, res) => {
//   try {
//     let { id, mobile } = req.body;
    
//     if (!id || !mobile) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "NIC and mobile number are required" 
//       });
//     }
    
//     // Normalize NIC to uppercase for comparison
//     id = id.toUpperCase();
    
//     console.log("Looking for user:", { nicNumber: id, mobileNumber: mobile });
    
//     // Find user with case-insensitive NIC search
//     const user = await ApplicantModel.findOne({ 
//       nicNumber: { $regex: new RegExp(`^${id}$`, 'i') },
//       mobileNumber: mobile
//     });
    
//     console.log("User found:", user ? "Yes" : "No");
    
//     if (user) {
//       // Generate OTP (6 digits)
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Store OTP with expiration (5 minutes)
//       otpStore[mobile] = {
//         otp,
//         expires: Date.now() + 5 * 60 * 1000
//       };
      
//       console.log(`📩 OTP for ${mobile}: ${otp}`);
      
//       return res.json({ 
//         success: true, 
//         message: "OTP sent to your mobile number",
//         user: {
//           nameWithInitials: user.nameWithInitials,
//           fullNameEnglish: user.fullNameEnglish,
//           nicNumber: user.nicNumber,
//           mobileNumber: user.mobileNumber,
//           dateOfBirth: user.dateOfBirth,
//           permanentAddress: user.permanentAddress,
//           policeDivision: user.policeDivision,
//           gnDivision: user.gnDivision,
//           email: user.email
//         }
//       });
//     } else {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Invalid NIC or mobile number. Please check your credentials." 
//       });
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again." 
//     });
//   }
// });

// // Verify OTP API
// app.post("/api/verify-otp", (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
    
//     if (!mobile || !otp) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Mobile number and OTP are required" 
//       });
//     }
    
//     const storedOtpData = otpStore[mobile];
    
//     if (storedOtpData && storedOtpData.expires > Date.now()) {
//       if (storedOtpData.otp === otp) {
//         delete otpStore[mobile];
//         return res.json({ 
//           success: true, 
//           message: "OTP verified successfully"
//         });
//       } else {
//         return res.status(401).json({ 
//           success: false, 
//           message: "Invalid OTP" 
//         });
//       }
//     } else {
//       return res.status(401).json({ 
//         success: false, 
//         message: "OTP has expired or is invalid" 
//       });
//     }
//   } catch (err) {
//     console.error("OTP verification error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user profile
// app.get("/api/profile/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (user) {
//       res.json({ success: true, user });
//     } else {
//       res.status(404).json({ success: false, message: "User not found" });
//     }
//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user applications
// app.get("/api/applications/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     res.json({ success: true, applications: user.applications || [] });
//   } catch (err) {
//     console.error("Applications fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get application status
// app.get("/api/application/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     // Check in PCC system database
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (application) {
//       res.json({ success: true, application });
//     } else {
//       res.status(404).json({ success: false, message: "Application not found" });
//     }
//   } catch (err) {
//     console.error("Application fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Submit new application
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData } = req.body;
    
//     // Find user
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Generate application ID
//     const appId = 'PCC' + Math.floor(100000 + Math.random() * 900000);
//     const submissionDate = new Date();
    
//     // Create application object
//     const application = {
//       applicationId: appId,
//       applicantId: user._id,
//       nicNumber: user.nicNumber,
//       mobileNumber: user.mobileNumber,
//       nameWithInitials: user.nameWithInitials,
//       fullNameEnglish: user.fullNameEnglish,
//       submissionDate: submissionDate,
//       reason: applicationData.reason,
//       fromDate: applicationData.fromDate,
//       toDate: applicationData.toDate,
//       status: "pending",
//       policeDivision: applicationData.policeDivision,
//       gnDivision: applicationData.gnDivision,
//       documents: applicationData.documents,
//       timeline: [
//         { 
//           step: "Submitted", 
//           date: submissionDate, 
//           completed: true,
//           description: "Application submitted successfully"
//         }
//       ]
//     };
    
//     // Save to PCC system database
//     const newApplication = new ApplicationModel(application);
//     await newApplication.save();
    
//     // Add to police division
//     await PoliceDivisionModel.findOneAndUpdate(
//       { divisionName: applicationData.policeDivision },
//       { $push: { applications: application } },
//       { upsert: true, new: true }
//     );
    
//     // Add to user's applications
//     user.applications.push(application);
//     await user.save();
    
//     // Log notification
//     const notification = {
//       type: "application_submitted",
//       message: `Application #${appId} submitted and sent to ${applicationData.policeDivision} Police Division`,
//       timestamp: new Date(),
//       applicationId: appId,
//       policeDivision: applicationData.policeDivision
//     };
    
//     console.log("📋 Application Notification:", notification);
    
//     res.json({ 
//       success: true, 
//       message: "Application submitted successfully",
//       applicationId: appId,
//       notification: notification
//     });
//   } catch (err) {
//     console.error("Application submission error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get dashboard data
// app.get("/api/dashboard/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Get recent applications (last 5)
//     const recentApplications = user.applications
//       ? user.applications.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)).slice(0, 5)
//       : [];
    
//     // Generate notifications
//     const notifications = [];
    
//     if (recentApplications.length > 0) {
//       recentApplications.forEach(app => {
//         if (app.status === "pending") {
//           notifications.push({
//             type: "application_update",
//             message: `Your PCC application #${app.applicationId} is currently being reviewed by the assigned officer.`,
//             timestamp: new Date(),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "approved") {
//           notifications.push({
//             type: "certificate_ready",
//             message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
//             timestamp: new Date(),
//             applicationId: app.applicationId
//           });
//         }
//       });
//     }
    
//     res.json({ 
//       success: true, 
//       applications: recentApplications,
//       notifications: notifications,
//       applicationsThisMonth: user.applications ? user.applications.filter(app => {
//         const appDate = new Date(app.submissionDate);
//         const now = new Date();
//         return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
//       }).length : 0
//     });
//   } catch (err) {
//     console.error("Dashboard fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ 
//     success: true, 
//     message: "Server is running", 
//     timestamp: new Date().toISOString() 
//   });
// });

// // Clean up expired OTPs
// setInterval(() => {
//   const now = Date.now();
//   for (const mobile in otpStore) {
//     if (otpStore[mobile].expires < now) {
//       delete otpStore[mobile];
//     }
//   }
// }, 60 * 60 * 1000);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
//-----------------------

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Applicant Schema
// const applicantSchema = new mongoose.Schema({
//   nameWithInitials: String,
//   fullNameEnglish: String,
//   nicNumber: String,
//   dateOfBirth: String,
//   permanentAddress: String,
//   policeDivision: String,
//   gnDivision: String,
//   mobileNumber: String,
//   email: String,
//   applications: [{
//     applicationId: String,
//     submissionDate: Date,
//     reason: String,
//     reasonText: String,
//     fromDate: String,
//     toDate: String,
//     status: String,
//     policeDivision: String,
//     gnDivision: String,
//     documents: Object,
//     timeline: Array
//   }]
// });

// const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// // Application Schema for PCC System
// const applicationSchema = new mongoose.Schema({
//   applicationId: String,
//   applicantId: String,
//   nicNumber: String,
//   mobileNumber: String,
//   nameWithInitials: String,
//   fullNameEnglish: String,
//   submissionDate: Date,
//   reason: String,
//   reasonText: String,
//   fromDate: String,
//   toDate: String,
//   status: String,
//   policeDivision: String,
//   gnDivision: String,
//   documents: Object,
//   timeline: Array
// });

// // Police Division Schema
// const policeDivisionSchema = new mongoose.Schema({
//   divisionName: String,
//   applications: [applicationSchema]
// });

// // Create connections to different databases
// const nicDemoConn = mongoose.createConnection(MONGODB_URI);
// const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));

// const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
// const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
// const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");

// let otpStore = {};

// // Connect to MongoDB
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("✅ MongoDB connected successfully"))
// .catch(err => {
//   console.error("❌ MongoDB connection error:", err);
//   process.exit(1);
// });

// // Login API
// app.post("/api/login", async (req, res) => {
//   try {
//     let { id, mobile } = req.body;
    
//     if (!id || !mobile) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "NIC and mobile number are required" 
//       });
//     }
    
//     // Normalize NIC to uppercase for comparison
//     id = id.toUpperCase();
    
//     console.log("Looking for user:", { nicNumber: id, mobileNumber: mobile });
    
//     // Find user with case-insensitive NIC search
//     const user = await ApplicantModel.findOne({ 
//       nicNumber: { $regex: new RegExp(`^${id}$`, 'i') },
//       mobileNumber: mobile
//     });
    
//     console.log("User found:", user ? "Yes" : "No");
    
//     if (user) {
//       // Generate OTP (6 digits)
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
//       // Store OTP with expiration (5 minutes)
//       otpStore[mobile] = {
//         otp,
//         expires: Date.now() + 5 * 60 * 1000
//       };
      
//       console.log(`📩 OTP for ${mobile}: ${otp}`);
      
//       return res.json({ 
//         success: true, 
//         message: "OTP sent to your mobile number",
//         user: {
//           nameWithInitials: user.nameWithInitials,
//           fullNameEnglish: user.fullNameEnglish,
//           nicNumber: user.nicNumber,
//           mobileNumber: user.mobileNumber,
//           dateOfBirth: user.dateOfBirth,
//           permanentAddress: user.permanentAddress,
//           policeDivision: user.policeDivision,
//           gnDivision: user.gnDivision,
//           email: user.email
//         }
//       });
//     } else {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Invalid NIC or mobile number. Please check your credentials." 
//       });
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again." 
//     });
//   }
// });

// // Verify OTP API
// app.post("/api/verify-otp", (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
    
//     if (!mobile || !otp) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Mobile number and OTP are required" 
//       });
//     }
    
//     const storedOtpData = otpStore[mobile];
    
//     if (storedOtpData && storedOtpData.expires > Date.now()) {
//       if (storedOtpData.otp === otp) {
//         delete otpStore[mobile];
//         return res.json({ 
//           success: true, 
//           message: "OTP verified successfully"
//         });
//       } else {
//         return res.status(401).json({ 
//           success: false, 
//           message: "Invalid OTP" 
//         });
//       }
//     } else {
//       return res.status(401).json({ 
//         success: false, 
//         message: "OTP has expired or is invalid" 
//       });
//     }
//   } catch (err) {
//     console.error("OTP verification error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user profile
// app.get("/api/profile/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (user) {
//       res.json({ success: true, user });
//     } else {
//       res.status(404).json({ success: false, message: "User not found" });
//     }
//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get user applications
// app.get("/api/applications/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     res.json({ success: true, applications: user.applications || [] });
//   } catch (err) {
//     console.error("Applications fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get application status
// app.get("/api/application/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     // Check in PCC system database
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (application) {
//       res.json({ success: true, application });
//     } else {
//       res.status(404).json({ success: false, message: "Application not found" });
//     }
//   } catch (err) {
//     console.error("Application fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Submit new application
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData } = req.body;
    
//     // Find user
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Check application limit
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       const appDate = new Date(app.submissionDate);
//       const now = new Date();
//       return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
//     }).length : 0;
    
//     if (applicationsThisMonth >= 2) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "You have reached the maximum of 2 applications this month. Please try again next month." 
//       });
//     }
    
//     // Generate application ID
//     const appId = 'PCC' + Math.floor(100000 + Math.random() * 900000);
//     const submissionDate = new Date();
    
//     // Reason display mapping
//     const reasonDisplayNames = {
//       "local_job": "Local Job (Employment within Sri Lanka)",
//       "higher_education": "Higher Education (Local or Abroad)",
//       "work_contract": "Work Contracts / Volunteering",
//       "legal_matters": "Legal Matters",
//       "adoption": "Adoption Process"
//     };
    
//     // Create application object
//     const application = {
//       applicationId: appId,
//       applicantId: user._id,
//       nicNumber: user.nicNumber,
//       mobileNumber: user.mobileNumber,
//       nameWithInitials: user.nameWithInitials,
//       fullNameEnglish: user.fullNameEnglish,
//       submissionDate: submissionDate,
//       reason: applicationData.reason,
//       reasonText: reasonDisplayNames[applicationData.reason] || applicationData.reason,
//       fromDate: applicationData.fromDate,
//       toDate: applicationData.toDate,
//       status: "pending",
//       policeDivision: applicationData.policeDivision,
//       gnDivision: applicationData.gnDivision,
//       documents: applicationData.documents,
//       timeline: [
//         { 
//           step: "Submitted", 
//           date: submissionDate, 
//           completed: true,
//           description: "Application submitted successfully"
//         }
//       ]
//     };
    
//     // Save to PCC system database
//     const newApplication = new ApplicationModel(application);
//     await newApplication.save();
    
//     // Add to police division
//     await PoliceDivisionModel.findOneAndUpdate(
//       { divisionName: applicationData.policeDivision },
//       { $push: { applications: application } },
//       { upsert: true, new: true }
//     );
    
//     // Add to user's applications
//     if (!user.applications) {
//       user.applications = [];
//     }
//     user.applications.push(application);
//     await user.save();
    
//     // Log notification
//     const notification = {
//       type: "application_submitted",
//       message: `Application #${appId} submitted and sent to ${applicationData.policeDivision} Police Division`,
//       timestamp: new Date(),
//       applicationId: appId,
//       policeDivision: applicationData.policeDivision
//     };
    
//     console.log("📋 Application Notification:", notification);
    
//     res.json({ 
//       success: true, 
//       message: "Application submitted successfully",
//       applicationId: appId,
//       notification: notification
//     });
//   } catch (err) {
//     console.error("Application submission error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get dashboard data
// app.get("/api/dashboard/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
    
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Get recent applications (last 5)
//     const recentApplications = user.applications
//       ? user.applications.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)).slice(0, 5)
//       : [];
    
//     // Generate notifications
//     const notifications = [];
    
//     if (recentApplications.length > 0) {
//       recentApplications.forEach(app => {
//         if (app.status === "pending") {
//           notifications.push({
//             type: "application_update",
//             message: `Your PCC application #${app.applicationId} is currently being reviewed by the assigned officer.`,
//             timestamp: new Date(),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "approved") {
//           notifications.push({
//             type: "certificate_ready",
//             message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
//             timestamp: new Date(),
//             applicationId: app.applicationId
//           });
//         }
//       });
//     }
    
//     // Calculate applications this month
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       const appDate = new Date(app.submissionDate);
//       const now = new Date();
//       return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
//     }).length : 0;
    
//     res.json({ 
//       success: true, 
//       applications: recentApplications,
//       notifications: notifications,
//       applicationsThisMonth: applicationsThisMonth
//     });
//   } catch (err) {
//     console.error("Dashboard fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Get police divisions
// app.get("/api/police-divisions", async (req, res) => {
//   try {
//     const divisions = await PoliceDivisionModel.find({}, 'divisionName');
//     res.json({ success: true, divisions });
//   } catch (err) {
//     console.error("Police divisions fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ 
//     success: true, 
//     message: "Server is running", 
//     timestamp: new Date().toISOString() 
//   });
// });

// // Clean up expired OTPs
// setInterval(() => {
//   const now = Date.now();
//   for (const mobile in otpStore) {
//     if (otpStore[mobile].expires < now) {
//       delete otpStore[mobile];
//     }
//   }
// }, 60 * 60 * 1000);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and DOC files are allowed'));
    }
  }
});

// Applicant Schema
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

const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// Application Schema for PCC System
const applicationSchema = new mongoose.Schema({
  applicationId: String,
  applicantId: String,
  nicNumber: String,
  mobileNumber: String,
  nameWithInitials: String,
  fullNameEnglish: String,
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
});

// Police Division Schema
const policeDivisionSchema = new mongoose.Schema({
  divisionName: String,
  applications: [applicationSchema]
});

// Document Schema for storing file metadata
const documentSchema = new mongoose.Schema({
  applicationId: String,
  fileName: String,
  originalName: String,
  filePath: String,
  fileType: String,
  fileSize: Number,
  uploadDate: Date,
  documentType: String // nic, birthCert, gnCert, supportLetter
});

// Create connections to different databases
const nicDemoConn = mongoose.createConnection(MONGODB_URI);
const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));

const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");
const DocumentModel = pccSystemConn.model("Document", documentSchema, "documents");

let otpStore = {};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    let { id, mobile } = req.body;
    
    if (!id || !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: "NIC and mobile number are required" 
      });
    }
    
    // Normalize NIC to uppercase for comparison
    id = id.toUpperCase();
    
    console.log("Looking for user:", { nicNumber: id, mobileNumber: mobile });
    
    // Find user with case-insensitive NIC search
    const user = await ApplicantModel.findOne({ 
      nicNumber: { $regex: new RegExp(`^${id}$`, 'i') },
      mobileNumber: mobile
    });
    
    console.log("User found:", user ? "Yes" : "No");
    
    if (user) {
      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (5 minutes)
      otpStore[mobile] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000
      };
      
      console.log(`📩 OTP for ${mobile}: ${otp}`);
      
      return res.json({ 
        success: true, 
        message: "OTP sent to your mobile number",
        user: {
          nameWithInitials: user.nameWithInitials,
          fullNameEnglish: user.fullNameEnglish,
          nicNumber: user.nicNumber,
          mobileNumber: user.mobileNumber,
          dateOfBirth: user.dateOfBirth,
          permanentAddress: user.permanentAddress,
          policeDivision: user.policeDivision,
          gnDivision: user.gnDivision,
          email: user.email
        }
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid NIC or mobile number. Please check your credentials." 
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
});

// Verify OTP API
app.post("/api/verify-otp", (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Mobile number and OTP are required" 
      });
    }
    
    const storedOtpData = otpStore[mobile];
    
    if (storedOtpData && storedOtpData.expires > Date.now()) {
      if (storedOtpData.otp === otp) {
        delete otpStore[mobile];
        return res.json({ 
          success: true, 
          message: "OTP verified successfully"
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid OTP" 
        });
      }
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "OTP has expired or is invalid" 
      });
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get user profile
app.get("/api/profile/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get user applications
app.get("/api/applications/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, applications: user.applications || [] });
  } catch (err) {
    console.error("Applications fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get application status
app.get("/api/application/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    
    // Check in PCC system database
    const application = await ApplicationModel.findOne({ applicationId: appId });
    
    if (application) {
      res.json({ success: true, application });
    } else {
      res.status(404).json({ success: false, message: "Application not found" });
    }
  } catch (err) {
    console.error("Application fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Upload documents endpoint
app.post("/api/upload", upload.fields([
  { name: 'nic', maxCount: 1 },
  { name: 'birthCert', maxCount: 1 },
  { name: 'gnCert', maxCount: 1 },
  { name: 'supportLetter', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = {};

    if (files.nic) {
      uploadedFiles.nic = {
        fileName: files.nic[0].filename,
        originalName: files.nic[0].originalname,
        filePath: files.nic[0].path,
        fileType: files.nic[0].mimetype,
        fileSize: files.nic[0].size
      };
    }

    if (files.birthCert) {
      uploadedFiles.birthCert = {
        fileName: files.birthCert[0].filename,
        originalName: files.birthCert[0].originalname,
        filePath: files.birthCert[0].path,
        fileType: files.birthCert[0].mimetype,
        fileSize: files.birthCert[0].size
      };
    }

    if (files.gnCert) {
      uploadedFiles.gnCert = {
        fileName: files.gnCert[0].filename,
        originalName: files.gnCert[0].originalname,
        filePath: files.gnCert[0].path,
        fileType: files.gnCert[0].mimetype,
        fileSize: files.gnCert[0].size
      };
    }

    if (files.supportLetter) {
      uploadedFiles.supportLetter = {
        fileName: files.supportLetter[0].filename,
        originalName: files.supportLetter[0].originalname,
        filePath: files.supportLetter[0].path,
        fileType: files.supportLetter[0].mimetype,
        fileSize: files.supportLetter[0].size
      };
    }

    res.json({ 
      success: true, 
      message: "Files uploaded successfully",
      files: uploadedFiles
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ 
      success: false, 
      message: "File upload failed. Please try again." 
    });
  }
});

// Submit new application
app.post("/api/application", async (req, res) => {
  try {
    const { mobile, applicationData, uploadedFiles } = req.body;
    
    // Find user
    const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Check application limit
    const now = new Date();
    const applicationsThisMonth = user.applications ? user.applications.filter(app => {
      if (!app.submissionDate) return false;
      const appDate = new Date(app.submissionDate);
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length : 0;
    
    if (applicationsThisMonth >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: "You have reached the maximum of 2 applications this month. Please try again next month." 
      });
    }
    
    // Generate application ID
    const appId = 'PCC' + Math.floor(100000 + Math.random() * 900000);
    const submissionDate = new Date();
    
    // Reason display mapping
    const reasonDisplayNames = {
      "local_job": "Local Job (Employment within Sri Lanka)",
      "higher_education": "Higher Education (Local or Abroad)",
      "work_contract": "Work Contracts / Volunteering",
      "legal_matters": "Legal Matters",
      "adoption": "Adoption Process"
    };
    
    // Create application object
    const application = {
      applicationId: appId,
      applicantId: user._id,
      nicNumber: user.nicNumber,
      mobileNumber: user.mobileNumber,
      nameWithInitials: user.nameWithInitials,
      fullNameEnglish: user.fullNameEnglish,
      submissionDate: submissionDate,
      reason: applicationData.reason,
      reasonText: reasonDisplayNames[applicationData.reason] || applicationData.reason,
      fromDate: applicationData.fromDate,
      toDate: applicationData.toDate,
      status: "pending",
      policeDivision: applicationData.policeDivision,
      gnDivision: applicationData.gnDivision,
      documents: uploadedFiles,
      timeline: [
        { 
          step: "Submitted", 
          date: submissionDate, 
          completed: true,
          description: "Application submitted successfully"
        }
      ]
    };
    
    // Save documents to database
    if (uploadedFiles.nic) {
      const nicDoc = new DocumentModel({
        applicationId: appId,
        fileName: uploadedFiles.nic.fileName,
        originalName: uploadedFiles.nic.originalName,
        filePath: uploadedFiles.nic.filePath,
        fileType: uploadedFiles.nic.fileType,
        fileSize: uploadedFiles.nic.fileSize,
        uploadDate: submissionDate,
        documentType: 'nic'
      });
      await nicDoc.save();
    }
    
    if (uploadedFiles.birthCert) {
      const birthCertDoc = new DocumentModel({
        applicationId: appId,
        fileName: uploadedFiles.birthCert.fileName,
        originalName: uploadedFiles.birthCert.originalName,
        filePath: uploadedFiles.birthCert.filePath,
        fileType: uploadedFiles.birthCert.fileType,
        fileSize: uploadedFiles.birthCert.fileSize,
        uploadDate: submissionDate,
        documentType: 'birthCert'
      });
      await birthCertDoc.save();
    }
    
    if (uploadedFiles.gnCert) {
      const gnCertDoc = new DocumentModel({
        applicationId: appId,
        fileName: uploadedFiles.gnCert.fileName,
        originalName: uploadedFiles.gnCert.originalName,
        filePath: uploadedFiles.gnCert.filePath,
        fileType: uploadedFiles.gnCert.fileType,
        fileSize: uploadedFiles.gnCert.fileSize,
        uploadDate: submissionDate,
        documentType: 'gnCert'
      });
      await gnCertDoc.save();
    }
    
    if (uploadedFiles.supportLetter) {
      const supportLetterDoc = new DocumentModel({
        applicationId: appId,
        fileName: uploadedFiles.supportLetter.fileName,
        originalName: uploadedFiles.supportLetter.originalName,
        filePath: uploadedFiles.supportLetter.filePath,
        fileType: uploadedFiles.supportLetter.fileType,
        fileSize: uploadedFiles.supportLetter.fileSize,
        uploadDate: submissionDate,
        documentType: 'supportLetter'
      });
      await supportLetterDoc.save();
    }
    
    // Save to PCC system database
    const newApplication = new ApplicationModel(application);
    await newApplication.save();
    
    // Add to police division
    await PoliceDivisionModel.findOneAndUpdate(
      { divisionName: applicationData.policeDivision },
      { $push: { applications: application } },
      { upsert: true, new: true }
    );
    
    // Add to user's applications
    if (!user.applications) {
      user.applications = [];
    }
    user.applications.push(application);
    await user.save();
    
    // Log notification
    const notification = {
      type: "application_submitted",
      message: `Application #${appId} submitted and sent to ${applicationData.policeDivision} Police Division`,
      timestamp: new Date(),
      applicationId: appId,
      policeDivision: applicationData.policeDivision
    };
    
    console.log("📋 Application Notification:", notification);
    console.log("📁 Files uploaded:", Object.keys(uploadedFiles).length);
    
    res.json({ 
      success: true, 
      message: "Application submitted successfully",
      applicationId: appId,
      notification: notification
    });
  } catch (err) {
    console.error("Application submission error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get application documents
app.get("/api/documents/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    
    const documents = await DocumentModel.find({ applicationId: appId });
    
    res.json({ success: true, documents });
  } catch (err) {
    console.error("Documents fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get dashboard data
app.get("/api/dashboard/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Get recent applications (last 5)
    const recentApplications = user.applications
      ? user.applications.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)).slice(0, 5)
      : [];
    
    // Generate notifications
    const notifications = [];
    
    if (recentApplications.length > 0) {
      recentApplications.forEach(app => {
        if (app.status === "pending") {
          notifications.push({
            type: "application_update",
            message: `Your PCC application #${app.applicationId} is currently being reviewed by the assigned officer.`,
            timestamp: new Date(),
            applicationId: app.applicationId
          });
        } else if (app.status === "approved") {
          notifications.push({
            type: "certificate_ready",
            message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
            timestamp: new Date(),
            applicationId: app.applicationId
          });
        }
      });
    }
    
    // Calculate applications this month - FIXED VERSION
    const now = new Date();
    const applicationsThisMonth = user.applications ? user.applications.filter(app => {
      if (!app.submissionDate) return false;
      
      const appDate = new Date(app.submissionDate);
      return appDate.getMonth() === now.getMonth() && 
             appDate.getFullYear() === now.getFullYear();
    }).length : 0;
    
    res.json({ 
      success: true, 
      applications: recentApplications,
      notifications: notifications,
      applicationsThisMonth: applicationsThisMonth
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Get police divisions
app.get("/api/police-divisions", async (req, res) => {
  try {
    const divisions = await PoliceDivisionModel.find({}, 'divisionName');
    res.json({ success: true, divisions });
  } catch (err) {
    console.error("Police divisions fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString() 
  });
});

// Clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const mobile in otpStore) {
    if (otpStore[mobile].expires < now) {
      delete otpStore[mobile];
    }
  }
}, 60 * 60 * 1000);


// Add to your existing server.js

// Get application status with detailed timeline
app.get("/api/application-status/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    
    // Check in PCC system database
    const application = await ApplicationModel.findOne({ applicationId: appId });
    
    if (application) {
      res.json({ 
        success: true, 
        application,
        // Generate detailed status information
        statusInfo: generateStatusInfo(application)
      });
    } else {
      res.status(404).json({ success: false, message: "Application not found" });
    }
  } catch (err) {
    console.error("Application status fetch error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Update application status (for police use)
app.post("/api/update-application-status", async (req, res) => {
  try {
    const { appId, status, step, officer, description } = req.body;
    
    const application = await ApplicationModel.findOne({ applicationId: appId });
    
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    
    // Update status
    if (status) {
      application.status = status;
    }
    
    // Add to timeline
    const newTimelineEntry = {
      step: step || status,
      date: new Date(),
      completed: true,
      officer: officer || null,
      description: description || `${step || status} completed`
    };
    
    if (!application.timeline) {
      application.timeline = [];
    }
    
    application.timeline.push(newTimelineEntry);
    
    // Update in all locations
    await application.save();
    
    // Update in police division
    await PoliceDivisionModel.updateOne(
      { "applications.applicationId": appId },
      { 
        $set: { 
          "applications.$.status": application.status,
          "applications.$.timeline": application.timeline
        } 
      }
    );
    
    // Update in applicant record
    await ApplicantModel.updateOne(
      { "applications.applicationId": appId },
      { 
        $set: { 
          "applications.$.status": application.status,
          "applications.$.timeline": application.timeline
        } 
      }
    );
    
    res.json({ 
      success: true, 
      message: "Application status updated successfully",
      application 
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later." 
    });
  }
});

// Helper function to generate status information
function generateStatusInfo(application) {
  const statusMessages = {
    "pending": {
      title: "Under Review",
      description: "Your application is being processed",
      color: "#f39c12",
      icon: "⏳"
    },
    "approved": {
      title: "Approved",
      description: "Your application has been approved",
      color: "#27ae60",
      icon: "✅"
    },
    "rejected": {
      title: "Rejected",
      description: "Your application has been rejected",
      color: "#e74c3c",
      icon: "❌"
    },
    "processing": {
      title: "Processing",
      description: "Your application is being processed",
      color: "#3498db",
      icon: "⚙️"
    }
  };
  
  const currentStatus = application.status || "pending";
  const statusInfo = statusMessages[currentStatus];
  
  return {
    currentStatus,
    title: statusInfo.title,
    description: statusInfo.description,
    color: statusInfo.color,
    icon: statusInfo.icon,
    lastUpdated: application.timeline && application.timeline.length > 0 
      ? application.timeline[application.timeline.length - 1].date 
      : application.submissionDate
  };
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});