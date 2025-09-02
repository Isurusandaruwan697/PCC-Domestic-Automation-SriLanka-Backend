const mongoose = require("mongoose");

const ApplicantSchema = new mongoose.Schema({
  nameWithInitials: String,
  fullNameEnglish: String,
  nicNumber: String,
  mobileNumber: String
});

module.exports = mongoose.model("Applicant", ApplicantSchema, "applicants");
