// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024 // 2MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only images, PDFs, and DOC files are allowed'));
//     }
//   }
// });

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

// // Document Schema for storing file metadata
// const documentSchema = new mongoose.Schema({
//   applicationId: String,
//   fileName: String,
//   originalName: String,
//   filePath: String,
//   fileType: String,
//   fileSize: Number,
//   uploadDate: Date,
//   documentType: String // nic, birthCert, gnCert, supportLetter
// });

// // Create connections to different databases
// const nicDemoConn = mongoose.createConnection(MONGODB_URI);
// const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));

// const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
// const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
// const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");
// const DocumentModel = pccSystemConn.model("Document", documentSchema, "documents");

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

// // Upload documents endpoint
// app.post("/api/upload", upload.fields([
//   { name: 'nic', maxCount: 1 },
//   { name: 'birthCert', maxCount: 1 },
//   { name: 'gnCert', maxCount: 1 },
//   { name: 'supportLetter', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const files = req.files;
//     const uploadedFiles = {};

//     if (files.nic) {
//       uploadedFiles.nic = {
//         fileName: files.nic[0].filename,
//         originalName: files.nic[0].originalname,
//         filePath: files.nic[0].path,
//         fileType: files.nic[0].mimetype,
//         fileSize: files.nic[0].size
//       };
//     }

//     if (files.birthCert) {
//       uploadedFiles.birthCert = {
//         fileName: files.birthCert[0].filename,
//         originalName: files.birthCert[0].originalname,
//         filePath: files.birthCert[0].path,
//         fileType: files.birthCert[0].mimetype,
//         fileSize: files.birthCert[0].size
//       };
//     }

//     if (files.gnCert) {
//       uploadedFiles.gnCert = {
//         fileName: files.gnCert[0].filename,
//         originalName: files.gnCert[0].originalname,
//         filePath: files.gnCert[0].path,
//         fileType: files.gnCert[0].mimetype,
//         fileSize: files.gnCert[0].size
//       };
//     }

//     if (files.supportLetter) {
//       uploadedFiles.supportLetter = {
//         fileName: files.supportLetter[0].filename,
//         originalName: files.supportLetter[0].originalname,
//         filePath: files.supportLetter[0].path,
//         fileType: files.supportLetter[0].mimetype,
//         fileSize: files.supportLetter[0].size
//       };
//     }

//     res.json({ 
//       success: true, 
//       message: "Files uploaded successfully",
//       files: uploadedFiles
//     });
//   } catch (err) {
//     console.error("File upload error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "File upload failed. Please try again." 
//     });
//   }
// });

// // Submit new application
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData, uploadedFiles } = req.body;
    
//     // Find user
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Check application limit
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
//       const appDate = new Date(app.submissionDate);
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
//       documents: uploadedFiles,
//       timeline: [
//         { 
//           step: "Submitted", 
//           date: submissionDate, 
//           completed: true,
//           description: "Application submitted successfully"
//         }
//       ]
//     };
    
//     // Save documents to database
//     if (uploadedFiles.nic) {
//       const nicDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.nic.fileName,
//         originalName: uploadedFiles.nic.originalName,
//         filePath: uploadedFiles.nic.filePath,
//         fileType: uploadedFiles.nic.fileType,
//         fileSize: uploadedFiles.nic.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'nic'
//       });
//       await nicDoc.save();
//     }
    
//     if (uploadedFiles.birthCert) {
//       const birthCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.birthCert.fileName,
//         originalName: uploadedFiles.birthCert.originalName,
//         filePath: uploadedFiles.birthCert.filePath,
//         fileType: uploadedFiles.birthCert.fileType,
//         fileSize: uploadedFiles.birthCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'birthCert'
//       });
//       await birthCertDoc.save();
//     }
    
//     if (uploadedFiles.gnCert) {
//       const gnCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.gnCert.fileName,
//         originalName: uploadedFiles.gnCert.originalName,
//         filePath: uploadedFiles.gnCert.filePath,
//         fileType: uploadedFiles.gnCert.fileType,
//         fileSize: uploadedFiles.gnCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'gnCert'
//       });
//       await gnCertDoc.save();
//     }
    
//     if (uploadedFiles.supportLetter) {
//       const supportLetterDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.supportLetter.fileName,
//         originalName: uploadedFiles.supportLetter.originalName,
//         filePath: uploadedFiles.supportLetter.filePath,
//         fileType: uploadedFiles.supportLetter.fileType,
//         fileSize: uploadedFiles.supportLetter.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'supportLetter'
//       });
//       await supportLetterDoc.save();
//     }
    
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
//     console.log("📁 Files uploaded:", Object.keys(uploadedFiles).length);
    
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

// // Get application documents
// app.get("/api/documents/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     const documents = await DocumentModel.find({ applicationId: appId });
    
//     res.json({ success: true, documents });
//   } catch (err) {
//     console.error("Documents fetch error:", err);
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
    
//     // Calculate applications this month - FIXED VERSION
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
      
//       const appDate = new Date(app.submissionDate);
//       return appDate.getMonth() === now.getMonth() && 
//              appDate.getFullYear() === now.getFullYear();
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


// // Add to your existing server.js

// // Get application status with detailed timeline
// app.get("/api/application-status/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     // Check in PCC system database
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (application) {
//       res.json({ 
//         success: true, 
//         application,
//         // Generate detailed status information
//         statusInfo: generateStatusInfo(application)
//       });
//     } else {
//       res.status(404).json({ success: false, message: "Application not found" });
//     }
//   } catch (err) {
//     console.error("Application status fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Update application status (for police use)
// app.post("/api/update-application-status", async (req, res) => {
//   try {
//     const { appId, status, step, officer, description } = req.body;
    
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (!application) {
//       return res.status(404).json({ success: false, message: "Application not found" });
//     }
    
//     // Update status
//     if (status) {
//       application.status = status;
//     }
    
//     // Add to timeline
//     const newTimelineEntry = {
//       step: step || status,
//       date: new Date(),
//       completed: true,
//       officer: officer || null,
//       description: description || `${step || status} completed`
//     };
    
//     if (!application.timeline) {
//       application.timeline = [];
//     }
    
//     application.timeline.push(newTimelineEntry);
    
//     // Update in all locations
//     await application.save();
    
//     // Update in police division
//     await PoliceDivisionModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     // Update in applicant record
//     await ApplicantModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     res.json({ 
//       success: true, 
//       message: "Application status updated successfully",
//       application 
//     });
//   } catch (err) {
//     console.error("Status update error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Helper function to generate status information
// function generateStatusInfo(application) {
//   const statusMessages = {
//     "pending": {
//       title: "Under Review",
//       description: "Your application is being processed",
//       color: "#f39c12",
//       icon: "⏳"
//     },
//     "approved": {
//       title: "Approved",
//       description: "Your application has been approved",
//       color: "#27ae60",
//       icon: "✅"
//     },
//     "rejected": {
//       title: "Rejected",
//       description: "Your application has been rejected",
//       color: "#e74c3c",
//       icon: "❌"
//     },
//     "processing": {
//       title: "Processing",
//       description: "Your application is being processed",
//       color: "#3498db",
//       icon: "⚙️"
//     }
//   };
  
//   const currentStatus = application.status || "pending";
//   const statusInfo = statusMessages[currentStatus];
  
//   return {
//     currentStatus,
//     title: statusInfo.title,
//     description: statusInfo.description,
//     color: statusInfo.color,
//     icon: statusInfo.icon,
//     lastUpdated: application.timeline && application.timeline.length > 0 
//       ? application.timeline[application.timeline.length - 1].date 
//       : application.submissionDate
//   };
// }

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });





// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Helper function to convert to Sri Lanka time (UTC+5:30)
// function convertToSriLankaTime(date) {
//   if (!date) return null;
  
//   // Convert to Sri Lanka time (UTC+5:30)
//   const options = {
//     timeZone: 'Asia/Colombo',
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   };
  
//   return new Date(date).toLocaleString('en-US', options);
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024 // 2MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only images, PDFs, and DOC files are allowed'));
//     }
//   }
// });

// // Applicant Schema - UPDATED with permanentAddress
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
//     permanentAddress: String, // Add this
//     deliveryMethod: String, // Add this
//     documents: Object,
//     timeline: Array
//   }]
// });

// const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// // Application Schema for PCC System - UPDATED with permanentAddress and deliveryMethod
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
//   permanentAddress: String, // Add this
//   deliveryMethod: String, // Add this
//   documents: Object,
//   timeline: Array
// });

// // Police Division Schema - UPDATED with permanentAddress and deliveryMethod
// const policeDivisionSchema = new mongoose.Schema({
//   divisionName: String,
//   applications: [applicationSchema]
// });

// // Document Schema for storing file metadata
// const documentSchema = new mongoose.Schema({
//   applicationId: String,
//   fileName: String,
//   originalName: String,
//   filePath: String,
//   fileType: String,
//   fileSize: Number,
//   uploadDate: Date,
//   documentType: String // nic, birthCert, gnCert, supportLetter
// });

// // Create connections to different databases
// const nicDemoConn = mongoose.createConnection(MONGODB_URI);
// const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));

// const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
// const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
// const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");
// const DocumentModel = pccSystemConn.model("Document", documentSchema, "documents");

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
//       message: "Invalid OTP" 
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
    
//     // Convert dates to Sri Lanka time for all applications
//     const applicationsWithLocalTime = user.applications ? user.applications.map(app => ({
//       ...app.toObject(),
//       submissionDate: convertToSriLankaTime(app.submissionDate),
//       // Convert timeline dates as well
//       timeline: app.timeline ? app.timeline.map(item => ({
//         ...item,
//         date: convertToSriLankaTime(item.date)
//       })) : []
//     })) : [];
    
//     res.json({ success: true, applications: applicationsWithLocalTime });
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
//       // Convert dates to Sri Lanka time
//       const applicationWithLocalTime = {
//         ...application.toObject(),
//         submissionDate: convertToSriLankaTime(application.submissionDate),
//         // Convert timeline dates as well
//         timeline: application.timeline ? application.timeline.map(item => ({
//           ...item,
//           date: convertToSriLankaTime(item.date)
//         })) : []
//       };
      
//       res.json({ success: true, application: applicationWithLocalTime });
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

// // Upload documents endpoint
// app.post("/api/upload", upload.fields([
//   { name: 'nic', maxCount: 1 },
//   { name: 'birthCert', maxCount: 1 },
//   { name: 'gnCert', maxCount: 1 },
//   { name: 'supportLetter', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const files = req.files;
//     const uploadedFiles = {};

//     if (files.nic) {
//       uploadedFiles.nic = {
//         fileName: files.nic[0].filename,
//         originalName: files.nic[0].originalname,
//         filePath: files.nic[0].path,
//         fileType: files.nic[0].mimetype,
//         fileSize: files.nic[0].size
//       };
//     }

//     if (files.birthCert) {
//       uploadedFiles.birthCert = {
//         fileName: files.birthCert[0].filename,
//         originalName: files.birthCert[0].originalname,
//         filePath: files.birthCert[0].path,
//         fileType: files.birthCert[0].mimetype,
//         fileSize: files.birthCert[0].size
//       };
//     }

//     if (files.gnCert) {
//       uploadedFiles.gnCert = {
//         fileName: files.gnCert[0].filename,
//         originalName: files.gnCert[0].originalname,
//         filePath: files.gnCert[0].path,
//         fileType: files.gnCert[0].mimetype,
//         fileSize: files.gnCert[0].size
//       };
//     }

//     if (files.supportLetter) {
//       uploadedFiles.supportLetter = {
//         fileName: files.supportLetter[0].filename,
//         originalName: files.supportLetter[0].originalname,
//         filePath: files.supportLetter[0].path,
//         fileType: files.supportLetter[0].mimetype,
//         fileSize: files.supportLetter[0].size
//       };
//     }

//     res.json({ 
//       success: true, 
//       message: "Files uploaded successfully",
//       files: uploadedFiles
//     });
//   } catch (err) {
//     console.error("File upload error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "File upload failed. Please try again." 
//     });
//   }
// });

// // Submit new application - UPDATED with permanentAddress and deliveryMethod
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData, uploadedFiles } = req.body;
    
//     // Find user
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Check application limit
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
//       const appDate = new Date(app.submissionDate);
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
    
//     // Create application object - UPDATED with permanentAddress and deliveryMethod
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
//       permanentAddress: applicationData.permanentAddress, // Add this
//       deliveryMethod: applicationData.deliveryMethod || "digital", // Add this (default to digital)
//       documents: uploadedFiles,
//       timeline: [
//         { 
//           step: "Submitted", 
//           date: submissionDate, 
//           completed: true,
//           description: "Application submitted successfully"
//         }
//       ]
//     };
    
//     // Save documents to database
//     if (uploadedFiles.nic) {
//       const nicDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.nic.fileName,
//         originalName: uploadedFiles.nic.originalName,
//         filePath: uploadedFiles.nic.filePath,
//         fileType: uploadedFiles.nic.fileType,
//         fileSize: uploadedFiles.nic.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'nic'
//       });
//       await nicDoc.save();
//     }
    
//     if (uploadedFiles.birthCert) {
//       const birthCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.birthCert.fileName,
//         originalName: uploadedFiles.birthCert.originalName,
//         filePath: uploadedFiles.birthCert.filePath,
//         fileType: uploadedFiles.birthCert.fileType,
//         fileSize: uploadedFiles.birthCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'birthCert'
//       });
//       await birthCertDoc.save();
//     }
    
//     if (uploadedFiles.gnCert) {
//       const gnCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.gnCert.fileName,
//         originalName: uploadedFiles.gnCert.originalName,
//         filePath: uploadedFiles.gnCert.filePath,
//         fileType: uploadedFiles.gnCert.fileType,
//         fileSize: uploadedFiles.gnCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'gnCert'
//       });
//       await gnCertDoc.save();
//     }
    
//     if (uploadedFiles.supportLetter) {
//       const supportLetterDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.supportLetter.fileName,
//         originalName: uploadedFiles.supportLetter.originalName,
//         filePath: uploadedFiles.supportLetter.filePath,
//         fileType: uploadedFiles.supportLetter.fileType,
//         fileSize: uploadedFiles.supportLetter.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'supportLetter'
//       });
//       await supportLetterDoc.save();
//     }
    
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
    
//     // Log notification with Sri Lanka time
//     const notification = {
//       type: "application_submitted",
//       message: `Application #${appId} submitted and sent to ${applicationData.policeDivision} Police Division`,
//       timestamp: convertToSriLankaTime(new Date()),
//       applicationId: appId,
//       policeDivision: applicationData.policeDivision
//     };
    
//     console.log("📋 Application Notification:", notification);
//     console.log("📁 Files uploaded:", Object.keys(uploadedFiles).length);
//     console.log("📦 Delivery Method:", applicationData.deliveryMethod || "digital");
    
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

// // Get application documents
// app.get("/api/documents/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     const documents = await DocumentModel.find({ applicationId: appId });
    
//     // Convert upload dates to Sri Lanka time
//     const documentsWithLocalTime = documents.map(doc => ({
//       ...doc.toObject(),
//       uploadDate: convertToSriLankaTime(doc.uploadDate)
//     }));
    
//     res.json({ success: true, documents: documentsWithLocalTime });
//   } catch (err) {
//     console.error("Documents fetch error:", err);
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
    
//     // Convert dates to Sri Lanka time
//     const applicationsWithLocalTime = recentApplications.map(app => ({
//       ...app.toObject(),
//       submissionDate: convertToSriLankaTime(app.submissionDate),
//       // Convert timeline dates as well
//       timeline: app.timeline ? app.timeline.map(item => ({
//         ...item,
//         date: convertToSriLankaTime(item.date)
//       })) : []
//     }));
    
//     // Generate notifications
//     const notifications = [];
    
//     if (recentApplications.length > 0) {
//       recentApplications.forEach(app => {
//         if (app.status === "pending") {
//           notifications.push({
//             type: "application_update",
//             message: `Your PCC application #${app.applicationId} is currently being reviewed by the assigned officer.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "approved") {
//           notifications.push({
//             type: "certificate_ready",
//             message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         }
//       });
//     }
    
//     // Calculate applications this month - FIXED VERSION
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
      
//       const appDate = new Date(app.submissionDate);
//       return appDate.getMonth() === now.getMonth() && 
//              appDate.getFullYear() === now.getFullYear();
//     }).length : 0;
    
//     res.json({ 
//       success: true, 
//       applications: applicationsWithLocalTime,
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
//     timestamp: convertToSriLankaTime(new Date())
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

// // Get application status with detailed timeline
// app.get("/api/application-status/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     // Check in PCC system database
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (application) {
//       // Convert dates to Sri Lanka time
//       const applicationWithLocalTime = {
//         ...application.toObject(),
//         submissionDate: convertToSriLankaTime(application.submissionDate),
//         // Convert timeline dates as well
//         timeline: application.timeline ? application.timeline.map(item => ({
//           ...item,
//           date: convertToSriLankaTime(item.date)
//         })) : []
//       };
      
//       res.json({ 
//         success: true, 
//         application: applicationWithLocalTime,
//         // Generate detailed status information
//         statusInfo: generateStatusInfo(application)
//       });
//     } else {
//       res.status(404).json({ success: false, message: "Application not found" });
//     }
//   } catch (err) {
//     console.error("Application status fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Update application status (for police use)
// app.post("/api/update-application-status", async (req, res) => {
//   try {
//     const { appId, status, step, officer, description } = req.body;
    
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (!application) {
//       return res.status(404).json({ success: false, message: "Application not found" });
//     }
    
//     // Update status
//     if (status) {
//       application.status = status;
//     }
    
//     // Add to timeline
//     const newTimelineEntry = {
//       step: step || status,
//       date: new Date(),
//       completed: true,
//       officer: officer || null,
//       description: description || `${step || status} completed`
//     };
    
//     if (!application.timeline) {
//       application.timeline = [];
//     }
    
//     application.timeline.push(newTimelineEntry);
    
//     // Update in all locations
//     await application.save();
    
//     // Update in police division
//     await PoliceDivisionModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     // Update in applicant record
//     await ApplicantModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     res.json({ 
//       success: true, 
//       message: "Application status updated successfully",
//       application 
//     });
//   } catch (err) {
//     console.error("Status update error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Helper function to generate status information
// function generateStatusInfo(application) {
//   const statusMessages = {
//     "pending": {
//       title: "Under Review",
//       description: "Your application is being processed",
//       color: "#f39c12",
//       icon: "⏳"
//     },
//     "approved": {
//       title: "Approved",
//       description: "Your application has been approved",
//       color: "#27ae60",
//       icon: "✅"
//     },
//     "rejected": {
//       title: "Rejected",
//       description: "Your application has been rejected",
//       color: "#e74c3c",
//       icon: "❌"
//     },
//     "processing": {
//       title: "Processing",
//       description: "Your application is being processed",
//       color: "#3498db",
//       icon: "⚙️"
//     }
//   };
  
//   const currentStatus = application.status || "pending";
//   const statusInfo = statusMessages[currentStatus];
  
//   return {
//     currentStatus,
//     title: statusInfo.title,
//     description: statusInfo.description,
//     color: statusInfo.color,
//     icon: statusInfo.icon,
//     lastUpdated: application.timeline && application.timeline.length > 0 
//       ? convertToSriLankaTime(application.timeline[application.timeline.length - 1].date)
//       : convertToSriLankaTime(application.submissionDate)
//   };
// }

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });





// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // Middleware
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const PORT = process.env.PORT || 5000;
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://razinmalik364_db_user:MTrOySMsWkmId2t3@cluster0.pg11pvs.mongodb.net/nic_demo?retryWrites=true&w=majority";

// // Helper function to convert to Sri Lanka time (UTC+5:30)
// function convertToSriLankaTime(date) {
//   if (!date) return null;
  
//   // Convert to Sri Lanka time (UTC+5:30)
//   const options = {
//     timeZone: 'Asia/Colombo',
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   };
  
//   return new Date(date).toLocaleString('en-US', options);
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024 // 2MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only images, PDFs, and DOC files are allowed'));
//     }
//   }
// });

// // Applicant Schema - UPDATED with permanentAddress
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
//     permanentAddress: String,
//     deliveryMethod: String,
//     documents: Object,
//     timeline: Array,
//     criminalCheck: Object // NEW: For criminal check results
//   }]
// });

// const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// // Application Schema for PCC System - UPDATED with criminalCheck field
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
//   permanentAddress: String,
//   deliveryMethod: String,
//   documents: Object,
//   timeline: Array,
//   criminalCheck: { // NEW: Criminal check results field
//     conductedAt: Date,
//     result: {
//       type: String,
//       enum: ['clear', 'minor_convictions', 'major_convictions', 'pending_cases', 'error']
//     },
//     flags: Array,
//     message: String
//   }
// });

// // Police Division Schema - UPDATED with permanentAddress and deliveryMethod
// const policeDivisionSchema = new mongoose.Schema({
//   divisionName: String,
//   applications: [applicationSchema]
// });

// // Document Schema for storing file metadata
// const documentSchema = new mongoose.Schema({
//   applicationId: String,
//   fileName: String,
//   originalName: String,
//   filePath: String,
//   fileType: String,
//   fileSize: Number,
//   uploadDate: Date,
//   documentType: String // nic, birthCert, gnCert, supportLetter
// });

// // Criminal Record Schema for AMI Database
// const criminalRecordSchema = new mongoose.Schema({
//   nicNumber: {
//     type: String,
//     required: true,
//     index: true,
//     unique: true
//   },
//   fullName: {
//     type: String,
//     required: true
//   },
//   dateOfBirth: String,
//   records: [{
//     type: {
//       type: String,
//       required: true,
//       enum: ['minor', 'major', 'pending_case']
//     },
//     category: {
//       type: String,
//       required: true,
//       enum: [
//         'minor_traffic_violation', 'small_vehicle_accident', 'petty_theft', 'disturbing_peace', 'public_nuisance',
//         'theft', 'burglary', 'assault', 'major_vehicle_accident', 'fraud', 'homicide', 'drug_trafficking', 'robbery'
//       ]
//     },
//     description: {
//       type: String,
//       required: true
//     },
//     caseId: {
//       type: String,
//       required: true
//     },
//     dateOfIncident: {
//       type: Date,
//       required: true
//     },
//     dateReported: {
//       type: Date,
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ['convicted', 'acquitted', 'dismissed', 'pending_trial'],
//       default: 'pending_trial'
//     },
//     severity: {
//       type: String,
//       enum: ['Low', 'Medium', 'High', 'Critical'],
//       default: 'Medium'
//     },
//     sentence: String,
//     issuingAuthority: String
//   }],
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Create connections to different databases
// const nicDemoConn = mongoose.createConnection(MONGODB_URI);
// const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));
// const amiRecordsConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'AMI_records')); // NEW: AMI connection

// const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
// const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
// const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");
// const DocumentModel = pccSystemConn.model("Document", documentSchema, "documents");
// const CriminalRecordModel = amiRecordsConn.model("CriminalRecord", criminalRecordSchema, "criminalrecords"); // NEW: Criminal model

// let otpStore = {};
// let criminalCheckTimers = {}; // NEW: Store timers for criminal checks

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

// // NEW: Function to perform criminal record check
// async function performCriminalCheck(applicationId, nicNumber) {
//   try {
//     console.log(`🔍 Starting criminal check for Application: ${applicationId}, NIC: ${nicNumber}`);
    
//     const application = await ApplicationModel.findOne({ applicationId });
//     if (!application) {
//       console.error(`Application ${applicationId} not found for criminal check.`);
//       return;
//     }

//     // Update status to show criminal check is in progress
//     application.status = 'criminal_check';
//     application.timeline.push({
//       step: "Criminal Check",
//       date: new Date(),
//       completed: true,
//       officer: "SGT 3456 (A.B. Jayasinghe)",
//       description: "Automated criminal record check initiated."
//     });
//     await application.save();

//     // Query the AMI Criminal Records Database
//     const criminalRecord = await CriminalRecordModel.findOne({ nicNumber });

//     // Create assessment object
//     let criminalCheckAssessment = {
//       conductedAt: new Date(),
//       result: 'clear',
//       flags: [],
//       message: 'No criminal records found.'
//     };

//     if (criminalRecord && criminalRecord.records.length > 0) {
//       // Categorize records
//       const majorConvictions = criminalRecord.records.filter(record =>
//         record.type === 'major' && record.status === 'convicted'
//       );
//       const minorConvictions = criminalRecord.records.filter(record =>
//         record.type === 'minor' && record.status === 'convicted'
//       );
//       const pendingCases = criminalRecord.records.filter(record =>
//         record.status === 'pending_trial'
//       );

//       criminalCheckAssessment.flags = [...majorConvictions, ...minorConvictions, ...pendingCases];

//       if (majorConvictions.length > 0) {
//         criminalCheckAssessment.result = 'major_convictions';
//         criminalCheckAssessment.message = `Applicant has ${majorConvictions.length} major conviction(s). Requires officer review.`;
//       } else if (pendingCases.length > 0) {
//         criminalCheckAssessment.result = 'pending_cases';
//         criminalCheckAssessment.message = `Applicant has ${pendingCases.length} pending case(s). Requires officer review.`;
//       } else if (minorConvictions.length > 0) {
//         criminalCheckAssessment.result = 'minor_convictions';
//         criminalCheckAssessment.message = `Applicant has ${minorConvictions.length} minor conviction(s).`;
//       }
//     }

//     // Store assessment and update status to processing
//     application.criminalCheck = criminalCheckAssessment;
//     application.status = 'processing';
//     application.timeline.push({
//       step: "Criminal Check Complete",
//       date: new Date(),
//       completed: true,
//       officer: "SGT 3456 (A.B. Jayasinghe)",
//       description: criminalCheckAssessment.message
//     });

//     await application.save();

//     // Update applicant record
//     await ApplicantModel.updateOne(
//       { "applications.applicationId": applicationId },
//       {
//         $set: {
//           "applications.$.status": "processing",
//           "applications.$.criminalCheck": criminalCheckAssessment,
//           "applications.$.timeline": application.timeline
//         }
//       }
//     );

//     // Update police division record
//     await PoliceDivisionModel.updateOne(
//       { "applications.applicationId": applicationId },
//       {
//         $set: {
//           "applications.$.status": "processing",
//           "applications.$.criminalCheck": criminalCheckAssessment,
//           "applications.$.timeline": application.timeline
//         }
//       }
//     );

//     console.log(`✅ Criminal check complete for ${applicationId}. Result: ${criminalCheckAssessment.result}`);

//   } catch (error) {
//     console.error(`❌ Criminal check failed for ${applicationId}:`, error);
    
//     // Update application with error status
//     const application = await ApplicationModel.findOne({ applicationId });
//     if (application) {
//       application.status = 'processing';
//       application.timeline.push({
//         step: "Criminal Check Error",
//         date: new Date(),
//         completed: true,
//         officer: "SGT 3456 (A.B. Jayasinghe)",
//         description: "Automated criminal check encountered an error. Requires manual review."
//       });
//       await application.save();
//     }
//   }
// }

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
//       message: "Invalid OTP" 
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
    
//     // Convert dates to Sri Lanka time for all applications
//     const applicationsWithLocalTime = user.applications ? user.applications.map(app => ({
//       ...app.toObject(),
//       submissionDate: convertToSriLankaTime(app.submissionDate),
//       // Convert timeline dates as well
//       timeline: app.timeline ? app.timeline.map(item => ({
//         ...item,
//         date: convertToSriLankaTime(item.date)
//       })) : []
//     })) : [];
    
//     res.json({ success: true, applications: applicationsWithLocalTime });
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
//       // Convert dates to Sri Lanka time
//       const applicationWithLocalTime = {
//         ...application.toObject(),
//         submissionDate: convertToSriLankaTime(application.submissionDate),
//         // Convert timeline dates as well
//         timeline: application.timeline ? application.timeline.map(item => ({
//           ...item,
//           date: convertToSriLankaTime(item.date)
//         })) : []
//       };
      
//       res.json({ success: true, application: applicationWithLocalTime });
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

// // Upload documents endpoint
// app.post("/api/upload", upload.fields([
//   { name: 'nic', maxCount: 1 },
//   { name: 'birthCert', maxCount: 1 },
//   { name: 'gnCert', maxCount: 1 },
//   { name: 'supportLetter', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const files = req.files;
//     const uploadedFiles = {};

//     if (files.nic) {
//       uploadedFiles.nic = {
//         fileName: files.nic[0].filename,
//         originalName: files.nic[0].originalname,
//         filePath: files.nic[0].path,
//         fileType: files.nic[0].mimetype,
//         fileSize: files.nic[0].size
//       };
//     }

//     if (files.birthCert) {
//       uploadedFiles.birthCert = {
//         fileName: files.birthCert[0].filename,
//         originalName: files.birthCert[0].originalname,
//         filePath: files.birthCert[0].path,
//         fileType: files.birthCert[0].mimetype,
//         fileSize: files.birthCert[0].size
//       };
//     }

//     if (files.gnCert) {
//       uploadedFiles.gnCert = {
//         fileName: files.gnCert[0].filename,
//         originalName: files.gnCert[0].originalname,
//         filePath: files.gnCert[0].path,
//         fileType: files.gnCert[0].mimetype,
//         fileSize: files.gnCert[0].size
//       };
//     }

//     if (files.supportLetter) {
//       uploadedFiles.supportLetter = {
//         fileName: files.supportLetter[0].filename,
//         originalName: files.supportLetter[0].originalname,
//         filePath: files.supportLetter[0].path,
//         fileType: files.supportLetter[0].mimetype,
//         fileSize: files.supportLetter[0].size
//       };
//     }

//     res.json({ 
//       success: true, 
//       message: "Files uploaded successfully",
//       files: uploadedFiles
//     });
//   } catch (err) {
//     console.error("File upload error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "File upload failed. Please try again." 
//     });
//   }
// });

// // Submit new application - UPDATED with criminal check scheduling
// app.post("/api/application", async (req, res) => {
//   try {
//     const { mobile, applicationData, uploadedFiles } = req.body;
    
//     // Find user
//     const user = await ApplicantModel.findOne({ mobileNumber: mobile });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
    
//     // Check application limit
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
//       const appDate = new Date(app.submissionDate);
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
    
//     // Create application object - UPDATED with permanentAddress and deliveryMethod
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
//       status: "submitted", // Changed from "pending" to "submitted"
//       policeDivision: applicationData.policeDivision,
//       gnDivision: applicationData.gnDivision,
//       permanentAddress: applicationData.permanentAddress,
//       deliveryMethod: applicationData.deliveryMethod || "digital",
//       documents: uploadedFiles,
//       timeline: [
//         { 
//           step: "Submitted", 
//           date: submissionDate, 
//           completed: true,
//           description: "Application submitted successfully"
//         }
//       ]
//     };
    
//     // Save documents to database
//     if (uploadedFiles.nic) {
//       const nicDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.nic.fileName,
//         originalName: uploadedFiles.nic.originalName,
//         filePath: uploadedFiles.nic.filePath,
//         fileType: uploadedFiles.nic.fileType,
//         fileSize: uploadedFiles.nic.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'nic'
//       });
//       await nicDoc.save();
//     }
    
//     if (uploadedFiles.birthCert) {
//       const birthCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.birthCert.fileName,
//         originalName: uploadedFiles.birthCert.originalName,
//         filePath: uploadedFiles.birthCert.filePath,
//         fileType: uploadedFiles.birthCert.fileType,
//         fileSize: uploadedFiles.birthCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'birthCert'
//       });
//       await birthCertDoc.save();
//     }
    
//     if (uploadedFiles.gnCert) {
//       const gnCertDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.gnCert.fileName,
//         originalName: uploadedFiles.gnCert.originalName,
//         filePath: uploadedFiles.gnCert.filePath,
//         fileType: uploadedFiles.gnCert.fileType,
//         fileSize: uploadedFiles.gnCert.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'gnCert'
//       });
//       await gnCertDoc.save();
//     }
    
//     if (uploadedFiles.supportLetter) {
//       const supportLetterDoc = new DocumentModel({
//         applicationId: appId,
//         fileName: uploadedFiles.supportLetter.fileName,
//         originalName: uploadedFiles.supportLetter.originalName,
//         filePath: uploadedFiles.supportLetter.filePath,
//         fileType: uploadedFiles.supportLetter.fileType,
//         fileSize: uploadedFiles.supportLetter.fileSize,
//         uploadDate: submissionDate,
//         documentType: 'supportLetter'
//       });
//       await supportLetterDoc.save();
//     }
    
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
    
//     // Schedule criminal check after 30 seconds
//     criminalCheckTimers[appId] = setTimeout(() => {
//       performCriminalCheck(appId, user.nicNumber);
//       delete criminalCheckTimers[appId];
//     }, 30000);
    
//     console.log(`⏰ Criminal check scheduled for Application #${appId} in 30 seconds`);
    
//     // Log notification with Sri Lanka time
//     const notification = {
//       type: "application_submitted",
//       message: `Application #${appId} submitted. Criminal check scheduled.`,
//       timestamp: convertToSriLankaTime(new Date()),
//       applicationId: appId,
//       policeDivision: applicationData.policeDivision
//     };
    
//     console.log("📋 Application Notification:", notification);
//     console.log("📁 Files uploaded:", Object.keys(uploadedFiles).length);
//     console.log("📦 Delivery Method:", applicationData.deliveryMethod || "digital");
    
//     res.json({ 
//       success: true, 
//       message: "Application submitted successfully. Criminal check will be processed shortly.",
//       applicationId: appId,
//       notification: notification
//     });
//   } catch (err) {
//     console.error("Application submission error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//   });
//   }
// });

// // Get application documents
// app.get("/api/documents/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     const documents = await DocumentModel.find({ applicationId: appId });
    
//     // Convert upload dates to Sri Lanka time
//     const documentsWithLocalTime = documents.map(doc => ({
//       ...doc.toObject(),
//       uploadDate: convertToSriLankaTime(doc.uploadDate)
//     }));
    
//     res.json({ success: true, documents: documentsWithLocalTime });
//   } catch (err) {
//     console.error("Documents fetch error:", err);
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
    
//     // Convert dates to Sri Lanka time
//     const applicationsWithLocalTime = recentApplications.map(app => ({
//       ...app.toObject(),
//       submissionDate: convertToSriLankaTime(app.submissionDate),
//       // Convert timeline dates as well
//       timeline: app.timeline ? app.timeline.map(item => ({
//         ...item,
//         date: convertToSriLankaTime(item.date)
//       })) : []
//     }));
    
//     // Generate notifications
//     const notifications = [];
    
//     if (recentApplications.length > 0) {
//       recentApplications.forEach(app => {
//         if (app.status === "submitted") {
//           notifications.push({
//             type: "application_submitted",
//             message: `Your PCC application #${app.applicationId} has been submitted. Criminal check pending.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "criminal_check") {
//           notifications.push({
//             type: "criminal_check",
//             message: `Your PCC application #${app.applicationId} is undergoing criminal record verification.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "processing") {
//           notifications.push({
//             type: "application_processing",
//             message: `Your PCC application #${app.applicationId} is being processed by the authorities.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         } else if (app.status === "approved") {
//           notifications.push({
//             type: "certificate_ready",
//             message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
//             timestamp: convertToSriLankaTime(new Date()),
//             applicationId: app.applicationId
//           });
//         }
//       });
//     }
    
//     // Calculate applications this month - FIXED VERSION
//     const now = new Date();
//     const applicationsThisMonth = user.applications ? user.applications.filter(app => {
//       if (!app.submissionDate) return false;
      
//       const appDate = new Date(app.submissionDate);
//       return appDate.getMonth() === now.getMonth() && 
//              appDate.getFullYear() === now.getFullYear();
//     }).length : 0;
    
//     res.json({ 
//       success: true, 
//       applications: applicationsWithLocalTime,
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
//     timestamp: convertToSriLankaTime(new Date())
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

// // Get application status with detailed timeline
// app.get("/api/application-status/:appId", async (req, res) => {
//   try {
//     const { appId } = req.params;
    
//     // Check in PCC system database
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (application) {
//       // Convert dates to Sri Lanka time
//       const applicationWithLocalTime = {
//         ...application.toObject(),
//         submissionDate: convertToSriLankaTime(application.submissionDate),
//         // Convert timeline dates as well
//         timeline: application.timeline ? application.timeline.map(item => ({
//           ...item,
//           date: convertToSriLankaTime(item.date)
//         })) : []
//       };
      
//       res.json({ 
//         success: true, 
//         application: applicationWithLocalTime,
//         // Generate detailed status information
//         statusInfo: generateStatusInfo(application)
//       });
//     } else {
//       res.status(404).json({ success: false, message: "Application not found" });
//     }
//   } catch (err) {
//     console.error("Application status fetch error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Update application status (for police use)
// app.post("/api/update-application-status", async (req, res) => {
//   try {
//     const { appId, status, step, officer, description } = req.body;
    
//     const application = await ApplicationModel.findOne({ applicationId: appId });
    
//     if (!application) {
//       return res.status(404).json({ success: false, message: "Application not found" });
//     }
    
//     // Update status
//     if (status) {
//       application.status = status;
//     }
    
//     // Add to timeline
//     const newTimelineEntry = {
//       step: step || status,
//       date: new Date(),
//       completed: true,
//       officer: officer || null,
//       description: description || `${step || status} completed`
//     };
    
//     if (!application.timeline) {
//       application.timeline = [];
//     }
    
//     application.timeline.push(newTimelineEntry);
    
//     // Update in all locations
//     await application.save();
    
//     // Update in police division
//     await PoliceDivisionModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     // Update in applicant record
//     await ApplicantModel.updateOne(
//       { "applications.applicationId": appId },
//       { 
//         $set: { 
//           "applications.$.status": application.status,
//           "applications.$.timeline": application.timeline
//         } 
//       }
//     );
    
//     res.json({ 
//       success: true, 
//       message: "Application status updated successfully",
//       application 
//     });
//   } catch (err) {
//     console.error("Status update error:", err);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error. Please try again later." 
//     });
//   }
// });

// // Helper function to generate status information - UPDATED for new statuses
// function generateStatusInfo(application) {
//   const statusMessages = {
//     "submitted": {
//       title: "Submitted",
//       description: "Your application has been submitted successfully",
//       color: "#f39c12",
//       icon: "📤"
//     },
//     "criminal_check": {
//       title: "Criminal Check",
//       description: "Your application is undergoing automated criminal record verification",
//       color: "#3498db",
//       icon: "🔍"
//     },
//     "processing": {
//       title: "Processing",
//       description: "Your application is being processed by the authorities",
//       color: "#3498db",
//       icon: "⚙️"
//     },
//     "approved": {
//       title: "Approved",
//       description: "Your application has been approved",
//       color: "#27ae60",
//       icon: "✅"
//     },
//     "rejected": {
//       title: "Rejected",
//       description: "Your application has been rejected",
//       color: "#e74c3c",
//       icon: "❌"
//     }
//   };
  
//   const currentStatus = application.status || "submitted";
//   const statusInfo = statusMessages[currentStatus];
  
//   return {
//     currentStatus,
//     title: statusInfo.title,
//     description: statusInfo.description,
//     color: statusInfo.color,
//     icon: statusInfo.icon,
//     lastUpdated: application.timeline && application.timeline.length > 0 
//       ? convertToSriLankaTime(application.timeline[application.timeline.length - 1].date)
//       : convertToSriLankaTime(application.submissionDate)
//   };
// }

// // Clean up timers on server shutdown
// process.on('SIGINT', () => {
//   console.log('🛑 Server shutting down. Cleaning up timers...');
//   for (const timerId in criminalCheckTimers) {
//     clearTimeout(criminalCheckTimers[timerId]);
//   }
//   process.exit(0);
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });






//-----------------------
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

// Helper function to convert to Sri Lanka time (UTC+5:30)
function convertToSriLankaTime(date) {
  if (!date) return null;
  
  // Convert to Sri Lanka time (UTC+5:30)
  const options = {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  return new Date(date).toLocaleString('en-US', options);
}

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

// Applicant Schema - UPDATED with permanentAddress
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
    permanentAddress: String,
    deliveryMethod: String,
    documents: Object,
    timeline: Array,
    criminalCheck: Object // NEW: For criminal check results
  }]
});

const Applicant = mongoose.model("Applicant", applicantSchema, "applicants");

// Application Schema for PCC System - UPDATED with criminalCheck field
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
  permanentAddress: String,
  deliveryMethod: String,
  documents: Object,
  timeline: Array,
  criminalCheck: { // NEW: Criminal check results field
    conductedAt: Date,
    result: {
      type: String,
      enum: ['clear', 'minor_convictions', 'major_convictions', 'pending_cases', 'error']
    },
    flags: Array,
    message: String
  }
});

// Police Division Schema - UPDATED with permanentAddress and deliveryMethod
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

// Criminal Record Schema for AMI Database
const criminalRecordSchema = new mongoose.Schema({
  nicNumber: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: String,
  records: [{
    type: {
      type: String,
      required: true,
      enum: ['minor', 'major', 'pending_case']
    },
    category: {
      type: String,
      required: true,
      enum: [
        'minor_traffic_violation', 'small_vehicle_accident', 'petty_theft', 'disturbing_peace', 'public_nuisance',
        'theft', 'burglary', 'assault', 'major_vehicle_accident', 'fraud', 'homicide', 'drug_trafficking', 'robbery'
      ]
    },
    description: {
      type: String,
      required: true
    },
    caseId: {
      type: String,
      required: true
    },
    dateOfIncident: {
      type: Date,
      required: true
    },
    dateReported: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['convicted', 'acquitted', 'dismissed', 'pending_trial'],
      default: 'pending_trial'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    sentence: String,
    issuingAuthority: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create connections to different databases
const nicDemoConn = mongoose.createConnection(MONGODB_URI);
const pccSystemConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'pcc_system'));
const amiRecordsConn = mongoose.createConnection(MONGODB_URI.replace('nic_demo', 'AMI_records')); // NEW: AMI connection

const ApplicantModel = nicDemoConn.model("Applicant", applicantSchema, "applicants");
const PoliceDivisionModel = pccSystemConn.model("PoliceDivision", policeDivisionSchema, "policedivisions");
const ApplicationModel = pccSystemConn.model("Application", applicationSchema, "applications");
const DocumentModel = pccSystemConn.model("Document", documentSchema, "documents");
const CriminalRecordModel = amiRecordsConn.model("CriminalRecord", criminalRecordSchema, "criminalrecords"); // NEW: Criminal model

// Use global variables for testing access - initialized only once
global.otpStore = global.otpStore || {};
global.criminalCheckTimers = global.criminalCheckTimers || {}; // NEW: Store timers for criminal checks

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

// NEW: Function to perform criminal record check
async function performCriminalCheck(applicationId, nicNumber) {
  try {
    console.log(`🔍 Starting criminal check for Application: ${applicationId}, NIC: ${nicNumber}`);
    
    const application = await ApplicationModel.findOne({ applicationId });
    if (!application) {
      console.error(`Application ${applicationId} not found for criminal check.`);
      return;
    }

    // Update status to show criminal check is in progress
    application.status = 'criminal_check';
    application.timeline.push({
      step: "Criminal Check",
      date: new Date(),
      completed: true,
      officer: "SGT 3456 (A.B. Jayasinghe)",
      description: "Automated criminal record check initiated."
    });
    await application.save();

    // Query the AMI Criminal Records Database
    const criminalRecord = await CriminalRecordModel.findOne({ nicNumber });

    // Create assessment object
    let criminalCheckAssessment = {
      conductedAt: new Date(),
      result: 'clear',
      flags: [],
      message: 'No criminal records found.'
    };

    if (criminalRecord && criminalRecord.records.length > 0) {
      // Categorize records
      const majorConvictions = criminalRecord.records.filter(record =>
        record.type === 'major' && record.status === 'convicted'
      );
      const minorConvictions = criminalRecord.records.filter(record =>
        record.type === 'minor' && record.status === 'convicted'
      );
      const pendingCases = criminalRecord.records.filter(record =>
        record.status === 'pending_trial'
      );

      criminalCheckAssessment.flags = [...majorConvictions, ...minorConvictions, ...pendingCases];

      if (majorConvictions.length > 0) {
        criminalCheckAssessment.result = 'major_convictions';
        criminalCheckAssessment.message = `Applicant has ${majorConvictions.length} major conviction(s). Requires officer review.`;
      } else if (pendingCases.length > 0) {
        criminalCheckAssessment.result = 'pending_cases';
        criminalCheckAssessment.message = `Applicant has ${pendingCases.length} pending case(s). Requires officer review.`;
      } else if (minorConvictions.length > 0) {
        criminalCheckAssessment.result = 'minor_convictions';
        criminalCheckAssessment.message = `Applicant has ${minorConvictions.length} minor conviction(s).`;
      }
    }

    // Store assessment and update status to processing
    application.criminalCheck = criminalCheckAssessment;
    application.status = 'processing';
    application.timeline.push({
      step: "Criminal Check Complete",
      date: new Date(),
      completed: true,
      officer: "SGT 3456 (A.B. Jayasinghe)",
      description: criminalCheckAssessment.message
    });

    await application.save();

    // Update applicant record
    await ApplicantModel.updateOne(
      { "applications.applicationId": applicationId },
      {
        $set: {
          "applications.$.status": "processing",
          "applications.$.criminalCheck": criminalCheckAssessment,
          "applications.$.timeline": application.timeline
        }
      }
    );

    // Update police division record
    await PoliceDivisionModel.updateOne(
      { "applications.applicationId": applicationId },
      {
        $set: {
          "applications.$.status": "processing",
          "applications.$.criminalCheck": criminalCheckAssessment,
          "applications.$.timeline": application.timeline
        }
      }
    );

    console.log(`✅ Criminal check complete for ${applicationId}. Result: ${criminalCheckAssessment.result}`);

  } catch (error) {
    console.error(`❌ Criminal check failed for ${applicationId}:`, error);
    
    // Update application with error status
    const application = await ApplicationModel.findOne({ applicationId });
    if (application) {
      application.status = 'processing';
      application.timeline.push({
        step: "Criminal Check Error",
        date: new Date(),
        completed: true,
        officer: "SGT 3456 (A.B. Jayasinghe)",
        description: "Automated criminal check encountered an error. Requires manual review."
      });
      await application.save();
    }
  }
}

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
      global.otpStore[mobile] = {
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
    
    const storedOtpData = global.otpStore[mobile];
    
    if (storedOtpData && storedOtpData.expires > Date.now()) {
      if (storedOtpData.otp === otp) {
        delete global.otpStore[mobile];
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
    
    // Convert dates to Sri Lanka time for all applications
    const applicationsWithLocalTime = user.applications ? user.applications.map(app => ({
      ...app.toObject(),
      submissionDate: convertToSriLankaTime(app.submissionDate),
      // Convert timeline dates as well
      timeline: app.timeline ? app.timeline.map(item => ({
        ...item,
        date: convertToSriLankaTime(item.date)
      })) : []
    })) : [];
    
    res.json({ success: true, applications: applicationsWithLocalTime });
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
      // Convert dates to Sri Lanka time
      const applicationWithLocalTime = {
        ...application.toObject(),
        submissionDate: convertToSriLankaTime(application.submissionDate),
        // Convert timeline dates as well
        timeline: application.timeline ? application.timeline.map(item => ({
          ...item,
          date: convertToSriLankaTime(item.date)
        })) : []
      };
      
      res.json({ success: true, application: applicationWithLocalTime });
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

// Submit new application - UPDATED with criminal check scheduling
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
    
    // Create application object - UPDATED with permanentAddress and deliveryMethod
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
      status: "submitted", // Changed from "pending" to "submitted"
      policeDivision: applicationData.policeDivision,
      gnDivision: applicationData.gnDivision,
      permanentAddress: applicationData.permanentAddress,
      deliveryMethod: applicationData.deliveryMethod || "digital",
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
    
    // Schedule criminal check after 30 seconds
    global.criminalCheckTimers[appId] = setTimeout(() => {
      performCriminalCheck(appId, user.nicNumber);
      delete global.criminalCheckTimers[appId];
    }, 30000);
    
    console.log(`⏰ Criminal check scheduled for Application #${appId} in 30 seconds`);
    
    // Log notification with Sri Lanka time
    const notification = {
      type: "application_submitted",
      message: `Application #${appId} submitted. Criminal check scheduled.`,
      timestamp: convertToSriLankaTime(new Date()),
      applicationId: appId,
      policeDivision: applicationData.policeDivision
    };
    
    console.log("📋 Application Notification:", notification);
    console.log("📁 Files uploaded:", Object.keys(uploadedFiles).length);
    console.log("📦 Delivery Method:", applicationData.deliveryMethod || "digital");
    
    res.json({ 
      success: true, 
      message: "Application submitted successfully. Criminal check will be processed shortly.",
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
    
    // Convert upload dates to Sri Lanka time
    const documentsWithLocalTime = documents.map(doc => ({
      ...doc.toObject(),
      uploadDate: convertToSriLankaTime(doc.uploadDate)
    }));
    
    res.json({ success: true, documents: documentsWithLocalTime });
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
    
    // Convert dates to Sri Lanka time
    const applicationsWithLocalTime = recentApplications.map(app => ({
      ...app.toObject(),
      submissionDate: convertToSriLankaTime(app.submissionDate),
      // Convert timeline dates as well
      timeline: app.timeline ? app.timeline.map(item => ({
        ...item,
        date: convertToSriLankaTime(item.date)
      })) : []
    }));
    
    // Generate notifications
    const notifications = [];
    
    if (recentApplications.length > 0) {
      recentApplications.forEach(app => {
        if (app.status === "submitted") {
          notifications.push({
            type: "application_submitted",
            message: `Your PCC application #${app.applicationId} has been submitted. Criminal check pending.`,
            timestamp: convertToSriLankaTime(new Date()),
            applicationId: app.applicationId
          });
        } else if (app.status === "criminal_check") {
          notifications.push({
            type: "criminal_check",
            message: `Your PCC application #${app.applicationId} is undergoing criminal record verification.`,
            timestamp: convertToSriLankaTime(new Date()),
            applicationId: app.applicationId
          });
        } else if (app.status === "processing") {
          notifications.push({
            type: "application_processing",
            message: `Your PCC application #${app.applicationId} is being processed by the authorities.`,
            timestamp: convertToSriLankaTime(new Date()),
            applicationId: app.applicationId
          });
        } else if (app.status === "approved") {
          notifications.push({
            type: "certificate_ready",
            message: `Your PCC application #${app.applicationId} has been approved. You can now download the certificate.`,
            timestamp: convertToSriLankaTime(new Date()),
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
      applications: applicationsWithLocalTime,
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
    timestamp: convertToSriLankaTime(new Date())
  });
});

// Clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const mobile in global.otpStore) {
    if (global.otpStore[mobile].expires < now) {
      delete global.otpStore[mobile];
    }
  }
}, 60 * 60 * 1000);

// Get application status with detailed timeline
app.get("/api/application-status/:appId", async (req, res) => {
  try {
    const { appId } = req.params;
    
    // Check in PCC system database
    const application = await ApplicationModel.findOne({ applicationId: appId });
    
    if (application) {
      // Convert dates to Sri Lanka time
      const applicationWithLocalTime = {
        ...application.toObject(),
        submissionDate: convertToSriLankaTime(application.submissionDate),
        // Convert timeline dates as well
        timeline: application.timeline ? application.timeline.map(item => ({
          ...item,
          date: convertToSriLankaTime(item.date)
        })) : []
      };
      
      res.json({ 
        success: true, 
        application: applicationWithLocalTime,
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

// Helper function to generate status information - UPDATED for new statuses
function generateStatusInfo(application) {
  const statusMessages = {
    "submitted": {
      title: "Submitted",
      description: "Your application has been submitted successfully",
      color: "#f39c12",
      icon: "📤"
    },
    "criminal_check": {
      title: "Criminal Check",
      description: "Your application is undergoing automated criminal record verification",
      color: "#3498db",
      icon: "🔍"
    },
    "processing": {
      title: "Processing",
      description: "Your application is being processed by the authorities",
      color: "#3498db",
      icon: "⚙️"
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
    }
  };
  
  const currentStatus = application.status || "submitted";
  const statusInfo = statusMessages[currentStatus];
  
  return {
    currentStatus,
    title: statusInfo.title,
    description: statusInfo.description,
    color: statusInfo.color,
    icon: statusInfo.icon,
    lastUpdated: application.timeline && application.timeline.length > 0 
      ? convertToSriLankaTime(application.timeline[application.timeline.length - 1].date)
      : convertToSriLankaTime(application.submissionDate)
  };
}

// Clean up timers on server shutdown
process.on('SIGINT', () => {
  console.log('🛑 Server shutting down. Cleaning up timers...');
  for (const timerId in global.criminalCheckTimers) {
    clearTimeout(global.criminalCheckTimers[timerId]);
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export the app and models for testing
module.exports = {
  app,
  ApplicantModel,
  ApplicationModel,
  PoliceDivisionModel,
  DocumentModel,
  CriminalRecordModel,
  performCriminalCheck,
  // Export global variables for testing
  otpStore: global.otpStore,
  criminalCheckTimers: global.criminalCheckTimers
};